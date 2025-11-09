// Authentication middleware
const authMiddleware = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  
  // Check for user in session
  if (req.session && req.session.passport && req.session.passport.user) {
    req.user = req.session.passport.user;
    return next();
  }
  
  res.status(401).json({
    success: false,
    error: 'Authentication required'
  });
};

module.exports = authMiddleware;