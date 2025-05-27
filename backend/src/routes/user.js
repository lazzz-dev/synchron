const express = require('express');
const router = express.Router();
const isAuthenticated = require('../middleware/auth');

router.get('/profile', isAuthenticated, (req, res) => {
  res.status(200).json({
    id: req.user._id,
    name: req.user.name,
    email: req.user.email,
    createdAt: req.user.createdAt
  });
});

module.exports = router;
