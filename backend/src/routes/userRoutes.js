const express = require('express');
const router = express.Router();
const { getUsers, getUserById } = require('../controllers/userController');

// Lấy danh sách người dùng
router.get('/', getUsers);


module.exports = router; 