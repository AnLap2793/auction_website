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


module.exports = {
  getUsers,
}; 