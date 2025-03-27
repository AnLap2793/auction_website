const multer = require('multer');
const path = require('path');
const cloudinary = require('../config/cloudinary');

// Cấu hình multer cho việc upload file tạm thời
const storage = multer.memoryStorage();

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // Giới hạn 5MB
    },
    fileFilter: function (req, file, cb) {
        const filetypes = /jpeg|jpg|png|gif/;
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = filetypes.test(file.mimetype);
        
        if (extname && mimetype) {
            return cb(null, true);
        } else {
            cb(new Error('Chỉ chấp nhận file hình ảnh!'));
        }
    }
});

class ImageService {
    // Upload hình ảnh (một hoặc nhiều)
    async uploadImages(files) {
        try {
            if (!files || (Array.isArray(files) && files.length === 0)) {
                throw new Error('Không tìm thấy file');
            }

            // Chuyển đổi files thành mảng nếu là một file
            const filesArray = Array.isArray(files) ? files : [files];

            const uploadPromises = filesArray.map(file => {
                return new Promise((resolve, reject) => {
                    const uploadStream = cloudinary.uploader.upload_stream(
                        {
                            folder: 'auction_website/products',
                            resource_type: 'auto',
                            transformation: [
                                { quality: 'auto' },
                                { fetch_format: 'auto' }
                            ]
                        },
                        (error, result) => {
                            if (error) reject(error);
                            else resolve({
                                publicId: result.public_id,
                                url: result.secure_url,
                                format: result.format,
                                width: result.width,
                                height: result.height,
                                size: result.bytes
                            });
                        }
                    );

                    uploadStream.end(file.buffer);
                });
            });

            const results = await Promise.all(uploadPromises);
            
            // Trả về một object nếu chỉ upload một file
            return Array.isArray(files) ? results : results[0];
        } catch (error) {
            throw new Error(`Lỗi khi upload hình ảnh: ${error.message}`);
        }
    }

    // Xóa hình ảnh từ Cloudinary
    async deleteImage(fileName) {
        try {
             // Định dạng đúng public_id (bỏ phần mở rộng .jpg, .png nếu có)
            const publicId = `auction_website/products/${fileName.replace(/\.[^/.]+$/, "")}`;

            const result = await cloudinary.uploader.destroy(publicId);
            return { 
                message: 'Xóa hình ảnh thành công',
                result 
            };
        } catch (error) {
            throw new Error(`Lỗi khi xóa hình ảnh: ${error.message}`);
        }
    }

    // Lấy thông tin hình ảnh từ Cloudinary
    async getImageInfo(publicId) {
        try {
            const result = await cloudinary.api.resource(publicId);
            return {
                publicId: result.public_id,
                url: result.secure_url,
                format: result.format,
                width: result.width,
                height: result.height,
                size: result.bytes,
                createdAt: result.created_at,
                updatedAt: result.updated_at
            };
        } catch (error) {
            throw new Error(`Lỗi khi lấy thông tin hình ảnh: ${error.message}`);
        }
    }
}

module.exports = {
    ImageService,
    upload
};
