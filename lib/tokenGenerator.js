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
    let token = generaToken(username, password, res);
    //res.end(token);
});

async function generaToken(user, pwd, res = undefined) {
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
        "generaToken": generaToken
    };
}
