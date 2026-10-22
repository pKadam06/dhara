const express = require("express");

const router = express.Router();
const cache = new Map();
const CACHE_MS = 10 * 60 * 1000;

function coordinates(req, res) {
    const lat = Number(req.query.lat);
    const lon = Number(req.query.lon);

    if (!Number.isFinite(lat) || !Number.isFinite(lon) || lat < -90 || lat > 90 || lon < -180 || lon > 180) {
        res.status(400).json({ success: false, message: "A valid location is required." });
        return null;
    }

    return { lat, lon };
}

async function openWeather(kind, lat, lon) {
    const apiKey = process.env.OPENWEATHER_API_KEY?.trim();
    if (!apiKey) {
        return {
            status: 503,
            body: { success: false, message: "Weather is not configured. Set OPENWEATHER_API_KEY." }
        };
    }

    const cacheKey = `${kind}:${lat.toFixed(2)}:${lon.toFixed(2)}`;
    const cached = cache.get(cacheKey);
    if (cached && Date.now() - cached.savedAt < CACHE_MS) {
        return { status: 200, body: cached.body };
    }

    const endpoint = kind === "forecast" ? "forecast" : "weather";
    const url = `https://api.openweathermap.org/data/2.5/${endpoint}?lat=${lat}&lon=${lon}&appid=${encodeURIComponent(apiKey)}&units=metric`;
    const response = await fetch(url);
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
        return {
            status: response.status === 401 ? 503 : 502,
            body: { success: false, message: "Weather data is unavailable right now." }
        };
    }

    cache.set(cacheKey, { savedAt: Date.now(), body: data });
    return { status: 200, body: data };
}

router.get("/current", async (req, res) => {
    const coords = coordinates(req, res);
    if (!coords) return;

    try {
        const result = await openWeather("current", coords.lat, coords.lon);
        res.status(result.status).json(result.body);
    } catch (error) {
        console.error("Weather request failed:", error.message);
        res.status(502).json({ success: false, message: "Weather data is unavailable right now." });
    }
});

router.get("/forecast", async (req, res) => {
    const coords = coordinates(req, res);
    if (!coords) return;

    try {
        const result = await openWeather("forecast", coords.lat, coords.lon);
        res.status(result.status).json(result.body);
    } catch (error) {
        console.error("Forecast request failed:", error.message);
        res.status(502).json({ success: false, message: "Weather data is unavailable right now." });
    }
});

module.exports = router;
