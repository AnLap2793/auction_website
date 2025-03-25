const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');
require('dotenv').config();

// Cấu hình transporter của nodemailer
const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

// Tạo token xác thực email
const generateVerificationToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.EMAIL_VERIFICATION_EXPIRY || '24h' }
  );
};

// Gửi email xác thực
const sendVerificationEmail = async (user, verificationUrl) => {
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: user.email,
    subject: 'Xác thực tài khoản Auction Website',
    html: `
      <h1>Xác thực tài khoản của bạn</h1>
      <p>Xin chào ${user.first_name || 'người dùng'},</p>
      <p>Cảm ơn bạn đã đăng ký tài khoản trên Auction Website. Vui lòng nhấp vào nút bên dưới để xác thực email của bạn:</p>
      <a href="${verificationUrl}" style="display: inline-block; background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin: 10px 0;">Xác thực Email</a>
      <p>Hoặc bạn có thể nhấp vào liên kết sau: <a href="${verificationUrl}">${verificationUrl}</a></p>
      <p>Liên kết này sẽ hết hạn sau 24 giờ.</p>
      <p>Nếu bạn không đăng ký tài khoản này, vui lòng bỏ qua email này.</p>
      <p>Trân trọng,<br>Đội ngũ Auction Website</p>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Lỗi gửi email:', error);
    return false;
  }
};

module.exports = {
  generateVerificationToken,
  sendVerificationEmail
}; 