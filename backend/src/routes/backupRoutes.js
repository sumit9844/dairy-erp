const express = require('express');
const router = express.Router();
const backupController = require('../controllers/backupController');

router.get('/json', backupController.downloadJSON);
router.get('/csv', backupController.downloadCSV);

module.exports = router;