const { Product, Category, User, ProductImage, Auction } = require('../models');
const cloudinary = require('../config/cloudinary');
const { where } = require('sequelize');

class ProductService {
    // Lấy danh sách sản phẩm
    async getAllProducts() {
        try {
            const products = await Product.findAll({
                include: [
                    { model: Category, attributes: ['id', 'name'] },
                    { model: User, attributes: ['id', 'first_name', 'last_name', 'email'] },
                    { model: ProductImage, attributes: ['id', 'image_url'] }
                ],
                order: [['created_at', 'DESC']]
            });
            return products;
        } catch (error) {
            throw new Error('Lỗi khi lấy danh sách sản phẩm: ' + error.message);
        }
    }

    // Tạo sản phẩm mới
    async createProduct(productData) {
        try {
            // Tạo sản phẩm mới
            const newProduct = await Product.create({
                title: productData.title,
                description: productData.description,
                starting_price: productData.starting_price,
                category_id: productData.category_id,
                seller_id: productData.seller_id,
                created_at: new Date(),
                updated_at: new Date()
            });

            // Xử lý thêm ảnh sản phẩm nếu có
            if (productData.ProductImages && productData.ProductImages.length > 0) {
                // Lọc ra các URL ảnh hợp lệ
                const validImages = productData.ProductImages
                    .filter(img => img && img.image_url && typeof img.image_url === 'string' && img.image_url.trim() !== '');
                
                if (validImages.length > 0) {
                    // Lưu URL vào database
                    const createPromises = validImages.map(img => 
                        ProductImage.create({
                            product_id: newProduct.id,
                            image_url: img.image_url
                        })
                    );

                    await Promise.all(createPromises);
                }
            } 
            // Hỗ trợ cả định dạng cũ (mảng URLs) để tương thích ngược
            else if (productData.images && productData.images.length > 0) {
                // Lọc ra các URL ảnh hợp lệ
                const imageUrls = productData.images
                    .filter(url => url && typeof url === 'string' && url.trim() !== '');
                
                if (imageUrls.length > 0) {
                    // Lưu URL vào database
                    const createPromises = imageUrls.map(url => 
                        ProductImage.create({
                            product_id: newProduct.id,
                            image_url: url
                        })
                    );

                    await Promise.all(createPromises);
                }
            }

            // Lấy lại thông tin sản phẩm đã tạo bao gồm cả ảnh
            const createdProduct = await Product.findByPk(newProduct.id, {
                include: [
                    { model: Category, attributes: ['id', 'name'] },
                    { model: User, attributes: ['id', 'first_name', 'last_name', 'email'] },
                    { model: ProductImage, attributes: ['id', 'image_url'] }
                ]
            });

            return {
                success: true,
                message: 'Tạo sản phẩm mới thành công',
                data: createdProduct
            };
        } catch (error) {
            throw new Error('Lỗi khi tạo sản phẩm mới: ' + error.message);
        }
    }

    // Lấy chi tiết sản phẩm theo ID
    async getProductById(productId) {
        try {
            const product = await Product.findByPk(productId, {
                include: [
                    { model: Category, attributes: ['id', 'name'] },
                    { model: User, attributes: ['id', 'first_name', 'last_name', 'email'] },
                    { model: ProductImage, attributes: ['id', 'image_url'] }
                ]
            });
            
            if (!product) {
                throw new Error('Không tìm thấy sản phẩm');
            }
            
            return product;
        } catch (error) {
            throw new Error('Lỗi khi lấy thông tin sản phẩm: ' + error.message);
        }
    }

    // Cập nhật thông tin sản phẩm
    async updateProduct(productId, productData) {
        try {
            const product = await Product.findByPk(productId);
            if (!product) {
                throw new Error('Không tìm thấy sản phẩm');
            }

            // Cập nhật thông tin cơ bản của sản phẩm
            await product.update({
                title: productData.title,
                description: productData.description,
                starting_price: productData.starting_price,
                category_id: productData.category_id,
                updated_at: new Date()
            });

            // Xử lý cập nhật ảnh sản phẩm nếu có
            if (productData.ProductImages) {
                // Lấy danh sách ảnh hiện tại của sản phẩm
                const currentImages = await ProductImage.findAll({
                    where: { product_id: productId },
                    attributes: ['id', 'image_url']
                });

                // Lọc ra các URL ảnh hợp lệ từ dữ liệu mới
                const newImageUrls = productData.ProductImages
                    .filter(img => img && img.image_url && typeof img.image_url === 'string' && img.image_url.trim() !== '')
                    .map(img => img.image_url);
                
                if (newImageUrls.length > 0) {
                    // Lấy danh sách URL ảnh hiện tại
                    const currentUrls = currentImages.map(img => img.image_url);
                    
                    // Tìm các ảnh cần thêm mới (có trong mới nhưng không có trong hiện tại)
                    const urlsToAdd = newImageUrls.filter(url => !currentUrls.includes(url));

                    // Thêm các ảnh mới
                    if (urlsToAdd.length > 0) {
                        // Lưu URL vào database
                        const createPromises = urlsToAdd.map(url => 
                            ProductImage.create({
                                product_id: productId,
                                image_url: url
                            })
                        );

                        await Promise.all(createPromises);
                    }
                }
            }

            // Lấy lại thông tin sản phẩm đã cập nhật bao gồm cả ảnh
            const updatedProduct = await Product.findByPk(productId, {
                include: [
                    { model: Category, attributes: ['id', 'name'] },
                    { model: User, attributes: ['id', 'first_name', 'last_name', 'email'] },
                    { model: ProductImage, attributes: ['id', 'image_url'] }
                ]
            });

            return {
                success: true,
                message: 'Cập nhật thông tin sản phẩm thành công',
                data: updatedProduct
            };
        } catch (error) {
            throw new Error('Lỗi khi cập nhật sản phẩm: ' + error.message);
        }
    }

    // Xóa sản phẩm
    async deleteProduct(productId) {
        try {
            const product = await Product.findByPk(productId);
            if (!product) {
                throw new Error('Không tìm thấy sản phẩm');
            }
            // Xóa tất cả ảnh của sản phẩm trong database
            await ProductImage.destroy({
                where: { product_id: productId }
            });
            // Xóa sản phẩm
            await product.destroy();
            return {
                success: true,
                message: 'Xóa sản phẩm thành công'
            };
        } catch (error) {
            throw new Error('Lỗi khi xóa sản phẩm: ' + error.message);
        }
    }

    // Lấy sản phẩm của người bán
    async getProductBySellerID(seller_id){
        try {
            const product = await Product.findAll({
                include: [
                    { model: Category, attributes: ['id', 'name'] },
                    { model: User, attributes: ['id', 'first_name', 'last_name', 'email'] },
                    { model: ProductImage, attributes: ['id', 'image_url'] },
                    { model: Auction }
                ],
                where: {seller_id: seller_id},
                order: [['created_at', 'DESC']]
            });
            if (!product) {
                throw new Error('Không tìm thấy sản phẩm');
            }
            return product;
        } catch (error) {
            throw new Error('Lỗi khi lấy sản phẩm');
        }
    }
}

module.exports = new ProductService();
