require('dotenv').config();
const app = require('./app');
const http = require('http');
const { Server } = require('socket.io');

const port = process.env.PORT || 5000;

// Tạo HTTP server
const server = http.createServer(app);

// Tạo Socket.IO server
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"]
  }
});

// In thông báo khi Socket.IO server khởi động
//console.log(`Socket.IO server được cấu hình với CORS origin: ${process.env.FRONTEND_URL || "http://localhost:5173"}`);

// Socket.IO events
io.on('connection', (socket) => {
  console.log(`Người dùng kết nối: ${socket.id}`);
  
  // Lắng nghe sự kiện khi có người đặt giá
  socket.on('placeBid', (data) => {
    // Broadcast đến tất cả người dùng trong phòng
    io.to(`auction-${data.auctionId}`).emit('newBid', data);
  });
  
  // Tham gia vào phòng đấu giá
  socket.on('joinAuction', (auctionId) => {
    socket.join(`auction-${auctionId}`);
    console.log(`Người dùng ${socket.id} đã tham gia phòng auction-${auctionId}`);
  });
  
  // Rời khỏi phòng đấu giá
  socket.on('leaveAuction', (auctionId) => {
    socket.leave(`auction-${auctionId}`);
    console.log(`Người dùng ${socket.id} đã rời khỏi phòng auction-${auctionId}`);
  });
  
  // Xử lý khi ngắt kết nối
  socket.on('disconnect', () => {
    console.log(`Người dùng ngắt kết nối: ${socket.id}`);
  });
});

//API
app.get("/", (req, res) => {
    res.send("Hello world!");
});

//Khởi động server
server.listen(port, () => {
    console.log(`Server đang chạy trên cổng ${port}`);
});

// Xuất app và io để có thể sử dụng trong các module khác
module.exports = { app, io };