require("dotenv").config({ quiet: true });

const nodemailer = require("nodemailer");

const user = process.env.EMAIL_USER;
const pass = process.env.EMAIL_PASS;

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user, pass },
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 15000
});

let senderAddress = null;

function canUseGmailApi() {
    return Boolean(
        process.env.GOOGLE_REFRESH_TOKEN
        && process.env.GOOGLE_CLIENT_ID
        && process.env.GOOGLE_CLIENT_SECRET
    );
}

async function gmailAccessToken() {
    const body = new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
        grant_type: "refresh_token"
    });
    const response = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok || !data.access_token) {
        throw new Error("Gmail authorization failed");
    }
    return data.access_token;
}

async function senderFromToken(accessToken) {
    if (senderAddress) return senderAddress;
    const response = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
        headers: { Authorization: `Bearer ${accessToken}` }
    });
    const data = await response.json().catch(() => ({}));
    senderAddress = data.email || user;
    return senderAddress;
}

async function sendViaGmailApi({ to, subject, text }) {
    const accessToken = await gmailAccessToken();
    const from = await senderFromToken(accessToken);
    const raw = Buffer.from([
        `From: DHARA <${from}>`,
        `To: ${to}`,
        `Subject: ${subject}`,
        "MIME-Version: 1.0",
        "Content-Type: text/plain; charset=utf-8",
        "",
        text
    ].join("\r\n")).toString("base64url");

    const response = await fetch("https://gmail.googleapis.com/gmail/v1/users/me/messages/send", {
        method: "POST",
        headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ raw })
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
        const message = data.error?.message || "Gmail could not send the message";
        console.error("Gmail API:", response.status, message);
        throw new Error(message);
    }
    return { messageId: data.id };
}

async function sendViaWebhook({ to, subject, text }) {
    const query = new URLSearchParams({
        secret: process.env.MAIL_WEBHOOK_SECRET,
        to,
        subject,
        text
    });
    const response = await fetch(`${process.env.MAIL_WEBHOOK_URL}?${query}`);
    const body = (await response.text()).trim();
    if (!response.ok || body !== "ok") {
        console.error("Mail relay status:", response.status);
        throw new Error("Could not send the OTP email");
    }
    return { messageId: "mail-relay" };
}

async function sendMail(message) {
    if (process.env.MAIL_WEBHOOK_URL && process.env.MAIL_WEBHOOK_SECRET) {
        return sendViaWebhook(message);
    }
    if (canUseGmailApi()) {
        return sendViaGmailApi(message);
    }
    return transporter.sendMail(message);
}

if (
    !process.env.MAIL_WEBHOOK_URL
    && !canUseGmailApi()
    && user
    && pass
    && process.env.NODE_ENV !== "production"
) {
    transporter.verify()
        .then(() => console.log("Mail server ready"))
        .catch((error) => console.warn("Mail server is not ready:", error.message));
} else if (!canUseGmailApi() && (!user || !pass)) {
    console.warn("Email OTP is not configured. Set EMAIL_USER and EMAIL_PASS.");
}

module.exports = transporter;
module.exports.sendMail = sendMail;
