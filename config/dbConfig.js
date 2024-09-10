const mongoose = require('mongoose');
require('dotenv').config(); // Make sure to require dotenv to access environment variables

const connectDB = async () => {
  try {
    // Use the connection string from the environment variables
    const connectionString = process.env.CONNECTION_STRING;

    // Connect to MongoDB
    await mongoose.connect(connectionString, {});

    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error.message);
    process.exit(1); // Exit the process with failure
  }
};

module.exports = connectDB;
