const userService = require('../services/userService');

// Lấy danh sách người dùng
const getUsers = async (req, res) => {
  try {
    const users = await userService.getAllUsers();
    
    res.json({
      success: true,
      data: users
    });
  } catch (error) {
    console.error('Lỗi khi lấy danh sách người dùng:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Có lỗi xảy ra khi lấy danh sách người dùng',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Chỉnh sửa thông tin người dùng
const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const userData = req.body;

    const updatedUser = await userService.editUser(id, userData);
    
    res.json({
      success: true,
      message: 'Cập nhật thông tin người dùng thành công',
      data: updatedUser
    });
  } catch (error) {
    console.error('Lỗi khi cập nhật thông tin người dùng:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Có lỗi xảy ra khi cập nhật thông tin người dùng',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Xóa người dùng
const removeUser = async (req, res) => {
  try {
    const { id } = req.params;
    await userService.deleteUser(id);
    res.json({
      success: true,
      message: 'Xóa người dùng thành công'
    });
  } catch (error) {
    console.error('Lỗi khi xóa người dùng:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Có lỗi xảy ra khi xóa người dùng',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Toggle trạng thái người dùng
const toggleUserStatus = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await userService.toggleUserStatus(id);
    
    res.json({
      success: true,
      message: result.message,
      data: result.data
    });
  } catch (error) {
    console.error('Lỗi khi thay đổi trạng thái người dùng:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Có lỗi xảy ra khi thay đổi trạng thái người dùng',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  getUsers,
  updateUser,
  removeUser,
  toggleUserStatus
}; 