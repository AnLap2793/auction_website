const productService = require('../services/productService');

// Lấy danh sách sản phẩm
const getAllProducts = async (req, res) => {
    try {
        const products = await productService.getAllProducts();
        res.json({
            success: true,
            data: products
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Lấy chi tiết sản phẩm theo ID
const getProductById = async (req, res) => {
    try {
        const product = await productService.getProductById(req.params.id);
        res.json({
            success: true,
            data: product
        });
    } catch (error) {
        res.status(404).json({
            success: false,
            message: error.message
        });
    }
};

// Cập nhật thông tin sản phẩm
const updateProduct = async (req, res) => {
    try {
        const result = await productService.updateProduct(req.params.id, req.body);
        res.json(result);
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Xóa sản phẩm
const deleteProduct = async (req, res) => {
    try {
        const result = await productService.deleteProduct(req.params.id);
        res.json(result);
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


module.exports = {
    getAllProducts,
    getProductById,
    updateProduct,
    deleteProduct
};
