/**
 * @description Returns the current time neatly formated
 * @returns {string} Time-string with format 'dd.mm.yyyy hh:mm:ss' 
 */
exports.getTime = function() {
    let today = new Date();
    let dd = String(today.getDate()).padStart(2, '0');
    let mm = String(today.getMonth() + 1).padStart(2, '0');
    let yyyy = String(today.getFullYear());
    let mimi = String(today.getMinutes()).padStart(2, '0');
    let hh = String(today.getHours()).padStart(2, '0');
    let ss = String(today.getSeconds()).padStart(2, '0');

    return today = dd + '.' + mm + '.' + yyyy + " " + hh + ":" + mimi + ":" + ss;
}