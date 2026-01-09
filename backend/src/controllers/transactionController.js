const transactionService = require("../services/transactionService");

// Lấy tất cả transactions
const getAllTransactions = async (req, res) => {
    try {
        const transactions = await transactionService.getAllTransactions();
        res.json(transactions);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Lấy transaction theo ID
const getTransactionById = async (req, res) => {
    try {
        const transaction = await transactionService.getTransactionById(req.params.id);
        res.json(transaction);
    } catch (error) {
        if (error.message === "Không tìm thấy giao dịch") {
            return res.status(404).json({ message: error.message });
        }
        res.status(500).json({ message: error.message });
    }
};

// Tạo transaction mới
const createTransaction = async (req, res) => {
    try {
        const transaction = await transactionService.createTransaction(req.body);
        res.status(201).json(transaction);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Cập nhật trạng thái transaction
const updateTransactionStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const transaction = await transactionService.updateTransactionStatus(req.params.id, status);
        res.json(transaction);
    } catch (error) {
        if (error.message === "Không tìm thấy giao dịch") {
            return res.status(404).json({ message: error.message });
        }
        res.status(400).json({ message: error.message });
    }
};

// Lấy transactions theo auction_id
const getTransactionsByAuctionId = async (req, res) => {
    try {
        const transactions = await transactionService.getTransactionsByAuctionId(req.params.auctionId);
        res.json({
            success: true,
            data: transactions,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// Lấy transactions theo user_id
const getUserTransactions = async (req, res) => {
    try {
        const userId = req.params.userId;
        const transactions = await transactionService.getUserTransactions(userId);
        res.json({
            success: true,
            data: transactions,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// Lấy deposit transaction của user cho một auction cụ thể
const getUserDepositTransaction = async (req, res) => {
    try {
        const { auctionId, userId } = req.params;
        const transaction = await transactionService.getUserDepositTransaction(auctionId, userId);

        if (!transaction) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy giao dịch đặt cọc",
            });
        }

        res.json({
            success: true,
            data: transaction,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

module.exports = {
    getAllTransactions,
    getTransactionById,
    createTransaction,
    updateTransactionStatus,
    getTransactionsByAuctionId,
    getUserTransactions,
    getUserDepositTransaction,
};
