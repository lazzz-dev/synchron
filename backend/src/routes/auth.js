const express = require('express');
const passport = require('passport');
const router = express.Router();

router.get('/google', 
  passport.authenticate('google', { 
    scope: ['profile', 'email', 'https://www.googleapis.com/auth/spreadsheets.readonly'] 
  })
);

router.get('/google/callback', 
  passport.authenticate('google', { 
    failureRedirect: process.env.CLIENT_URL || 'http://localhost:3000/login',
    session: true
  }),
  (req, res) => {
    res.redirect(process.env.CLIENT_URL || 'http://localhost:3000/dashboard');
  }
);

router.get('/status', (req, res) => {
  if (req.isAuthenticated()) {
    return res.status(200).json({ 
      isAuthenticated: true, 
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email
      }
    });
  }
  return res.status(200).json({ isAuthenticated: false });
});

router.get('/logout', (req, res) => {
  req.logout(function(err) {
    if (err) { return next(err); }
    res.redirect(process.env.CLIENT_URL || 'http://localhost:3000');
  });
});

module.exports = router;
