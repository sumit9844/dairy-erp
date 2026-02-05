const express = require('express');
const router = express.Router();
const collectionController = require('../controllers/collectionController');

// Ensure these function names (addCollection, getRecentCollections) 
// match exactly what is in the controller file above.
router.post('/', collectionController.addCollection);
router.get('/', collectionController.getRecentCollections);

module.exports = router;