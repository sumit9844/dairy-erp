const express = require('express');
const router = express.Router();
const collectionController = require('../controllers/collectionController');

router.post('/', collectionController.addCollection);
router.get('/', collectionController.getCollectionsByDate); // Updated
router.put('/:id', collectionController.updateCollection); // New: Edit

module.exports = router;