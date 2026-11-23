const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');

// Check booking conflict
router.post('/check-conflict', bookingController.checkBookingConflict);

// Booking CRUD & Status
router.get('/', bookingController.getBookings);
router.get('/:id', bookingController.getBookingById);
router.post('/', bookingController.createBooking);
router.patch('/:id/status', bookingController.updateBookingStatus);
router.delete('/:id', bookingController.deleteBooking);

module.exports = router;
