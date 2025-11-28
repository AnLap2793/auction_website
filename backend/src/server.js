require('dotenv').config();
const app = require('./app');
const http = require('http');
const { Server } = require('socket.io');
const { redisClient, connectRedis } = require('./config/redis');
const socketService = require('./services/socketService');
const bidQueueService = require('./services/bidQueueService');

const port = process.env.PORT || 5000;

// Tạo HTTP server
const server = http.createServer(app);

// Kết nối Redis
connectRedis();

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

// Khởi tạo Socket.IO service
socketService.init(io);

// Socket.IO events
io.on('connection', (socket) => {
  console.log(`Người dùng kết nối: ${socket.id}`);
  
  // Lắng nghe sự kiện khi có người đặt giá
  socket.on('placeBid', async (data) => {
    try {
      // Thêm bid vào hàng đợi xử lý
      await bidQueueService.enqueueBid({
        auction_id: data.auctionId,
        user_id: data.userId,
        bid_amount: data.amount
      });

      // Gửi thông báo cho người dùng rằng bid đã được nhận
      socket.emit('bidReceived', {
        message: 'Lượt đặt giá của bạn đã được nhận và đang được xử lý'
      });
    } catch (error) {
      console.error('Lỗi xử lý đặt giá:', error);
      socket.emit('bidError', { message: 'Có lỗi xảy ra khi xử lý đặt giá' });
    }
  });
  
  // Tham gia vào phòng đấu giá
  socket.on('joinAuction', async (auctionId) => {
    socket.join(`auction-${auctionId}`);
    console.log(`Người dùng ${socket.id} đã tham gia phòng auction-${auctionId}`);
    
    // Gửi thông tin giá cao nhất hiện tại cho người dùng mới
    const highestBid = await redisClient.get(`auction:${auctionId}:highestBid`);
    if (highestBid) {
      socket.emit('currentHighestBid', JSON.parse(highestBid));
    }
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