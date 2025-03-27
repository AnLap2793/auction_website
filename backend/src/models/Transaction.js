const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Transaction = sequelize.define('Transaction', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  anonymous_winner_id: {
    type: DataTypes.TEXT,
    allowNull: false,
    references: {
      model: 'auction_winners',
      key: 'anonymous_winner_id'
    }
  },
  auction_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'auctions',
      key: 'id'
    }
  },
  amount: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false
  },
  status: {
    type: DataTypes.TEXT,
    allowNull: false,
    validate: {
      isIn: [['pending', 'completed', 'failed']]
    }
  },
  payment_method: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  transaction_code: {
    type: DataTypes.TEXT,
    allowNull: false,
    unique: true
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  updated_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  timestamps: false,
  tableName: 'transactions',
  underscored: true
});

module.exports = Transaction; 