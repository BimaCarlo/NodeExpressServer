var express = require("express");
var database;
//var jwt = require('jsonwebtoken');
var uuid = require('uuid');
var nJwt = require('njwt');

var router = express.Router();
//-------------------------------
router.use(function timeLog(req, res, next) {
    var ora = new Date(Date.now()).toLocaleString("it-IT");
    console.log(`Info - Requested token at Time : ${ora}`);
    next();
});

router.post('/', function (req, res) {
    let username = req.body.userid;
    let password = req.body.password;
    generaTokenCallBack(username, password, res, function (res, token) { res.end(token); });
    //res.end(token);
});

//Questo metodo ha come terzo parametro opzionale il 'res'
//in questo modo posso rispondere con il res.end(token)
//in caso non venga passato viene tornato come un semplice
//valore di ritorno
async function generaTokenResRet(user, pwd, res = undefined) {//*! metodo 2 con inserimento callback + uso come metodo + passaggio si cookie
    var token = {};
    await database.Model.find(
        { 'user': user, 'password': pwd },
        function (err, response) {
            if (err) {
                console.log(err);
            }
            if (response.length == 1) {
                token = {
                    username: user,
                    password: pwd,
                    allowed: true
                };
            }
            else {
                let errore = "Login Error : Invalid credentials";
                console.log(errore);
            }

            if (token.username != undefined) {
                var privateKey = 'secret';
                var jwt = nJwt.create(token, privateKey, "HS256");
                token = jwt.compact();
            }
            else {
                token = "";
            }
        });

    if (res != undefined) {
        res.end(token);
    }
    else { return token; }
}

//viene passata la callback da eseguire alla fine della
//ricerca dati. Alla callback vengono passati 2 dati
// - res (nel caso la callback non ne abbia accesso)
// - token
async function generaTokenCallBack(user, pwd, res, callback) {
    var token = {};
    await database.Model.find(
        { 'user': user, 'password': pwd },
        function (err, response) {
            if (err) {
                console.log(err);
            }
            else {
                if (response.length == 1) {
                    token = {
                        username: user,
                        password: pwd,
                        allowed: true
                    };
                    var privateKey = 'secret';
                    var jwt = nJwt.create(token, privateKey, "HS256");
                    token = jwt.compact();
                }
                else {
                    let errore = "Login Error : Invalid credentials";
                    console.log(errore);
                    token = "";
                }

                callback(res, token);
            }
        });
}


//viene solo passata la res per settare i cookie
//per utilizzare questo metodo, che ritorna il 
//token devo usare la sintassi:
// generaTokenCookie(u,p,r).then((token)=>{...})
async function generaTokenCookie(user, pwd, res) {
    var token = {};
    //await database.Model.find( { 'user': user, 'password': pwd },
    await ricercaUtente(user, pwd).then(
        function (result) {
            let err = result.err;
            let response = result.resp;
            if (err) {
                console.log(err);
            }
            else {
                if (response.length == 1) {
                    token = {
                        username: user,
                        password: pwd,
                        allowed: true
                    };
                    var privateKey = 'secret';
                    var jwt = nJwt.create(token, privateKey, "HS256");
                    token = jwt.compact();
                }
                else {
                    let errore = "Login Error : Invalid credentials";
                    console.log(errore);
                    //token = "";
                    token = {
                        username: user,
                        password: pwd,
                        allowed: false
                    };
                }
                //settaggio dei cookies
                res.clearCookie('jwebtoken');
                res.cookie('jwebtoken', token, { maxAge: 60000, httpOnly: true });
                //res.cookies['jwebtoken'];
            }
        });
    return token;
}

async function ricercaUtente(user, pwd) {
    let er, resp;
    await database.Model.find(
        { 'user': user, 'password': pwd },
        function (err, response) { er = err; resp = response });
    return { "err": er, "resp": resp };
}


/*
function ricercaUtente(user, pwd) {
    let res = {};
    database.Model.find(
        { 'user': user, 'password': pwd },
        function (err, response) {
            if (err) {
                console.log(err);
            }
            if (response.length == 1) {
                res = {
                    username: user,
                    password: pwd,
                    allowed: true
                };
                return res;
            }
            else {
                let errore = "Login Error : Invalid credentials";
                console.log(errore);
                return res;
            }
        });
}
*/
module.exports = function (param) {
    database = param;//passando il mio DB nei parametri mi evito di doverne istanziare uno per ogni modulo
    //return router;//ritorno il router con cui verrà gestito le chiamata, in questo caso, di Login
    return {
        "router": router,
        "generaToken": generaTokenCookie
    };
}
