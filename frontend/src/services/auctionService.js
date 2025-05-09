import axios from '../utils/axiosCustomize';


const auctionService = {
    // Lấy danh sách phiên đấu giá
    getAllAuctions: async (filters = {}) => {
        const response = await axios.get(`/auctions`, { params: filters });
        return response.data;
    },

    // Lấy chi tiết phiên đấu giá
    getAuctionById: async (id) => {
        const response = await axios.get(`/auctions/${id}`);
        return response.data;
    },

    // Tạo phiên đấu giá mới
    createAuction: async (auctionData) => {
        const response = await axios.post(`/auctions`, auctionData);
        return response.data;
    },

    // Cập nhật phiên đấu giá
    updateAuction: async (id, auctionData) => {
        const response = await axios.put(`/auctions/${id}`, auctionData);
        return response.data;
    },

    // Hủy phiên đấu giá
    cancelAuction: async (id) => {
        const response = await axios.patch(`/auctions/${id}/cancel`);
        return response.data;
    },

    // Lấy số lượt đăng ký của phiên đấu giá
    getAuctionRegistrations: async (id) => {
        const response = await axios.get(`/auctions/${id}/registrations`);
        return response.data;
    },

    // Cập nhật trạng thái phiên đấu giá
    updateAuctionStatus: async () => {
        try {
            const response = await axios.get(`/auctions/status/update`);
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Không thể cập nhật trạng thái phiên đấu giá');
        }
    },

    // Xóa phiên đấu giá
    deleteAuction: async (id) => {
        try {
            const response = await axios.delete(`/auctions/${id}`);
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Không thể xóa phiên đấu giá');
        }
    }
};

export default auctionService;
