const express = require('express');
const router = express.Router();
const { getUsers, getUserById } = require('../controllers/auctionController');