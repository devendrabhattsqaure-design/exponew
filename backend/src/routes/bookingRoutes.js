const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');

router.get('/', bookingController.getAllBookings);
router.post('/', bookingController.createBooking);
router.post('/:bookingId/cancel', bookingController.cancelBooking);
router.post('/:bookingId/request-cancellation', bookingController.requestCancellation);
router.get('/user/:userId', bookingController.getUserBookings);

module.exports = router;
