const express = require('express');
const router = express.Router();
const backupController = require('../controllers/backupController');

router.get('/', backupController.downloadBackup);
router.get('/csv', backupController.downloadCSV);

module.exports = router;