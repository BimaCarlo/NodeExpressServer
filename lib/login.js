var express = require('express');
var router = express.Router();
//var tokenGenerator = require('toke');
var tokenGenerator;
var database;
var uuid = require('uuid');
var nJwt = require('njwt');
var store = require('store');

router.use(function timeLog(req, res, next) {
  var ora = new Date(Date.now()).toLocaleString("it-IT");
  console.log(`Info - Access ${req.method} method Protected page Time : ${ora}`);
  next();
});

router.get("/", function (req, res) {//richiamo il mio form
  let ritorno = "/protected_page";
  let jwtoken = req.query.jwtoken;
  if (jwtoken != undefined && jwtoken != null) {//login automatico con local storage
    jwtoken = verificaWebToken(jwtoken, 'secret');
    if(jwtoken != undefined && jwtoken.body.allowed){
      req.session.user = { 'userid': jwtoken.body.username, 'password': jwtoken.body.password };
      res.end(ritorno);
      //res.redirect('/protected_page');
    }
  }
  else {
    let user = req.cookies['userid_pers'];
    let tokenCookie = verificaWebToken(req.cookies['jwebtoken'], 'secret');//verrà generato un errore se il token non esiste ma viene gestito dal metodo e scritto in console 
    if (tokenCookie != undefined && tokenCookie.body.allowed) {
      req.session.user = { 'userid': tokenCookie.body.userid, 'password': tokenCookie.body.password };
      res.redirect('/protected_page');
    }
    else {
      res.render('login', { 'user': user });
      //ritorno = "/login";
      //controllo lo storage    
      /*
      //Local storage simulato
      try {
        let tokenStore = verificaWebToken(store.get('token' + user).token,'secret');
        if (tokenStore != undefined && tokenStore.body.allowed) {
          req.session.user = { 'userid': tokenStore.body.userid, 'password': tokenStore.body.pwd };
          res.redirect('/protected_page');
        }
        else
          res.render('login', { 'user': user });//passo dei parametri al file PUG
      } catch (err) {
        res.render('login', { 'user': user });//passo dei parametri al file PUG
      }*/

    }
  }
})

router.post("/", function (req, res, next) {//la chiamata in post in questo caso funziona come un middleware
  //gestisisco il ritorno di parametri
  let userid = req.body.userid;
  let pwd = req.body.password;
  let remember = req.body.remember;

  tokenGenerator.generaToken(userid, pwd, res).then(
    function (token) {
      let verifiedToken;
      if (token != null) {
        verifiedToken = verificaWebToken(token, 'secret');
        if (verifiedToken != null && verifiedToken.body.allowed) {
          //consentito
          if (remember === '1') {//voglio che lo username sia automaticamente mostrato nella textbox (Checkbox "Ricordami")
            //con questo cookie la prossima volta che verrà aperta userò questo cookie
            res.cookie('userid', userid, { maxAge: 1000 * 60 * 4, httpOnly: true });
            res.cookie('userid_pers', userid, { maxAge: 1000 * 60 * 4, httpOnly: true });
          }
          else {
            //pulisco i cookie perchè non vuole essere ricordato
            res.clearCookie('userid');
            res.cookie('userid_pers', userid, { maxAge: 1000 * 60 * 4, httpOnly: true });
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

      }
      else {
        let errore = "Login Error : Invalid credentials";
        console.log(errore);
        res.render('login', { user: userid, message: errore });
      }
    });


});
router.use(function timeLog(req, res, next) {
  var ora = new Date(Date.now()).toLocaleString("it-IT");
  console.log(`Info : Login User ${req.body.userid} at ${ora}`);
});

function verificaWebToken(token, secretKey) {
  let ritorno;
  console.log("Entro nel metodo verificaWebToken");
  try {
    console.log("ritorno il token");
    ritorno = nJwt.verify(token, secretKey);
  } catch (err) {
    console.log("Error : Login Token not valid " + err);
    console.log("ritorno undefined");
    ritorno = undefined;
  }
  return ritorno;
}

//*Param -> database
module.exports = function (param, tGenerator) {
  tokenGenerator = tGenerator;
  database = param;//passando il mio DB nei parametri mi evito di doverne istanziare uno per ogni modulo
  return router;//ritorno il router con cui verrà gestito le chiamata, in questo caso, di Login
}


function vecchiUtilizzatoriDiGeneraToken() {
  /*
  *!Da Aggiornare : Non utilizzare così come sono
  tokenGenerator.generaToken(userid, pwd, res, function (res, token) {

    nJwt.verify(token, 'secret', function (err, verifiedJwt) {
      if (err || !verifiedJwt.body.allowed) {
        console.log("Error : Login Token not valid " + err); // Token has expired, has been tampered with, etc
        token = "";//faccio in modo che non sia valido il login
      }
    });

    if (token != "") {
      //consentito
      if (remember === '1') {//voglio che lo username sia automaticamente mostrato nella textbox (Checkbox "Ricordami")
        //con questo cookie la prossima volta che verrà aperta userò questo cookie
        res.cookie('userid', userid, { maxAge: 3600000, httpOnly: true });
      }
      else {
        //pulisco i cookie perchè non vuole essere ricordato
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
  */

  /* tokenGenerator.generaToken(userid, pwd).then(function (token) {
 
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
     }});*/
}