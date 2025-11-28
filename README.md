# Auction Website

Một trang web đấu giá trực tuyến được xây dựng với React và Node.js.

## Tính năng

-   Đăng ký và đăng nhập tài khoản
-   Xem danh sách các sản phẩm đấu giá
-   Tham gia đấu giá sản phẩm
-   Đăng sản phẩm để đấu giá
-   Theo dõi lịch sử đấu giá
-   Quản lý thông tin cá nhân

## Công nghệ sử dụng

### Frontend

-   React
-   Vite
-   Antd design

### Backend

-   Node.js
-   Express
-   PostgreSQL
-   JWT Authentication

## Cài đặt

### Yêu cầu

-   Node.js (phiên bản 14.0.0 trở lên)
-   PostgreSQL (phiên bản 12 trở lên)

### Các bước cài đặt

1. Clone repository:

```bash
git clone https://github.com/your-username/auction_website.git
cd auction_website
```

2. Cài đặt dependencies cho backend:

```bash
cd backend
npm install
```

3. Thiết lập cơ sở dữ liệu:

-   Tạo database PostgreSQL mới
-   Import file `database.sql`
-   Cấu hình thông tin kết nối trong file `.env`

4. Khởi chạy backend:

```bash
npm run dev
```

5. Cài đặt dependencies cho frontend:

```bash
cd ../frontend
npm install
```

6. Khởi chạy frontend:

```bash
npm run dev
```

Ứng dụng sẽ chạy tại `http://localhost:5173`
