const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// If index.js uses '/api/auth', this line creates '/api/auth/login'
router.post('/login', authController.login);
router.post('/register', authController.register);

module.exports = router;