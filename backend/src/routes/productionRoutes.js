const express = require('express');
const router = express.Router();
const productionController = require('../controllers/productionController');

// This handles: GET https://dairy-erp-backend.onrender.com/api/production
router.get('/', productionController.getProductionHistory);

// This handles: POST https://dairy-erp-backend.onrender.com/api/production
router.post('/', productionController.addProduction);

module.exports = router;