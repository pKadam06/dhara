const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const Otp = require("../models/Otp");
const generateOTP = require("../utils/generateOTP");
const { sendMail } = require("../config/mail");
const { otpHash, safeEqual } = require("../utils/security");

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function databaseReady(res) {
    if (mongoose.connection.readyState === 1) return true;
    res.status(503).json({
        success: false,
        message: "Database is unavailable. Try again shortly."
    });
    return false;
}

exports.sendOTP = async (req, res) => {
    try {
        if (!databaseReady(res)) return;

        const normalizedEmail = req.body.email?.trim().toLowerCase();
        if (!normalizedEmail || !EMAIL_PATTERN.test(normalizedEmail)) {
            return res.status(400).json({ success: false, message: "Enter a valid email address" });
        }

        if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS || !process.env.JWT_SECRET) {
            return res.status(503).json({
                success: false,
                message: "Email verification is not configured."
            });
        }

        const otp = generateOTP();
        await Otp.findOneAndDelete({ email: normalizedEmail });
        await Otp.create({
            email: normalizedEmail,
            otp: otpHash(normalizedEmail, otp),
            attempts: 0
        });

        const info = await sendMail({
            from: `"DHARA" <${process.env.EMAIL_USER}>`,
            to: normalizedEmail,
            subject: "DHARA Email Verification OTP",
            text: `Your DHARA verification OTP is ${otp}. It expires in 5 minutes.`
        });

        console.log("OTP email sent:", info.messageId);
        res.json({
            success: true,
            message: "OTP sent successfully"
        });
    } catch (error) {
        console.error("OTP email failed:", error.message);
        res.status(500).json({
            success: false,
            message: "Could not send the OTP. Check the email address and try again."
        });
    }
};

exports.verifyOTP = async (req, res) => {
    try {
        if (!databaseReady(res)) return;

        const email = req.body.email?.trim().toLowerCase();
        const otp = req.body.otp?.trim();

        if (!email || !otp) {
            return res.status(400).json({ success: false, message: "Email and OTP are required" });
        }

        if (!process.env.JWT_SECRET) {
            return res.status(503).json({ success: false, message: "Email verification is not configured." });
        }

        const data = await Otp.findOne({ email });
        if (!data) {
            return res.status(400).json({ success: false, message: "Invalid or expired OTP" });
        }

        if (data.attempts >= 5) {
            await Otp.deleteOne({ email });
            return res.status(429).json({
                success: false,
                message: "Too many incorrect attempts. Request a new OTP."
            });
        }

        if (!safeEqual(data.otp, otpHash(email, otp))) {
            data.attempts += 1;
            await data.save();
            return res.status(400).json({ success: false, message: "Invalid or expired OTP" });
        }

        await Otp.deleteOne({ email });
        const verificationToken = jwt.sign(
            { email, purpose: "email-verify" },
            process.env.JWT_SECRET,
            { expiresIn: "15m" }
        );

        res.json({
            success: true,
            message: "OTP verified",
            verificationToken
        });
    } catch (error) {
        console.error("OTP verification failed:", error.message);
        res.status(500).json({
            success: false,
            message: "Could not verify the OTP. Please try again."
        });
    }
};
