// Import module server
const { app, io } = require('./server');
const socketService = require('./services/socketService');

// Khởi tạo Socket.IO service
socketService.init(io);

// Export app để có thể sử dụng trong testing
module.exports = app; 