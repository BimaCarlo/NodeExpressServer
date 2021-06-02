var express = require("express");
var router = express.Router();
var store = require("store");
//-------------------------------
router.use(function timeLog(req, res, next) {
  var ora = new Date(Date.now()).toLocaleString("it-IT");
  console.log(`Info - Access ${req.method} method Protected page Time : ${ora}`);
  next();
});

router.get('/', function (req, res) {
  let user = req.cookies['userid_pers']
  store.remove('token' + user);
  res.clearCookie('jwebtoken');
  req.session.destroy(function () {
    console.log("Info - User logged out");
    res.redirect("Login");

  });
});

module.exports = router;