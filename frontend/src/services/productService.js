import axios from '../utils/axiosCustomize';

//Lấy danh sách sản phẩm 
const getAllProducts = async () => {
    try {
        const response = await axios.get(`/products`);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
}

// Tạo sản phẩm mới
const createProduct = async (productData) => {
    try {
        const response = await axios.post('/products', productData);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
}

// Cập nhật sản phẩm
const updateProduct = async (productId, productData) => {
    try {
        const response = await axios.put(`/products/${productId}`, productData);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
}

// Xóa sản phẩm
const deleteProduct = async (productId) => {
    try {
        const response = await axios.delete(`/products/${productId}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
}

//Lấy sản phẩm theo id người bán
const getProductBySellerID = async (seller_id) => {
    try {
        const response = await axios.get(`/products/${seller_id}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
}

export  {
    getAllProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    getProductBySellerID
}
