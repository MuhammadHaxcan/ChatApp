const User = require('../models/UserModel');
const bcrypt = require('bcrypt');
const passport = require('passport');

// Show registration form
exports.showRegisterPage = (req, res) => {
    res.render('register', { title: 'Register' , user: req.user });
};

// Register handler
exports.register = async (req, res) => {
    const { username, email, password } = req.body;
    try {
        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).send('User already exists');
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new user
        const newUser = new User({ username, email, password: hashedPassword });
        await newUser.save();

        res.redirect('/auth/login');
    } catch (error) {
        console.error('Error registering user:', error);
        res.status(500).send('Server error');
    }
};

// Show login form
exports.showLoginPage = (req, res) => {
    res.render('login', { title: 'Login', user: req.user });
};

// Login handler
exports.login = (req, res, next) => {
    passport.authenticate('local', (err, user, info) => {
        if (err) {
            return next(err);
        }
        if (!user) {
            return res.status(400).send('Invalid email or password');
        }
        req.logIn(user, (err) => {
            if (err) {
                return next(err);
            }
            res.redirect('/');
        });
    })(req, res, next);
};

// Logout handler
exports.logout = (req, res) => {
    req.logout((err) => {
        if (err) {
            console.error('Error logging out:', err);
            return res.status(500).send('Server error');
        }
        res.redirect('/auth/login');
    });
};
