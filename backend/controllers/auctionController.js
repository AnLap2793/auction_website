const { validationResult } = require('express-validator');
const { Op } = require('sequelize');
const { Auction, User, Bid, Category, Wishlist } = require('../models');
const logger = require('../middlewares/logger');
const { getIO } = require('../config/socket');

// Get all auctions with pagination and filters
exports.getAuctions = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const offset = (page - 1) * limit;
    
    // Build filter conditions
    const whereConditions = {};
    
    if (req.query.category) {
      whereConditions.categoryId = req.query.category;
    }
    
    if (req.query.status) {
      whereConditions.status = req.query.status;
    }
    
    if (req.query.minPrice) {
      whereConditions.currentPrice = {
        ...whereConditions.currentPrice,
        [Op.gte]: parseFloat(req.query.minPrice)
      };
    }
    
    if (req.query.maxPrice) {
      whereConditions.currentPrice = {
        ...whereConditions.currentPrice,
        [Op.lte]: parseFloat(req.query.maxPrice)
      };
    }
    
    if (req.query.search) {
      whereConditions[Op.or] = [
        { title: { [Op.iLike]: `%${req.query.search}%` } },
        { description: { [Op.iLike]: `%${req.query.search}%` } }
      ];
    }
    
    // Get current date
    const now = new Date();
    
    // Featured auctions (popular with most bids)
    const featuredAuctions = await Auction.findAll({
      where: {
        status: 'active',
        startDate: { [Op.lte]: now },
        endDate: { [Op.gt]: now },
        ...whereConditions
      },
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
      order: [['bidCount', 'DESC']],
      limit: 6
    });
    
    // Upcoming auctions
    const upcomingAuctions = await Auction.findAll({
      where: {
        status: 'pending',
        startDate: { [Op.gt]: now },
        ...whereConditions
      },
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
      order: [['startDate', 'ASC']],
      limit,
      offset
    });
    
    // Ongoing auctions
    const ongoingAuctions = await Auction.findAll({
      where: {
        status: 'active',
        startDate: { [Op.lte]: now },
        endDate: { [Op.gt]: now },
        ...whereConditions
      },
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
      order: [['endDate', 'ASC']],
      limit,
      offset
    });
    
    // Get total count for pagination
    const totalCount = await Auction.count({
      where: whereConditions
    });
    
    res.status(200).json({
      featured: featuredAuctions,
      upcoming: upcomingAuctions,
      ongoing: ongoingAuctions,
      total: totalCount,
      page,
      limit,
      totalPages: Math.ceil(totalCount / limit)
    });
  } catch (error) {
    logger.error('Get auctions error:', error);
    next(error);
  }
};

// Get auction by ID
exports.getAuctionById = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const auction = await Auction.findByPk(id, {
      include: [
        {
          model: User,
          as: 'seller',
          attributes: ['id', 'name', 'email']
        },
        {
          model: Category,
          attributes: ['id', 'name']
        },
        {
          model: User,
          as: 'highestBidder',
          attributes: ['id', 'name']
        }
      ]
    });
    
    if (!auction) {
      return res.status(404).json({ message: 'Auction not found' });
    }
    
    // Get bid history
    const bidHistory = await Bid.findAll({
      where: { auctionId: id },
      include: [
        {
          model: User,
          attributes: ['id', 'name']
        }
      ],
      order: [['timestamp', 'DESC']],
      limit: 20
    });
    
    // Check if auction is in user's wishlist
    let inWishlist = false;
    if (req.user) {
      const wishlistItem = await Wishlist.findOne({
        where: {
          userId: req.user.id,
          auctionId: id
        }
      });
      inWishlist = !!wishlistItem;
    }
    
    res.status(200).json({
      auction,
      bidHistory,
      inWishlist
    });
  } catch (error) {
    logger.error('Get auction by ID error:', error);
    next(error);
  }
};

// Create new auction
exports.createAuction = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const {
      title,
      description,
      startingPrice,
      minIncrement,
      startDate,
      endDate,
      categoryId
    } = req.body;
    
    // Check if category exists
    const category = await Category.findByPk(categoryId);
    if (!category) {
      return res.status(400).json({ message: 'Invalid category' });
    }
    
    // Process uploaded images
    const images = req.files ? req.files.map(file => file.path) : [];
    
    // Create auction
    const auction = await Auction.create({
      title,
      description,
      startingPrice,
      currentPrice: startingPrice,
      minIncrement,
      startDate,
      endDate,
      images,
      status: new Date(startDate) <= new Date() ? 'active' : 'pending',
      sellerId: req.user.id,
      categoryId
    });
    
    res.status(201).json({
      message: 'Auction created successfully',
      auction
    });
  } catch (error) {
    logger.error('Create auction error:', error);
    next(error);
  }
};

// Update auction
exports.updateAuction = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const { id } = req.params;
    const {
      title,
      description,
      minIncrement,
      startDate,
      endDate,
      categoryId
    } = req.body;
    
    // Find auction
    const auction = await Auction.findByPk(id);
    if (!auction) {
      return res.status(404).json({ message: 'Auction not found' });
    }
    
    // Check if user is the seller
    if (auction.sellerId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to update this auction' });
    }
    
    // Check if auction has already started
    if (auction.status !== 'pending' && (startDate || endDate)) {
      return res.status(400).json({ message: 'Cannot update dates for an active or ended auction' });
    }
    
    // Update auction
    await auction.update({
      title: title || auction.title,
      description: description || auction.description,
      minIncrement: minIncrement || auction.minIncrement,
      startDate: startDate || auction.startDate,
      endDate: endDate || auction.endDate,
      categoryId: categoryId || auction.categoryId
    });
    
    // Process new images if any
    if (req.files && req.files.length > 0) {
      const newImages = req.files.map(file => file.path);
      auction.images = [...auction.images, ...newImages];
      await auction.save();
    }
    
    // Notify clients about the update
    const io = getIO();
    io.to(`auction:${id}`).emit('auction-update', auction);
    
    res.status(200).json({
      message: 'Auction updated successfully',
      auction
    });
  } catch (error) {
    logger.error('Update auction error:', error);
    next(error);
  }
};

// Delete auction
exports.deleteAuction = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Find auction
    const auction = await Auction.findByPk(id);
    if (!auction) {
      return res.status(404).json({ message: 'Auction not found' });
    }
    
    // Check if user is the seller or admin
    if (auction.sellerId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this auction' });
    }
    
    // Check if auction has bids
    const bidCount = await Bid.count({ where: { auctionId: id } });
    if (bidCount > 0 && auction.status === 'active') {
      return res.status(400).json({ message: 'Cannot delete an active auction with bids' });
    }
    
    // Delete auction
    await auction.destroy();
    
    res.status(200).json({ message: 'Auction deleted successfully' });
  } catch (error) {
    logger.error('Delete auction error:', error);
    next(error);
  }
};

// Add to wishlist
exports.addToWishlist = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Check if auction exists
    const auction = await Auction.findByPk(id);
    if (!auction) {
      return res.status(404).json({ message: 'Auction not found' });
    }
    
    // Check if already in wishlist
    const existingItem = await Wishlist.findOne({
      where: {
        userId: req.user.id,
        auctionId: id
      }
    });
    
    if (existingItem) {
      return res.status(400).json({ message: 'Auction already in wishlist' });
    }
    
    // Add to wishlist
    await Wishlist.create({
      userId: req.user.id,
      auctionId: id
    });
    
    res.status(201).json({ message: 'Added to wishlist' });
  } catch (error) {
    logger.error('Add to wishlist error:', error);
    next(error);
  }
};

// Remove from wishlist
exports.removeFromWishlist = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Remove from wishlist
    const result = await Wishlist.destroy({
      where: {
        userId: req.user.id,
        auctionId: id
      }
    });
    
    if (result === 0) {
      return res.status(404).json({ message: 'Item not found in wishlist' });
    }
    
    res.status(200).json({ message: 'Removed from wishlist' });
  } catch (error) {
    logger.error('Remove from wishlist error:', error);
    next(error);
  }
};

// Get user's wishlist
exports.getWishlist = async (req, res, next) => {
  try {
    const wishlist = await Wishlist.findAll({
      where: { userId: req.user.id },
      include: [
        {
          model: Auction,
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
        }
      ]
    });
    
    res.status(200).json({ wishlist });
  } catch (error) {
    logger.error('Get wishlist error:', error);
    next(error);
  }
};