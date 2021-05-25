var database = require('./lib/database');
var express = require('express');
var session = require('express-session');
var cookieParser = require('cookie-parser');
var signup = require('./lib/signup')(database);
var page = require('./lib/page')(database);
var logout = require('./lib/logout');
var tokenGenerator = require('./lib/tokenGenerator')(database);
var login = require('./lib/login')(database, tokenGenerator);
//*Per il modulo HTTPS
var http = require('http');//reindirizzamento
var https = require("https");
var fs = require("fs");
//----------------MIDDLEWARE----------------
var app = express();
app.use(express.static('public'));//faccio in modo che tutti i file all'interno della cartella public siano accessibili
app.use(express.urlencoded({extended:true}));//decodifica i dati dell'header del protocollo http parsificando da urlencoded a JSON
app.use(session({secret:"secret key", resave:true, saveUninitialized:true}));//
app.use(cookieParser());//
//----------------CHIAMATE------------------
app.use("/login", login);//tutte le richieste che inizieranno con login
app.use("/signup", signup);//tutte le richieste che inizieranno con signup
app.use("/protected_page", page);
app.use("/logout", logout);//tutte le richieste che inizieranno con login
app.use("/token", tokenGenerator.router);
//------------------------------------------
app.set("view engine","pug");
app.set("views","./views");//i file pug sono nella cartella views
//------------------------------------------

https.createServer(
  {
    key: fs.readFileSync('./certificate/server.key'),//*entrambi i file vengono generati con openssl
    cert: fs.readFileSync('./certificate/server.cert')
  }, app)
  .listen(3000, function () 
  {
    console.log('Example app listening on port 3000! Go to https://localhost:3000/')
    //*! IMPORTANTE : NON localhost:3000 (sennò va in http) MA https://localhost:3000
  });
//app.listen(3000, function(){console.log("Port is active on port 3000");});

//*--------------------------------
//*MI SERVE PER IL REINDIRIZZAMENTO
//*--------------------------------

http.createServer(function (req, res) {
  res.writeHead(302, { "Location": "https://localhost:3000"});
  res.end();
}).listen(8080);