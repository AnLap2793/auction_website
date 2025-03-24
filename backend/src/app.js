require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { sequelize } = require('./models');
const syncDatabase = require('./utils/dbSync');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Test Database Connection
const testDbConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('Kết nối cơ sở dữ liệu thành công.');
    
    // Đồng bộ database 
    // Cẩn thận: Tùy chọn force: true sẽ xóa dữ liệu hiện có
    if (process.env.NODE_ENV === 'development') {
      await syncDatabase();
    }
  } catch (error) {
    console.error('Kết nối cơ sở dữ liệu thất bại:', error);
  }
};

testDbConnection();

// Định nghĩa routes sẽ được thêm sau
// app.use('/api/users', require('./routes/users'));
// app.use('/api/categories', require('./routes/categories'));
// app.use('/api/products', require('./routes/products'));
// app.use('/api/auctions', require('./routes/auctions'));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Có lỗi xảy ra trên máy chủ',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

module.exports = app;
