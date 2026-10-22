require("dotenv").config({ quiet: true });

const nodemailer = require("nodemailer");

const user = process.env.EMAIL_USER;
const pass = process.env.EMAIL_PASS;

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user, pass }
});

if (user && pass) {
    transporter.verify()
        .then(() => console.log("Mail server ready"))
        .catch((error) => console.warn("Mail server is not ready:", error.message));
} else {
    console.warn("Email OTP is not configured. Set EMAIL_USER and EMAIL_PASS.");
}

module.exports = transporter;
