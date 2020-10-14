const express = require('express');
const router = express.Router();

const checkAuth = (req, res, next) => {
     if (req.user) {
          next();
     } else {
          res.redirect('/auth/login');
     }
};

router.get('/', checkAuth, (req, res) => {
     res.render('profile', { user: req.user });
});

module.exports = router;
