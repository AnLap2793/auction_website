const Auction = require('../models/Auction');
const Product = require('../models/Product');
const Bid = require('../models/Bid');
const ProductImage = require('../models/ProductImage');
const { Op, Sequelize } = require('sequelize');

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
    const auction = await Auction.findByPk(id, {
      include: [
        {
          model: Product
        }
      ]
    });
    
    if (!auction) {
      throw new Error('Không tìm thấy phiên đấu giá');
    }
    
    return {
      success: true,
      data: auction
    };
  } catch (error) {
    throw new Error(`Không thể lấy thông tin đấu giá: ${error.message}`);
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
    
    // Lấy số lượng người đấu giá duy nhất (anonymous_id)
    const bidderCount = await Bid.count({
      distinct: true,
      col: 'anonymous_id',
      where: {
        auction_id: auctionId
      }
    });
    
    // Lấy danh sách chi tiết người đấu giá
    // const bidders = await Bid.findAll({
    //   where: { auction_id: auctionId },
    //   attributes: [
    //     'anonymous_id',
    //     [Sequelize.fn('COUNT', Sequelize.col('Bid.id')), 'bid_count'],
    //     [Sequelize.fn('MAX', Sequelize.col('amount')), 'highest_bid']
    //   ],
    //   include: [
    //     {
    //       model: AnonymousBidder,
    //       attributes: ['id'],
    //       include: [
    //         {
    //           model: User,
    //           attributes: ['id', 'email', 'first_name', 'last_name']
    //         }
    //       ]
    //     }
    //   ],
    //   group: [
    //     'Bid.anonymous_id',
    //     'AnonymousBidder.id', 
    //     'AnonymousBidder.User.id'
    //   ],
    //   order: [[Sequelize.literal('highest_bid'), 'DESC']]
    // });
    
    return {
      success: true,
      data: {
        auction_id: auctionId,
        total_registrations: bidderCount,
        //bidders: bidders
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
    
    // Cập nhật các phiên đấu giá đang diễn ra thành đã kết thúc
    await Auction.update(
      { status: 'closed' },
      {
        where: {
          status: 'active',
          end_time: {
            [Op.lte]: now
          }
        }
      }
    );
    
    return {
      success: true,
      message: 'Cập nhật trạng thái phiên đấu giá thành công'
    };
  } catch (error) {
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

module.exports = {
  getAllAuctions,
  getAuctionById,
  createAuction,
  updateAuction,
  cancelAuction,
  getAuctionRegistrations,
  updateAuctionStatus,
  deleteAuction
};
