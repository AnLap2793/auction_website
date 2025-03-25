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



module.exports = {
  getAllUsers
}; 