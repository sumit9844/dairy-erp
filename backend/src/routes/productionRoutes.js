const express = require('express');
const router = express.Router();
const productionController = require('../controllers/productionController');

// This handles: GET http://localhost:5000/api/production
router.get('/', productionController.getProductionHistory);

// This handles: POST http://localhost:5000/api/production
router.post('/', productionController.addProduction);

module.exports = router;