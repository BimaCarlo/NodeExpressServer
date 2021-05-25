var express = require('express');
var router = express.Router();
//var tokenGenerator = require('toke');
var tokenGenerator;
var database;
var uuid = require('uuid');
var nJwt = require('njwt');

router.use(function timeLog(req, res, next) {
  var ora = new Date(Date.now()).toLocaleString("it-IT");
  console.log(`Info - Access ${req.method} method Protected page Time : ${ora}`);
  next();
});

router.get("/", function (req, res) {//richiamo il mio form
  res.render('login', { 'user': req.cookies['userid'] });//passo dei parametri al file PUG
})

router.post("/", function (req, res, next) {//la chiamata in post in questo caso funziona come un middleware
  //gestisisco il ritorno di parametri
  let userid = req.body.userid;
  let pwd = req.body.password;
  let remember = req.body.remember;
  tokenGenerator.generaToken(userid, pwd).then(function (token) {

    //controllo la validità del token
    
    nJwt.verify(token,'secret',function(err,verifiedJwt){
      if(err){
        console.log("Error : Login Token not valid " + err); // Token has expired, has been tampered with, etc
        token = "";//faccio in modo che non sia valido il login
      }
    });

    if (token != "") {
      //consentito
      if (req.body.remember === '1') {//voglio che lo username sia automaticamente mostrato nella textbox (Checkbox "Ricordami")
        //con questo cookie la prossima volta che verrà aperta userò questo cookie
        res.cookie('userid', userid, { maxAge: 3600000, httpOnly: true });
      }
      else {
        //pulisco i cookiem oerchè non vuole essere ricordato
        res.clearCookie('userid');
      }
      //Salvo i dati di username e password nella sessione
      console.log("Info - Login valid credentials");
      req.session.user = { 'userid': userid, 'password': pwd };
      res.redirect('/protected_page');
    }
    else {
      let errore = "Login Error : Invalid credentials";
      console.log(errore);
      res.render('login', { user: userid, message: errore });
    }
  });

  /*
  //*Versione con ricerca in login
  database.Model.find({ 'user': req.body.userid, 'password': req.body.password }, function (err, response) {
    if (response.length == 1) {
      //ha trovato l'utente
      if (req.body.remember === '1') {//voglio che lo username sia automaticamente mostrato nella textbox (Checkbox "Ricordami")
        //con questo cookie la prossima volta che verrà aperta userò questo cookie
        res.cookie('userid', req.body.userid, { maxAge: 3600000, httpOnly: true });
      }
      else {
        //pulisco i cookiem oerchè non vuole essere ricordato
        res.clearCookie('userid');
      }
      //Salvo i dati di username e password nella sessione
      console.log("Info - Login valid credentials");
      req.session.user = { 'userid': req.body.userid, 'password': req.body.password };
      res.redirect('/protected_page');
    }
    else {
      let errore = "Login Error : Invalid credentials";
      console.log(errore);
      res.render('login', { user: req.cookies.userid, message: errore });
    }
});*/
});
router.use(function timeLog(req, res, next) {
  var ora = new Date(Date.now()).toLocaleString("it-IT");
  console.log(`Info : Login User ${req.body.userid} at ${ora}`);
});

//*Param -> database
module.exports = function (param, tGenerator) {
  tokenGenerator = tGenerator;
  database = param;//passando il mio DB nei parametri mi evito di doverne istanziare uno per ogni modulo
  return router;//ritorno il router con cui verrà gestito le chiamata, in questo caso, di Login
}