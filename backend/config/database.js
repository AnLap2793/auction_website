const { Sequelize } = require('sequelize');
const config = require('../config/database');
const logger = require('../middlewares/logger');

// Initialize Sequelize with PostgreSQL
const sequelize = new Sequelize(config.database, config.username, config.password, {
  host: config.host,
  dialect: 'postgres',
  logging: (msg) => logger.debug(msg),
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
});

// Import models
const User = require('./User')(sequelize);
const Category = require('./Category')(sequelize);
const Auction = require('./Auction')(sequelize);
const Bid = require('./Bid')(sequelize);
const Payment = require('./Payment')(sequelize);
const Wishlist = require('./Wishlist')(sequelize);

// Define associations
User.hasMany(Auction, { foreignKey: 'sellerId', as: 'auctions' });
Auction.belongsTo(User, { foreignKey: 'sellerId', as: 'seller' });

User.hasMany(Bid, { foreignKey: 'userId' });
Bid.belongsTo(User, { foreignKey: 'userId' });

Auction.hasMany(Bid, { foreignKey: 'auctionId' });
Bid.belongsTo(Auction, { foreignKey: 'auctionId' });

Category.hasMany(Auction, { foreignKey: 'categoryId' });
Auction.belongsTo(Category, { foreignKey: 'categoryId' });

User.hasMany(Payment, { foreignKey: 'userId' });
Payment.belongsTo(User, { foreignKey: 'userId' });

Auction.hasMany(Payment, { foreignKey: 'auctionId' });
Payment.belongsTo(Auction, { foreignKey: 'auctionId' });

Auction.belongsTo(User, { foreignKey: 'highestBidderId', as: 'highestBidder' });

User.belongsToMany(Auction, { through: Wishlist, foreignKey: 'userId' });
Auction.belongsToMany(User, { through: Wishlist, foreignKey: 'auctionId' });

// Export models and Sequelize instance
module.exports = {
  sequelize,
  Sequelize,
  User,
  Category,
  Auction,
  Bid,
  Payment,
  Wishlist
};