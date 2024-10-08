const express = require('express');
const session = require('express-session');
const passport = require('passport');
const mongoose = require('mongoose');
const path = require('path');
const dotenv = require('dotenv');
const http = require('http'); // Import http module
const socketIo = require('socket.io'); // Import socket.io

const defaultRoutes = require('./routes/defaultRoutes');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const chatRoutes = require('./routes/chatRoutes');
const groupRoutes = require('./routes/groupRoutes');
const socketHandler = require('./socket'); // Import socket handler

const connectDB = require('./config/dbConfig');

dotenv.config();
require('./config/passport-setup'); // Adjust the path as necessary

const app = express();
const server = http.createServer(app); // Create HTTP server
const io = socketIo(server); // Initialize Socket.io with the server

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
app.use('/chat', chatRoutes);
app.use('/group', groupRoutes);

// Set up Socket.io
socketHandler(io); // Pass the io instance to the socket handler

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on PORT: ${PORT}`);
});