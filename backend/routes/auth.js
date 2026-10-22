const express = require("express");
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("node:crypto");
const User = require("../models/user");

const { createRateLimit, clientKey } = require("../utils/rateLimit");

const router = express.Router();
const authLimit = createRateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    keyFn: clientKey
});
const googleCredentialsConfigured = Boolean(
    process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
);

if (googleCredentialsConfigured) {
    passport.use(new GoogleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL
            || `http://localhost:${process.env.PORT || 5000}/api/auth/google/callback`
    }, (accessToken, refreshToken, profile, done) => done(null, profile)));
}

function loginPageUrl(req) {
    // Prefer explicit FRONTEND_URL so Live Server (5501) gets the redirect
    const frontendUrl = process.env.FRONTEND_URL
        || (req.get("host")?.includes("5000") ? "http://127.0.0.1:5501" : `${req.protocol}://${req.get("host")}`);
    return new URL("/login.html", frontendUrl);
}

function redirectWithGoogleError(req, res, message) {
    const loginUrl = loginPageUrl(req);
    loginUrl.hash = new URLSearchParams({ google_error: message }).toString();
    res.redirect(loginUrl.toString());
}

router.get("/google", (req, res, next) => {
    if (!googleCredentialsConfigured) {
        return res.status(503).send(
            "Google sign-in is not configured. Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in the backend environment."
        );
    }

    passport.authenticate("google", { scope: ["profile", "email"] })(req, res, next);
});

router.get("/google/callback", (req, res, next) => {
    if (!googleCredentialsConfigured) {
        return res.status(503).send("Google sign-in is not configured.");
    }

    passport.authenticate("google", { session: false }, async (error, profile) => {
        if (error || !profile) {
            return redirectWithGoogleError(req, res, "Google sign-in failed. Please try again.");
        }

        try {
            const email = profile.emails?.[0]?.value?.trim().toLowerCase();
            if (!email) {
                return redirectWithGoogleError(req, res, "Google did not provide an email address.");
            }

            let user = await User.findOne({ email });
            if (!user) {
                const fullName = profile.displayName?.trim() || email.split("@")[0];
                const password = await bcrypt.hash(crypto.randomBytes(32).toString("hex"), 10);
                user = await User.create({ fullName, email, password });
            }

            if (!process.env.JWT_SECRET) {
                throw new Error("JWT_SECRET is not configured");
            }

            const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });
            const userData = {
                id: user._id,
                fullName: user.fullName,
                email: user.email,
                phone: user.phone,
                state: user.state,
                district: user.district,
                village: user.village
            };
            const loginUrl = loginPageUrl(req);
            loginUrl.hash = new URLSearchParams({
                google_token: token,
                google_user: JSON.stringify(userData)
            }).toString();
            res.redirect(loginUrl.toString());
        } catch (callbackError) {
            console.error("Google sign-in callback failed:", callbackError.message);
            redirectWithGoogleError(req, res, "Google sign-in could not be completed. Please try again.");
        }
    })(req, res, next);
});

const {
    register,
    login
} = require("../controllers/authController");

router.post("/register", authLimit, register);

router.post("/login", authLimit, login);

module.exports = router;