const mongoose = require("mongoose");
const User = require("../models/user");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function databaseReady(res) {
    if (mongoose.connection.readyState === 1) return true;
    res.status(503).json({
        success: false,
        message: "Database is unavailable. Try again shortly."
    });
    return false;
}

function publicFailure(res, error, fallback) {
    console.error(fallback, error.message);
    res.status(500).json({ success: false, message: fallback });
}

exports.register = async (req, res) => {
    try {
        if (!databaseReady(res)) return;

        const { fullName, email, password, phone, state, district, village, verificationToken } = req.body;
        const normalizedEmail = email?.trim().toLowerCase();
        const normalizedName = fullName?.trim();

        if (!normalizedName || !normalizedEmail || !password) {
            return res.status(400).json({
                success: false,
                message: "Full name, email, and password are required"
            });
        }

        if (!EMAIL_PATTERN.test(normalizedEmail)) {
            return res.status(400).json({ success: false, message: "Enter a valid email address" });
        }

        if (String(password).length < 8) {
            return res.status(400).json({
                success: false,
                message: "Password must be at least 8 characters"
            });
        }

        if (phone && !/^\d{10}$/.test(String(phone).trim())) {
            return res.status(400).json({
                success: false,
                message: "Enter a 10-digit phone number"
            });
        }

        if (!process.env.JWT_SECRET) {
            return res.status(503).json({ success: false, message: "Sign-up is not configured." });
        }

        let verifiedEmail;
        try {
            const payload = jwt.verify(verificationToken, process.env.JWT_SECRET);
            verifiedEmail = payload.email;
            if (payload.purpose !== "email-verify" || verifiedEmail !== normalizedEmail) {
                throw new Error("mismatch");
            }
        } catch {
            return res.status(400).json({
                success: false,
                message: "Verify the email OTP before creating an account"
            });
        }

        const userExists = await User.findOne({ email: normalizedEmail });
        if (userExists) {
            return res.status(400).json({
                success: false,
                message: "User already exists"
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await User.create({
            fullName: normalizedName,
            email: normalizedEmail,
            password: hashedPassword,
            phone: phone?.trim(),
            state: state?.trim(),
            district: district?.trim(),
            village: village?.trim()
        });

        res.status(201).json({
            success: true,
            message: "Registration Successful",
            user: {
                id: user._id,
                fullName: user.fullName,
                email: user.email,
                phone: user.phone,
                state: user.state,
                district: user.district,
                village: user.village
            }
        });
    } catch (error) {
        if (error?.code === 11000) {
            return res.status(400).json({ success: false, message: "User already exists" });
        }
        publicFailure(res, error, "Registration failed. Please try again.");
    }
};

exports.login = async (req, res) => {
    try {
        if (!databaseReady(res)) return;

        const { email, password } = req.body;
        const normalizedEmail = email?.trim().toLowerCase();

        if (!normalizedEmail || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required"
            });
        }

        const user = await User.findOne({ email: normalizedEmail });
        const match = user?.password
            ? await bcrypt.compare(password, user.password)
            : false;

        if (!user || !match) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });
        }

        if (!process.env.JWT_SECRET) {
            return res.status(503).json({ success: false, message: "Sign-in is not configured." });
        }

        const token = jwt.sign(
            { id: user._id },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        res.json({
            success: true,
            message: "Login Successful",
            token,
            user: {
                id: user._id,
                fullName: user.fullName,
                email: user.email,
                phone: user.phone,
                state: user.state,
                district: user.district,
                village: user.village
            }
        });
    } catch (error) {
        publicFailure(res, error, "Login failed. Please try again.");
    }
};
