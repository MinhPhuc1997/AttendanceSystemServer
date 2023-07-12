
function writeLogin(timestart, timelate) {
    if (timestart == '') { return false }
    return (convertTimeToMinutes(timestart) > convertTimeToMinutes(timelate))
}
exports.system = {
    writeLogin,
};