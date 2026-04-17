const express = require('express');
const router = express.Router();
const turfController = require('../controllers/turfController');

router.get('/', turfController.getAllTurfs);
router.get('/:id', turfController.getTurfById);

// Dev only
router.post('/seed', turfController.seedTurfs);

module.exports = router;
