const express = require('express');
const router = express.Router();
const { 
    register, 
    login, 
    getCurrentUser, 
    verifyEmail, 
    resendVerificationEmail,
    forgotPassword,
    resetPasswordController
} = require('../controllers/authController');
const { authenticateToken } = require('../middlewares/auth');

// Route đăng ký
router.post('/register', register);

// Route đăng nhập
router.post('/login', login);

// Route xác thực email
router.get('/verify-email/:token', verifyEmail);

// Route gửi lại email xác thực
router.post('/resend-verification', resendVerificationEmail);

// Route lấy thông tin user hiện tại (yêu cầu xác thực)
router.get('/account', authenticateToken, getCurrentUser);

// Route gửi yêu cầu reset password
router.post('/forgot-password', forgotPassword);

// Route reset password
router.post('/reset-password', resetPasswordController);

module.exports = router; 