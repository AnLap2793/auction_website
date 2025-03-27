const sequelize = require('../config/database');
const { DataTypes } = require('sequelize');

// Import models
const User = require('./User');
const Category = require('./Category');
const Product = require('./Product');
const ProductImage = require('./ProductImage');
const Auction = require('./Auction');
const AnonymousBidder = require('./AnonymousBidder');
const Bid = require('./Bid');
const AuctionWinner = require('./AuctionWinner');
const Transaction = require('./Transaction');
const Notification = require('./Notification');

// Định nghĩa các mối quan hệ
// Category - Product (1:n)
Category.hasMany(Product, { foreignKey: 'category_id' });
Product.belongsTo(Category, { foreignKey: 'category_id' });

// User - Product (1:n)
User.hasMany(Product, { foreignKey: 'seller_id' });
Product.belongsTo(User, { foreignKey: 'seller_id' });

// Product - ProductImage (1:n)
Product.hasMany(ProductImage, { foreignKey: 'product_id' });
ProductImage.belongsTo(Product, { foreignKey: 'product_id' });

// Product - Auction (1:n)
Product.hasMany(Auction, { foreignKey: 'product_id' });
Auction.belongsTo(Product, { foreignKey: 'product_id' });

// User - AnonymousBidder (1:1)
User.hasOne(AnonymousBidder, { foreignKey: 'real_user_id' });
AnonymousBidder.belongsTo(User, { foreignKey: 'real_user_id' });

// Auction - Bid (1:n)
Auction.hasMany(Bid, { foreignKey: 'auction_id' });
Bid.belongsTo(Auction, { foreignKey: 'auction_id' });

// AnonymousBidder - Bid (1:n)
AnonymousBidder.hasMany(Bid, { foreignKey: 'anonymous_id', sourceKey: 'anonymous_id' });
Bid.belongsTo(AnonymousBidder, { foreignKey: 'anonymous_id', targetKey: 'anonymous_id' });

// Auction - AuctionWinner (1:1)
Auction.hasOne(AuctionWinner, { foreignKey: 'auction_id' });
AuctionWinner.belongsTo(Auction, { foreignKey: 'auction_id' });

// User - AuctionWinner (1:n)
User.hasMany(AuctionWinner, { foreignKey: 'real_winner_id' });
AuctionWinner.belongsTo(User, { foreignKey: 'real_winner_id' });

// AuctionWinner - Transaction (1:n)
AuctionWinner.hasMany(Transaction, { foreignKey: 'anonymous_winner_id', sourceKey: 'anonymous_winner_id' });
Transaction.belongsTo(AuctionWinner, { foreignKey: 'anonymous_winner_id', targetKey: 'anonymous_winner_id' });

// Auction - Transaction (1:n)
Auction.hasMany(Transaction, { foreignKey: 'auction_id' });
Transaction.belongsTo(Auction, { foreignKey: 'auction_id' });

// User - Notification (1:n)
User.hasMany(Notification, { foreignKey: 'user_id' });
Notification.belongsTo(User, { foreignKey: 'user_id' });

// Xuất các models
module.exports = {
  sequelize,
  User,
  Category,
  Product,
  ProductImage,
  Auction,
  AnonymousBidder,
  Bid,
  AuctionWinner,
  Transaction,
  Notification
}; 