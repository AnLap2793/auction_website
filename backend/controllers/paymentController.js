const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { Payment, Auction, User } = require('../models');
const logger = require('../middlewares/logger');

// Create payment intent
exports.createPaymentIntent = async (req, res, next) => {
  try {
    const { auctionId } = req.body;
    
    // Find auction
    const auction = await Auction.findByPk(auctionId);
    if (!auction) {
      return res.status(404).json({ message: 'Auction not found' });
    }
    
    // Check if auction has ended
    if (auction.status !== 'ended') {
      return res.status(400).json({ message: 'Auction has not ended yet' });
    }
    
    // Check if user is the highest bidder
    if (auction.highestBidderId !== req.user.id) {
      return res.status(403).json({ message: 'Only the highest bidder can make payment' });
    }
    
    // Check if payment already exists
    const existingPayment = await Payment.findOne({
      where: {
        auctionId,
        userId: req.user.id,
        status: ['completed', 'processing']
      }
    });
    
    if (existingPayment) {
      return res.status(400).json({ message: 'Payment already exists for this auction' });
    }
    
    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(auction.currentPrice * 100), // Convert to cents
      currency: 'usd',
      metadata: {
        auctionId,
        userId: req.user.id
      }
    });
    
    // Create payment record
    await Payment.create({
      auctionId,
      userId: req.user.id,
      amount: auction.currentPrice,
      paymentIntentId: paymentIntent.id,
      status: 'pending'
    });
    
    res.status(200).json({
      clientSecret: paymentIntent.client_secret
    });
  } catch (error) {
    logger.error('Create payment intent error:', error);
    next(error);
  }
};

// Handle webhook events
exports.handleWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;
  
  try {
    event = stripe.webhooks.constructEvent(
      req.rawBody,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    logger.error('Webhook signature verification failed:', err);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }
  
  // Handle the event
  switch (event.type) {
    case 'payment_intent.succeeded':
      await handlePaymentSuccess(event.data.object);
      break;
    case 'payment_intent.payment_failed':
      await handlePaymentFailure(event.data.object);
      break;
    default:
      logger.info(`Unhandled event type ${event.type}`);
  }
  
  res.status(200).json({ received: true });
};

// Handle successful payment
const handlePaymentSuccess = async (paymentIntent) => {
  try {
    const { auctionId, userId } = paymentIntent.metadata;
    
    // Update payment status
    await Payment.update(
      { status: 'completed' },
      {
        where: {
          paymentIntentId: paymentIntent.id
        }
      }
    );
    
    // Update auction status
    await Auction.update(
      { paymentStatus: 'paid' },
      {
        where: {
          id: auctionId
        }
      }
    );
    
    logger.info(`Payment successful for auction ${auctionId} by user ${userId}`);
  } catch (error) {
    logger.error('Payment success handler error:', error);
  }
};

// Handle failed payment
const handlePaymentFailure = async (paymentIntent) => {
  try {
    // Update payment status
    await Payment.update(
      { status: 'failed' },
      {
        where: {
          paymentIntentId: paymentIntent.id
        }
      }
    );
    
    logger.info(`Payment failed for intent ${paymentIntent.id}`);
  } catch (error) {
    logger.error('Payment failure handler error:', error);
  }
};

// Get payment history
exports.getPaymentHistory = async (req, res, next) => {
  try {
    const payments = await Payment.findAll({
      where: { userId: req.user.id },
      include: [
        {
          model: Auction,
          attributes: ['id', 'title', 'currentPrice', 'endDate']
        }
      ],
      order: [['createdAt', 'DESC']]
    });
    
    res.status(200).json({ payments });
  } catch (error) {
    logger.error('Get payment history error:', error);
    next(error);
  }
};