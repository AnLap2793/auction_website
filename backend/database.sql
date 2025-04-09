-- Tạo database
CREATE DATABASE auction_website;

-- Kết nối tới database
\c auction_website;

-- Kích hoạt extension uuid-ossp
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Bảng người dùng
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    first_name TEXT,
    last_name TEXT,
    phone_number TEXT,
    address TEXT,
    role TEXT CHECK (role IN ('seller', 'buyer')) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    is_verified BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE
);

-- Bảng danh mục sản phẩm
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Bảng sản phẩm (ẩn danh người bán)
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    seller_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    starting_price DECIMAL(15,2) NOT NULL
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);


-- Bảng hình ảnh sản phẩm
CREATE TABLE product_images (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Bảng đấu giá
CREATE TABLE auctions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE NOT NULL,
    status TEXT CHECK (status IN ('pending', 'active', 'closed', 'canceled')) NOT NULL,
    bid_increment DECIMAL(15,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Bảng đặt giá (ẩn danh)
CREATE TABLE bids (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    auction_id UUID NOT NULL REFERENCES auctions(id) ON DELETE CASCADE,
    anonymous_id TEXT NOT NULL REFERENCES anonymous_bidders(anonymous_id) ON DELETE CASCADE,
    amount DECIMAL(15,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Bảng ẩn danh người thắng đấu giá
CREATE TABLE auction_winners (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    auction_id UUID NOT NULL REFERENCES auctions(id) ON DELETE CASCADE,
    real_winner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    anonymous_winner_id TEXT UNIQUE NOT NULL
);

-- Bảng giao dịch (bảo mật thông tin thanh toán)
CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    anonymous_winner_id TEXT NOT NULL REFERENCES auction_winners(anonymous_winner_id) ON DELETE CASCADE,
    auction_id UUID NOT NULL REFERENCES auctions(id) ON DELETE CASCADE,
    amount DECIMAL(15,2) NOT NULL,
    status TEXT CHECK (status IN ('pending', 'completed', 'failed')) NOT NULL,
    payment_method TEXT NOT NULL,
    transaction_code TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Bảng thông báo
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    type TEXT CHECK (type IN ('bid_placed', 'auction_won', 'payment_success', 'general')) NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
); 

CREATE INDEX idx_products_seller_id ON products (seller_id);
CREATE INDEX idx_products_category_id ON products (category_id);
CREATE INDEX idx_product_images_product_id ON product_images (product_id);
CREATE INDEX idx_auctions_product_id ON auctions (product_id);
CREATE INDEX idx_bids_auction_id ON bids (auction_id);
CREATE INDEX idx_bids_anonymous_id ON bids (anonymous_id);
CREATE INDEX idx_auction_winners_auction_id ON auction_winners (auction_id);
CREATE INDEX idx_transactions_auction_id ON transactions (auction_id);
CREATE INDEX idx_notifications_user_id ON notifications (user_id);