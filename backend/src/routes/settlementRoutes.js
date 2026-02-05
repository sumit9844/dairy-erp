const express = require('express');
const router = express.Router();
const settlementController = require('../controllers/settlementController');

// This matches the call in index.js
router.get('/statement', settlementController.getFarmerStatement);

module.exports = router;