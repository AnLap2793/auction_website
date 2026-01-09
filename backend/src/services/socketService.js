let io;

// Khởi tạo Socket.IO
function init(socketIo) {
  io = socketIo;
  return io;
}

// Lấy đối tượng io đã khởi tạo
function getIO() {
  if (!io) {
    throw new Error('Đối tượng Socket.IO chưa được khởi tạo!');
  }
  return io;
}

// Gửi thông báo đến tất cả người dùng
function emitToAll(event, data) {
  getIO().emit(event, data);
}

// Gửi thông báo đến một phòng cụ thể
function emitToRoom(room, event, data) {
  getIO().to(room).emit(event, data);
}

// Gửi thông báo đến một người dùng cụ thể
function emitToUser(socketId, event, data) {
  getIO().to(socketId).emit(event, data);
}

// Gửi thông báo khi có giá mới trong phòng đấu giá
function notifyNewBid(auctionId, bidData) {
  emitToRoom(`auction-${auctionId}`, 'newBid', bidData);
}

// Gửi thông báo khi đấu giá kết thúc
function notifyAuctionEnded(auctionId, auctionData) {
  emitToRoom(`auction-${auctionId}`, 'auctionEnded', auctionData);
}

// Gửi thông báo khi có đấu giá mới được tạo
function notifyNewAuction(auctionData) {
  emitToAll('newAuction', auctionData);
}

// Gửi thông báo khi bid xử lý thất bại
function notifyBidFailed(auctionId, errorData) {
  emitToRoom(`auction-${auctionId}`, 'bidFailed', errorData);
}

module.exports = {
  init,
  getIO,
  emitToAll,
  emitToRoom,
  emitToUser,
  notifyNewBid,
  notifyAuctionEnded,
  notifyNewAuction,
  notifyBidFailed
}; 