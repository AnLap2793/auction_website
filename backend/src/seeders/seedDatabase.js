const bcrypt = require("bcrypt");
const { v4: uuidv4 } = require("uuid");
const {
    User,
    Category,
    Product,
    ProductImage,
    Auction,
    Bid,
    AuctionRegistration,
    AuctionWinner,
    Transaction,
    sequelize,
} = require("../models");

const seedDatabase = async () => {
    try {
        await sequelize.sync({ force: true }); // Xóa và tạo lại tất cả các bảng

        // Tạo users
        const hashedPassword = await bcrypt.hash("password123", 10);
        const users = await User.bulkCreate([
            {
                id: uuidv4(),
                email: "admin@auction.com",
                password_hash: hashedPassword,
                first_name: "Admin",
                last_name: "System",
                phone_number: "0123456789",
                address: "123 Admin Street",
                role: "admin",
                is_verified: true,
                is_active: true,
            },
            {
                id: uuidv4(),
                email: "seller1@example.com",
                password_hash: hashedPassword,
                first_name: "Nguyễn",
                last_name: "Văn A",
                phone_number: "0123456788",
                address: "456 Seller Street",
                role: "seller",
                is_verified: true,
                is_active: true,
            },
            {
                id: uuidv4(),
                email: "seller2@example.com",
                password_hash: hashedPassword,
                first_name: "Trần",
                last_name: "Thị B",
                phone_number: "0123456787",
                address: "789 Seller Street",
                role: "seller",
                is_verified: true,
                is_active: true,
            },
            {
                id: uuidv4(),
                email: "buyer1@example.com",
                password_hash: hashedPassword,
                first_name: "Lê",
                last_name: "Văn C",
                phone_number: "0123456786",
                address: "321 Buyer Street",
                role: "buyer",
                is_verified: true,
                is_active: true,
            },
            {
                id: uuidv4(),
                email: "buyer2@example.com",
                password_hash: hashedPassword,
                first_name: "Phạm",
                last_name: "Thị D",
                phone_number: "0123456785",
                address: "654 Buyer Street",
                role: "buyer",
                is_verified: true,
                is_active: true,
            },
        ]);

        // Tạo categories
        const categories = await Category.bulkCreate([
            {
                id: uuidv4(),
                name: "Điện tử",
                description: "Các sản phẩm điện tử như điện thoại, máy tính, tablet",
            },
            {
                id: uuidv4(),
                name: "Thời trang",
                description: "Quần áo, giày dép, phụ kiện thời trang",
            },
            {
                id: uuidv4(),
                name: "Nội thất",
                description: "Bàn ghế, tủ kệ, đồ trang trí nội thất",
            },
            {
                id: uuidv4(),
                name: "Xe cộ",
                description: "Xe máy, xe đạp, phụ tùng xe",
            },
            {
                id: uuidv4(),
                name: "Đồ cổ",
                description: "Các sản phẩm cổ, hiếm có giá trị",
            },
        ]);

        // Tạo products
        const sellers = users.filter((user) => user.role === "seller");
        const antiqueCategoryId = categories[4].id; // Đồ cổ

        // Mảng 50 sản phẩm đồ cổ
        const antiqueProductsData = [
            // Gốm sứ cổ (15 sản phẩm)
            {
                title: "Bình gốm men ngọc thời Lý",
                description:
                    "Bình gốm men ngọc cổ thời Lý (1010-1225), cao 25cm, đường kính 15cm. Men ngọc nguyên bản, hoa văn tinh xảo. Có giấy chứng nhận từ Bảo tàng Lịch sử Việt Nam.",
                price: 85000000,
                sellerIndex: 0,
                image_url: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop",
            },
            {
                title: "Chén gốm hoa nâu thời Trần",
                description:
                    "Chén gốm hoa nâu thời Trần (1225-1400), đường kính 12cm. Hoa văn hoa nâu đặc trưng, tình trạng tốt. Hiếm có trên thị trường.",
                price: 35000000,
                sellerIndex: 1,
                image_url: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop",
            },
            {
                title: "Đĩa gốm men trắng thời Lê",
                description:
                    "Đĩa gốm men trắng thời Lê sơ (1428-1527), đường kính 28cm. Men trắng tinh khiết, hoa văn chạm khắc tinh tế. Bảo quản tốt.",
                price: 45000000,
                sellerIndex: 0,
                image_url: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop",
            },
            {
                title: "Bình gốm Chu Đậu thế kỷ 15",
                description:
                    "Bình gốm Chu Đậu cổ điển, cao 30cm. Men xanh trắng đặc trưng, hoa văn phong phú. Sản phẩm nổi tiếng của gốm Việt Nam cổ.",
                price: 120000000,
                sellerIndex: 1,
                image_url: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop",
            },
            {
                title: "Lọ gốm men lam thời Nguyễn",
                description:
                    "Lọ gốm men lam thời Nguyễn (1802-1945), cao 20cm. Men lam Huế đặc trưng, hoa văn rồng phượng. Tình trạng nguyên vẹn.",
                price: 28000000,
                sellerIndex: 0,
                image_url: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop",
            },
            {
                title: "Bát gốm men nâu thời Lý",
                description:
                    "Bát gốm men nâu thời Lý, đường kính 18cm. Men nâu đậm, hoa văn đơn giản nhưng tinh tế. Hiếm gặp.",
                price: 15000000,
                sellerIndex: 1,
                image_url: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop",
            },
            {
                title: "Ấm gốm men ngọc thời Trần",
                description:
                    "Ấm gốm men ngọc thời Trần, cao 15cm. Men ngọc xanh biển, tay cầm cong đẹp. Bảo quản tốt, không vỡ nứt.",
                price: 55000000,
                sellerIndex: 0,
                image_url: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop",
            },
            {
                title: "Đĩa gốm hoa lam thế kỷ 16",
                description:
                    "Đĩa gốm hoa lam thế kỷ 16, đường kính 32cm. Hoa văn hoa lam tinh xảo, men bóng đẹp. Có dấu hiệu xác thực.",
                price: 65000000,
                sellerIndex: 1,
                image_url: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop",
            },
            {
                title: "Bình gốm men trắng vẽ lam thời Lê",
                description:
                    "Bình gốm men trắng vẽ lam thời Lê trung hưng, cao 22cm. Vẽ lam tinh tế, hoa văn phong phú. Giá trị lịch sử cao.",
                price: 75000000,
                sellerIndex: 0,
                image_url: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop",
            },
            {
                title: "Chum gốm thời Lý",
                description:
                    "Chum gốm cổ thời Lý, cao 40cm, đường kính 35cm. Men tự nhiên, hoa văn chạm khắc. Hiếm có kích thước lớn như vậy.",
                price: 95000000,
                sellerIndex: 1,
                image_url: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop",
            },
            {
                title: "Bát đĩa gốm men ngọc thời Lý",
                description:
                    "Bộ bát đĩa gốm men ngọc thời Lý, 6 chiếc. Men ngọc đồng nhất, hoa văn tương đồng. Bộ sưu tập hiếm.",
                price: 180000000,
                sellerIndex: 0,
                image_url: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop",
            },
            {
                title: "Lọ gốm men nâu thời Trần",
                description: "Lọ gốm men nâu thời Trần, cao 18cm. Men nâu đậm, hình dáng thanh thoát. Tình trạng tốt.",
                price: 42000000,
                sellerIndex: 1,
                image_url: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop",
            },
            {
                title: "Bình gốm Chu Đậu vẽ rồng",
                description:
                    "Bình gốm Chu Đậu vẽ rồng, cao 28cm. Hoa văn rồng bay đặc trưng, men xanh trắng. Sản phẩm cao cấp.",
                price: 150000000,
                sellerIndex: 0,
                image_url: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop",
            },
            {
                title: "Đĩa gốm men trắng thời Lê sơ",
                description:
                    "Đĩa gốm men trắng thời Lê sơ, đường kính 26cm. Men trắng tinh khiết, hoa văn chạm khắc. Bảo quản tốt.",
                price: 38000000,
                sellerIndex: 1,
                image_url: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop",
            },
            {
                title: "Ấm tích gốm men ngọc thời Lý",
                description:
                    "Ấm tích gốm men ngọc thời Lý, cao 12cm. Men ngọc xanh, tay cầm cong. Hiếm có loại ấm tích cổ.",
                price: 68000000,
                sellerIndex: 0,
                image_url: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop",
            },

            // Đồng cổ (10 sản phẩm)
            {
                title: "Tượng Phật đồng thời Lý",
                description:
                    "Tượng Phật đồng thời Lý, cao 35cm. Đúc tinh xảo, nét mặt thanh thoát. Có dấu niên đại, giá trị tâm linh cao.",
                price: 250000000,
                sellerIndex: 1,
                image_url: "https://images.unsplash.com/photo-1544966503-7cc5ac882d5f?w=800&h=600&fit=crop",
            },
            {
                title: "Chuông đồng chùa cổ thế kỷ 17",
                description:
                    "Chuông đồng chùa cổ thế kỷ 17, cao 50cm. Có chữ Hán khắc, hoa văn rồng phượng. Âm thanh trong trẻo.",
                price: 180000000,
                sellerIndex: 0,
                image_url: "https://images.unsplash.com/photo-1544966503-7cc5ac882d5f?w=800&h=600&fit=crop",
            },
            {
                title: "Đỉnh đồng thời Nguyễn",
                description:
                    "Đỉnh đồng thời Nguyễn, cao 25cm. Đúc tinh xảo, hoa văn rồng phượng. Dùng trong cung đình.",
                price: 120000000,
                sellerIndex: 1,
                image_url: "https://images.unsplash.com/photo-1544966503-7cc5ac882d5f?w=800&h=600&fit=crop",
            },
            {
                title: "Vạc đồng thời Lê",
                description: "Vạc đồng thời Lê, đường kính 40cm. Đúc dày, hoa văn chạm khắc. Hiếm có kích thước lớn.",
                price: 200000000,
                sellerIndex: 0,
                image_url: "https://images.unsplash.com/photo-1544966503-7cc5ac882d5f?w=800&h=600&fit=crop",
            },
            {
                title: "Tượng Quan Âm đồng thời Trần",
                description:
                    "Tượng Quan Âm đồng thời Trần, cao 30cm. Đúc tinh xảo, nét mặt từ bi. Giá trị tâm linh và nghệ thuật cao.",
                price: 220000000,
                sellerIndex: 1,
                image_url: "https://images.unsplash.com/photo-1544966503-7cc5ac882d5f?w=800&h=600&fit=crop",
            },
            {
                title: "Chuông đồng nhỏ thời Lý",
                description: "Chuông đồng nhỏ thời Lý, cao 20cm. Có chữ khắc, hoa văn tinh xảo. Bảo quản tốt.",
                price: 85000000,
                sellerIndex: 0,
                image_url: "https://images.unsplash.com/photo-1544966503-7cc5ac882d5f?w=800&h=600&fit=crop",
            },
            {
                title: "Lư hương đồng thời Nguyễn",
                description: "Lư hương đồng thời Nguyễn, cao 15cm. Đúc tinh xảo, hoa văn rồng. Dùng trong cung đình.",
                price: 65000000,
                sellerIndex: 1,
                image_url: "https://images.unsplash.com/photo-1544966503-7cc5ac882d5f?w=800&h=600&fit=crop",
            },
            {
                title: "Tượng thần đồng thời Lê",
                description: "Tượng thần đồng thời Lê, cao 28cm. Đúc tinh xảo, nét mặt uy nghi. Hiếm có.",
                price: 190000000,
                sellerIndex: 0,
                image_url: "https://images.unsplash.com/photo-1544966503-7cc5ac882d5f?w=800&h=600&fit=crop",
            },
            {
                title: "Đỉnh đồng tam giác thời Nguyễn",
                description:
                    "Đỉnh đồng tam giác thời Nguyễn, cao 22cm. Hoa văn rồng phượng, đúc tinh xảo. Giá trị cao.",
                price: 95000000,
                sellerIndex: 1,
                image_url: "https://images.unsplash.com/photo-1544966503-7cc5ac882d5f?w=800&h=600&fit=crop",
            },
            {
                title: "Chuông đồng chùa làng thế kỷ 18",
                description:
                    "Chuông đồng chùa làng thế kỷ 18, cao 45cm. Có chữ khắc tên chùa, hoa văn dân gian. Âm thanh hay.",
                price: 150000000,
                sellerIndex: 0,
                image_url: "https://images.unsplash.com/photo-1544966503-7cc5ac882d5f?w=800&h=600&fit=crop",
            },

            // Tranh cổ (8 sản phẩm)
            {
                title: "Tranh dân gian Đông Hồ - Gà trống",
                description:
                    'Tranh dân gian Đông Hồ "Gà trống" thế kỷ 19. In trên giấy dó, màu sắc tự nhiên. Bản in cổ, hiếm có.',
                price: 25000000,
                sellerIndex: 1,
                image_url: "https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=800&h=600&fit=crop",
            },
            {
                title: "Tranh thủy mặc thế kỷ 18",
                description:
                    "Tranh thủy mặc vẽ cảnh làng quê thế kỷ 18. Vẽ trên lụa, có chữ ký tác giả. Giá trị nghệ thuật cao.",
                price: 180000000,
                sellerIndex: 0,
                image_url: "https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=800&h=600&fit=crop",
            },
            {
                title: "Tranh sơn mài cổ thế kỷ 19",
                description:
                    "Tranh sơn mài cổ thế kỷ 19, kích thước 60x40cm. Hoa văn tinh xảo, màu sắc bền đẹp. Hiếm có.",
                price: 220000000,
                sellerIndex: 1,
                image_url: "https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=800&h=600&fit=crop",
            },
            {
                title: "Tranh dân gian Hàng Trống - Tố Nữ",
                description: 'Tranh dân gian Hàng Trống "Tố Nữ" thế kỷ 19. In trên giấy, màu sắc tươi. Bản in cổ.',
                price: 35000000,
                sellerIndex: 0,
                image_url: "https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=800&h=600&fit=crop",
            },
            {
                title: "Tranh thủy mặc vẽ phong cảnh",
                description:
                    "Tranh thủy mặc vẽ phong cảnh núi sông thế kỷ 18. Vẽ trên giấy, có triện. Giá trị nghệ thuật.",
                price: 150000000,
                sellerIndex: 1,
                image_url: "https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=800&h=600&fit=crop",
            },
            {
                title: "Tranh sơn mài vẽ rồng",
                description:
                    "Tranh sơn mài vẽ rồng thế kỷ 19, kích thước 50x30cm. Hoa văn rồng tinh xảo, màu vàng đỏ. Đẹp mắt.",
                price: 190000000,
                sellerIndex: 0,
                image_url: "https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=800&h=600&fit=crop",
            },
            {
                title: "Tranh dân gian Đông Hồ - Lợn",
                description: 'Tranh dân gian Đông Hồ "Lợn" thế kỷ 19. In trên giấy dó, màu sắc tự nhiên. Bản in cổ.',
                price: 28000000,
                sellerIndex: 1,
                image_url: "https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=800&h=600&fit=crop",
            },
            {
                title: "Tranh thủy mặc vẽ hoa mai",
                description:
                    "Tranh thủy mặc vẽ hoa mai thế kỷ 18. Vẽ trên lụa, có thơ đề. Giá trị nghệ thuật và văn hóa.",
                price: 120000000,
                sellerIndex: 0,
                image_url: "https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=800&h=600&fit=crop",
            },

            // Tượng cổ (7 sản phẩm)
            {
                title: "Tượng Phật gỗ thời Lý",
                description:
                    "Tượng Phật gỗ thời Lý, cao 40cm. Chạm khắc tinh xảo, nét mặt thanh thoát. Gỗ quý, bảo quản tốt.",
                price: 180000000,
                sellerIndex: 1,
                image_url: "https://images.unsplash.com/photo-1544966503-7cc5ac882d5f?w=800&h=600&fit=crop",
            },
            {
                title: "Tượng thần gỗ thời Trần",
                description:
                    "Tượng thần gỗ thời Trần, cao 35cm. Chạm khắc tinh xảo, hoa văn phong phú. Giá trị tâm linh.",
                price: 150000000,
                sellerIndex: 0,
                image_url: "https://images.unsplash.com/photo-1544966503-7cc5ac882d5f?w=800&h=600&fit=crop",
            },
            {
                title: "Tượng động vật gỗ thời Lê",
                description: "Tượng động vật gỗ thời Lê, cao 25cm. Chạm khắc tinh xảo, hình dáng sống động. Gỗ quý.",
                price: 85000000,
                sellerIndex: 1,
                image_url: "https://images.unsplash.com/photo-1544966503-7cc5ac882d5f?w=800&h=600&fit=crop",
            },
            {
                title: "Tượng Phật đá thời Lý",
                description: "Tượng Phật đá thời Lý, cao 30cm. Điêu khắc tinh xảo, nét mặt từ bi. Đá quý, hiếm có.",
                price: 250000000,
                sellerIndex: 0,
                image_url: "https://images.unsplash.com/photo-1544966503-7cc5ac882d5f?w=800&h=600&fit=crop",
            },
            {
                title: "Tượng thần đá thời Trần",
                description:
                    "Tượng thần đá thời Trần, cao 28cm. Điêu khắc tinh xảo, hoa văn rồng. Giá trị nghệ thuật cao.",
                price: 200000000,
                sellerIndex: 1,
                image_url: "https://images.unsplash.com/photo-1544966503-7cc5ac882d5f?w=800&h=600&fit=crop",
            },
            {
                title: "Tượng Phật gỗ thời Nguyễn",
                description:
                    "Tượng Phật gỗ thời Nguyễn, cao 35cm. Chạm khắc tinh xảo, sơn son thếp vàng. Bảo quản tốt.",
                price: 120000000,
                sellerIndex: 0,
                image_url: "https://images.unsplash.com/photo-1544966503-7cc5ac882d5f?w=800&h=600&fit=crop",
            },
            {
                title: "Tượng động vật đá thời Lê",
                description: "Tượng động vật đá thời Lê, cao 20cm. Điêu khắc tinh xảo, hình dáng sống động. Đá quý.",
                price: 95000000,
                sellerIndex: 1,
                image_url: "https://images.unsplash.com/photo-1544966503-7cc5ac882d5f?w=800&h=600&fit=crop",
            },

            // Đồ trang sức cổ (5 sản phẩm)
            {
                title: "Vòng tay vàng cổ thời Nguyễn",
                description: "Vòng tay vàng cổ thời Nguyễn, nặng 30g. Chạm khắc hoa văn tinh xảo, vàng 18K. Hiếm có.",
                price: 45000000,
                sellerIndex: 0,
                image_url: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800&h=600&fit=crop",
            },
            {
                title: "Nhẫn vàng cổ thời Lê",
                description: "Nhẫn vàng cổ thời Lê, nặng 15g. Chạm khắc hoa văn rồng, vàng nguyên chất. Giá trị cao.",
                price: 35000000,
                sellerIndex: 1,
                image_url: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800&h=600&fit=crop",
            },
            {
                title: "Trâm cài tóc bạc cổ thời Nguyễn",
                description:
                    "Trâm cài tóc bạc cổ thời Nguyễn, dài 20cm. Chạm khắc hoa văn tinh xảo, bạc nguyên chất. Đẹp mắt.",
                price: 25000000,
                sellerIndex: 0,
                image_url: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800&h=600&fit=crop",
            },
            {
                title: "Vòng cổ vàng cổ thời Nguyễn",
                description: "Vòng cổ vàng cổ thời Nguyễn, nặng 40g. Chạm khắc hoa văn phong phú, vàng 18K. Hiếm có.",
                price: 55000000,
                sellerIndex: 1,
                image_url: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800&h=600&fit=crop",
            },
            {
                title: "Nhẫn bạc cổ thời Lê",
                description:
                    "Nhẫn bạc cổ thời Lê, nặng 12g. Chạm khắc hoa văn đơn giản, bạc nguyên chất. Tình trạng tốt.",
                price: 18000000,
                sellerIndex: 0,
                image_url: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800&h=600&fit=crop",
            },

            // Sách cổ (3 sản phẩm)
            {
                title: "Sách Hán Nôm thế kỷ 18",
                description:
                    "Sách Hán Nôm thế kỷ 18, 200 trang. Viết tay trên giấy dó, chữ đẹp. Nội dung về lịch sử, hiếm có.",
                price: 85000000,
                sellerIndex: 1,
                image_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=600&fit=crop",
            },
            {
                title: "Sách cổ triều Nguyễn",
                description:
                    "Sách cổ triều Nguyễn, 150 trang. In trên giấy dó, có minh họa. Nội dung về văn hóa, giá trị cao.",
                price: 65000000,
                sellerIndex: 0,
                image_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=600&fit=crop",
            },
            {
                title: "Sách Hán Nôm thế kỷ 19",
                description:
                    "Sách Hán Nôm thế kỷ 19, 180 trang. Viết tay trên giấy dó, chữ đẹp. Nội dung về y học cổ truyền.",
                price: 75000000,
                sellerIndex: 1,
                image_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=600&fit=crop",
            },

            // Đồ gỗ cổ (2 sản phẩm)
            {
                title: "Tủ gỗ cổ thời Nguyễn",
                description:
                    "Tủ gỗ cổ thời Nguyễn, cao 150cm, rộng 100cm. Gỗ quý, chạm khắc tinh xảo. Bảo quản tốt, hiếm có.",
                price: 180000000,
                sellerIndex: 0,
                image_url: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=600&fit=crop",
            },
            {
                title: "Bàn gỗ cổ thời Lê",
                description:
                    "Bàn gỗ cổ thời Lê, dài 120cm, rộng 60cm. Gỗ quý, chạm khắc hoa văn. Tình trạng tốt, giá trị cao.",
                price: 150000000,
                sellerIndex: 1,
                image_url: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=600&fit=crop",
            },
        ];

        // Tạo mảng products ban đầu (5 sản phẩm cũ)
        const initialProducts = [
            {
                id: uuidv4(),
                seller_id: sellers[0].id,
                category_id: categories[0].id,
                title: "iPhone 13 Pro Max 256GB",
                description: "Điện thoại iPhone 13 Pro Max mới 100%, nguyên seal",
                starting_price: 15000000,
            },
            {
                id: uuidv4(),
                seller_id: sellers[1].id,
                category_id: categories[1].id,
                title: "Áo khoác da nam cao cấp",
                description: "Áo khoác da thật, nhập khẩu từ Ý",
                starting_price: 2500000,
            },
            {
                id: uuidv4(),
                seller_id: sellers[0].id,
                category_id: categories[2].id,
                title: "Bộ sofa da cao cấp",
                description: "Bộ sofa da nhập khẩu từ Đức, bảo hành 5 năm",
                starting_price: 8000000,
            },
            {
                id: uuidv4(),
                seller_id: sellers[1].id,
                category_id: categories[3].id,
                title: "Honda Wave Alpha 2023",
                description: "Xe máy Wave Alpha đời mới nhất, chưa đăng ký",
                starting_price: 18000000,
            },
            {
                id: uuidv4(),
                seller_id: sellers[0].id,
                category_id: categories[4].id,
                title: "Bình gốm thời Lý",
                description: "Bình gốm cổ thời Lý, có giấy chứng nhận",
                starting_price: 50000000,
            },
        ];

        // Tạo mảng 50 sản phẩm đồ cổ
        const antiqueProducts = antiqueProductsData.map((item) => ({
            id: uuidv4(),
            seller_id: sellers[item.sellerIndex].id,
            category_id: antiqueCategoryId,
            title: item.title,
            description: item.description,
            starting_price: item.price,
        }));

        // Kết hợp tất cả products
        const allProducts = [...initialProducts, ...antiqueProducts];
        const products = await Product.bulkCreate(allProducts);

        // Tạo product images cho 5 sản phẩm ban đầu
        const initialProductImages = [
            {
                id: uuidv4(),
                product_id: products[0].id,
                image_url:
                    "https://res.cloudinary.com/dzapyb23p/image/upload/v1747730409/auction_website/products/rgdhgpf418wkp8zbsbbd.jpg",
            },
            {
                id: uuidv4(),
                product_id: products[1].id,
                image_url:
                    "https://res.cloudinary.com/dzapyb23p/image/upload/v1747731256/auction_website/products/clj0bpbg00eleyphyloe.jpg",
            },
            {
                id: uuidv4(),
                product_id: products[2].id,
                image_url:
                    "https://res.cloudinary.com/dzapyb23p/image/upload/v1747730410/auction_website/products/wldom6fxkq9qnwfvoco3.jpg",
            },
            {
                id: uuidv4(),
                product_id: products[3].id,
                image_url:
                    "https://res.cloudinary.com/dzapyb23p/image/upload/v1747730410/auction_website/products/y7g2evo5vesjopxjyxo3.jpg",
            },
            {
                id: uuidv4(),
                product_id: products[4].id,
                image_url:
                    "https://res.cloudinary.com/dzapyb23p/image/upload/v1747730410/auction_website/products/scaj1a5uvhtzt40btxrk.jpg",
            },
        ];

        // Tạo product images cho 50 sản phẩm đồ cổ
        // Map theo title để đảm bảo đúng sản phẩm (an toàn hơn)
        const antiqueProductImages = products.slice(5).map((product) => {
            const productData = antiqueProductsData.find((item) => item.title === product.title);
            return {
                id: uuidv4(),
                product_id: product.id,
                image_url: productData ? productData.image_url : "",
            };
        });

        // Kết hợp tất cả product images
        const allProductImages = [...initialProductImages, ...antiqueProductImages];
        await ProductImage.bulkCreate(allProductImages);

        // Tạo auctions
        const now = new Date();
        const oneWeekLater = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
        const twoWeeksLater = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);
        const buyers = users.filter((user) => user.role === "buyer");

        // Tạo auctions cho 5 sản phẩm ban đầu
        const initialAuctions = [
            {
                id: uuidv4(),
                product_id: products[0].id,
                start_time: now,
                end_time: oneWeekLater,
                status: "active",
                bid_increment: 500000,
                current_bid: 15500000,
                current_winner_id: buyers[0].id, // buyer1
            },
            {
                id: uuidv4(),
                product_id: products[1].id,
                start_time: now,
                end_time: oneWeekLater,
                status: "active",
                bid_increment: 100000,
                current_bid: 2600000,
                current_winner_id: buyers[1].id, // buyer2
            },
            {
                id: uuidv4(),
                product_id: products[2].id,
                start_time: now,
                end_time: oneWeekLater,
                status: "active",
                bid_increment: 200000,
                current_bid: 8200000,
                current_winner_id: buyers[0].id, // buyer1
            },
            {
                id: uuidv4(),
                product_id: products[3].id,
                start_time: now,
                end_time: oneWeekLater,
                status: "pending",
                bid_increment: 500000,
                current_bid: null,
                current_winner_id: null,
            },
            {
                id: uuidv4(),
                product_id: products[4].id,
                start_time: now,
                end_time: oneWeekLater,
                status: "pending",
                bid_increment: 1000000,
                current_bid: null,
                current_winner_id: null,
            },
        ];

        // Tạo auctions cho 50 sản phẩm đồ cổ
        // 30 auctions active, 20 auctions pending
        const antiqueProductsForAuction = products.slice(5); // Lấy 50 sản phẩm đồ cổ
        const antiqueAuctions = antiqueProductsForAuction.map((product, index) => {
            const isActive = index < 30; // 30 đầu là active, 20 sau là pending
            const startingPrice = parseFloat(product.starting_price);

            // Tính bid_increment dựa trên giá khởi điểm
            let bidIncrement;
            if (startingPrice < 20000000) {
                bidIncrement = 100000;
            } else if (startingPrice < 50000000) {
                bidIncrement = 500000;
            } else if (startingPrice < 100000000) {
                bidIncrement = 1000000;
            } else if (startingPrice < 200000000) {
                bidIncrement = 2000000;
            } else {
                bidIncrement = 5000000;
            }

            // Tính current_bid cho active auctions (giá khởi điểm + bid_increment)
            const currentBid = isActive ? startingPrice + bidIncrement : null;
            const currentWinnerId = isActive ? buyers[index % buyers.length].id : null;

            // Thời gian kết thúc: 1-2 tuần sau
            const endTime = index % 2 === 0 ? oneWeekLater : twoWeeksLater;

            return {
                id: uuidv4(),
                product_id: product.id,
                start_time: now,
                end_time: endTime,
                status: isActive ? "active" : "pending",
                bid_increment: bidIncrement,
                current_bid: currentBid,
                current_winner_id: currentWinnerId,
            };
        });

        // Kết hợp tất cả auctions
        const allAuctions = [...initialAuctions, ...antiqueAuctions];
        const auctions = await Auction.bulkCreate(allAuctions);

        // Tạo bids
        await Bid.bulkCreate([
            {
                id: uuidv4(),
                auction_id: auctions[0].id,
                user_id: buyers[0].id,
                bid_amount: 15500000,
            },
            {
                id: uuidv4(),
                auction_id: auctions[1].id,
                user_id: buyers[1].id,
                bid_amount: 2600000,
            },
            {
                id: uuidv4(),
                auction_id: auctions[2].id,
                user_id: buyers[0].id,
                bid_amount: 8200000,
            },
            {
                id: uuidv4(),
                auction_id: auctions[0].id,
                user_id: buyers[1].id,
                bid_amount: 15000000,
            },
            {
                id: uuidv4(),
                auction_id: auctions[2].id,
                user_id: buyers[1].id,
                bid_amount: 8000000,
            },
        ]);

        // Tạo auction registrations
        await AuctionRegistration.bulkCreate([
            {
                id: uuidv4(),
                auction_id: auctions[0].id,
                user_id: buyers[0].id,
                status: "approved",
                registration_date: now,
            },
            {
                id: uuidv4(),
                auction_id: auctions[0].id,
                user_id: buyers[1].id,
                status: "approved",
                registration_date: now,
            },
            {
                id: uuidv4(),
                auction_id: auctions[1].id,
                user_id: buyers[1].id,
                status: "approved",
                registration_date: now,
            },
            {
                id: uuidv4(),
                auction_id: auctions[2].id,
                user_id: buyers[0].id,
                status: "approved",
                registration_date: now,
            },
            {
                id: uuidv4(),
                auction_id: auctions[2].id,
                user_id: buyers[1].id,
                status: "pending",
                registration_date: now,
            },
        ]);

        // Tạo auction winners cho các phiên đấu giá đã kết thúc
        const closedAuction1 = await Auction.create({
            id: uuidv4(),
            product_id: products[0].id,
            start_time: new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000), // 2 tuần trước
            end_time: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000), // 1 tuần trước
            status: "closed",
            bid_increment: 500000,
            current_bid: 16000000,
            current_winner_id: buyers[0].id,
        });

        const closedAuction2 = await Auction.create({
            id: uuidv4(),
            product_id: products[1].id,
            start_time: new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000), // 2 tuần trước
            end_time: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000), // 1 tuần trước
            status: "closed",
            bid_increment: 100000,
            current_bid: 3000000,
            current_winner_id: buyers[1].id,
        });

        const auctionWinner1 = await AuctionWinner.create({
            id: uuidv4(),
            auction_id: closedAuction1.id,
            winner_id: buyers[0].id,
        });

        const auctionWinner2 = await AuctionWinner.create({
            id: uuidv4(),
            auction_id: closedAuction2.id,
            winner_id: buyers[1].id,
        });

        // Tạo transactions cho người thắng đấu giá
        await Transaction.create({
            id: uuidv4(),
            auction_id: closedAuction1.id,
            amount: 16000000,
            status: "completed",
            payment_method: "VNPAY",
            transaction_code: "TRX" + Date.now(),
        });

        await Transaction.create({
            id: uuidv4(),
            auction_id: closedAuction2.id,
            amount: 3000000,
            status: "pending",
            payment_method: "VNPAY",
            transaction_code: "TRX" + Date.now() + "1",
        });

        console.log("Database seeded successfully!");
    } catch (error) {
        console.error("Error seeding database:", error);
    }
};

module.exports = seedDatabase;
