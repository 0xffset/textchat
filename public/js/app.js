const socket = io.connect('localhost:3330'); //? Connect to mother socket

//? Submits data to the server
const uname = sessionStorage.getItem("username");
const colorName = sessionStorage.getItem("color");
sessionStorage.removeItem("username");
sessionStorage.removeItem("color");
//? Emits the new client information to the server
socket.emit("clientInformation", {
    name: uname,
    color: colorName
});

const inputBox = document.getElementsByClassName("input")[0];

//? "Press enter to send message"
document.getElementsByTagName("input")[0].addEventListener("keyup", function (event) {
    if (event.keyCode === 13) {
        event.preventDefault();
        if (inputBox.value != "")
            socket.emit("message", {
                time: getTime(),
                message: inputBox.value
            });
        inputBox.value = "";
    }
});

//? Creates the messages
socket.on("newMessage", function (data) {
    createMessage(data.name, data.color, data.message);
    window.scrollTo(0, document.body.scrollHeight);
});

//? Typing stuff idk
inputBox.addEventListener("input", () => {
    if (inputBox.value !== "")
        socket.emit("typing");
    else
        socket.emit("notTyping");
});

socket.on("newTyping", function (data) {
    newTyping(socket.id, data);
});
//? -----------------------------------------

//? Gets all available messages and creates them
socket.on("loadAll", function (data) {
    let returnLength = Object.keys(data.query).length;
    for (let i = 0; i < returnLength; i++) {
        createMessage(data.query[i].user, data.query[i].farbe, data.query[i].message);
    }
    window.scrollTo(0, document.body.scrollHeight);

});

//? Manipulates the online user list
socket.on("onlineUsers", function (data) {
    setOnlineUsers(data);
});