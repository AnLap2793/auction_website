const Auction = require('../models/Auction');
const Product = require('../models/Product');
const Bid = require('../models/Bid');
const ProductImage = require('../models/ProductImage');
const { Op, Sequelize } = require('sequelize');
const User = require('../models/User');
const AuctionRegistration = require('../models/AuctionRegistration');
const Category = require('../models/Category');
const AuctionWinner = require('../models/AuctionWinner');
const Notification = require('../models/Notification');

// Lấy tất cả các phiên đấu giá
const getAllAuctions = async (filters = {}) => {
  try {
    const whereConditions = {};
    const productWhereConditions = {};
    
    // Nếu là user thường thì mới lọc theo trạng thái
    if (!filters.isAdmin) {
      // Lọc theo trạng thái
      if (filters.status) {
        whereConditions.status = filters.status;
      }
    } else {
      // Nếu là admin và có yêu cầu lọc theo trạng thái cụ thể
      if (filters.status && filters.status !== 'all') {
        whereConditions.status = filters.status;
      }
    }
    
    // Lọc theo danh mục sản phẩm
    if (filters.category_id) {
      productWhereConditions.category_id = filters.category_id;
    }
    
    // Lọc theo từ khóa tìm kiếm
    if (filters.search) {
      productWhereConditions.title = {
        [Op.like]: `%${filters.search}%`
      };
    }

    // Xác định thứ tự sắp xếp
    let order = [['end_time', 'desc']];
    if(filters.sort){
      const [field, direction] = filters.sort.split(':');
      if (field && direction) {
        // Xử lý trường hợp field là thuộc tính của Product
        if (field === 'starting_price') {
          order = [[{ model: Product }, 'starting_price', direction.toUpperCase()]];
        } else {
          order = [[field, direction.toUpperCase()]];
        }
      }
    }
    
    // Thiết lập phân trang
    const page = parseInt(filters.page) || 1;
    const limit = parseInt(filters.limit) || 10;
    const offset = (page - 1) * limit;
    
    // Đếm tổng số bản ghi
    const countResult = await Auction.count({
      where: whereConditions,
      include: [
        {
          model: Product,
          where: Object.keys(productWhereConditions).length > 0 ? productWhereConditions : undefined
        }
      ],
      distinct: true
    });
    
    // Lấy dữ liệu phân trang
    const auctions = await Auction.findAll({
      where: whereConditions,
      include: [
        {
          model: Product,
          where: Object.keys(productWhereConditions).length > 0 ? productWhereConditions : undefined,
          include: { model: ProductImage, attributes: ['id', 'image_url'] }
        }
      ],
      order: order,
      limit: limit,
      offset: offset
    });
    
    // Tính toán thông tin phân trang
    const totalPages = Math.ceil(countResult / limit);
    
    return {
      success: true,
      data: auctions,
      metadata: {
        total: countResult,
        page: page,
        limit: limit,
        pages: totalPages
      }
    };
  } catch (error) {
    throw new Error(`Không thể lấy danh sách đấu giá: ${error.message}`);
  }
};

// Lấy chi tiết phiên đấu giá theo ID
const getAuctionById = async (id) => {
  try {
    // Tìm phiên đấu giá theo ID và thực hiện include các bảng liên quan
    const auction = await Auction.findByPk(id, {
      include: [
        {
          model: Product,
          include: [
            { model: ProductImage },
            { model: Category },
            { model: User, as: 'Seller', attributes: ['id', 'username', 'email', 'avatar', 'rating'] }
          ]
        },
        {
          model: User,
          as: 'CurrentWinner',
          attributes: ['id', 'username', 'email', 'avatar']
        }
      ]
    });
    
    if (!auction) {
      throw new Error('Không tìm thấy phiên đấu giá');
    }
    
    // Tăng số lượt xem
    await incrementAuctionViews(id);
    
    // Lấy số lượng người đăng ký
    const registrationCount = await AuctionRegistration.count({
      where: { auction_id: id }
    });
    
    // Lấy số lượng lượt đấu giá
    const bidCount = await Bid.count({
      where: { auction_id: id }
    });
    
    // Chuẩn bị dữ liệu trả về
    const responseData = auction.toJSON();
    responseData.registration_count = registrationCount;
    responseData.bid_count = bidCount;
    
    return {
      success: true,
      data: responseData
    };
  } catch (error) {
    throw new Error(`Không thể lấy thông tin đấu giá: ${error.message}`);
  }
};

// Hàm tăng số lượt xem cho phiên đấu giá
const incrementAuctionViews = async (auctionId) => {
  try {
    const auction = await Auction.findByPk(auctionId);
    if (auction) {
      // Sử dụng increment của Sequelize để tăng giá trị views
      await auction.increment('views', { by: 1 });
    }
  } catch (error) {
    console.error('Lỗi khi tăng số lượt xem:', error);
    // Không throw error để không ảnh hưởng đến việc lấy thông tin phiên đấu giá
  }
};

// Tạo phiên đấu giá mới
const createAuction = async (auctionData) => {
  try {
    // Kiểm tra thời gian hợp lệ
    if (new Date(auctionData.start_time) >= new Date(auctionData.end_time)) {
      throw new Error('Thời gian bắt đầu phải trước thời gian kết thúc');
    }
    
    // Kiểm tra sản phẩm tồn tại
    const product = await Product.findByPk(auctionData.product_id);
    if (!product) {
      throw new Error('Sản phẩm không tồn tại');
    }
    
    // Kiểm tra xem sản phẩm đã có trong phiên đấu giá khác chưa
    const existingAuction = await Auction.findOne({
      where: {
        product_id: auctionData.product_id,
        status: {
          [Op.in]: ['pending', 'active']
        }
      }
    });
    
    if (existingAuction) {
      throw new Error('Sản phẩm này đã tồn tại trong một phiên đấu giá khác');
    }
    
    const auction = await Auction.create(auctionData);
    
    return {
      success: true,
      message: 'Tạo phiên đấu giá thành công',
      data: auction
    };
  } catch (error) {
    throw new Error(`Không thể tạo phiên đấu giá: ${error.message}`);
  }
};

// Cập nhật phiên đấu giá
const updateAuction = async (id, auctionData) => {
  try {
    const auction = await Auction.findByPk(id);
    
    if (!auction) {
      throw new Error('Không tìm thấy phiên đấu giá');
    }
    
    // Chỉ cho phép cập nhật các phiên đấu giá chưa bắt đầu hoặc đã hoãn
    // if (auction.status !== 'pending' && auction.status !== 'canceled') {
    //   throw new Error('Chỉ có thể cập nhật phiên đấu giá chưa bắt đầu hoặc đã hoãn');
    // }
    
    // Kiểm tra thời gian hợp lệ nếu cập nhật
    if (auctionData.start_time && auctionData.end_time) {
      if (new Date(auctionData.start_time) >= new Date(auctionData.end_time)) {
        throw new Error('Thời gian bắt đầu phải trước thời gian kết thúc');
      }
    } else if (auctionData.start_time) {
      if (new Date(auctionData.start_time) >= new Date(auction.end_time)) {
        throw new Error('Thời gian bắt đầu phải trước thời gian kết thúc');
      }
    } else if (auctionData.end_time) {
      if (new Date(auction.start_time) >= new Date(auctionData.end_time)) {
        throw new Error('Thời gian bắt đầu phải trước thời gian kết thúc');
      }
    }
    
    await auction.update(auctionData);
    
    return {
      success: true,
      message: 'Cập nhật phiên đấu giá thành công',
      data: auction
    };
  } catch (error) {
    throw new Error(`Không thể cập nhật phiên đấu giá: ${error.message}`);
  }
};

// Hủy phiên đấu giá
const cancelAuction = async (id) => {
  try {
    const auction = await Auction.findByPk(id);
    
    if (!auction) {
      throw new Error('Không tìm thấy phiên đấu giá');
    }
    
    // Chỉ có thể hoãn các phiên đấu giá chưa kết thúc
    if (auction.status === 'ended') {
      throw new Error('Không thể hoãn phiên đấu giá đã kết thúc');
    }
    
    await auction.update({ status: 'canceled' });
    
    return {
      success: true,
      message: 'Hoãn phiên đấu giá thành công'
    };
  } catch (error) {
    throw new Error(`Không thể hoãn phiên đấu giá: ${error.message}`);
  }
};

// Lấy số lượt đăng ký của một phiên đấu giá
const getAuctionRegistrations = async (auctionId) => {
  try {
    const auction = await Auction.findByPk(auctionId);
    
    if (!auction) {
      throw new Error('Không tìm thấy phiên đấu giá');
    }
    
    // Lấy số lượng đăng ký từ bảng AuctionRegistration
    const registrationCount = await AuctionRegistration.count({
      where: { auction_id: auctionId }
    });
    
    // Tùy chọn: Lấy danh sách chi tiết người đăng ký
    const registrations = await AuctionRegistration.findAll({
      where: { auction_id: auctionId },
      include: [
        {
          model: User,
          attributes: ['id', 'username', 'email', 'avatar']
        }
      ],
      order: [['registration_time', 'DESC']]
    });
    
    return {
      success: true,
      data: {
        auction_id: auctionId,
        total_registrations: registrationCount,
        registrations: registrations
      }
    };
  } catch (error) {
    throw new Error(`Không thể lấy số lượt đăng ký: ${error.message}`);
  }
};

// Hàm cập nhật trạng thái phiên đấu giá
const updateAuctionStatus = async () => {
  try {
    const now = new Date();
    
    // Cập nhật các phiên đấu giá sắp diễn ra thành đang diễn ra
    await Auction.update(
      { status: 'active' },
      {
        where: {
          status: 'pending',
          start_time: {
            [Op.lte]: now
          }
        }
      }
    );
    
    // Lấy danh sách phiên đấu giá sắp kết thúc
    const closingAuctions = await Auction.findAll({
      where: {
        status: 'active',
        end_time: {
          [Op.lte]: now
        }
      },
      include: [
        {
          model: Product
        }
      ]
    });
    
    // Xử lý các phiên đấu giá sắp kết thúc
    for (const auction of closingAuctions) {
      // Cập nhật trạng thái sang đã kết thúc
      await auction.update({ status: 'closed' });
      
      // Kiểm tra có người thắng cuộc không
      if (auction.current_winner_id) {
        // Tạo bản ghi người thắng
        await createAuctionWinner(auction);
      }
    }
    
    return {
      success: true,
      message: 'Cập nhật trạng thái phiên đấu giá thành công'
    };
  } catch (error) {
    throw new Error(`Không thể cập nhật trạng thái phiên đấu giá: ${error.message}`);
  }
};

// Hàm tạo người thắng phiên đấu giá
const createAuctionWinner = async (auction) => {
  try {
    // Kiểm tra xem đã có người thắng chưa
    const existingWinner = await AuctionWinner.findOne({
      where: { auction_id: auction.id }
    });
    
    if (existingWinner) {
      return; // Đã có người thắng, bỏ qua
    }
    
    if (!auction.current_winner_id || !auction.current_bid) {
      return; // Không có thông tin người thắng, bỏ qua
    }
    
    // Tạo bản ghi người thắng mới
    await AuctionWinner.create({
      auction_id: auction.id,
      winner_id: auction.current_winner_id,
      winning_bid: auction.current_bid,
      win_time: new Date(),
      payment_status: 'pending'
    });
    
    // Tạo thông báo cho người thắng
    await Notification.create({
      user_id: auction.current_winner_id,
      content: `Chúc mừng! Bạn đã thắng phiên đấu giá "${auction.Product.title}" với giá ${auction.current_bid.toLocaleString()} VNĐ.`,
      type: 'auction_win',
      is_read: false,
      link: `/auction/${auction.id}`
    });
    
    console.log(`Đã tạo người thắng cho phiên đấu giá ${auction.id}: người dùng ${auction.current_winner_id}`);
  } catch (error) {
    console.error(`Lỗi khi tạo người thắng cho phiên đấu giá ${auction.id}:`, error);
  }
};

// Xóa phiên đấu giá
const deleteAuction = async (id) => {
  try {
    const auction = await Auction.findByPk(id);
    
    if (!auction) {
      throw new Error('Không tìm thấy phiên đấu giá');
    }
    
    // Chỉ cho phép xóa các phiên đấu giá chưa bắt đầu hoặc đã kết thúc
    if (auction.status === 'active' || auction.status === 'pending') {
      throw new Error('Không thể xóa phiên đấu giá đang diễn ra hoặc sắp diễn ra');
    }
    
    await auction.destroy();
    
    return {
      success: true,
      message: 'Xóa phiên đấu giá thành công'
    };
  } catch (error) {
    throw new Error(`Không thể xóa phiên đấu giá: ${error.message}`);
  }
};

// Lấy lịch sử đấu giá của một phiên đấu giá
const getAuctionBids = async (auctionId) => {
  try {
    const auction = await Auction.findByPk(auctionId);
    
    if (!auction) {
      throw new Error('Không tìm thấy phiên đấu giá');
    }
    
    // Lấy lịch sử đấu giá, sắp xếp theo thời gian giảm dần (mới nhất lên đầu)
    const bids = await Bid.findAll({
      where: { auction_id: auctionId },
      include: [
        {
          model: User,
          attributes: ['id', 'username', 'email', 'avatar', 'created_at']
        },
        {
          model: Auction,
          attributes: ['id', 'product_id', 'status', 'current_bid', 'current_winner_id'],
          include: [
            {
              model: Product,
              attributes: ['id', 'title', 'starting_price']
            }
          ]
        }
      ],
      order: [['created_at', 'DESC']]
    });
    
    // Tính toán thống kê
    const stats = {
      count: bids.length,
      highest_bid: bids.length > 0 ? Math.max(...bids.map(bid => parseFloat(bid.bid_amount))) : 0,
      unique_bidders: new Set(bids.map(bid => bid.user_id)).size
    };
    
    return {
      success: true,
      data: bids,
      stats: stats
    };
  } catch (error) {
    throw new Error(`Không thể lấy lịch sử đấu giá: ${error.message}`);
  }
};

// Đặt giá cho phiên đấu giá
const placeBid = async (auctionId, userId, bidAmount) => {
  try {
    // Kiểm tra phiên đấu giá tồn tại
    const auction = await Auction.findByPk(auctionId, {
      include: [{ model: Product }]
    });
    
    if (!auction) {
      throw new Error('Không tìm thấy phiên đấu giá');
    }
    
    // Kiểm tra phiên đấu giá đang diễn ra
    if (auction.status !== 'active') {
      throw new Error('Phiên đấu giá không trong trạng thái hoạt động');
    }
    
    // Kiểm tra thời gian đấu giá
    const now = new Date();
    if (now < new Date(auction.start_time) || now > new Date(auction.end_time)) {
      throw new Error('Không thể đặt giá ngoài thời gian đấu giá');
    }
    
    // Kiểm tra người dùng đã đăng ký tham gia đấu giá chưa
    const registration = await AuctionRegistration.findOne({
      where: {
        auction_id: auctionId,
        user_id: userId
      }
    });
    
    if (!registration) {
      throw new Error('Bạn chưa đăng ký tham gia phiên đấu giá này');
    }
    
    // Lấy giá hiện tại cao nhất
    const highestBid = await Bid.findOne({
      where: { auction_id: auctionId },
      order: [['bid_amount', 'DESC']]
    });
    
    const startingPrice = auction.Product.starting_price;
    const bidIncrement = auction.bid_increment || 100000; // Mặc định tăng 100,000 VND
    
    // Kiểm tra số tiền đặt giá
    const minimumBid = highestBid 
      ? parseInt(highestBid.bid_amount) + bidIncrement
      : startingPrice;
    
    if (parseInt(bidAmount) < minimumBid) {
      throw new Error(`Số tiền đặt giá phải lớn hơn ${minimumBid.toLocaleString()} VND`);
    }
    
    // Tạo lịch sử đấu giá mới
    const newBid = await Bid.create({
      auction_id: auctionId,
      user_id: userId,
      bid_amount: bidAmount
    });
    
    // Cập nhật giá hiện tại cho phiên đấu giá
    await auction.update({
      current_bid: bidAmount,
      current_winner_id: userId
    });
    
    return {
      success: true,
      message: 'Đặt giá thành công',
      data: newBid
    };
  } catch (error) {
    throw new Error(`Không thể đặt giá: ${error.message}`);
  }
};

// Đăng ký tham gia đấu giá
const registerForAuction = async (auctionId, userId) => {
  try {
    // Kiểm tra phiên đấu giá tồn tại
    const auction = await Auction.findByPk(auctionId);
    
    if (!auction) {
      throw new Error('Không tìm thấy phiên đấu giá');
    }
    
    // Kiểm tra người dùng đã đăng ký chưa
    const existingRegistration = await AuctionRegistration.findOne({
      where: {
        auction_id: auctionId,
        user_id: userId
      }
    });
    
    if (existingRegistration) {
      throw new Error('Bạn đã đăng ký tham gia phiên đấu giá này');
    }
    
    // Kiểm tra thời gian đăng ký
    const now = new Date();
    if (now > new Date(auction.end_time)) {
      throw new Error('Đã hết thời gian đăng ký tham gia đấu giá');
    }
    
    // Tạo đăng ký mới
    const registration = await AuctionRegistration.create({
      auction_id: auctionId,
      user_id: userId,
      registration_time: now
    });
    
    return {
      success: true,
      message: 'Đăng ký tham gia đấu giá thành công',
      data: registration
    };
  } catch (error) {
    throw new Error(`Không thể đăng ký tham gia: ${error.message}`);
  }
};

module.exports = {
  getAllAuctions,
  getAuctionById,
  createAuction,
  updateAuction,
  cancelAuction,
  getAuctionRegistrations,
  updateAuctionStatus,
  deleteAuction,
  getAuctionBids,
  placeBid,
  registerForAuction
};
