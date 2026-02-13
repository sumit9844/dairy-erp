const express = require('express');
const router = express.Router();
const farmerController = require('../controllers/farmerController');

// Routes
router.post('/', farmerController.createFarmer);     // POST /api/farmers
router.get('/', farmerController.getAllFarmers);    // GET /api/farmers
router.put('/:id', farmerController.updateFarmer);
// NEW ROUTES
router.patch('/:id/status', farmerController.toggleFarmerStatus); // For Deactivate
router.delete('/:id', farmerController.deleteFarmer);             // For Delete

module.exports = router;