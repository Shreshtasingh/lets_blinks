const express = require('express');
const router = express.Router();

router.get('/', function (req, res) {
  res.redirect("/products")
});

//to show the map 
router.get('/map/:orderid', function (req, res) {
 res.render("map",{orderid : req.params.orderid})
})


module.exports = router;