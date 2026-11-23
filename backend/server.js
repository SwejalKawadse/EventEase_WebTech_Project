const dns = require("node:dns");

dns.setServers(["8.8.8.8", "1.1.1.1"]);

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = require('./config/db');
const eventRoutes = require('./routes/eventRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const venueRoutes = require('./routes/venueRoutes');
const errorHandler = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

// Core Middleware
// app.use(cors({
//   origin: ['http://localhost:5173', 'http://127.0.0.1:5173', 'http://localhost:3000'],
//   credentials: true,
// }));
// app.use(express.json());

// Core Middleware
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'http://localhost:3000',
    'https://event-ease-web-tech-project.vercel.app'
  ],
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

app.use(express.json());

// Request Logger for Viva & Debugging demonstration
app.use((req, res, next) => {
  console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.originalUrl}`);
  next();
});

// Database Connection Guard Middleware
// Ensures meaningful response if MongoDB is offline instead of unhandled hanging
app.use((req, res, next) => {
  if (req.path.startsWith('/api') && mongoose.connection.readyState !== 1) {
    return res.status(503).json({
      success: false,
      message: 'MongoDB is currently disconnected. Please check your MONGO_URI in .env or start MongoDB service.',
      status: 'DATABASE_DISCONNECTED'
    });
  }
  next();
});

// Mount REST API Routes
app.use('/api/events', eventRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/venues', venueRoutes);

// Health check / API status route
app.get('/api/health', (req, res) => {
  const isConnected = mongoose.connection.readyState === 1;
  res.json({
    status: isConnected ? 'healthy' : 'disconnected',
    database: isConnected ? 'MongoDB Connected' : 'MongoDB Offline',
    timestamp: new Date().toISOString(),
  });
});

// Root route
app.get('/', (req, res) => {
  const isConnected = mongoose.connection.readyState === 1;
  res.json({
    message: '🚀 EventEase MERN Stack Backend API is running.',
    database: isConnected ? 'MongoDB Connected' : 'MongoDB Disconnected',
    endpoints: {
      events: '/api/events',
      bookings: '/api/bookings',
      venues: '/api/venues',
      health: '/api/health',
    },
  });
});

// 404 handler for undefined routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Endpoint ${req.originalUrl} not found on this server.`,
  });
});

// Global Error Handler Middleware
app.use(errorHandler);

// Start Express Server
const server = app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`🚀 EventEase Server running on http://localhost:${PORT}`);
  console.log(`   API Base URL: http://localhost:${PORT}/api`);
  console.log(`   Events API:   http://localhost:${PORT}/api/events`);
  console.log(`   Bookings API: http://localhost:${PORT}/api/bookings`);
  console.log(`   Venues API:   http://localhost:${PORT}/api/venues`);
  console.log(`====================================================`);
});

module.exports = { app, server };
