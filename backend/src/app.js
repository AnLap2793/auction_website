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
    // Tùy chọn force: true sẽ xóa dữ liệu hiện có
    if (process.env.NODE_ENV === 'development') {
      await syncDatabase();
    }
  } catch (error) {
    console.error('Kết nối cơ sở dữ liệu thất bại:', error);
  }
};

testDbConnection();

// Routes
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/images', require('./routes/imageRoutes'));
app.use('/api/categories', require('./routes/categoryRoutes'));
app.use('/api/auctions', require('./routes/auctionRoutes'));


// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    status: 'error',
    message: 'Đã xảy ra lỗi, vui lòng thử lại sau'
  });
});

module.exports = app;
