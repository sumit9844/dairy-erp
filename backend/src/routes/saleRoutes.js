const express = require('express');
const router = express.Router();
const saleController = require('../controllers/saleController');

// This line handles: POST http://localhost:5000/api/sales/
router.post('/', saleController.addSale);

// This line handles: GET http://localhost:5000/api/sales/
router.get('/', saleController.getAllSales); 

module.exports = router;