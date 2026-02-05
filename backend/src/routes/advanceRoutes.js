const express = require('express');
const router = express.Router();
const advanceController = require('../controllers/advanceController');

router.post('/', advanceController.addAdvance);
router.get('/:farmerId', advanceController.getFarmerAdvances);

module.exports = router;