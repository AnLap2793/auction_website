const { User, Transaction, Auction, Product, AuctionWinner, Bid } = require('../models');

// Lấy danh sách người dùng
const getAllUsers = async () => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ['password_hash'] },
      order: [['created_at', 'DESC']]
    });
    return users;
  } catch (error) {
    throw new Error('Lỗi khi lấy danh sách người dùng: ' + error.message);
  }
};

// Chỉnh sửa thông tin người dùng
const editUser = async (userId, userData) => {
  try {
    const user = await User.findByPk(userId);
    if (!user) {
      throw new Error('Không tìm thấy người dùng');
    }

    // Cập nhật thông tin người dùng và thời gian cập nhật
    await user.update({
      ...userData,
      updated_at: new Date()
    });
    
    // Lấy lại thông tin người dùng đã cập nhật
    const updatedUser = await User.findByPk(userId, {
      attributes: { exclude: ['password_hash'] }
    });

    return {
      success: true,
      message: 'Cập nhật thông tin người dùng thành công',
      data: updatedUser
    };
  } catch (error) {
    throw new Error('Lỗi khi sửa thông tin người dùng: ' + error.message);
  }
};

// Xóa người dùng
const deleteUser = async (userId) => {
  try {
    const user = await User.findByPk(userId);
    if (!user) {
      throw new Error('Không tìm thấy người dùng');
    }

    await user.destroy();
    return { message: 'Xóa người dùng thành công' };
  } catch (error) {
    throw new Error('Lỗi khi xóa người dùng: ' + error.message);
  }
};

// Toggle trạng thái người dùng
const toggleUserStatus = async (userId) => {
  try {
    const user = await User.findByPk(userId);
    if (!user) {
      throw new Error('Không tìm thấy người dùng');
    }

    // Toggle trạng thái từ active sang inactive hoặc ngược lại
    const newStatus = !user.is_active;
    await user.update({ is_active: newStatus });

    // Lấy lại thông tin người dùng đã cập nhật
    const updatedUser = await User.findByPk(userId, {
      attributes: { exclude: ['password_hash'] }
    });

    return {
      success: true,
      message: `Đã ${newStatus ? 'kích hoạt' : 'vô hiệu hóa'} tài khoản người dùng`,
      data: updatedUser
    };
  } catch (error) {
    throw new Error('Lỗi khi thay đổi trạng thái người dùng: ' + error.message);
  }
};

// Lấy thống kê đặt giá của người dùng
const getUserBidStats = async (userId) => {
  try {
    const user = await User.findByPk(userId);
    if (!user) {
      throw new Error('Không tìm thấy người dùng');
    }

    // Lấy tất cả các lần đặt giá của người dùng từ bảng Bid
    const bids = await Bid.findAll({
      where: {
        user_id: userId
      },
      include: [{
        model: Auction,
        include: [{
          model: Product,
          attributes: ['id', 'title', 'description']
        }]
      }],
      order: [['created_at', 'DESC']]
    });

    // Lấy các cuộc đấu giá đã thắng từ bảng AuctionWinner
    const auctionsWon = await AuctionWinner.count({
      where: {
        winner_id: userId
      }
    });

    // Đếm các đấu giá đang hoạt động mà người dùng tham gia
    const activeBids = await Bid.count({
      where: {
        user_id: userId
      },
      include: [{
        model: Auction,
        where: {
          status: 'active'
        }
      }],
      distinct: true,
      col: 'auction_id'
    });

    // Tính toán thống kê
    const stats = {
      totalBids: bids.length,
      auctionsWon: auctionsWon,
      activeBids: activeBids,
      bidHistory: bids.map(bid => ({
        id: bid.id,
        item: bid.Auction?.Product?.title || 'Sản phẩm đấu giá',
        date: bid.created_at,
        amount: bid.bid_amount,
        status: bid.Auction?.status,
        auction_id: bid.auction_id,
        product_id: bid.Auction?.Product?.id
      }))
    };

    return {
      success: true,
      data: stats
    };
  } catch (error) {
    throw new Error('Lỗi khi lấy thống kê đặt giá: ' + error.message);
  }
};

module.exports = {
  getAllUsers,
  editUser,
  deleteUser,
  toggleUserStatus,
  getUserBidStats
}; 