const express = require('express');
const router = express.Router();
const {getAllProducts, getProductById, createProduct, updateProduct, deleteProduct} = require('../controllers/productController');

// Lấy danh sách sản phẩm
router.get('/', getAllProducts);

// Lấy chi tiết sản phẩm theo ID
router.get('/:id', getProductById);

// Cập nhật thông tin sản phẩm (yêu cầu đăng nhập)
router.put('/:id', updateProduct);

// Xóa sản phẩm (yêu cầu đăng nhập)
router.delete('/:id',deleteProduct);


module.exports = router;
