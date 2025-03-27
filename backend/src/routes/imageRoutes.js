const express = require('express');
const router = express.Router();
const ImageController = require('../controllers/imageController');
const { upload } = require('../services/imageService');

// Khởi tạo controller
const imageController = new ImageController();

// Upload hình ảnh (một hoặc nhiều)
router.post('/upload', upload.array('images', 8), imageController.uploadImages.bind(imageController));

// Xóa hình ảnh
router.delete('/:fileName', imageController.deleteImage.bind(imageController));

// Lấy thông tin hình ảnh
router.get('/:publicId/info', imageController.getImageInfo.bind(imageController));

module.exports = router; 