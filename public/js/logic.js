/**
 * @description Refreshes the online users list on the webpage
 * @param {Object} data Object containing objects with names and according colors
 * @param {Object} data.users
 * @param {Object} data.users.object Different objects containing the data
 * @param {string} data.users.object.name Name 
 * @param {string} data.users.object.color Color
 */
function setOnlineUsers(data) {
    while (document.getElementById("displayUsersOnline").firstChild) {
        document.getElementById("displayUsersOnline").removeChild(document.getElementById("displayUsersOnline").firstChild);
    }

    let returnKeys = Object.keys(data.users);

    returnKeys.forEach(function(value) {
        let nameP = document.createElement("p");
        nameP.textContent = data.users[value].name;
        nameP.classList.add("displayUsers");
        nameP.style.color = data.users[value].color;
        document.getElementById("displayUsersOnline").appendChild(nameP);
    });
}

/**
 * @description Shows underneath the chat box who currently types
 * @param {string} socketID Socket.id of the client
 * @param {Object} data Contains object(s) with the name(s)
 * @param {Object} data.typing 
 * @param {Object} data.typing.Object Contains the name
 * @param {string} data.typing.Object.name Name
 */
function newTyping(socketID, data) {
    let nameList = [];
    document.getElementById("typing").textContent = "";

    if (data.typing[socketID] !== undefined)
        delete data.typing[socketID];

    if (Object.keys(data.typing).length === 1)
        document.getElementById("typing").textContent = data.typing[Object.keys(data.typing)[0]].name + " is typing...";
    else if (Object.keys(data.typing).length > 1) {
        for (const key in data.typing) {
            nameList.push(data.typing[key].name);
        }
        document.getElementById("typing").textContent = nameList.join(", ") + " are typing...";
    }
}

/**
 * @description Builds the message div construct
 * @param {string} pName Name of the sender
 * @param {string} pColor Color of the name
 * @param {string} pMessage Message value
 */
const createMessage = (pName, pColor, pMessage) => {
    const divM = document.createElement("div");
    divM.classList.add("message");
    document.getElementById("chat").insertBefore(divM, document.getElementsByClassName("spaceHolder")[0]); 

    // Beinhaltet die Nachricht und Versendername
    const wrapper = document.createElement("div");
    wrapper.classList.add("wrapper");

    // Beinhaltet den Versendername
    const name = document.createElement("p");
    name.classList.add("name");
    name.textContent = pName;
    name.style.color = pColor;

    // Beinhaltet die Nachricht
    const nachricht = document.createElement("p");
    nachricht.textContent = pMessage;
    nachricht.classList.add("nachricht");

    const divider = document.createElement("hr");

    // Nachricht bauen
    divM.appendChild(wrapper);
    wrapper.appendChild(name);
    wrapper.appendChild(nachricht);
    divM.appendChild(divider);
}

/**
 * @description Returns the current time neatly formated
 * @returns {string} Time-string with format 'dd.mm.yyyy hh:mm:ss' 
 */
const getTime = () => {
    let today = new Date();
    let dd = String(today.getDate()).padStart(2, '0');
    let mm = String(today.getMonth() + 1).padStart(2, '0');
    let yyyy = String(today.getFullYear());
    let mimi = String(today.getMinutes()).padStart(2, '0');
    let hh = String(today.getHours()).padStart(2, '0');
    let ss = String(today.getSeconds()).padStart(2, '0');

    return today = dd + '.' + mm + '.' + yyyy + " " + hh + ":" + mimi + ":" + ss;
}