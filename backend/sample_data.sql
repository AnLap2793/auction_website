-- Dữ liệu mẫu cho bảng users
WITH inserted_users AS (
    INSERT INTO users (id, email, password_hash, first_name, last_name, phone_number, address, role, created_at, updated_at, is_verified, is_active)
    VALUES
    (uuid_generate_v4(), 'admin@auction.com', 'hashed_password_1', 'Admin', 'System', '0123456789', '123 Admin Street', 'admin', NOW(), NOW(), TRUE, TRUE),
    (uuid_generate_v4(), 'seller1@example.com', 'hashed_password_2', 'Nguyễn', 'Văn A', '0123456788', '456 Seller Street', 'seller', NOW(), NOW(), TRUE, TRUE),
    (uuid_generate_v4(), 'seller2@example.com', 'hashed_password_3', 'Trần', 'Thị B', '0123456787', '789 Seller Street', 'seller', NOW(), NOW(), TRUE, TRUE),
    (uuid_generate_v4(), 'buyer1@example.com', 'hashed_password_4', 'Lê', 'Văn C', '0123456786', '321 Buyer Street', 'buyer', NOW(), NOW(), TRUE, TRUE),
    (uuid_generate_v4(), 'buyer2@example.com', 'hashed_password_5', 'Phạm', 'Thị D', '0123456785', '654 Buyer Street', 'buyer', NOW(), NOW(), TRUE, TRUE)
    RETURNING id, email
)
-- Dữ liệu mẫu cho bảng categories
, inserted_categories AS (
    INSERT INTO categories (id, name, description, created_at, updated_at)
    VALUES
    (uuid_generate_v4(), 'Điện tử', 'Các sản phẩm điện tử như điện thoại, máy tính, tablet', NOW(), NOW()),
    (uuid_generate_v4(), 'Thời trang', 'Quần áo, giày dép, phụ kiện thời trang', NOW(), NOW()),
    (uuid_generate_v4(), 'Nội thất', 'Bàn ghế, tủ kệ, đồ trang trí nội thất', NOW(), NOW()),
    (uuid_generate_v4(), 'Xe cộ', 'Xe máy, xe đạp, phụ tùng xe', NOW(), NOW()),
    (uuid_generate_v4(), 'Đồ cổ', 'Các sản phẩm cổ, hiếm có giá trị', NOW(), NOW())
    RETURNING id, name
)
-- Dữ liệu mẫu cho bảng products
, inserted_products AS (
    INSERT INTO products (id, category_id, title, description, starting_price, current_price, created_at, updated_at)
    SELECT 
        uuid_generate_v4(),
        c.id,
        p.title,
        p.description,
        p.starting_price,
        p.current_price,
        NOW(),
        NOW()
    FROM (VALUES
        ('Điện tử', 'iPhone 13 Pro Max 256GB', 'Máy mới 100%, đầy đủ phụ kiện, bảo hành 12 tháng', 15000000, 15000000),
        ('Thời trang', 'Áo khoác da nam cao cấp', 'Áo da thật, size L, màu đen, mới 100%', 2500000, 2500000),
        ('Nội thất', 'Bộ sofa da cao cấp', 'Sofa 3 chỗ, da thật, màu nâu, mới 100%', 8000000, 8000000),
        ('Xe cộ', 'Honda Wave Alpha 2023', 'Xe mới 100%, đăng ký đầy đủ, bảo hành 5 năm', 15000000, 15000000),
        ('Đồ cổ', 'Bình gốm cổ thời Lý', 'Bình gốm cổ thời Lý, có giấy tờ kiểm định', 50000000, 50000000)
    ) AS p(category_name, title, description, starting_price, current_price)
    JOIN inserted_categories c ON c.name = p.category_name
    RETURNING id, title
)
-- Dữ liệu mẫu cho bảng seller_products
INSERT INTO seller_products (id, seller_id, product_id)
SELECT 
    uuid_generate_v4(),
    u.id,
    p.id
FROM (VALUES
    ('seller1@example.com', 'iPhone 13 Pro Max 256GB'),
    ('seller1@example.com', 'Áo khoác da nam cao cấp'),
    ('seller2@example.com', 'Bộ sofa da cao cấp'),
    ('seller2@example.com', 'Honda Wave Alpha 2023'),
    ('seller1@example.com', 'Bình gốm cổ thời Lý')
) AS sp(seller_email, product_title)
JOIN inserted_users u ON u.email = sp.seller_email
JOIN inserted_products p ON p.title = sp.product_title;

-- Dữ liệu mẫu cho bảng product_images
INSERT INTO product_images (id, product_id, image_url, order_num, created_at)
SELECT 
    uuid_generate_v4(),
    p.id,
    pi.image_url,
    pi.order_num,
    NOW()
FROM (VALUES
    ('iPhone 13 Pro Max 256GB', 'https://example.com/images/iphone13-1.jpg', 1),
    ('iPhone 13 Pro Max 256GB', 'https://example.com/images/iphone13-2.jpg', 2),
    ('Áo khoác da nam cao cấp', 'https://example.com/images/jacket-1.jpg', 1),
    ('Bộ sofa da cao cấp', 'https://example.com/images/sofa-1.jpg', 1),
    ('Honda Wave Alpha 2023', 'https://example.com/images/wave-1.jpg', 1)
) AS pi(product_title, image_url, order_num)
JOIN inserted_products p ON p.title = pi.product_title;

-- Dữ liệu mẫu cho bảng auctions
INSERT INTO auctions (id, product_id, start_time, end_time, status, created_at, updated_at)
SELECT 
    uuid_generate_v4(),
    p.id,
    NOW(),
    NOW() + INTERVAL '7 days',
    'active',
    NOW(),
    NOW()
FROM inserted_products p;

-- Dữ liệu mẫu cho bảng anonymous_bidders
INSERT INTO anonymous_bidders (id, real_user_id, anonymous_id)
SELECT 
    uuid_generate_v4(),
    u.id,
    ab.anonymous_id
FROM (VALUES
    ('buyer1@example.com', 'ANON001'),
    ('buyer2@example.com', 'ANON002')
) AS ab(user_email, anonymous_id)
JOIN inserted_users u ON u.email = ab.user_email;

-- Dữ liệu mẫu cho bảng bids
INSERT INTO bids (id, auction_id, anonymous_id, amount, created_at)
SELECT 
    uuid_generate_v4(),
    a.id,
    ab.anonymous_id,
    b.amount,
    NOW()
FROM (VALUES
    ('iPhone 13 Pro Max 256GB', 'ANON001', 15500000),
    ('Áo khoác da nam cao cấp', 'ANON002', 2600000),
    ('Bộ sofa da cao cấp', 'ANON001', 8100000)
) AS b(product_title, anonymous_id, amount)
JOIN inserted_products p ON p.title = b.product_title
JOIN auctions a ON a.product_id = p.id
JOIN anonymous_bidders ab ON ab.anonymous_id = b.anonymous_id;

-- Dữ liệu mẫu cho bảng notifications
INSERT INTO notifications (id, user_id, message, type, is_read, created_at)
SELECT 
    uuid_generate_v4(),
    u.id,
    n.message,
    n.type,
    FALSE,
    NOW()
FROM (VALUES
    ('buyer1@example.com', 'Bạn đã đặt giá thành công cho sản phẩm iPhone 13 Pro Max 256GB', 'bid_placed'),
    ('buyer2@example.com', 'Bạn đã đặt giá thành công cho sản phẩm Áo khoác da nam cao cấp', 'bid_placed'),
    ('seller1@example.com', 'Sản phẩm của bạn đã có người đặt giá', 'bid_placed')
) AS n(user_email, message, type)
JOIN inserted_users u ON u.email = n.user_email; 