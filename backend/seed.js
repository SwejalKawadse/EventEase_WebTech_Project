const dns = require("node:dns");

dns.setServers(["8.8.8.8", "1.1.1.1"]);

const mongoose = require('mongoose');
require('dotenv').config();
const Event = require('./models/Event');
const Venue = require('./models/Venue');
const Booking = require('./models/Booking');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/eventease';

const sampleVenues = [
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

const sampleBookings = [
  {
    bookingId: "EV-10294",
    customerName: "Rahul Sharma",
    customerEmail: "rahul.sharma@example.com",
    customerPhone: "9876543210",
    eventType: "Wedding",
    venueId: "v-101",
    venueName: "The Grand Courtyard",
    eventDate: "2026-12-15",
    startTime: "17:00",
    endTime: "23:00",
    guestCount: 200,
    decoration: { package: "Grand Royal Theme", price: 65000 },
    theme: "Royal Regal",
    food: { type: "Royal Gourmet", items: ["Welcome Drinks", "Appetizers", "Royal Buffet", "Desserts"], pricePerGuest: 1200, totalFoodPrice: 240000 },
    music: { type: "Live Band & DJ", price: 25000 },
    entertainment: { type: "Master of Ceremonies", price: 10000 },
    photography: { package: "Drone & Cinematic Video", price: 30000 },
    additionalServices: ["Valet Parking Assist", "Bridal Suite Access"],
    specialRequirements: "Floral stage backdrop and red carpet entrance",
    pricing: {
      venueBase: 35000,
      decoration: 65000,
      food: 240000,
      music: 25000,
      entertainment: 10000,
      photography: 30000,
      additionalServices: 10000,
      totalAmount: 415000
    },
    status: "Confirmed"
  },
  {
    bookingId: "EV-28491",
    customerName: "Priya Desai",
    customerEmail: "priya.desai@example.com",
    customerPhone: "9123456789",
    eventType: "Birthday",
    venueId: "v-104",
    venueName: "Skyline Glasshouse Pavilion",
    eventDate: "2026-11-30",
    startTime: "19:00",
    endTime: "23:30",
    guestCount: 80,
    decoration: { package: "Minimalist Modern", price: 15000 },
    theme: "Neon Glow",
    food: { type: "Deluxe Multi-Cuisine", items: ["Mocktails", "Starters", "Main Course"], pricePerGuest: 750, totalFoodPrice: 60000 },
    music: { type: "DJ Console & Party Sound", price: 12000 },
    entertainment: { type: "None", price: 0 },
    photography: { package: "Standard Photography", price: 12000 },
    additionalServices: ["Photo Booth"],
    specialRequirements: "Birthday cake pedestal with spotlighting",
    pricing: {
      venueBase: 28000,
      decoration: 15000,
      food: 60000,
      music: 12000,
      entertainment: 0,
      photography: 12000,
      additionalServices: 5000,
      totalAmount: 132000
    },
    status: "Pending"
  }
];

const sampleEvents = [
  {
    eventName: "Annual Tech Fest 2026",
    description: "A flagship inter-college technology symposium with coding hackathons, robotics arenas, paper presentations, and tech talks from industry leaders.",
    organizerName: "Prof. Abhay Patil",
    email: "abhay.tech@example.com",
    phoneNumber: "9876543210",
    eventDate: "2026-12-20",
    startTime: "09:00",
    endTime: "18:00",
    venue: "Main Auditorium Hall A",
    category: "Corporate",
    guestCount: 300,
    status: "Upcoming",
    image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1000&q=80",
  },
  {
    eventName: "Cultural Fest - Tarang 2026",
    description: "Three-day extravaganza of live music, classical & western dance competitions, stage drama, and street food stalls celebrating student creativity.",
    organizerName: "Ananya Deshmukh",
    email: "ananya.cultural@example.com",
    phoneNumber: "9823456789",
    eventDate: "2026-12-28",
    startTime: "16:00",
    endTime: "22:00",
    venue: "Open Air Amphitheatre",
    category: "Party",
    guestCount: 500,
    status: "Upcoming",
    image: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1000&q=80",
  },
  {
    eventName: "Sharma & Kapoor Grand Wedding Reception",
    description: "Elegant open-air courtyard reception with bespoke Mediterranean dining pavilions, acoustic jazz band, and fairytale floral decorations.",
    organizerName: "Rahul Sharma",
    email: "rahul.sharma@example.com",
    phoneNumber: "9876543210",
    eventDate: "2026-12-15",
    startTime: "18:00",
    endTime: "23:30",
    venue: "The Grand Courtyard",
    category: "Wedding",
    guestCount: 250,
    status: "Confirmed",
    image: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1000&q=80",
  }
];

async function seedDatabase() {
  try {
    console.log(`Connecting to MongoDB at: ${MONGO_URI}`);
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB.');

    // Clear and seed Venues
    await Venue.deleteMany({});
    await Venue.insertMany(sampleVenues);
    console.log('🏢 Sample Venues inserted successfully!');

    // Clear and seed Bookings
    await Booking.deleteMany({});
    await Booking.insertMany(sampleBookings);
    console.log('📅 Sample Bookings inserted successfully!');

    // Clear and seed Events
    await Event.deleteMany({});
    await Event.insertMany(sampleEvents);
    console.log('🎉 Sample Events inserted successfully!');

    console.log('====================================================');
    console.log('✨ EventEase database seeded successfully!');
    console.log('====================================================');
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error.message);
    process.exit(1);
  }
}

seedDatabase();
