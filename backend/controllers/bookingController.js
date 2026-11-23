const Booking = require('../models/Booking');
const Event = require('../models/Event');

/**
 * Helper to normalize Indian phone number
 */
const normalizePhone = (rawPhone) => {
  if (!rawPhone) return '';
  const digits = String(rawPhone).replace(/\D/g, '');
  if (digits.length === 12 && digits.startsWith('91')) return digits.slice(2);
  if (digits.length === 11 && digits.startsWith('0')) return digits.slice(1);
  return digits;
};

// @desc    Get all bookings
// @route   GET /api/bookings
exports.getBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find().sort({ createdAt: -1 });
    res.json(bookings);
  } catch (error) {
    next(error);
  }
};

// @desc    Get single booking by bookingId or _id
// @route   GET /api/bookings/:id
exports.getBookingById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const booking = await Booking.findOne({
      $or: [{ bookingId: id }, { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }]
    });

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found.' });
    }
    res.json(booking);
  } catch (error) {
    next(error);
  }
};

// @desc    Check booking conflict for venue and date
// @route   POST /api/bookings/check-conflict
exports.checkBookingConflict = async (req, res, next) => {
  try {
    const { venueName, eventDate, excludeBookingId } = req.body;
    if (!venueName || !eventDate) {
      return res.status(400).json({ message: 'Venue name and event date are required.' });
    }

    const query = {
      venueName: new RegExp(`^${venueName.trim()}$`, 'i'),
      eventDate: eventDate.trim(),
      status: { $ne: 'Cancelled' },
    };

    if (excludeBookingId) {
      query.bookingId = { $ne: excludeBookingId };
    }

    const conflictingBooking = await Booking.findOne(query);
    if (conflictingBooking) {
      return res.json({
        conflict: true,
        message: 'This venue is already booked for another event on the selected date. Please select another date or venue.',
      });
    }

    res.json({ conflict: false, message: 'Venue is available.' });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new booking with validation & conflict detection
// @route   POST /api/bookings
exports.createBooking = async (req, res, next) => {
  try {
    const data = req.body;

    // 1. Full name validation
    if (!data.customerName || !data.customerName.trim()) {
      return res.status(400).json({ message: 'Please enter your full name.' });
    }

    // 2. Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!data.customerEmail || !emailRegex.test(data.customerEmail.trim())) {
      return res.status(400).json({ message: 'Please enter a valid email address (e.g. name@example.com).' });
    }

    // 3. Indian Phone number validation (10 digits starting with 6-9)
    const cleanPhone = normalizePhone(data.customerPhone);
    const phoneRegex = /^[6-9]\d{9}$/;
    if (!cleanPhone || !phoneRegex.test(cleanPhone)) {
      return res.status(400).json({ message: 'Invalid phone number! Must be a valid 10-digit mobile number (e.g. 9876543210).' });
    }

    // 4. Date validation
    if (!data.eventDate) {
      return res.status(400).json({ message: 'Event date is required.' });
    }
    const today = new Date().toISOString().split('T')[0];
    if (data.eventDate < today) {
      return res.status(400).json({ message: 'Event date cannot be in the past.' });
    }

    // 5. Conflict Check on Venue + Date
    const venueName = (data.venueName || '').trim();
    if (venueName) {
      const existingBooking = await Booking.findOne({
        venueName: new RegExp(`^${venueName}$`, 'i'),
        eventDate: data.eventDate,
        status: { $ne: 'Cancelled' },
      });

      if (existingBooking) {
        return res.status(409).json({
          conflict: true,
          message: 'This venue is already booked for another event on the selected date. Please select another date or venue.',
        });
      }
    }

    // Generate unique booking reference ID
    const bookingId = data.id || data.bookingId || `EV-${Math.floor(10000 + Math.random() * 90000)}`;

    const newBooking = new Booking({
      bookingId,
      customerName: data.customerName.trim(),
      customerEmail: data.customerEmail.trim().toLowerCase(),
      customerPhone: cleanPhone,
      eventType: data.eventType || 'Celebration',
      venueId: data.venueId || 'v-101',
      venueName: data.venueName || 'Selected Venue',
      eventDate: data.eventDate,
      startTime: data.startTime || '18:00',
      endTime: data.endTime || '23:00',
      guestCount: Number(data.guestCount) || 100,
      decoration: data.decoration || { package: 'Basic', price: 5000 },
      theme: data.theme || 'Minimal',
      food: data.food || { type: 'Vegetarian', items: ['Starters', 'Main Course'], pricePerGuest: 400, totalFoodPrice: 40000 },
      music: data.music || { type: 'No Music', price: 0 },
      entertainment: data.entertainment || { type: 'None', price: 0 },
      photography: data.photography || { package: 'None', price: 0 },
      additionalServices: data.additionalServices || [],
      specialRequirements: data.specialRequirements || '',
      pricing: data.pricing || { totalAmount: 45000 },
      status: data.status || 'Confirmed',
    });

    const saved = await newBooking.save();

    // Also mirror into Event model so it appears in events list
    try {
      await Event.create({
        eventName: `${saved.eventType} - ${saved.customerName}`,
        description: `Reserved event at ${saved.venueName} for ${saved.guestCount} guests.${saved.specialRequirements ? ' Note: ' + saved.specialRequirements : ''}`,
        organizerName: saved.customerName,
        email: saved.customerEmail,
        phoneNumber: saved.customerPhone,
        eventDate: saved.eventDate,
        startTime: saved.startTime,
        endTime: saved.endTime,
        venue: saved.venueName,
        category: saved.eventType,
        guestCount: saved.guestCount,
        status: saved.status === 'Cancelled' ? 'Cancelled' : 'Confirmed',
      });
    } catch (mirrorErr) {
      // If event duplicate happens or fails, booking is still saved
      console.log('Notice: Event mirror sync notice:', mirrorErr.message);
    }

    res.status(201).json(saved);
  } catch (error) {
    next(error);
  }
};

// @desc    Update booking status
// @route   PATCH /api/bookings/:id/status
exports.updateBookingStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!['Pending', 'Confirmed', 'Completed', 'Cancelled'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status value. Allowed: Pending, Confirmed, Completed, Cancelled' });
    }

    const booking = await Booking.findOneAndUpdate(
      { $or: [{ bookingId: req.params.id }, { _id: req.params.id.match(/^[0-9a-fA-F]{24}$/) ? req.params.id : null }] },
      { status },
      { new: true }
    );

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found.' });
    }

    res.json(booking);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete / Cancel a booking
// @route   DELETE /api/bookings/:id
exports.deleteBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findOneAndDelete({
      $or: [{ bookingId: req.params.id }, { _id: req.params.id.match(/^[0-9a-fA-F]{24}$/) ? req.params.id : null }]
    });

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found.' });
    }

    res.json({ message: 'Booking removed successfully.', id: req.params.id });
  } catch (error) {
    next(error);
  }
};
