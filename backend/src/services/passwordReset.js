const User = require("../models/User")
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { sendResetPasswordEmail } = require('./emailService');
require('dotenv').config();

// Tạo token reset password
const generateResetToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn: '1h' } // Token hết hạn sau 1 giờ
  );
};

// Gửi email reset password
const sendResetPasswordRequest = async (email) => {
  try {
    // Tìm user theo email
    const user = await User.findOne({ where: { email } });
    if (!user) {
      throw new Error('Không tìm thấy tài khoản với email này');
    }

    // Tạo reset token
    const resetToken = generateResetToken(user.id);

    // Tạo URL reset password với query parameter
    const resetPasswordUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

    // Gửi email
    const emailSent = await sendResetPasswordEmail(email, resetPasswordUrl);
    if (!emailSent) {
      throw new Error('Không thể gửi email reset password');
    }

    return true;
  } catch (error) {
    throw error;
  }
};

// Reset password
const resetPassword = async (token, newPassword) => {
  try {
    // Xác thực token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Tìm user
    const user = await User.findByPk(decoded.userId);
    if (!user) {
      throw new Error('Không tìm thấy người dùng');
    }

    // Mã hóa mật khẩu mới
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Cập nhật mật khẩu
    user.password_hash = hashedPassword;
    await user.save();

    return true;
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new Error('Token reset password đã hết hạn');
    }
    if (error.name === 'JsonWebTokenError') {
      throw new Error('Token không hợp lệ');
    }
    throw error;
  }
};

module.exports = {
  sendResetPasswordRequest,
  resetPassword
};

