const express = require('express');
const router = express.Router();
const passport = require('passport');

router.get('/google', passport.authenticate("google",{
    scope: ['profile','email']  // Request Google profile data
  })
, function(req, res) {});

router.get('/google/callback', passport.authenticate("google",{
    successRedirect : '/products',
    failureRedirect : "/"
}),
function(req, res) {}
);

//copying the code form the passport js logout documentation
router.get('/logout', function(req, res, next){
    req.logout(function(err) {
      if (err) { return next(err);

       }
      res.redirect('/');
    });
  });
module.exports = router;