const ioImport = require("./app.js");
const curTime = require("./curTime.js");
const fs = require("fs");
const io = ioImport.io;
const databaseCon = require("./databaseCon.js");

/**
 * @description Stores the name and according colors of the currently online users
 * @example usernameList : {
                Object : {
                    name : string,
                    color : string
                }
            }
 */
let usernameList = {};

/**
 * @description Stores the names and ids of currently typing people 
 * @example typingList : {
                Object : {
                    name : string
                }
            }
 */
let typingList = {};

/**
 * @description Hold log string
 * @type {string}
 */
let newMessage;
/**
 * @description Hold log string
 * @type {string}
 */
let newAlias;
/**
 * @description Hold log string
 * @type {string}
 */
let newDisconnect;

/**
 * @description Stores and logs the new client information. Emits to other clients about the new client
 * @param {string} socketID Socket.id of the client
 * @param {object} data Object with name and color
 * @param {string} data.name Displayname of the socket
 * @param {string} data.color Displaycolor of the name
 */
exports.clientInformation = function(socketID, data) {
    usernameList[socketID] = {
        name: data.name,
        color: data.color
    };

    newAlias = (curTime.getTime() + ": " + socketID + ` is now known as "${ usernameList[socketID].name }"`);
    console.log(newAlias);
    fs.appendFileSync("logs.txt", (newAlias + "\n"), function(err) {
        if (err) throw err;
    });

    io.sockets.emit("onlineUsers", {
        users: usernameList
    });
};

/**
 * @description Removes the client from the currently typing list and emits that
 * list, emits the new message to everyone and sends it to the database 
 * @param {string} socketID Socket.id of the client
 * @param {Object} data Object with sending time and value
 * @param {string} data.time Time the message was sent
 * @param {string} data.message Message value
 */
exports.message = function(socketID, data) {
    // Refresh typing list
    delete typingList[socketID];
    io.sockets.emit("newTyping", {
        typing: typingList
    });

    // Send new message to every client
    io.sockets.emit("newMessage", {
        message: data.message,
        name: usernameList[socketID].name,
        color: usernameList[socketID].color
    });

    // Log message
    newMessage = (data.time + ", " + usernameList[socketID].name + "(" + socketID + ") : " + data.message);
    console.log(newMessage);
    fs.appendFileSync("textLog.txt", (newMessage + "\n"), function(err) {
        if (err) throw err;
    });

    // Save message in database
    databaseCon.saveMessageDB(usernameList[socketID].name, data.message, data.time, usernameList[socketID].color);
};

/**
 * @description Adds, if not already included, new typist
 * @param {string} socketID Socket.id of the emiter
 */
exports.typing = function(socketID) {
    if (typingList[socketID] === undefined && usernameList[socketID].name !== undefined) {
        typingList[socketID] = {
            name : usernameList[socketID].name
        }
        io.sockets.emit("newTyping", {
            typing: typingList
        });
    }
}

/**
 * @description Removes, if not already excluded, old typist
 * @param {string} socketID Socket.id of the emiter
 */
exports.notTyping = function(socketID) {
    delete typingList[socketID];
    io.sockets.emit("newTyping", {
            typing: typingList
        });
}

/**
 * @description Removes the disconnected client from the usernameList and if in typingList, remove them there too
 * @param {string} socketID Socket.id of the client
 */
exports.disconnect = function(socketID) {
    if (usernameList[socketID] !== undefined) {
        newDisconnect = (curTime.getTime() + ": " + usernameList[socketID].name + "(" + socketID + ") disconnected");
        console.log(newDisconnect);
        fs.appendFileSync("logs.txt", (newDisconnect + "\n"), function(err) {
            if (err) throw err;
        });

        if (typingList[socketID] !== undefined)
            delete typingList[socketID];

        delete usernameList[socketID];
        
        io.sockets.emit("newTyping", {
            typing: typingList
        });
        io.sockets.emit("onlineUsers", {
            users: usernameList
        });
    }
}