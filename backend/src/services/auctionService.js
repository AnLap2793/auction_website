const Auction = require('../models/Auction');
const Product = require('../models/Product');
const Bid = require('../models/Bid');
const ProductImage = require('../models/ProductImage');
const AuctionRegistration = require('../models/AuctionRegistration');
const User = require('../models/User');
const AuctionWinner = require('../models/AuctionWinner');
const { Op, Sequelize } = require('sequelize');
const Category = require('../models/Category');
const Transaction = require('../models/Transaction');
const { v4: uuidv4 } = require('uuid');

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

// Lấy chi tiết phiên đấu giá
const getAuctionById = async (id) => {
  try {
    const auction = await Auction.findByPk(id, {
      include: [
        {
          model: Product,
          include: [
            {
              model: Category,
              attributes: ['id', 'name']
            },
            {
              model: ProductImage,
              attributes: ['id', 'image_url']
            }
          ]
        },
        {
          model: AuctionWinner,
          include: [
            {
              model: User,
              attributes: ['id', 'email', 'first_name', 'last_name']
            }
          ]
        }
      ]
    });
    
    if (!auction) {
      throw new Error('Không tìm thấy phiên đấu giá');
    }
    
    // Định dạng dữ liệu để trả về
    const auctionData = {
      id: auction.id,
      product_id: auction.product_id,
      start_time: auction.start_time,
      end_time: auction.end_time,
      status: auction.status,
      bid_increment: auction.bid_increment,
      current_bid: auction.current_bid,
      Product: auction.Product,
      winner: null // Mặc định là null
    };
    
    // Nếu phiên đấu giá đã kết thúc và có người thắng
    if ((auction.status === 'closed') && auction.AuctionWinner) {
      auctionData.winner = {
        id: auction.AuctionWinner.User.id,
        email: auction.AuctionWinner.User.email,
        name: `${auction.AuctionWinner.User.first_name} ${auction.AuctionWinner.User.last_name}`
      };
    }
    
    return {
      success: true,
      data: auctionData
    };
  } catch (error) {
    throw new Error(`Không thể lấy thông tin phiên đấu giá: ${error.message}`);
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
    
    // Lấy danh sách đăng ký tham gia đấu giá
    const registrations = await AuctionRegistration.findAll({
      where: { auction_id: auctionId },
      include: [
        {
          model: User,
          attributes: ['id', 'email', 'first_name', 'last_name']
        }
      ],
      order: [['registration_date', 'DESC']]
    });
    
    return {
      success: true,
      data: {
        auction_id: auctionId,
        total_registrations: registrations.length,
        registrations: registrations.map(reg => ({
          id: reg.id,
          user: {
            id: reg.User.id,
            email: reg.User.email,
            first_name: reg.User.first_name,
            last_name: reg.User.last_name
          },
          registration_date: reg.registration_date,
          status: reg.status
        }))
      }
    };
  } catch (error) {
    throw new Error(`Không thể lấy số lượt đăng ký: ${error.message}`);
  }
};

// Cập nhật trạng thái phiên đấu giá tự động
const updateAuctionStatus = async () => {
  try {
    const now = new Date();
    
    // Tìm các phiên đấu giá đang ở trạng thái pending và đã đến thời gian bắt đầu
    const pendingAuctions = await Auction.findAll({
      where: {
        status: 'pending',
        start_time: { [Op.lte]: now }
      }
    });
    
    // Cập nhật trạng thái thành 'active'
    for (const auction of pendingAuctions) {
      await auction.update({ status: 'active' });
      
      // Emit socket event khi phiên đấu giá bắt đầu (nếu Socket.IO đã được khởi tạo)
      try {
        const socketService = require('../services/socketService');
        socketService.emitToAll('auctionStarted', {
          auction_id: auction.id,
          message: 'Phiên đấu giá đã bắt đầu',
          auction: auction
        });
      } catch (socketError) {
        // Bỏ qua lỗi nếu Socket.IO chưa được khởi tạo (có thể chạy từ scheduled task)
        console.warn(`Không thể gửi socket event cho auction ${auction.id}:`, socketError.message);
      }
    }
    
    // Tìm các phiên đấu giá đang ở trạng thái active và đã đến thời gian kết thúc
    const activeAuctions = await Auction.findAll({
      where: {
        status: 'active',
        end_time: { [Op.lte]: now }
      }
    });
    
    // Cập nhật trạng thái thành 'closed'
    for (const auction of activeAuctions) {
      await auction.update({ status: 'closed' });
      
      // Lấy thông tin người thắng cuộc
      const winner = auction.current_winner_id 
        ? await User.findByPk(auction.current_winner_id) 
        : null;
      
      // Tạo kết quả đấu giá
      if (winner) {
        await AuctionWinner.create({
          auction_id: auction.id,
          user_id: winner.id,
          winning_bid: auction.current_bid,
          win_date: now
        });
        
        // Tạo giao dịch
        await Transaction.create({
          auction_id: auction.id,
          user_id: winner.id,
          amount: auction.current_bid,
          status: 'pending',
          transaction_type: 'auction_win',
          transaction_code: uuidv4(),
          payment_method: 'VNPAY',
          created_at: now
        });
      }
      
      // Emit socket event khi phiên đấu giá kết thúc (nếu Socket.IO đã được khởi tạo)
      try {
        const socketService = require('../services/socketService');
        
        // Lấy thông tin sản phẩm cho phiên đấu giá
        const auctionWithDetails = await Auction.findByPk(auction.id, {
          include: [
            { model: Product, include: [{ model: ProductImage }] },
            { 
              model: User, 
              as: 'CurrentWinner',
              attributes: ['id', 'first_name', 'last_name', 'email'] 
            }
          ]
        });
        
        socketService.notifyAuctionEnded(auction.id, {
          auction_id: auction.id,
          message: 'Phiên đấu giá đã kết thúc',
          auction: auctionWithDetails,
          winner: winner ? {
            id: winner.id,
            name: `${winner.first_name} ${winner.last_name}`,
            email: winner.email
          } : null,
          winning_bid: auction.current_bid
        });
      } catch (socketError) {
        // Bỏ qua lỗi nếu Socket.IO chưa được khởi tạo (có thể chạy từ scheduled task)
        console.warn(`Không thể gửi socket event cho auction ${auction.id}:`, socketError.message);
      }
    }
    
    return {
      success: true,
      message: 'Cập nhật trạng thái phiên đấu giá thành công',
      data: {
        activated: pendingAuctions.length,
        closed: activeAuctions.length
      }
    };
  } catch (error) {
    console.error('Lỗi khi cập nhật trạng thái phiên đấu giá:', error);
    throw new Error(`Không thể cập nhật trạng thái phiên đấu giá: ${error.message}`);
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

// Lấy lịch sử đấu giá
const getAuctionBids = async (auctionId) => {
  try {
    const auction = await Auction.findByPk(auctionId);
    
    if (!auction) {
      throw new Error('Không tìm thấy phiên đấu giá');
    }
    
    // Lấy danh sách lịch sử đấu giá và sắp xếp theo thời gian giảm dần (mới nhất lên đầu)
    const bids = await Bid.findAll({
      where: { auction_id: auctionId },
      include: [
        {
          model: User,
          attributes: ['id', 'email', 'first_name', 'last_name']
        }
      ],
      order: [['created_at', 'DESC']]
    });
    
    // Chuyển đổi thông tin để frontend dễ sử dụng
    const transformedBids = bids.map(bid => ({
      id: bid.id,
      auction_id: bid.auction_id,
      User: bid.User || { username: 'Ẩn danh' },
      bid_amount: bid.bid_amount, // Sử dụng trường amount trong model Bid
      created_at: bid.created_at
    }));
    
    return {
      success: true,
      data: transformedBids
    };
  } catch (error) {
    throw new Error(`Không thể lấy lịch sử đấu giá: ${error.message}`);
  }
};

// Đặt giá cho phiên đấu giá
const placeBid = async (bidData) => {
  try {
    const { auction_id, user_id, bid_amount } = bidData;
    
    // Kiểm tra phiên đấu giá tồn tại
    const auction = await Auction.findByPk(auction_id, {
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
    const startTime = new Date(auction.start_time);
    const endTime = new Date(auction.end_time);
    
    if (now < startTime) {
      throw new Error('Phiên đấu giá chưa bắt đầu');
    }
    
    if (now > endTime) {
      throw new Error('Phiên đấu giá đã kết thúc');
    }
    
    // Kiểm tra giá đặt hợp lệ
    if (!bid_amount || isNaN(bid_amount)) {
      throw new Error('Giá đặt không hợp lệ');
    }
    
    // Lấy giá cao nhất hiện tại
    const highestBid = await Bid.findOne({
      where: { auction_id },
      order: [['bid_amount', 'DESC']] 
    });
    
    const startingPrice = auction.Product.starting_price;
    const minBidAmount = highestBid ? parseFloat(highestBid.bid_amount) : parseFloat(startingPrice);
    const minIncrement = auction.bid_increment || 500000; // Mặc định tăng 500,000 VNĐ
    
    // Kiểm tra giá đặt phải cao hơn giá cao nhất hiện tại
    if (parseFloat(bid_amount) <= parseFloat(minBidAmount)) {
      throw new Error(`Giá đặt phải cao hơn giá hiện tại (${minBidAmount.toLocaleString()} VNĐ)`);
    }
    
    // Kiểm tra giá đặt phải cao hơn giá hiện tại + mức tăng tối thiểu
    if (parseFloat(bid_amount) < parseFloat(minBidAmount) + parseFloat(minIncrement)) {
      throw new Error(`Giá đặt phải cao hơn giá hiện tại ít nhất ${Number(minIncrement).toLocaleString()} VNĐ`);
    }
    
    // Kiểm tra người dùng đã đăng ký tham gia đấu giá chưa 
    const registration = await AuctionRegistration.findOne({
      where: { auction_id, user_id }
    });
    
    if (!registration && auction.require_registration) {
      throw new Error('Bạn cần đăng ký tham gia phiên đấu giá trước khi đặt giá');
    }
    
    // Tạo bản ghi đặt giá mới
    const bid = await Bid.create({
      auction_id,
      user_id,
      bid_amount: parseFloat(bid_amount)
    });
    
    // Cập nhật giá cao nhất của phiên đấu giá
    await auction.update({
      current_bid: parseFloat(bid_amount),
      current_winner_id: user_id
    });
    
    return {
      success: true,
      message: 'Đặt giá thành công',
      data: {
        id: bid.id,
        auction_id: bid.auction_id,
        user_id: bid.user_id,
        bid_amount: bid.bid_amount,
        created_at: bid.created_at
      }
    };
  } catch (error) {
    throw new Error(`Không thể đặt giá: ${error.message}`);
  }
};

// Đăng ký tham gia phiên đấu giá
const registerForAuction = async (auctionId, userId) => {
  try {
    // Kiểm tra xem phiên đấu giá có tồn tại không
    const auction = await Auction.findByPk(auctionId);
    if (!auction) {
      throw new Error('Không tìm thấy phiên đấu giá');
    }

    // Kiểm tra xem phiên đấu giá có ở trạng thái pending không
    if (auction.status !== 'pending') {
      throw new Error('Chỉ có thể đăng ký tham gia phiên đấu giá ở trạng thái chờ');
    }

    // Kiểm tra xem người dùng đã đăng ký tham gia chưa
    const existingRegistration = await AuctionRegistration.findOne({
      where: {
        auction_id: auctionId,
        user_id: userId
      }
    });

    if (existingRegistration) {
      throw new Error('Bạn đã đăng ký tham gia phiên đấu giá này rồi');
    }

    // Tạo đăng ký mới
    const registration = await AuctionRegistration.create({
      auction_id: auctionId,
      user_id: userId,
      registration_date: new Date(),
      status: 'pending'
    });

    return {
      success: true,
      message: 'Đăng ký tham gia đấu giá thành công',
      data: registration
    };
  } catch (error) {
    throw error;
  }

};

// Cập nhật trạng thái đăng ký đấu giá
const updateRegistrationStatus = async (auctionId, registrationId, status, userId) => {
  try {
    // Kiểm tra xem phiên đấu giá có tồn tại không
    const auction = await Auction.findByPk(auctionId);
    if (!auction) {
      throw new Error('Không tìm thấy phiên đấu giá');
    }

    // Kiểm tra trạng thái hợp lệ
    const validStatuses = ['pending', 'approved', 'rejected'];
    if (!validStatuses.includes(status)) {
      throw new Error('Trạng thái không hợp lệ');
    }

    // Kiểm tra đăng ký tồn tại
    const registration = await AuctionRegistration.findOne({
      where: {
        id: registrationId,
        auction_id: auctionId
      },
      include: {
        model: Auction,
        attributes: ['id', 'product_id'],
        include: {
          model: Product,
          attributes: ['seller_id']
        }
      }
    });

    if (!registration) {
      throw new Error('Không tìm thấy đăng ký đấu giá');
    }

    // Kiểm tra xem người cập nhật có phải là người bán của sản phẩm không
    if (registration.Auction.Product.seller_id !== userId) {
      throw new Error('Bạn không có quyền cập nhật trạng thái đăng ký này');
    }

    // Cập nhật trạng thái
    registration.status = status;
    await registration.save();

    return {
      success: true,
      message: 'Cập nhật trạng thái đăng ký thành công',
      data: {
        id: registration.id,
        status: registration.status
      }
    };
  } catch (error) {
    throw error;
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
  registerForAuction,
  updateRegistrationStatus
};
