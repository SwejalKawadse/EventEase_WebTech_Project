const mongoose = require('mongoose');
const Event = require('../models/Event');

/**
 * Helper to normalize Indian phone numbers to 10 digits
 */
const normalizeIndianPhone = (rawPhone) => {
  if (!rawPhone) return '';
  const digits = String(rawPhone).replace(/\D/g, '');
  if (digits.length === 12 && digits.startsWith('91')) return digits.slice(2);
  if (digits.length === 11 && digits.startsWith('0')) return digits.slice(1);
  return digits;
};

/**
 * Validate incoming event payload strictly on the backend
 */
const validateEventInput = (data) => {
  const errors = [];

  // 1. Event Name validation
  const eventName = (data.eventName || data.name || '').trim();
  if (!eventName) {
    errors.push('Event name cannot be empty or contain only spaces.');
  } else if (eventName.length < 2) {
    errors.push('Event name must be at least 2 characters long.');
  }

  // 2. Description validation
  const description = (data.description || '').trim();
  if (!description) {
    errors.push('Event description cannot be empty or contain only spaces.');
  }

  // 3. Organizer Name validation
  const organizerName = (data.organizerName || data.organizer || 'Event Organizer').trim();
  if (!organizerName) {
    errors.push('Organizer name cannot be empty.');
  }

  // 4. Email validation
  const email = (data.email || '').trim().toLowerCase();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email) {
    errors.push('Email address is required.');
  } else if (!emailRegex.test(email)) {
    errors.push('Please enter a valid email format (e.g. organizer@example.com).');
  }

  // 5. Phone number validation (Indian mobile number 10 digits starting with 6-9)
  const rawPhone = String(data.phoneNumber || data.phone || '').trim();
  const phone = normalizeIndianPhone(rawPhone);
  const phoneRegex = /^[6-9]\d{9}$/;
  if (!rawPhone) {
    errors.push('Phone number is required.');
  } else if (!phoneRegex.test(phone)) {
    errors.push('Phone number must be a valid 10-digit Indian mobile number (starts with 6, 7, 8, or 9).');
  }

  // 6. Venue validation
  const venue = (data.venue || data.location || '').trim();
  if (!venue) {
    errors.push('Venue cannot be empty.');
  }

  // 7. Event Date validation (cannot be in the past)
  const eventDate = (data.eventDate || data.date || '').toString().slice(0, 10).trim();
  if (!eventDate) {
    errors.push('Event date is required.');
  } else {
    const today = new Date().toISOString().split('T')[0];
    if (eventDate < today) {
      errors.push('Event date cannot be in the past. Please choose today or a future date.');
    }
  }

  // 8. Time validation (End time must be later than start time)
  const startTime = (data.startTime || '10:00').trim();
  const endTime = (data.endTime || '18:00').trim();
  if (!startTime || !endTime) {
    errors.push('Both start time and end time are required.');
  } else if (endTime <= startTime) {
    errors.push('End time must be later than start time.');
  }

  return {
    isValid: errors.length === 0,
    errors,
    cleanData: {
      eventName,
      description,
      organizerName,
      email,
      phoneNumber: phone,
      venue,
      eventDate,
      startTime,
      endTime,
      category: (data.category || 'General').trim(),
      guestCount: Number(data.guestCount) || 100,
      status: data.status || 'Upcoming',
      image: data.image || 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=1000&q=80',
    },
  };
};

/**
 * Check if a venue is already booked on a selected date
 * Excludes the given eventId (for editing scenarios)
 */
const checkSchedulingConflict = async (venue, eventDate, excludeId = null) => {
  const query = {
    venue: new RegExp(`^${venue.trim()}$`, 'i'), // case-insensitive venue comparison
    eventDate: eventDate.trim(),
    status: { $ne: 'Cancelled' },
  };

  if (excludeId && mongoose.Types.ObjectId.isValid(excludeId)) {
    query._id = { $ne: excludeId };
  }

  const conflictingEvent = await Event.findOne(query);
  return conflictingEvent;
};

// @desc    Get all events (with optional search, category, date filters)
// @route   GET /api/events
exports.getEvents = async (req, res, next) => {
  try {
    const { search, category, date, venue } = req.query;
    const filter = {};

    if (category && category !== 'All') {
      filter.category = new RegExp(`^${category.trim()}$`, 'i');
    }

    if (date) {
      filter.eventDate = date;
    }

    if (venue) {
      filter.venue = new RegExp(venue.trim(), 'i');
    }

    if (search) {
      const searchRegex = new RegExp(search.trim(), 'i');
      filter.$or = [
        { eventName: searchRegex },
        { description: searchRegex },
        { venue: searchRegex },
        { category: searchRegex },
        { organizerName: searchRegex },
      ];
    }

    const events = await Event.find(filter).sort({ eventDate: 1, startTime: 1 });
    res.json(events);
  } catch (error) {
    next(error);
  }
};

// @desc    Get single event by ID
// @route   GET /api/events/:id
exports.getEventById = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid event ID format.' });
    }

    const event = await Event.findById(id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found.' });
    }
    res.json(event);
  } catch (error) {
    next(error);
  }
};

// @desc    Real-time check for venue + date conflict
// @route   POST /api/events/check-conflict
exports.checkConflict = async (req, res, next) => {
  try {
    const { venue, eventDate, excludeId } = req.body;
    if (!venue || !eventDate) {
      return res.status(400).json({ message: 'Venue and event date are required for conflict checking.' });
    }

    const conflict = await checkSchedulingConflict(venue, eventDate, excludeId);
    if (conflict) {
      return res.json({
        conflict: true,
        message: 'This venue is already booked for another event on the selected date. Please select another date or venue.',
        existingEvent: {
          id: conflict._id,
          eventName: conflict.eventName,
          venue: conflict.venue,
          eventDate: conflict.eventDate,
        },
      });
    }

    res.json({
      conflict: false,
      message: 'Venue is available on the selected date.',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new event with validation & conflict detection
// @route   POST /api/events
exports.createEvent = async (req, res, next) => {
  try {
    const { isValid, errors, cleanData } = validateEventInput(req.body);
    if (!isValid) {
      return res.status(400).json({ message: errors[0], errors });
    }

    // Check for scheduling conflict at the same venue on the same date
    const conflict = await checkSchedulingConflict(cleanData.venue, cleanData.eventDate);
    if (conflict) {
      return res.status(409).json({
        message: 'This venue is already booked for another event on the selected date. Please select another date or venue.',
        conflict: true,
        conflictingEvent: conflict.eventName,
      });
    }

    const newEvent = new Event(cleanData);
    const savedEvent = await newEvent.save();
    res.status(201).json(savedEvent);
  } catch (error) {
    // If concurrent requests bypassed the check, MongoDB compound index catches it:
    if (error.code === 11000) {
      return res.status(409).json({
        message: 'This venue is already booked for another event on the selected date. Please select another date or venue.',
        conflict: true,
      });
    }
    next(error);
  }
};

// @desc    Update an existing event with validation & self-excluding conflict check
// @route   PUT /api/events/:id
exports.updateEvent = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid event ID format.' });
    }

    const existingEvent = await Event.findById(id);
    if (!existingEvent) {
      return res.status(404).json({ message: 'Event not found.' });
    }

    const { isValid, errors, cleanData } = validateEventInput(req.body);
    if (!isValid) {
      return res.status(400).json({ message: errors[0], errors });
    }

    // Exclude this event's own ID from conflict checking so updating other fields doesn't trigger false conflict
    const conflict = await checkSchedulingConflict(cleanData.venue, cleanData.eventDate, id);
    if (conflict) {
      return res.status(409).json({
        message: 'This venue is already booked for another event on the selected date. Please select another date or venue.',
        conflict: true,
        conflictingEvent: conflict.eventName,
      });
    }

    Object.assign(existingEvent, cleanData);
    const updatedEvent = await existingEvent.save();
    res.json(updatedEvent);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        message: 'This venue is already booked for another event on the selected date. Please select another date or venue.',
        conflict: true,
      });
    }
    next(error);
  }
};

// @desc    Delete an event by ID
// @route   DELETE /api/events/:id
exports.deleteEvent = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid event ID format.' });
    }

    const deletedEvent = await Event.findByIdAndDelete(id);
    if (!deletedEvent) {
      return res.status(404).json({ message: 'Event not found.' });
    }

    res.json({ message: 'Event deleted successfully.', id });
  } catch (error) {
    next(error);
  }
};
