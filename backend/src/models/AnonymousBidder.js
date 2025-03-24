const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const AnonymousBidder = sequelize.define('AnonymousBidder', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  real_user_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  anonymous_id: {
    type: DataTypes.TEXT,
    allowNull: false,
    unique: true
  }
}, {
  timestamps: false,
  tableName: 'anonymous_bidders',
  underscored: true
});

module.exports = AnonymousBidder; 