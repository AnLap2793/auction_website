const sequelize = require('../config/database');
const { DataTypes } = require('sequelize');

// Import models
const User = require('./User');
const Category = require('./Category');
const Product = require('./Product');
const ProductImage = require('./ProductImage');
const Auction = require('./Auction');
const Bid = require('./Bid');
const AuctionWinner = require('./AuctionWinner');
const Transaction = require('./Transaction');
const Notification = require('./Notification');
const AuctionRegistration = require('./AuctionRegistration');

// Định nghĩa các mối quan hệ
// Category - Product (1:n)
Category.hasMany(Product, { foreignKey: 'category_id' });
Product.belongsTo(Category, { foreignKey: 'category_id' });

// User - Product (1:n)
User.hasMany(Product, { foreignKey: 'seller_id' });
Product.belongsTo(User, { foreignKey: 'seller_id', as: 'Seller' });

// Product - ProductImage (1:n)
Product.hasMany(ProductImage, { foreignKey: 'product_id' });
ProductImage.belongsTo(Product, { foreignKey: 'product_id' });

// Product - Auction (1:n)
Product.hasMany(Auction, { foreignKey: 'product_id' });
Auction.belongsTo(Product, { foreignKey: 'product_id' });

// Auction - Bid (1:n)
Auction.hasMany(Bid, { foreignKey: 'auction_id' });
Bid.belongsTo(Auction, { foreignKey: 'auction_id' });

// User - Bid (1:n)
User.hasMany(Bid, { foreignKey: 'user_id' });
Bid.belongsTo(User, { foreignKey: 'user_id' });

// Auction - AuctionWinner (1:1)
Auction.hasOne(AuctionWinner, { foreignKey: 'auction_id' });
AuctionWinner.belongsTo(Auction, { foreignKey: 'auction_id' });

// User - AuctionWinner (1:n)
User.hasMany(AuctionWinner, { foreignKey: 'winner_id' });
AuctionWinner.belongsTo(User, { foreignKey: 'winner_id' });

// Auction - Transaction (1:n)
Auction.hasMany(Transaction, { foreignKey: 'auction_id' });
Transaction.belongsTo(Auction, { foreignKey: 'auction_id' });

// User - Notification (1:n)
User.hasMany(Notification, { foreignKey: 'user_id' });
Notification.belongsTo(User, { foreignKey: 'user_id' });

// Auction - AuctionRegistration (1:n)
Auction.hasMany(AuctionRegistration, { foreignKey: 'auction_id' });
AuctionRegistration.belongsTo(Auction, { foreignKey: 'auction_id' });

// User - AuctionRegistration (1:n)
User.hasMany(AuctionRegistration, { foreignKey: 'user_id' });
AuctionRegistration.belongsTo(User, { foreignKey: 'user_id' });

// Auction - User (qua current_winner_id)
Auction.belongsTo(User, { as: 'CurrentWinner', foreignKey: 'current_winner_id' });
User.hasMany(Auction, { as: 'WinningAuctions', foreignKey: 'current_winner_id' });

// Xuất các models
module.exports = {
  sequelize,
  User,
  Category,
  Product,
  ProductImage,
  Auction,
  Bid,
  AuctionWinner,
  Transaction,
  Notification,
  AuctionRegistration
}; 