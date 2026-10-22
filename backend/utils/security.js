const crypto = require("node:crypto");

function otpHash(email, otp) {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
        throw new Error("JWT_SECRET is not configured");
    }

    return crypto
        .createHmac("sha256", secret)
        .update(`${email}:${otp}`)
        .digest("hex");
}

function safeEqual(leftValue, rightValue) {
    const left = Buffer.from(String(leftValue));
    const right = Buffer.from(String(rightValue));
    if (left.length !== right.length) return false;
    return crypto.timingSafeEqual(left, right);
}

module.exports = { otpHash, safeEqual };
