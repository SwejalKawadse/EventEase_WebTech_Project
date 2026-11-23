const mongoose = require('mongoose');

/**
 * Booking Schema for EventEase Platform
 * Represents user bookings for custom events and venue packages.
 */
const bookingSchema = new mongoose.Schema(
  {
    bookingId: {
      type: String,
      required: true,
      unique: true,
    },
    customerName: {
      type: String,
      required: [true, 'Customer name is required'],
      trim: true,
    },
    customerEmail: {
      type: String,
      required: [true, 'Customer email is required'],
      trim: true,
      lowercase: true,
      match: [
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        'Please enter a valid email address (e.g. name@example.com)',
      ],
    },
    customerPhone: {
      type: String,
      required: [true, 'Customer phone number is required'],
      trim: true,
      match: [
        /^[6-9]\d{9}$/,
        'Phone number must be a valid 10-digit Indian mobile number',
      ],
    },
    eventType: {
      type: String,
      required: [true, 'Event type is required'],
      trim: true,
    },
    venueId: {
      type: String,
      required: [true, 'Venue ID is required'],
    },
    venueName: {
      type: String,
      required: [true, 'Venue name is required'],
    },
    eventDate: {
      type: String, // Normalized YYYY-MM-DD
      required: [true, 'Event date is required'],
    },
    startTime: {
      type: String,
      default: '18:00',
    },
    endTime: {
      type: String,
      default: '23:00',
    },
    guestCount: {
      type: Number,
      required: [true, 'Guest count is required'],
      min: [1, 'Guest count must be at least 1'],
    },
    decoration: {
      package: { type: String, default: 'Basic' },
      price: { type: Number, default: 0 },
    },
    theme: {
      type: String,
      default: 'Minimal',
    },
    food: {
      type: { type: String, default: 'Vegetarian' },
      items: [String],
      pricePerGuest: { type: Number, default: 400 },
      totalFoodPrice: { type: Number, default: 0 },
    },
    music: {
      type: { type: String, default: 'No Music' },
      price: { type: Number, default: 0 },
    },
    entertainment: {
      type: { type: String, default: 'None' },
      price: { type: Number, default: 0 },
    },
    photography: {
      package: { type: String, default: 'None' },
      price: { type: Number, default: 0 },
    },
    additionalServices: {
      type: mongoose.Schema.Types.Mixed,
      default: [],
    },
    specialRequirements: {
      type: String,
      default: '',
      trim: true,
    },
    pricing: {
      venueBase: { type: Number, default: 0 },
      decoration: { type: Number, default: 0 },
      food: { type: Number, default: 0 },
      music: { type: Number, default: 0 },
      entertainment: { type: Number, default: 0 },
      photography: { type: Number, default: 0 },
      additionalServices: { type: Number, default: 0 },
      totalAmount: { type: Number, required: true },
    },
    status: {
      type: String,
      enum: ['Pending', 'Confirmed', 'Completed', 'Cancelled'],
      default: 'Confirmed',
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual property for 'id' matching 'bookingId'
bookingSchema.virtual('id').get(function () {
  return this.bookingId;
});

module.exports = mongoose.model('Booking', bookingSchema);
