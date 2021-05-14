var express = require("express");
var router = express.Router();
var database;

router.use(function timeLog(req, res, next) {
  //faccio un log dell'accesso
  var ora = new Date(Date.now()).toLocaleString("it-IT");
  console.log(`Info - Access ${req.method} method Protected page Time : ${ora}`);
  next();
});

router.get("/", function (req, res) {
  //qui rispondiamo alla chiamata /signup/
  //in questo caso la root si riferisce al secondo '/'
  //possiamo così rispondere alla root di SignUp senza dover
  //scrivere tutto il percorso. Solo le chiamate di signup
  //vengono indirizzate qui
  res.render("signup");
});
router.post("/", function (req, res, next) {
  database.Model.find({ 'user': req.body.userid }, function (err, response) {//controllo se lo user esista o meno
    if (response.length == 0)//l'utente non esiste ancora
    {
      database.user(req.body.userid, req.body.password).save(function (err, item) {
        if (err)//se si è verificato un errore
        {
          console.log(err);
          res.render("signup", { "message": err });
        }
        else {
          //se non si sono verificati errori setto lo user nei cookie e nella session
          req.session.user = { "userid": req.body.userid, "password": req.body.password };
          res.cookie('userid', req.body.userid, { maxAge: 3600000, httpOnly: true });
          res.render('login');
          next();
        }
      });
    }
    else {//l'utente esiste già, infatti il numero di record è pari a 1 ( se non maggiore ;=) )
      res.render("signup", { message: "User already exists. Login or choose anoter user id" });
      var ora = new Date(Date.now()).toLocaleString("it-IT");
      console.log(`Error - Signup user : ${req.body.userid} - Time ${ora}`);
    }
  });
});

router.use(function timeLog(req, res, next) {
  var ora = new Date(Date.now()).toLocaleString("it-IT");
  console.log(`Info : Login User ${req.body.userid} at ${ora}`);
});

module.exports = function (param) {
  database = param;//passando il mio DB nei parametri mi evito di doverne istanziare uno per ogni modulo
  return router;//ritorno il router con cui verrà gestito le chiamata, in questo caso, di Login
}