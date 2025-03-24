const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const AuctionWinner = sequelize.define('AuctionWinner', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  auction_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'auctions',
      key: 'id'
    }
  },
  real_winner_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  anonymous_winner_id: {
    type: DataTypes.TEXT,
    allowNull: false,
    unique: true
  }
}, {
  timestamps: false,
  tableName: 'auction_winners',
  underscored: true
});

module.exports = AuctionWinner; 