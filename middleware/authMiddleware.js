// middleware/authMiddleware.js

module.exports = (req, res, next) => {
    if (req.isAuthenticated()) {
        return next(); // User is authenticated, proceed to the next middleware/route handler
    }
    res.redirect('/auth/login'); // User is not authenticated, redirect to login page
};
