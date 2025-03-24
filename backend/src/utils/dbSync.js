const { sequelize } = require('../models');

const syncDatabase = async () => {
  try {
    // Đồng bộ hóa các mô hình với cơ sở dữ liệu
    await sequelize.sync({ alter: true });
    console.log('Cơ sở dữ liệu đã được đồng bộ thành công');
  } catch (error) {
    console.error('Lỗi đồng bộ cơ sở dữ liệu:', error);
    throw error;
  }
};

module.exports = syncDatabase; 