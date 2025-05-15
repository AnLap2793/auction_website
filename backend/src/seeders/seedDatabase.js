const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');
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
  sequelize
} = require('../models');

const seedDatabase = async () => {
  try {
    await sequelize.sync({ force: true }); // Xóa và tạo lại tất cả các bảng

    // Tạo users
    const hashedPassword = await bcrypt.hash('password123', 10);
    const users = await User.bulkCreate([
      {
        id: uuidv4(),
        email: 'admin@auction.com',
        password_hash: hashedPassword,
        first_name: 'Admin',
        last_name: 'System',
        phone_number: '0123456789',
        address: '123 Admin Street',
        role: 'admin',
        is_verified: true,
        is_active: true
      },
      {
        id: uuidv4(),
        email: 'seller1@example.com',
        password_hash: hashedPassword,
        first_name: 'Nguyễn',
        last_name: 'Văn A',
        phone_number: '0123456788',
        address: '456 Seller Street',
        role: 'seller',
        is_verified: true,
        is_active: true
      },
      {
        id: uuidv4(),
        email: 'seller2@example.com',
        password_hash: hashedPassword,
        first_name: 'Trần',
        last_name: 'Thị B',
        phone_number: '0123456787',
        address: '789 Seller Street',
        role: 'seller',
        is_verified: true,
        is_active: true
      },
      {
        id: uuidv4(),
        email: 'buyer1@example.com',
        password_hash: hashedPassword,
        first_name: 'Lê',
        last_name: 'Văn C',
        phone_number: '0123456786',
        address: '321 Buyer Street',
        role: 'buyer',
        is_verified: true,
        is_active: true
      },
      {
        id: uuidv4(),
        email: 'buyer2@example.com',
        password_hash: hashedPassword,
        first_name: 'Phạm',
        last_name: 'Thị D',
        phone_number: '0123456785',
        address: '654 Buyer Street',
        role: 'buyer',
        is_verified: true,
        is_active: true
      }
    ]);

    // Tạo categories
    const categories = await Category.bulkCreate([
      {
        id: uuidv4(),
        name: 'Điện tử',
        description: 'Các sản phẩm điện tử như điện thoại, máy tính, tablet'
      },
      {
        id: uuidv4(),
        name: 'Thời trang',
        description: 'Quần áo, giày dép, phụ kiện thời trang'
      },
      {
        id: uuidv4(),
        name: 'Nội thất',
        description: 'Bàn ghế, tủ kệ, đồ trang trí nội thất'
      },
      {
        id: uuidv4(),
        name: 'Xe cộ',
        description: 'Xe máy, xe đạp, phụ tùng xe'
      },
      {
        id: uuidv4(),
        name: 'Đồ cổ',
        description: 'Các sản phẩm cổ, hiếm có giá trị'
      }
    ]);

    // Tạo products
    const sellers = users.filter(user => user.role === 'seller');
    const products = await Product.bulkCreate([
      {
        id: uuidv4(),
        seller_id: sellers[0].id,
        category_id: categories[0].id,
        title: 'iPhone 13 Pro Max 256GB',
        description: 'Điện thoại iPhone 13 Pro Max mới 100%, nguyên seal',
        starting_price: 15000000
      },
      {
        id: uuidv4(),
        seller_id: sellers[1].id,
        category_id: categories[1].id,
        title: 'Áo khoác da nam cao cấp',
        description: 'Áo khoác da thật, nhập khẩu từ Ý',
        starting_price: 2500000
      },
      {
        id: uuidv4(),
        seller_id: sellers[0].id,
        category_id: categories[2].id,
        title: 'Bộ sofa da cao cấp',
        description: 'Bộ sofa da nhập khẩu từ Đức, bảo hành 5 năm',
        starting_price: 8000000
      },
      {
        id: uuidv4(),
        seller_id: sellers[1].id,
        category_id: categories[3].id,
        title: 'Honda Wave Alpha 2023',
        description: 'Xe máy Wave Alpha đời mới nhất, chưa đăng ký',
        starting_price: 18000000
      },
      {
        id: uuidv4(),
        seller_id: sellers[0].id,
        category_id: categories[4].id,
        title: 'Bình gốm thời Lý',
        description: 'Bình gốm cổ thời Lý, có giấy chứng nhận',
        starting_price: 50000000
      }
    ]);

    // Tạo product images
    await ProductImage.bulkCreate([
      {
        id: uuidv4(),
        product_id: products[0].id,
        image_url: 'https://example.com/images/iphone13-1.jpg'
      },
      {
        id: uuidv4(),
        product_id: products[1].id,
        image_url: 'https://example.com/images/jacket-1.jpg'
      },
      {
        id: uuidv4(),
        product_id: products[2].id,
        image_url: 'https://example.com/images/sofa-1.jpg'
      },
      {
        id: uuidv4(),
        product_id: products[3].id,
        image_url: 'https://example.com/images/wave-1.jpg'
      },
      {
        id: uuidv4(),
        product_id: products[4].id,
        image_url: 'https://example.com/images/antique-1.jpg'
      }
    ]);

    // Tạo auctions
    const now = new Date();
    const oneWeekLater = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const auctions = await Auction.bulkCreate([
      {
        id: uuidv4(),
        product_id: products[0].id,
        start_time: now,
        end_time: oneWeekLater,
        status: 'active',
        bid_increment: 500000,
        current_bid: 15500000,
        current_winner_id: users[3].id // buyer1
      },
      {
        id: uuidv4(),
        product_id: products[1].id,
        start_time: now,
        end_time: oneWeekLater,
        status: 'active',
        bid_increment: 100000,
        current_bid: 2600000,
        current_winner_id: users[4].id // buyer2
      },
      {
        id: uuidv4(),
        product_id: products[2].id,
        start_time: now,
        end_time: oneWeekLater,
        status: 'active',
        bid_increment: 200000,
        current_bid: 8200000,
        current_winner_id: users[3].id // buyer1
      },
      {
        id: uuidv4(),
        product_id: products[3].id,
        start_time: now,
        end_time: oneWeekLater,
        status: 'pending',
        bid_increment: 500000,
        current_bid: null,
        current_winner_id: null
      },
      {
        id: uuidv4(),
        product_id: products[4].id,
        start_time: now,
        end_time: oneWeekLater,
        status: 'pending',
        bid_increment: 1000000,
        current_bid: null,
        current_winner_id: null
      }
    ]);

    // Tạo bids
    const buyers = users.filter(user => user.role === 'buyer');
    await Bid.bulkCreate([
      {
        id: uuidv4(),
        auction_id: auctions[0].id,
        user_id: buyers[0].id,
        bid_amount: 15500000
      },
      {
        id: uuidv4(),
        auction_id: auctions[1].id,
        user_id: buyers[1].id,
        bid_amount: 2600000
      },
      {
        id: uuidv4(),
        auction_id: auctions[2].id,
        user_id: buyers[0].id,
        bid_amount: 8200000
      },
      {
        id: uuidv4(),
        auction_id: auctions[0].id,
        user_id: buyers[1].id,
        bid_amount: 15000000
      },
      {
        id: uuidv4(),
        auction_id: auctions[2].id,
        user_id: buyers[1].id,
        bid_amount: 8000000
      }
    ]);

    // Tạo auction registrations
    await AuctionRegistration.bulkCreate([
      {
        id: uuidv4(),
        auction_id: auctions[0].id,
        user_id: buyers[0].id,
        status: 'approved',
        registration_date: now
      },
      {
        id: uuidv4(),
        auction_id: auctions[0].id,
        user_id: buyers[1].id,
        status: 'approved',
        registration_date: now
      },
      {
        id: uuidv4(),
        auction_id: auctions[1].id,
        user_id: buyers[1].id,
        status: 'approved',
        registration_date: now
      },
      {
        id: uuidv4(),
        auction_id: auctions[2].id,
        user_id: buyers[0].id,
        status: 'approved',
        registration_date: now
      },
      {
        id: uuidv4(),
        auction_id: auctions[2].id,
        user_id: buyers[1].id,
        status: 'pending',
        registration_date: now
      }
    ]);

    // Tạo auction winners cho các phiên đấu giá đã kết thúc
    const closedAuction1 = await Auction.create({
      id: uuidv4(),
      product_id: products[0].id,
      start_time: new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000), // 2 tuần trước
      end_time: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000), // 1 tuần trước
      status: 'closed',
      bid_increment: 500000,
      current_bid: 16000000,
      current_winner_id: buyers[0].id
    });

    const closedAuction2 = await Auction.create({
      id: uuidv4(),
      product_id: products[1].id,
      start_time: new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000), // 2 tuần trước
      end_time: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000), // 1 tuần trước
      status: 'closed',
      bid_increment: 100000,
      current_bid: 3000000,
      current_winner_id: buyers[1].id
    });

    const auctionWinner1 = await AuctionWinner.create({
      id: uuidv4(),
      auction_id: closedAuction1.id,
      winner_id: buyers[0].id
    });

    const auctionWinner2 = await AuctionWinner.create({
      id: uuidv4(),
      auction_id: closedAuction2.id,
      winner_id: buyers[1].id
    });

    // Tạo transactions cho người thắng đấu giá
    await Transaction.create({
      id: uuidv4(),
      auction_id: closedAuction1.id,
      amount: 16000000,
      status: 'completed',
      payment_method: 'bank_transfer',
      transaction_code: 'TRX' + Date.now()
    });

    await Transaction.create({
      id: uuidv4(),
      auction_id: closedAuction2.id,
      amount: 3000000,
      status: 'pending',
      payment_method: 'bank_transfer',
      transaction_code: 'TRX' + Date.now() + '1'
    });

    console.log('Database seeded successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
  }
};

module.exports = seedDatabase; 