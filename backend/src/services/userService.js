const { User, Transaction, Auction, Product, AuctionWinner } = require('../models');

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

    // Lấy anonymous_winner_id từ bảng auction_winners
    const auctionWinners = await AuctionWinner.findAll({
      where: {
        real_winner_id: userId
      }
    });

    if (!auctionWinners.length) {
      return {
        success: false,
        data: {
          totalBids: 0,
          auctionsWon: 0,
          activeBids: 0,
          bidHistory: []
        }
      };
    }

    const anonymousIds = auctionWinners.map(aw => aw.anonymous_winner_id);

    // Lấy tất cả các giao dịch của người dùng
    const transactions = await Transaction.findAll({
      where: {
        anonymous_winner_id: anonymousIds
      },
      include: [{
        model: Auction,
        include: [{
          model: Product,
          attributes: ['id', 'title', 'description']
        }]
      }]
    });

    // Tính toán thống kê
    const stats = {
      totalBids: transactions.length,
      auctionsWon: transactions.filter(t => t.status === 'completed').length,
      activeBids: transactions.filter(t => t.status === 'pending').length,
      bidHistory: transactions.map(t => ({
        id: t.id,
        item: t.Auction?.Product?.title || 'Sản phẩm đấu giá',
        date: t.created_at,
        amount: t.amount,
        status: t.status,
        transaction_code: t.transaction_code,
        payment_method: t.payment_method,
        product_id: t.Auction?.Product?.id
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