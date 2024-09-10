const path = require('path');

// Home page controller
exports.home = (req, res) => {
  res.render('home', { title: 'Home' , user: req.user });
};

// About Us controller
exports.showAboutPage = (req, res) => {
    res.render('about', { title: 'About Us' , user: req.user });
};

// Dashboard page
exports.showDashboardPage = (req, res) => {
  res.render('dashboard', { title: 'Dashboard', user: req.user });
};



