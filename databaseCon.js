const mysql = require('mysql');
const curTime = require("./curTime.js");
const fs = require("fs");

var connection;

/**
 * @description Establishes connection to the database
 */
exports.declareCon = function() {
    try {
        connection = mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: 'root',
            database: 'nodetest'
        });
    } catch (err) {
        console.log(err);
    }
}

/**
 * @description Connects to the database and requests all messages available to be displayed for the user 
 * @param {SocketIO.Socket} socket The socket of the requesting client
 */
exports.getMessages = function(socket) {
    connection.query(`SELECT * FROM nodetest.messages;`, function (error, results, fields) {
        if (error)
            console.log(error);
        socket.emit("loadAll", {
            query: results
        });
    });
}

/**
 * @description Saves the messages into the database
 * @param {string} name Name
 * @param {string} message Message
 * @param {string} time Time
 * @param {string} color Color
 */
exports.saveMessageDB = function(name, message, time, color) {
    connection.query(`INSERT INTO nodetest.messages (user, message, zeit, farbe) VALUES ('${name}', '${message}', '${time}', '${color}')`, function (error, results, fields) {
        if (error)
            console.log(error);
    });
}

/**
 * @description Validates the login credentials with the database
 * @param {string} username Username of account
 * @param {string} password Password of account
 * @param {request} request Request object
 * @param {response} response Response object
 */
exports.login = function(username, password, request, response) {
    connection.query(`SELECT * FROM nodetest.useraccounts WHERE username ='${username}' AND password = '${password}'`, function(error, results, fields) {
        if (error)
            console.log(error);
        if (results.length > 0){
            request.session.loggedin = true;
            let newLogin = (curTime.getTime() + ": " + username + "(" + request.sessionID + ") logged in!");
            console.log(newLogin);
            fs.appendFileSync("logs.txt", (newLogin + "\n"), function(err) {
                if (err) throw err;
            });
            response.send({username : username, color : results[0].color, url :  "/chat"});
        } else
            response.send({url : "/loginWC"});
    });
}

/**
 * @description Checks if username already exists
 * @param {string} username Username of account
 * @param {string} password Password of account
 * @param {string} color Name display color
 * @param {request} request Request object
 * @param {response} response Response object
 */
exports.userExists = function(username, password, color, request, response) {
    connection.query(`SELECT * FROM nodetest.useraccounts WHERE username = '${username}'`, function(error, results, fields) {
        if (error)
            console.log(error);
        if (results.length > 0)
            response.send({url : "/registerAE"});
        else {
            register(username, password, color);
            request.session.loggedin = true;
            let newLogin = (curTime.getTime() + ": " + username + "(" + request.sessionID + ") logged in!");
            console.log(newLogin);
            fs.appendFileSync("logs.txt", (newLogin + "\n"), function(err) {
                if (err) throw err;
            });
            response.send({username : username, color : color, url :  "/chat"});
        }
    });
}

/**
 * @description Registers new users in the database
 * @param {string} username Username
 * @param {string} password Password
 * @param {string} color Name display color
 */
function register(username, password, color) {
    connection.query(`INSERT INTO nodetest.useraccounts (username, password, joindate, color) VALUES ('${username}', '${password}', '${curTime.getTime()}', '${color}')`, 
    function(error, results, fields) {
        if (error) 
            console.log(error);
    });
}