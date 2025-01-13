const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

// Load environment variables from .env file
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
const authRoutes = require('./routes/authRoutes');
app.use('/auth', authRoutes);

// Database connection with error handling
const connectDB = async () => {
  const mongoURI = process.env.MONGODB_URI; // MongoDB URI from .env file

  // Ensure MONGODB_URI is defined in the .env file
  if (!mongoURI) {
    console.error('MongoDB URI is not defined in .env');
    process.exit(1);
  }

  try {
    // Connect to MongoDB without deprecated options
    await mongoose.connect(mongoURI);
    console.log('MongoDB connected successfully');
  } catch (error) {
    // Log MongoDB connection error
    console.error('MongoDB connection error:', error.message);
    process.exit(1);
  }
};

// Connect to database
connectDB();

// Use PORT from .env or default to 5000
const PORT = process.env.PORT || 5000;

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Global error handling
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

