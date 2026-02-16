const express = require('express');
const router = express.Router();
const saleController = require('../controllers/saleController');

// This line handles: POST https://dairy-erp-backend.onrender.com/api/sales/
router.post('/', saleController.addSale);

// This line handles: GET https://dairy-erp-backend.onrender.com/api/sales/
router.get('/', saleController.getAllSales); 
router.delete('/:id', saleController.deleteSale);

module.exports = router;