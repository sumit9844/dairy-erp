const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');

// Define Routes
router.get('/', productController.getProducts);
router.post('/', productController.addProduct);
router.post('/add-stock', productController.addStock);    // <--- This line was crashing
router.get('/history', productController.getStockHistory);

module.exports = router;