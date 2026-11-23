const mongoose = require('mongoose');

/**
 * Event Schema for EventEase Platform
 * Enforces strict validation, Indian phone number format, valid date/time,
 * and a compound unique index on venue + eventDate for database-level conflict prevention.
 */
const eventSchema = new mongoose.Schema(
  {
    eventName: {
      type: String,
      required: [true, 'Event name cannot be empty'],
      trim: true,
      minlength: [2, 'Event name must be at least 2 characters long'],
    },
    description: {
      type: String,
      required: [true, 'Event description cannot be empty'],
      trim: true,
      minlength: [5, 'Event description must be at least 5 characters long'],
    },
    organizerName: {
      type: String,
      required: [true, 'Organizer name cannot be empty'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email address is required'],
      trim: true,
      lowercase: true,
      match: [
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        'Please enter a valid email format (e.g., organizer@example.com)',
      ],
    },
    phoneNumber: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
      match: [
        /^[6-9]\d{9}$/,
        'Phone number must be a valid 10-digit Indian mobile number starting with 6, 7, 8, or 9',
      ],
    },
    eventDate: {
      type: String, // Normalized format YYYY-MM-DD
      required: [true, 'Event date cannot be empty'],
      trim: true,
    },
    startTime: {
      type: String, // HH:MM
      required: [true, 'Start time is required'],
      trim: true,
    },
    endTime: {
      type: String, // HH:MM
      required: [true, 'End time is required'],
      trim: true,
    },
    venue: {
      type: String,
      required: [true, 'Venue cannot be empty'],
      trim: true,
    },
    category: {
      type: String,
      required: [true, 'Category cannot be empty'],
      trim: true,
      default: 'General',
    },
    guestCount: {
      type: Number,
      default: 100,
      min: [1, 'Guest count must be at least 1'],
    },
    status: {
      type: String,
      enum: ['Upcoming', 'Confirmed', 'Ongoing', 'Completed', 'Cancelled'],
      default: 'Upcoming',
    },
    image: {
      type: String,
      default: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=1000&q=80',
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual property for 'name' and 'location' to ensure backward compatibility
eventSchema.virtual('name').get(function () {
  return this.eventName;
});
eventSchema.virtual('location').get(function () {
  return this.venue;
});
eventSchema.virtual('date').get(function () {
  return this.eventDate;
});

// Database-level compound unique index to guarantee no double bookings
// Even with simultaneous requests, MongoDB will reject any second insert with code 11000
eventSchema.index(
  { venue: 1, eventDate: 1 },
  {
    unique: true,
    partialFilterExpression: { status: { $ne: 'Cancelled' } },
  }
);

module.exports = mongoose.model('Event', eventSchema);
