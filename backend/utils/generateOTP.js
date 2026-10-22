const crypto = require("node:crypto");

function generateOTP() {
    return crypto.randomInt(100000, 1000000).toString();
}

module.exports = generateOTP;
