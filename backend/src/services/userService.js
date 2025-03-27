const { User } = require('../models');

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

module.exports = {
  getAllUsers,
  editUser,
  deleteUser,
  toggleUserStatus
}; 