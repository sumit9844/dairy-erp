const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');

router.get('/', productController.getProducts);
router.post('/', productController.addProduct);
router.post('/add-stock', productController.addStock); // <--- New
router.get('/history', productController.getStockHistory); // <--- New

module.exports = router;