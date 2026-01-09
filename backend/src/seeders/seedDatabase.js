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
            {
                id: uuidv4(),
                email: "buyer3@example.com",
                password_hash: hashedPassword,
                first_name: "Hoàng",
                last_name: "Văn E",
                phone_number: "0123456784",
                address: "987 Buyer Street",
                role: "buyer",
                is_verified: true,
                is_active: true,
            },
            {
                id: uuidv4(),
                email: "buyer4@example.com",
                password_hash: hashedPassword,
                first_name: "Vũ",
                last_name: "Thị F",
                phone_number: "0123456783",
                address: "147 Buyer Street",
                role: "buyer",
                is_verified: true,
                is_active: true,
            },
            {
                id: uuidv4(),
                email: "buyer5@example.com",
                password_hash: hashedPassword,
                first_name: "Đỗ",
                last_name: "Văn G",
                phone_number: "0123456782",
                address: "258 Buyer Street",
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

        // Seed antique products - phân bố đều giữa 2 sellers
        const sellers = users.filter((user) => user.role === "seller");
        const antiqueProductsData = require("../data/antique_products.json");
        const antiqueCategory = categories.find((c) => c.name === "Đồ cổ");

        // Chia đều sản phẩm đồ cổ giữa 2 sellers
        const antiqueProducts = await Product.bulkCreate(
            antiqueProductsData.map((item, index) => ({
                id: uuidv4(),
                seller_id: sellers[index % 2].id, // Luân phiên giữa seller[0] và seller[1]
                category_id: antiqueCategory.id,
                title: item.title,
                description: item.description,
                starting_price: item.starting_price,
            }))
        );

        // Seed antique product images
        await ProductImage.bulkCreate(
            antiqueProducts.map((product, index) => {
                const item = antiqueProductsData[index];
                return {
                    id: uuidv4(),
                    product_id: product.id,
                    image_url: `https://loremflickr.com/640/480/${item.category_keyword.replace(
                        / /g,
                        ","
                    )}?lock=${index}`,
                };
            })
        );

        // Tạo auctions cho tất cả sản phẩm với phân bố trạng thái đồng đều
        const now = new Date();
        const oneWeekLater = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
        const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

        // Lấy danh sách buyers để sử dụng cho auctions
        const buyers = users.filter((user) => user.role === "buyer");

        // Tạo auctions cho 50 sản phẩm đồ cổ với phân bố trạng thái đồng đều
        const antiqueAuctions = await Auction.bulkCreate(
            antiqueProducts.map((product, index) => {
                // Phân bố trạng thái: 1/3 active, 1/3 pending, 1/3 closed
                const statusIndex = index % 3;
                let status, startTime, endTime, currentBid, currentWinnerId;

                // Tính bid_increment dựa trên giá khởi điểm
                const startingPrice = antiqueProductsData[index].starting_price;
                let bidIncrement;
                if (startingPrice >= 50000000) {
                    bidIncrement = 1000000; // >= 50M: tăng 1M
                } else if (startingPrice >= 20000000) {
                    bidIncrement = 500000; // >= 20M: tăng 500K
                } else if (startingPrice >= 10000000) {
                    bidIncrement = 200000; // >= 10M: tăng 200K
                } else {
                    bidIncrement = 100000; // < 10M: tăng 100K
                }

                if (statusIndex === 0) {
                    // Active: đang diễn ra
                    status = "active";
                    startTime = now;
                    endTime = oneWeekLater;
                    currentBid = startingPrice + bidIncrement;
                    currentWinnerId = buyers[index % buyers.length].id;
                } else if (statusIndex === 1) {
                    // Pending: chờ bắt đầu
                    status = "pending";
                    startTime = new Date(now.getTime() + ((index % 3) + 1) * 24 * 60 * 60 * 1000); // 1-3 ngày sau
                    endTime = new Date(startTime.getTime() + 7 * 24 * 60 * 60 * 1000);
                    currentBid = null;
                    currentWinnerId = null;
                } else {
                    // Closed: đã kết thúc
                    status = "closed";
                    startTime = twoWeeksAgo;
                    endTime = oneWeekAgo;
                    currentBid = startingPrice + bidIncrement * ((index % 5) + 1); // Giá cao hơn khởi điểm
                    currentWinnerId = buyers[index % buyers.length].id;
                }

                return {
                    id: uuidv4(),
                    product_id: product.id,
                    start_time: startTime,
                    end_time: endTime,
                    status: status,
                    bid_increment: bidIncrement,
                    current_bid: currentBid,
                    current_winner_id: currentWinnerId,
                };
            })
        );

        // Tạo bids cho các auctions đồ cổ (active và closed)
        const bidsToCreate = [];
        antiqueAuctions.forEach((auction, index) => {
            if (auction.status === "active" || auction.status === "closed") {
                const startingPrice = antiqueProductsData[index].starting_price;
                const bidIncrement = auction.bid_increment;

                // Tạo nhiều lượt đấu giá (5-10 lượt tùy loại auction)
                const numBids =
                    auction.status === "active"
                        ? 5 + (index % 6) // Active: 5-10 bids
                        : 8 + (index % 5); // Closed: 8-12 bids (đã kết thúc nên có nhiều lượt hơn)

                // Lấy danh sách buyers đã đăng ký cho auction này (sẽ tạo sau)
                // Tạm thời sử dụng tất cả buyers
                const availableBuyers = buyers;

                for (let i = 0; i < numBids; i++) {
                    const bidAmount = startingPrice + bidIncrement * (i + 1);
                    // Luân phiên giữa các buyers để mô phỏng cuộc đấu giá thực tế
                    const buyerIndex = (index * 2 + i) % availableBuyers.length;

                    bidsToCreate.push({
                        id: uuidv4(),
                        auction_id: auction.id,
                        user_id: availableBuyers[buyerIndex].id,
                        bid_amount: bidAmount,
                    });
                }
            }
        });

        await Bid.bulkCreate(bidsToCreate);

        // Tạo auction registrations cho các auctions active và pending
        const registrationsToCreate = [];

        // Tạo registrations cho các auctions đồ cổ (active và pending)
        antiqueAuctions.forEach((auction, index) => {
            if (auction.status === "active" || auction.status === "pending") {
                // Mỗi auction có 3-6 người đăng ký
                const numRegistrations = 3 + (index % 4); // 3-6 registrations

                // Chọn ngẫu nhiên các buyers để đăng ký
                const selectedBuyers = [];
                for (let i = 0; i < numRegistrations; i++) {
                    const buyerIndex = (index * 3 + i) % buyers.length;
                    if (!selectedBuyers.includes(buyerIndex)) {
                        selectedBuyers.push(buyerIndex);
                    } else {
                        // Nếu đã có, chọn buyer tiếp theo
                        selectedBuyers.push((buyerIndex + 1) % buyers.length);
                    }
                }

                selectedBuyers.forEach((buyerIdx, i) => {
                    // Phân bố trạng thái: khoảng 60% approved, 40% pending
                    const status = i < Math.floor(numRegistrations * 0.6) ? "approved" : "pending";
                    const registrationDate =
                        auction.start_time < now
                            ? new Date(now.getTime() - (i + 1) * 60 * 60 * 1000) // Cách nhau 1 giờ
                            : auction.start_time;

                    registrationsToCreate.push({
                        id: uuidv4(),
                        auction_id: auction.id,
                        user_id: buyers[buyerIdx].id,
                        status: status,
                        registration_date: registrationDate,
                    });
                });
            } else if (auction.status === "closed") {
                // Tạo registrations cho các auctions closed (đã diễn ra trong quá khứ)
                const numRegistrations = 4 + (index % 4); // 4-7 registrations

                for (let i = 0; i < numRegistrations; i++) {
                    const buyerIndex = (index * 2 + i) % buyers.length;
                    registrationsToCreate.push({
                        id: uuidv4(),
                        auction_id: auction.id,
                        user_id: buyers[buyerIndex].id,
                        status: "approved", // Đã closed nên tất cả đều approved
                        registration_date: new Date(
                            auction.start_time.getTime() - (numRegistrations - i) * 24 * 60 * 60 * 1000
                        ),
                    });
                }
            }
        });

        await AuctionRegistration.bulkCreate(registrationsToCreate);

        // Tạo auction winners và transactions cho các auctions đã closed
        const closedAuctions = antiqueAuctions.filter((auction) => auction.status === "closed");
        const winnersToCreate = [];
        const transactionsToCreate = [];

        closedAuctions.forEach((auction, index) => {
            if (auction.current_winner_id && auction.current_bid) {
                // Tạo auction winner
                winnersToCreate.push({
                    id: uuidv4(),
                    auction_id: auction.id,
                    user_id: auction.current_winner_id,
                    winning_bid: auction.current_bid,
                    win_date: auction.end_time,
                });

                // Tạo transaction (một số completed, một số pending)
                transactionsToCreate.push({
                    id: uuidv4(),
                    auction_id: auction.id,
                    user_id: auction.current_winner_id,
                    amount: auction.current_bid,
                    status: index % 2 === 0 ? "completed" : "pending", // Phân bố đều completed/pending
                    transaction_type: "auction_win",
                    payment_method: "VNPAY",
                    transaction_code: "TRX" + Date.now() + index,
                });
            }
        });

        if (winnersToCreate.length > 0) {
            await AuctionWinner.bulkCreate(winnersToCreate);
        }

        if (transactionsToCreate.length > 0) {
            await Transaction.bulkCreate(transactionsToCreate);
        }

        console.log("Database seeded successfully!");
    } catch (error) {
        console.error("Error seeding database:", error);
    }
};

module.exports = seedDatabase;
