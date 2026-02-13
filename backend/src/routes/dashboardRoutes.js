const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');

// Main Dashboard Stats
router.get('/stats', dashboardController.getStats);

// Financial Ledger (Credit/Debit)
router.get('/ledger', dashboardController.getLedger);

// Analytics Reports (Daily/Monthly)
router.get('/reports', dashboardController.getDetailedReports);

module.exports = router;