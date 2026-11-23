const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventController');

// Check conflict before booking
router.post('/check-conflict', eventController.checkConflict);

// Event CRUD
router.get('/', eventController.getEvents);
router.get('/:id', eventController.getEventById);
router.post('/', eventController.createEvent);
router.put('/:id', eventController.updateEvent);
router.delete('/:id', eventController.deleteEvent);

module.exports = router;
