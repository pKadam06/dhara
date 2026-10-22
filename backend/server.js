const express = require("express");
const cors = require("cors");
const session = require("express-session");
const passport = require("passport");
const crypto = require("node:crypto");
const path = require("node:path");
const mongoose = require("mongoose");
require("dotenv").config({ quiet: true });

const connectDB = require("./config/db");
const { startSensorListener } = require("./utils/sensorSerial");
const { createRateLimit, clientKey } = require("./utils/rateLimit");
const aiRoutes = require("./routes/ai");
const authRoutes = require("./routes/auth");
const otpRoutes = require("./routes/otpRoutes");
const sensorRoutes = require("./routes/sensor");
const marketRoutes = require("./routes/market");
const weatherRoutes = require("./routes/weather");

const app = express();
const isProduction = process.env.NODE_ENV === "production";

app.disable("x-powered-by");
app.set("trust proxy", 1);

if (isProduction) {
    const secret = process.env.JWT_SECRET || "";
    if (secret.length < 32) {
        console.error("Production requires JWT_SECRET with at least 32 characters.");
        process.exit(1);
    }
    if (!process.env.MONGO_URI) {
        console.error("Production requires MONGO_URI.");
        process.exit(1);
    }
    if (!process.env.FRONTEND_URL) {
        console.error("Production requires FRONTEND_URL so Google sign-in can return to the site.");
        process.exit(1);
    }
}

const allowedOrigins = new Set(
    [process.env.FRONTEND_URL, ...(process.env.CORS_ORIGINS || "http://localhost:5000").split(",")]
        .map((origin) => origin?.trim())
        .filter(Boolean)
);

app.use((req, res, next) => {
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("Referrer-Policy", "no-referrer");
    res.setHeader("X-Frame-Options", "SAMEORIGIN");
    next();
});

app.use(cors({
    origin(origin, callback) {
        if (!origin) return callback(null, true);
        if (!isProduction && /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) {
            return callback(null, true);
        }
        callback(null, allowedOrigins.has(origin));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json({ limit: "8mb" }));
app.use(session({
    secret: process.env.SESSION_SECRET || process.env.JWT_SECRET || crypto.randomBytes(32).toString("hex"),
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        sameSite: "lax",
        secure: isProduction
    }
}));
app.use(passport.initialize());

const weatherLimit = createRateLimit({ windowMs: 60 * 1000, max: 60, keyFn: clientKey });
const marketLimit = createRateLimit({ windowMs: 60 * 1000, max: 30, keyFn: clientKey });

app.get("/api/health", (req, res) => {
    res.json({
        success: true,
        database: mongoose.connection.readyState === 1 ? "connected" : "unavailable"
    });
});

app.use("/api/ai", aiRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/otp", otpRoutes);
app.use("/api/sensor", sensorRoutes);
app.use("/api/market", marketLimit, marketRoutes);
app.use("/api/weather", weatherLimit, weatherRoutes);

app.use("/api", (req, res) => {
    res.status(404).json({ success: false, message: "Not found" });
});

const hiddenPrefixes = ["/backend", "/node_modules", "/.vscode", "/.git"];
app.use((req, res, next) => {
    const requestPath = req.path.toLowerCase();
    if (hiddenPrefixes.some((prefix) => requestPath === prefix || requestPath.startsWith(`${prefix}/`))) {
        return res.status(404).end();
    }
    next();
});

app.use(express.static(path.join(__dirname, ".."), {
    dotfiles: "deny",
    index: "index.html"
}));

const port = Number(process.env.PORT) || 5000;

async function startServer() {
    try {
        await connectDB();
    } catch (error) {
        console.warn("MongoDB is unavailable. Sign-in and registration stay offline until it connects.");
        console.warn(error.message);
    }

    try {
        startSensorListener();
    } catch (error) {
        console.warn("Sensor listener did not start:", error.message);
    }

    app.listen(port, () => {
        console.log(`Server running on http://localhost:${port}`);
    });
}

startServer().catch((error) => {
    console.error("Unable to start server:", error.message);
    process.exit(1);
});
