var database = require('./lib/database');
var express = require('express');
var session = require('express-session');
var cookieParser = require('cookie-parser');
var login = require('./lib/login')(database);
var signup = require('./lib/signup')(database);
var page = require('./lib/page')(database);
var logout = require('./lib/logout');
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
//------------------------------------------
app.set("view engine","pug");
app.set("views","./views");//i file pug sono nella cartella views
//------------------------------------------
app.listen(3000, function(){console.log("Port is active on port 3000");});