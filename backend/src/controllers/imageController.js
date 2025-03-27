const { ImageService, upload } = require('../services/imageService');

class ImageController {
    constructor() {
        this.imageService = new ImageService();
    }

    // Upload hình ảnh (một hoặc nhiều)
    async uploadImages(req, res) {
        try {
            const files = req.files || req.file;
            const result = await this.imageService.uploadImages(files);
            res.status(200).json({
                success: true,
                data: result
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    }

    // Xóa hình ảnh
    async deleteImage(req, res) {
        try {
            const { fileName } = req.params;
            const result = await this.imageService.deleteImage(fileName);
            res.status(200).json({
                success: true,
                data: result
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    }

    // Lấy thông tin hình ảnh
    async getImageInfo(req, res) {
        try {
            const { publicId } = req.params;
            const result = await this.imageService.getImageInfo(publicId);
            res.status(200).json({
                success: true,
                data: result
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    }
}

module.exports = ImageController;