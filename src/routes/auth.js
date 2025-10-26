const express = require('express');
const router = express.Router();
const passport = require('../config/passport');

router.get('/google', 
  passport.authenticate('google', { 
    scope: ['profile', 'email'] 
  })
);

router.get('/google/callback',
  passport.authenticate('google', { 
    failureRedirect: process.env.FRONTEND_URL + '?error=auth_failed',
    session: false 
  }),
  (req, res) => {
    res.redirect(`${process.env.FRONTEND_URL}?userId=${req.user.id}&provider=google`);
  }
);

router.get('/logout', (req, res) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).json({ error: 'ログアウトに失敗しました' });
    }
    res.json({ success: true, message: 'ログアウトしました' });
  });
});

module.exports = router;