const express = require('express');
const session = require('express-session');
const passport = require('passport');
const mongoose = require('mongoose');
const path = require('path');
const dotenv = require('dotenv');

const defaultRoutes = require('./routes/defaultRoutes');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const chatRoutes = require('./routes/chatRoutes');

const connectDB = require('./config/dbConfig');

dotenv.config();
require('./config/passport-setup'); // Adjust the path as necessary

const app = express();

// Connect to DB
connectDB();

// Set up session middleware
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false
}));

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Set EJS as the template engine
app.set('view engine', 'ejs');

// Set up static file serving
app.use(express.static(path.join(__dirname, 'public')));

// Middleware for parsing request bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/', defaultRoutes);
app.use('/auth', authRoutes);
app.use('/user', userRoutes);
app.use('/chat',chatRoutes);


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on PORT: ${PORT}`);
});
