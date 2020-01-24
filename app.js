const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const path = require('path');
const app = express();
const server = app.listen(3330, listen);
const io = require("socket.io")(server);
const fs = require("fs");

exports.io = io;

const databaseCon = require("./databaseCon.js");
const curTime = require("./curTime.js");
const socketLogic = require("./socketLogic.js");

function listen() {
    const host = server.address().address;
    const port = server.address().port;
    console.log('Started server at https://' + host + ':' + port);
}

//? Stuff I don't understand
app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true
}));

app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());

//? Self explanatory 
databaseCon.declareCon();

//? Serving folder with css, js and loginpage
app.use(express.static(path.join(__dirname, 'public')));

app.get("/", function (request, response) {
    response.sendFile(path.join(__dirname, 'views/login.html'));
});

//? User does allready exist just wrong credentials
app.get("/loginWC", function(request, response) {
    response.sendFile(path.join(__dirname, "views/loginWC.html"));
});

//? Register Page
app.get("/register", function(request, response) {
    response.sendFile(path.join(__dirname, "views/register.html"));
});
app.get("/registerAE", function(request, response) {
    response.sendFile(path.join(__dirname, "views/registerAE.html"));
});

//? Serve the chat
app.get("/chat", function(request, response) {
    if(request.session.loggedin === true)
        response.sendFile(path.join(__dirname, "views/index.html"));
    else
        response.sendFile(path.join(__dirname, 'views/login.html'));   
});

//? Check login and either serve chat or deny
app.post("/", function (request, response) {
    let username = request.body.username;
    let password = request.body.password;

    databaseCon.login(username, password, request, response);
});

//? Registering
app.post("/register", function(request, response) {
    let username = request.body.username;
    let password = request.body.password;
    let color = request.body.color;

    databaseCon.userExists(username, password, color, request, response);
});

//? The logic
io.sockets.on("connection", function (socket) {
    // Logs connection in console and file
    let newCon = (curTime.getTime() + ": " + socket.id + " connected!");
    console.log(newCon);
    fs.appendFileSync("logs.txt", (newCon + "\n"), function(err) {
        if (err) throw err;
    });

    // Requests all available messages
    databaseCon.getMessages(socket);

    // Syncs the new client information
    socket.on("clientInformation", function(data) {
        socketLogic.clientInformation(socket.id, data)
    });

    socket.on("message", function(data) {
        socketLogic.message(socket.id, data);
    });

    socket.on("disconnect", function() {
        socketLogic.disconnect(socket.id)
    });

    // Typing
    socket.on("typing", function() {
        socketLogic.typing(socket.id)
    });

    socket.on("notTyping", function() {socketLogic.notTyping(socket.id)
    });

});