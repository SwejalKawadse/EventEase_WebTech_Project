const mongoose = require('mongoose');

// Schema for Event Venues
const venueSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true,
  },
  name: {
    type: String,
    required: [true, 'Venue name is required'],
    trim: true,
  },
  location: {
    type: String,
    required: [true, 'Venue location is required'],
    trim: true,
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
  },
  capacity: {
    type: Number,
    required: [true, 'Capacity is required'],
    min: [1, 'Capacity must be at least 1'],
  },
  startingPrice: {
    type: Number,
    required: [true, 'Starting price is required'],
    min: [0, 'Starting price cannot be negative'],
  },
  type: {
    type: String,
    required: true,
  },
  facilities: {
    type: [String],
    default: [],
  },
  eventTypes: {
    type: [String],
    default: [],
  },
  image: {
    type: String,
    required: true,
  },
  rating: {
    type: Number,
    default: 4.5,
    min: 1,
    max: 5,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Venue', venueSchema);
