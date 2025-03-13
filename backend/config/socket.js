const socketIO = require('socket.io');
const jwt = require('jsonwebtoken');
const { Auction, Bid, User } = require('../models');
const logger = require('../middlewares/logger');

let io;

const initializeSocket = (server) => {
  io = socketIO(server, {
    cors: {
      origin: process.env.CLIENT_URL,
      methods: ['GET', 'POST'],
      credentials: true
    }
  });

  // Authentication middleware
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error('Authentication error: Token not provided'));
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.user = decoded;
      next();
    } catch (error) {
      logger.error('Socket authentication error:', error);
      next(new Error('Authentication error: Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    logger.info(`User connected: ${socket.user.id}`);

    // Join auction room
    socket.on('join-auction', (auctionId) => {
      socket.join(`auction:${auctionId}`);
      logger.info(`User ${socket.user.id} joined auction room ${auctionId}`);
    });

    // Leave auction room
    socket.on('leave-auction', (auctionId) => {
      socket.leave(`auction:${auctionId}`);
      logger.info(`User ${socket.user.id} left auction room ${auctionId}`);
    });

    // Place bid
    socket.on('place-bid', async (data, callback) => {
      try {
        const { auctionId, amount } = data;
        const userId = socket.user.id;

        // Validate bid
        const auction = await Auction.findByPk(auctionId);
        if (!auction) {
          return callback({ success: false, message: 'Auction not found' });
        }

        if (auction.status !== 'active') {
          return callback({ success: false, message: 'Auction is not active' });
        }

        if (auction.endDate < new Date()) {
          return callback({ success: false, message: 'Auction has ended' });
        }

        if (amount <= auction.currentPrice) {
          return callback({ success: false, message: 'Bid amount must be higher than current price' });
        }

        if (amount < auction.currentPrice + auction.minIncrement) {
          return callback({ 
            success: false, 
            message: `Bid must be at least ${auction.minIncrement} higher than current price` 
          });
        }

        // Create bid
        const bid = await Bid.create({
          auctionId,
          userId,
          amount,
          timestamp: new Date()
        });

        // Update auction current price
        auction.currentPrice = amount;
        auction.highestBidderId = userId;
        await auction.save();

        // Get bidder info
        const bidder = await User.findByPk(userId, {
          attributes: ['id', 'name']
        });

        const bidData = {
          id: bid.id,
          amount: bid.amount,
          timestamp: bid.timestamp,
          bidder: {
            id: bidder.id,
            name: bidder.name
          }
        };

        // Broadcast new bid to all clients in the auction room
        io.to(`auction:${auctionId}`).emit('new-bid', bidData);

        // Send auction update
        io.to(`auction:${auctionId}`).emit('auction-update', {
          currentPrice: auction.currentPrice,
          highestBidder: {
            id: bidder.id,
            name: bidder.name
          }
        });

        callback({ success: true, data: bidData });
      } catch (error) {
        logger.error('Place bid error:', error);
        callback({ success: false, message: 'Failed to place bid' });
      }
    });

    socket.on('disconnect', () => {
      logger.info(`User disconnected: ${socket.user.id}`);
    });
  });

  return io;
};

const getIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized');
  }
  return io;
};

module.exports = {
  initializeSocket,
  getIO
};