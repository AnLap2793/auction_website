const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { generateToken } = require('../middlewares/auth');
const { generateVerificationToken, sendVerificationEmail } = require('../services/emailService');
const { sendResetPasswordRequest, resetPassword } = require('../services/passwordReset');

// Đăng ký user mới
const register = async (req, res) => {
    try {
        const { email, password, first_name, last_name, phone_number, role, address } = req.body;

        // Kiểm tra email đã tồn tại chưa
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(400).json({
                status: 'error',
                message: 'Email đã được sử dụng'
            });
        }

        // Mã hóa mật khẩu
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Tạo user mới
        const user = await User.create({
            email,
            password_hash: hashedPassword,
            first_name,
            last_name,
            phone_number,
            address,
            role: role || 'buyer', // Mặc định là buyer nếu không được chỉ định
            is_verified: false // Đặt is_verified thành false khi đăng ký
        });

        // Tạo verification token
        const verificationToken = generateVerificationToken(user.id);

        // Tạo URL xác thực - trỏ đến frontend
        const verificationUrl = `${process.env.FRONTEND_URL}/verify-email/${verificationToken}`;

        // Gửi email xác thực
        await sendVerificationEmail(user, verificationUrl);

        // Tạo token
        const token = generateToken(user);

        // Trả về thông tin user và token
        res.status(201).json({
            status: 'success',
            data: {
                user: {
                    id: user.id,
                    email: user.email,
                    first_name: user.first_name,
                    last_name: user.last_name,
                    role: user.role,
                    is_active: user.is_active,
                    is_verified: user.is_verified,
                    address: user.address
                },
                token,
                message: 'Đăng ký thành công. Vui lòng kiểm tra email để xác thực tài khoản.'
            }
        });
    } catch (error) {
        console.error('Lỗi đăng ký:', error);
        res.status(500).json({
            status: 'error',
            message: 'Lỗi server khi đăng ký'
        });
    }
};

// Đăng nhập
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Tìm user theo email
        const user = await User.findOne({ where: { email } });
        if (!user) {
            return res.status(401).json({
                status: 'error',
                message: 'Email hoặc mật khẩu không đúng'
            });
        }

        // Kiểm tra mật khẩu
        const isValidPassword = await bcrypt.compare(password, user.password_hash);
        if (!isValidPassword) {
            return res.status(401).json({
                status: 'error',
                message: 'Email hoặc mật khẩu không đúng'
            });
        }

        // Kiểm tra tài khoản có bị khóa không
        if (!user.is_active) {
            return res.status(401).json({
                status: 'error',
                message: 'Tài khoản đã bị khóa'
            });
        }

        // Tạo token
        const access_token = generateToken(user);

        // Trả về thông tin user và token
        res.json({
            status: 'success',
            data: {
                user: {
                    id: user.id,
                    email: user.email,
                    first_name: user.first_name,
                    last_name: user.last_name,
                    role: user.role,
                    is_active: user.is_active,
                    is_verified: user.is_verified
                },
                access_token
            }
        });
    } catch (error) {
        console.error('Lỗi đăng nhập:', error);
        res.status(500).json({
            status: 'error',
            message: 'Lỗi server khi đăng nhập'
        });
    }
};

// Xác thực email
const verifyEmail = async (req, res) => {
    try {
        const { token } = req.params;
        
        // Xác thực token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log('Decoded token:', decoded); // Thêm log để debug
        
        // Tìm user theo id trong token
        const user = await User.findByPk(decoded.userId);
        console.log('Found user:', user ? 'Yes' : 'No'); // Thêm log để debug
        
        if (!user) {
            return res.status(404).json({
                status: 'error',
                message: 'Không tìm thấy người dùng'
            });
        }
        
        // Nếu đã xác thực rồi
        if (user.is_verified) {
            return res.status(400).json({
                status: 'error',
                message: 'Email đã được xác thực'
            });
        }
        
        // Cập nhật trạng thái xác thực
        user.is_verified = true;
        await user.save();
        
        // Chuyển hướng hoặc trả về thông báo thành công
        res.json({
            status: 'success',
            message: 'Xác thực email thành công'
        });
    } catch (error) {
        console.error('Lỗi chi tiết:', error); // Thêm log để debug
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                status: 'error',
                message: 'Liên kết xác thực đã hết hạn'
            });
        } else if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                status: 'error',
                message: 'Token không hợp lệ'
            });
        }
        
        res.status(500).json({
            status: 'error',
            message: 'Lỗi server khi xác thực email'
        });
    }
};

// Gửi lại email xác thực
const resendVerificationEmail = async (req, res) => {
    try {
        const { email } = req.body;
        
        // Tìm user theo email
        const user = await User.findOne({ where: { email } });
        
        if (!user) {
            return res.status(404).json({
                status: 'error',
                message: 'Không tìm thấy tài khoản với email này'
            });
        }
        
        // Nếu đã xác thực rồi
        if (user.is_verified) {
            return res.status(400).json({
                status: 'error',
                message: 'Email đã được xác thực'
            });
        }
        
        // Tạo verification token
        const verificationToken = generateVerificationToken(user.id);
        
        // Tạo URL xác thực
        const verificationUrl = `${process.env.FRONTEND_URL}/verify-email/${verificationToken}`;
        
        // Gửi email xác thực
        const emailSent = await sendVerificationEmail(user, verificationUrl);
        
        if (!emailSent) {
            return res.status(500).json({
                status: 'error',
                message: 'Không thể gửi email xác thực'
            });
        }
        
        res.json({
            status: 'success',
            message: 'Email xác thực đã được gửi lại'
        });
        
    } catch (error) {
        console.error('Lỗi gửi lại email xác thực:', error);
        res.status(500).json({
            status: 'error',
            message: 'Lỗi server khi gửi lại email xác thực'
        });
    }
};

// Lấy thông tin user hiện tại
const getCurrentUser = async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id, {
            attributes: { exclude: ['password_hash'] }
        });

        res.json({
            status: 'success',
            data: { user }
        });
    } catch (error) {
        console.error('Lỗi lấy thông tin user:', error);
        res.status(500).json({
            status: 'error',
            message: 'Lỗi server khi lấy thông tin user'
        });
    }
};

// Gửi yêu cầu reset password
const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        
        await sendResetPasswordRequest(email);
        
        res.json({
            status: 'success',
            message: 'Email reset password đã được gửi. Vui lòng kiểm tra hộp thư của bạn.'
        });
    } catch (error) {
        console.error('Lỗi gửi yêu cầu reset password:', error);
        res.status(400).json({
            status: 'error',
            message: error.message
        });
    }
};

// Reset password
const resetPasswordController = async (req, res) => {
    try {
        const { token, newPassword } = req.body;
        
        await resetPassword(token, newPassword);
        
        res.json({
            status: 'success',
            message: 'Mật khẩu đã được đặt lại thành công'
        });
    } catch (error) {
        console.error('Lỗi reset password:', error);
        res.status(400).json({
            status: 'error',
            message: error.message
        });
    }
};

module.exports = {
    register,
    login,
    getCurrentUser,
    verifyEmail,
    resendVerificationEmail,
    forgotPassword,
    resetPasswordController
}; 