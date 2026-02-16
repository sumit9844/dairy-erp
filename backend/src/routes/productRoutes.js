const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');

router.get('/', productController.getProducts);
router.post('/', productController.addProduct);
router.put('/:id', productController.updateProduct);
router.delete('/:id', productController.deleteProduct);

// Stock Routes
router.post('/add-stock', productController.addStock);
router.get('/history', productController.getStockHistory);

module.exports = router;