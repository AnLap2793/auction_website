const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const SellerProduct = sequelize.define('SellerProduct', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  seller_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  product_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'products',
      key: 'id'
    }
  }
}, {
  timestamps: false,
  tableName: 'seller_products',
  underscored: true
});

module.exports = SellerProduct; 