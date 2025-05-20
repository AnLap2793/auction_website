import axios from '../utils/axiosCustomize';

const paymentService = {
    // Tạo URL thanh toán VNPay
    createPayment: async (paymentData) => {
        try {
            const response = await axios.post('/payments/create-payment', paymentData);
            return response.data;
        } catch (error) {
            console.error('Error creating payment:', error);
            throw error;
        }
    },

    // Kiểm tra trạng thái giao dịch
    getTransactionStatus: async (transactionId) => {
        try {
            const response = await axios.get(`/payments/transaction/${transactionId}`);
            return response.data;
        } catch (error) {
            console.error('Error getting transaction status:', error);
            throw error;
        }
    }
};

export default paymentService; 