const {Transaction} = require('../models');
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
}

module.exports = new TransactionService();
