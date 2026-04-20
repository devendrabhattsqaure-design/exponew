const express = require('express');
const router = express.Router();
const turfController = require('../controllers/turfController');

router.get('/', turfController.getAllTurfs);
router.post('/', turfController.createTurf);
router.get('/:id', turfController.getTurfById);
router.get('/:id/slots', turfController.getTurfSlots);
router.post('/:id/slots', turfController.createTurfSlot);
router.put('/slots/:slotId', turfController.updateTurfSlot);
router.delete('/slots/:slotId', turfController.deleteTurfSlot);

// Dev only
router.post('/seed', turfController.seedTurfs);

module.exports = router;
