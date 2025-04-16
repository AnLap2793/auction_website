import axios from '../utils/axiosCustomize';


const transactionService = {
    // Lấy tất cả transactions
    getAllTransactions: async () => {
        try {
            const response = await axios.get(`/transactions`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Lấy transaction theo ID
    getTransactionById: async (id) => {
        try {
            const response = await axios.get(`/transactions/${id}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Cập nhật trạng thái transaction
    updateTransactionStatus: async (id, status) => {
        try {
            const response = await axios.patch(`/transactions/${id}/status`, { status });
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Lấy transactions theo auction_id
    getTransactionsByAuctionId: async (auctionId) => {
        try {
            const response = await axios.get(`/transactions/auction/${auctionId}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },
    
    // Lấy transactions theo user_id
    getUserTransactions: async (userId) => {
        try {
            const response = await axios.get(`/transactions/user/${userId}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    }
};

export default transactionService;
