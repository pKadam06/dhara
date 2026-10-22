const express = require("express");
const { createRateLimit, clientKey } = require("../utils/rateLimit");
const { sendOTP, verifyOTP } = require("../controllers/otpController");

const router = express.Router();
const sendLimit = createRateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    keyFn: (req) => `${clientKey(req)}:${String(req.body?.email || "").toLowerCase()}`
});
const verifyLimit = createRateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    keyFn: clientKey
});

router.post("/send", sendLimit, sendOTP);
router.post("/verify", verifyLimit, verifyOTP);



module.exports= router;