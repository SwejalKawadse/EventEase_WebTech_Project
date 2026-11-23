const Venue = require('../models/Venue');

const DEFAULT_VENUES = [
  {
    id: "v-101",
    name: "The Grand Courtyard",
    location: "Koregaon Park, Pune",
    description: "An elegant open-air architectural courtyard featuring stone archways, manicured gardens, and candlelit banquet setups.",
    capacity: 250,
    startingPrice: 35000,
    type: "Courtyard & Lawn",
    facilities: ["Parking", "Air Conditioning", "Catering Kitchen", "Sound System", "Decoration Setup", "Power Backup"],
    eventTypes: ["Wedding", "Birthday", "Party", "Corporate"],
    image: "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=1000&q=80",
    rating: 4.9
  },
  {
    id: "v-102",
    name: "The Villa Florentine",
    location: "Bandra West, Mumbai",
    description: "A luxury heritage Mediterranean villa with terracotta tiled terraces, ocean views, and bespoke dining pavilions.",
    capacity: 320,
    startingPrice: 65000,
    type: "Heritage Villa",
    facilities: ["Valet Parking", "Air Conditioning", "In-house Chef", "Live Stage", "Power Backup", "Wi-Fi", "Private Suites"],
    eventTypes: ["Wedding", "Corporate", "Party"],
    image: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1000&q=80",
    rating: 4.8
  },
  {
    id: "v-103",
    name: "Emerald Palms Lawn",
    location: "Calangute Beachfront, Goa",
    description: "Tropical beachfront palm lawn perfect for breezy sunset receptions, cocktail parties, and vibrant celebrations.",
    capacity: 500,
    startingPrice: 45000,
    type: "Beachfront Lawn",
    facilities: ["Beach Access", "Bar Setup", "Sound System", "Special Lighting", "Power Backup", "Parking"],
    eventTypes: ["Party", "Wedding", "Graduation", "Birthday"],
    image: "https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=1000&q=80",
    rating: 4.7
  },
  {
    id: "v-104",
    name: "Skyline Glasshouse Pavilion",
    location: "Indiranagar, Bangalore",
    description: "Contemporary glass-enclosed rooftop venue with panoramic city skyline views, warm ambient lighting, and acoustic acoustics.",
    capacity: 150,
    startingPrice: 28000,
    type: "Rooftop Glasshouse",
    facilities: ["Air Conditioning", "DJ Console", "Catering Kitchen", "Wi-Fi", "Elevator Access", "Power Backup"],
    eventTypes: ["Corporate", "Birthday", "Graduation", "Party", "Other"],
    image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1000&q=80",
    rating: 4.9
  },
  {
    id: "v-105",
    name: "Heritage Manor & Royal Ballroom",
    location: "Civil Lines, Jaipur",
    description: "A regal Rajasthani palace ballroom featuring crystal chandeliers, carved pillars, and grand banquet seating.",
    capacity: 800,
    startingPrice: 120000,
    type: "Palace Ballroom",
    facilities: ["Grand Stage", "Valet Parking", "Air Conditioning", "Royal Catering", "Green Rooms", "Power Backup", "Security"],
    eventTypes: ["Wedding", "Corporate", "Party"],
    image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1000&q=80",
    rating: 4.9
  },
  {
    id: "v-106",
    name: "Crystal Lake Banquet",
    location: "Vasant Kunj, New Delhi",
    description: "Lakeside indoor-outdoor banquet facility with floor-to-ceiling glass windows and lush gardens.",
    capacity: 350,
    startingPrice: 50000,
    type: "Banquet & Garden",
    facilities: ["Parking", "Air Conditioning", "Catering Service", "Decoration Setup", "Sound System", "Restrooms"],
    eventTypes: ["Birthday", "Wedding", "Graduation", "Corporate", "Party"],
    image: "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&w=1000&q=80",
    rating: 4.6
  }
];

// @desc    Get all venues
// @route   GET /api/venues
exports.getVenues = async (req, res, next) => {
  try {
    let venues = await Venue.find().sort({ createdAt: -1 });
    if (venues.length === 0) {
      venues = await Venue.insertMany(DEFAULT_VENUES);
    }
    res.json(venues);
  } catch (error) {
    next(error);
  }
};

// @desc    Get single venue by ID
// @route   GET /api/venues/:id
exports.getVenueById = async (req, res, next) => {
  try {
    const venue = await Venue.findOne({ id: req.params.id });
    if (!venue) {
      return res.status(404).json({ message: 'Venue not found.' });
    }
    res.json(venue);
  } catch (error) {
    next(error);
  }
};

// @desc    Create new venue
// @route   POST /api/venues
exports.createVenue = async (req, res, next) => {
  try {
    const data = req.body;
    if (!data.name || !data.location) {
      return res.status(400).json({ message: 'Venue name and location are required.' });
    }

    const newVenue = new Venue({
      id: data.id || `v-${Date.now().toString().slice(-4)}`,
      name: data.name.trim(),
      location: data.location.trim(),
      description: data.description || 'Premium event venue with bespoke facilities.',
      capacity: Number(data.capacity) || 250,
      startingPrice: Number(data.startingPrice) || 35000,
      type: data.type || 'Event Venue',
      facilities: Array.isArray(data.facilities) ? data.facilities : ['Parking', 'Air Conditioning', 'Power Backup'],
      eventTypes: Array.isArray(data.eventTypes) ? data.eventTypes : ['Wedding', 'Birthday', 'Party', 'Corporate'],
      image: data.image || DEFAULT_VENUES[0].image,
      rating: Number(data.rating) || 4.8,
    });

    const saved = await newVenue.save();
    res.status(201).json(saved);
  } catch (error) {
    next(error);
  }
};

// @desc    Update venue
// @route   PUT /api/venues/:id
exports.updateVenue = async (req, res, next) => {
  try {
    const venue = await Venue.findOneAndUpdate(
      { id: req.params.id },
      { $set: req.body },
      { new: true, runValidators: true }
    );
    if (!venue) {
      return res.status(404).json({ message: 'Venue not found.' });
    }
    res.json(venue);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete venue
// @route   DELETE /api/venues/:id
exports.deleteVenue = async (req, res, next) => {
  try {
    const deleted = await Venue.findOneAndDelete({ id: req.params.id });
    if (!deleted) {
      return res.status(404).json({ message: 'Venue not found.' });
    }
    res.json({ message: 'Venue deleted successfully.' });
  } catch (error) {
    next(error);
  }
};
