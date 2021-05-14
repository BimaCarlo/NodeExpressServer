var express = require('express');
var router = express.Router();
var database;
//------------------------------------------------------------
router.use(function timeLog(req, res, next) {
  var ora = new Date(Date.now()).toLocaleString("it-IT");
  console.log(`Info - Access ${req.method} method Protected page Time : ${ora}`);
  next();
});
//------------------------------------------------------------
router.get('/', function (req, res, next) {
  if (req.session.user)//controllo che ci sia un utente nella session così sono sicuro che l'utente si sia loggato prima
  {
    if (req.session.page_views){req.session.page_views++;}
    else {req.session.page_views =1;}
    res.render('protected_page', { "userid": req.session.user.userid, "views": req.session.page_views });
    next();
  }
  else {
    var err = new Error("User not logged in");
    console.log("Error : trying to access unauthorized page!");
    next(err);
  }
});
//--------------------------------------------------------------
router.use(function (err, req, res, next) {
  //in questo caso predispongo la possibilità di passare un errore
  res.clearCookie('userid');
  res.redirect('/login');
  console.log(err);
});
router.use(function timeLog (req, res, next) {
  //funzione senza il caso di errore
  var ora = new Date(Date.now()).toLocaleString("it-IT");
  console.log(`Info - Protected page user: ${req.session.user.userid} - time ${ora}`);
});
//---------------------------------------------------------------
module.exports = function (params) {
  database = params;
  return router;
}