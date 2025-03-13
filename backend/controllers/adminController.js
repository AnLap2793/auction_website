const { User, Auction, Bid, Payment, Category } = require('../models');
const { Op } = require('sequelize');
const logger = require('../middlewares/logger');

// Get dashboard statistics
exports.getDashboardStats = async (req, res, next) => {
  try {
    // Total users
    const totalUsers = await User.count();
    
    // Total auctions
    const totalAuctions = await Auction.count();
    
    // Active auctions
    const activeAuctions = await Auction.count({
      where: {
        status: 'active',
        endDate: { [Op.gt]: new Date() }
      }
    });
    
    // Total bids
    const totalBids = await Bid.count();
    
    // Total revenue
    const revenue = await Payment.sum('amount', {
      where: { status: 'completed' }
    });
    
    // Recent auctions
    const recentAuctions = await Auction.findAll({
      order: [['createdAt', 'DESC']],
      limit: 5,
      include: [
        {
          model: User,
          as: 'seller',
          attributes: ['id', 'name']
        },
        {
          model: Category,
          attributes: ['id', 'name']
        }
      ]
    });
    
    // Recent users
    const recentUsers = await User.findAll({
      attributes: ['id', 'name', 'email', 'createdAt'],
      order: [['createdAt', 'DESC']],
      limit: 5
    });
    
    // Monthly revenue data for charts
    const currentYear = new Date().getFullYear();
    const monthlyRevenue = await Payment.findAll({
      attributes: [
        [sequelize.fn('date_trunc', 'month', sequelize.col('createdAt')), 'month'],
        [sequelize.fn('sum', sequelize.col('amount')), 'total']
      ],
      where: {
        status: 'completed',
        createdAt: {
          [Op.gte]: new Date(`${currentYear}-01-01`),
          [Op.lt]: new Date(`${currentYear + 1}-01-01`)
        }
      },
      group: [sequelize.fn('date_trunc', 'month', sequelize.col('createdAt'))],
      order: [[sequelize.fn('date_trunc', 'month', sequelize.col('createdAt')), 'ASC']]
    });
    
    // Format monthly revenue data
    const formattedMonthlyRevenue = Array(12).fill(0);
    monthlyRevenue.forEach(item => {
      const month = new Date(item.dataValues.month).getMonth();
      formattedMonthlyRevenue[month] = parseFloat(item.dataValues.total);
    });
    
    res.status(200).json({
      stats: {
        totalUsers,
        totalAuctions,
        activeAuctions,
        totalBids,
        revenue: revenue || 0
      },
      recentAuctions,
      recentUsers,
      charts: {
        monthlyRevenue: formattedMonthlyRevenue
      }
    });
  } catch (error) {
    logger.error('Get dashboard stats error:', error);
    next(error);
  }
};

// Get all users (with pagination)
exports.getUsers = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    
    // Build search conditions
    const whereConditions = {};
    if (req.query.search) {
      whereConditions[Op.or] = [
        { name: { [Op.iLike]: `%${req.query.search}%` } },
        { email: { [Op.iLike]: `%${req.query.search}%` } }
      ];
    }
    
    // Get users
    const { count, rows: users } = await User.findAndCountAll({
      where: whereConditions,
      attributes: { exclude: ['password'] },
      order: [['createdAt', 'DESC']],
      limit,
      offset
    });
    
    res.status(200).json({
      users,
      total: count,
      page,
      totalPages: Math.ceil(count / limit)
    });
  } catch (error) {
    logger.error('Get users error:', error);
    next(error);
  }
};

// Update user
exports.updateUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, email, role, isActive } = req.body;
    
    // Find user
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Update user
    await user.update({
      name: name || user.name,
      email: email || user.email,
      role: role || user.role,
      isActive: isActive !== undefined ? isActive : user.isActive
    });
    
    res.status(200).json({
      message: 'User updated successfully',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    logger.error('Update user error:', error);
    next(error);
  }
};

// Delete user
exports.deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Check if trying to delete self
    if (id === req.user.id) {
      return res.status(400).json({ message: 'Cannot delete your own account' });
    }
    
    // Find user
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Delete user
    await user.destroy();
    
    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    logger.error('Delete user error:', error);
    next(error);
  }
};

// Get all auctions (with pagination)
exports.getAuctions = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    
    // Build filter conditions
    const whereConditions = {};
    
    if (req.query.status) {
      whereConditions.status = req.query.status;
    }
    
    if (req.query.search) {
      whereConditions[Op.or] = [
        { title: { [Op.iLike]: `%${req.query.search}%` } },
        { description: { [Op.iLike]: `%${req.query.search}%` } }
      ];
    }
    
    // Get auctions
    const { count, rows: auctions } = await Auction.findAndCountAll({
      where: whereConditions,
      include: [
        {
          model: User,
          as: 'seller',
          attributes: ['id', 'name']
        },
        {
          model: Category,
          attributes: ['id', 'name']
        }
      ],
      order: [['createdAt', 'DESC']],
      limit,
      offset
    });
    
    res.status(200).json({
      auctions,
      total: count,
      page,
      totalPages: Math.ceil(count / limit)
    });
  } catch (error) {
    logger.error('Get auctions error:', error);
    next(error);
  }
};

// Get transaction report
exports.getTransactionReport = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    
    // Build date filter
    const dateFilter = {};
    if (startDate) {
      dateFilter[Op.gte] = new Date(startDate);
    }
    if (endDate) {
      dateFilter[Op.lte] = new Date(endDate);
    }
    
    // Get payments
    const payments = await Payment.findAll({
      where: {
        ...(Object.keys(dateFilter).length > 0 && { createdAt: dateFilter }),
        status: 'completed'
      },
      include: [
        {
          model: User,
          attributes: ['id', 'name', 'email']
        },
        {
          model: Auction,
          attributes: ['id', 'title', 'currentPrice']
        }
      ],
      order: [['createdAt', 'DESC']]
    });
    
        // Calculate total
        const total = payments.reduce((sum, payment) => sum + payment.amount, 0);
    
        res.status(200).json({
          payments,
          total,
          count: payments.length
        });
      } catch (error) {
        logger.error('Get transaction report error:', error);
        next(error);
      }
    };
    
    // Get system settings
    exports.getSystemSettings = async (req, res, next) => {
      try {
        // Get settings from database or config
        const settings = {
          siteName: process.env.SITE_NAME || 'Auction Hub',
          contactEmail: process.env.CONTACT_EMAIL || 'support@auctionhub.com',
          commissionRate: process.env.COMMISSION_RATE || 5,
          maintenanceMode: process.env.MAINTENANCE_MODE === 'true',
          allowUserRegistration: process.env.ALLOW_USER_REGISTRATION !== 'false',
          defaultAuctionDuration: process.env.DEFAULT_AUCTION_DURATION || 7,
          minBidIncrement: process.env.MIN_BID_INCREMENT || 1
        };
        
        res.status(200).json({ settings });
      } catch (error) {
        logger.error('Get system settings error:', error);
        next(error);
      }
    };
    
    // Update system settings
    exports.updateSystemSettings = async (req, res, next) => {
      try {
        const {
          siteName,
          contactEmail,
          commissionRate,
          maintenanceMode,
          allowUserRegistration,
          defaultAuctionDuration,
          minBidIncrement
        } = req.body;
        
        // Update environment variables or database settings
        // This is a simplified example - in a real app, you'd store these in a database
        process.env.SITE_NAME = siteName;
        process.env.CONTACT_EMAIL = contactEmail;
        process.env.COMMISSION_RATE = commissionRate;
        process.env.MAINTENANCE_MODE = maintenanceMode ? 'true' : 'false';
        process.env.ALLOW_USER_REGISTRATION = allowUserRegistration ? 'true' : 'false';
        process.env.DEFAULT_AUCTION_DURATION = defaultAuctionDuration;
        process.env.MIN_BID_INCREMENT = minBidIncrement;
        
        res.status(200).json({
          message: 'Settings updated successfully',
          settings: {
            siteName,
            contactEmail,
            commissionRate,
            maintenanceMode,
            allowUserRegistration,
            defaultAuctionDuration,
            minBidIncrement
          }
        });
      } catch (error) {
        logger.error('Update system settings error:', error);
        next(error);
      }
    };