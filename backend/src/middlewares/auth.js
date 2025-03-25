const jwt = require("jsonwebtoken")
require('dotenv').config();
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

// Middleware xác thực JWT
const authenticateToken = async (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];

        if (!token) {
            return res.status(401).json({
                status: 'error',
                message: 'Không tìm thấy token xác thực'
            });
        }

        const decoded = jwt.verify(token, JWT_SECRET);
        
        // Kiểm tra user có tồn tại và active không
        const user = await User.findByPk(decoded.id);
        if (!user || !user.is_active) {
            return res.status(401).json({
                status: 'error',
                message: 'Người dùng không tồn tại hoặc đã bị khóa'
            });
        }

        req.user = user;
        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                status: 'error',
                message: 'Token đã hết hạn'
            });
        }
        return res.status(403).json({
            status: 'error',
            message: 'Token không hợp lệ'
        });
    }
};

// Middleware kiểm tra role
const checkRole = (roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                status: 'error',
                message: 'Bạn không có quyền thực hiện hành động này'
            });
        }
        next();
    };
};

// Tạo token mới
const generateToken = (user) => {
    return jwt.sign(
        { 
            id: user.id,
            email: user.email,
            role: user.role
        },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
    );
};

module.exports = {
    authenticateToken,
    checkRole,
    generateToken,
    JWT_SECRET,
    JWT_EXPIRES_IN
};
