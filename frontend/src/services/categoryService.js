import axios from '../utils/axiosCustomize';

// Lấy danh sách danh mục
const getAllCategories = async () => {
    try {
        const response = await axios.get(`/categories`);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
}

export {
    getAllCategories
} 