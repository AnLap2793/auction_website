const {Transaction, Auction, AuctionWinner, Product} = require('../models');
const { v4: uuidv4 } = require('uuid');

class TransactionService {
  // Lấy tất cả transactions
  async getAllTransactions() {
    return await Transaction.findAll();
  }

  // Lấy transaction theo ID
  async getTransactionById(id) {
    const transaction = await Transaction.findByPk(id);
    if (!transaction) {
      throw new Error('Không tìm thấy giao dịch');
    }
    return transaction;
  }

  // Tạo transaction mới
  async createTransaction(transactionData) {
    const transaction = await Transaction.create({
      ...transactionData,
      transaction_code: uuidv4(),
      status: 'pending'
    });
    return transaction;
  }

  // Cập nhật trạng thái transaction
  async updateTransactionStatus(id, status) {
    const transaction = await Transaction.findByPk(id);
    if (!transaction) {
      throw new Error('Không tìm thấy giao dịch');
    }
    await transaction.update({ status });
    return transaction;
  }

  // Lấy transactions theo auction_id
  async getTransactionsByAuctionId(auctionId) {
    return await Transaction.findAll({
      where: { auction_id: auctionId }
    });
  }
  
  // Lấy transactions theo user_id
  async getUserTransactions(userId) {
    try {
      // Lấy các auction mà người dùng đã thắng
      const auctionWinners = await AuctionWinner.findAll({
        where: { winner_id: userId }
      });
      
      if (!auctionWinners || auctionWinners.length === 0) {
        return [];
      }
      
      const auctionIds = auctionWinners.map(winner => winner.auction_id);
      
      // Lấy các giao dịch liên quan đến các cuộc đấu giá đã thắng
      const transactions = await Transaction.findAll({
        where: { auction_id: auctionIds },
        include: [{
          model: Auction,
          include: [{
            model: Product,
            attributes: ['title', 'description']
          }]
        }],
        order: [['created_at', 'DESC']]
      });
      
      return transactions;
    } catch (error) {
      throw new Error('Lỗi khi lấy dữ liệu giao dịch: ' + error.message);
    }
  }
}

module.exports = new TransactionService();
