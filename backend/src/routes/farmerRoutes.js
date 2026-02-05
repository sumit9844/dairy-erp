const express = require('express');
const router = express.Router();
const farmerController = require('../controllers/farmerController');

// Routes
router.post('/', farmerController.createFarmer);     // POST /api/farmers
router.get('/', farmerController.getAllFarmers);    // GET /api/farmers

module.exports = router;