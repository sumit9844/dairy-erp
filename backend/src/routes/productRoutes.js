const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');

// URL will be: GET /api/products
router.get('/', productController.getProducts);

// URL will be: POST /api/products
router.post('/', productController.addProduct);

module.exports = router;