const mongoose = require('mongoose');

/**
 * Connect to MongoDB using Mongoose
 * Uses MONGO_URI from environment variables (.env)
 */
const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/eventease';
    
    // Set Mongoose connection options
    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000, // Timeout after 5 seconds instead of hanging
    });

    console.log(`====================================================`);
    console.log(`✅ MongoDB Connected Successfully!`);
    console.log(`   Host: ${conn.connection.host}`);
    console.log(`   Database Name: ${conn.connection.name}`);
    console.log(`   Connection State: Ready (readyState = 1)`);
    console.log(`====================================================`);
    return conn;
  } catch (error) {
    console.error(`❌ MongoDB Connection Failed!`);
    console.error(`   Error: ${error.message}`);
    console.log(`💡 Setup Tip:`);
    console.log(`   1. If using MongoDB Atlas: Check your MONGO_URI in backend/.env`);
    console.log(`      Make sure your IP address is whitelisted in Atlas Network Access (0.0.0.0/0).`);
    console.log(`   2. If using Local MongoDB: Ensure MongoDB Service is running on port 27017.`);
    return null;
  }
};

module.exports = connectDB;
