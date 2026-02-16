const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');

// Standard Routes
router.get('/', productController.getProducts);
router.post('/', productController.addProduct);

// New Inventory Routes
router.post('/add-stock', productController.addStock);
router.get('/history', productController.getStockHistory);

module.exports = router;