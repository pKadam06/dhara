const express = require("express");
const requireAuth = require("../middleware/authMiddleware");
const { createRateLimit } = require("../utils/rateLimit");

const router = express.Router();
const aiLimit = createRateLimit({
    windowMs: 10 * 60 * 1000,
    max: 20,
    keyFn: (req) => req.user?.id || req.ip || "unknown"
});

router.use(requireAuth);
router.use(aiLimit);

function getGeminiKey() {
    const key = process.env.GEMINI_API_KEY?.trim();
    return key && key.length > 10 ? key : null;
}

const MODELS = [
    "gemini-3.8-flash",
    "gemini-3.5-flash",
    "gemini-flash-latest",
    process.env.GEMINI_MODEL,
    "gemini-3.5-flash-lite"
].filter((model, index, models) => model && models.indexOf(model) === index);

async function callGemini(model, apiKey, body) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;
    const response = await fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "x-goog-api-key": apiKey
        },
        body: JSON.stringify(body)
    });
    const data = await response.json();
    return { ok: response.ok, status: response.status, data };
}

async function tryModels(apiKey, body) {
    let lastError = "AI request failed";
    for (const model of MODELS) {
        for (let attempt = 1; attempt <= 2; attempt++) {
            try {
                const result = await callGemini(model, apiKey, body);
                if (result.ok) {
                    const text = result.data.candidates?.[0]?.content?.parts?.[0]?.text;
                    if (text) return { success: true, answer: text, model };
                }
                lastError = result.data.error?.message || lastError;
                if ([400, 401, 403].includes(result.status) && /api key|credential|permission|unauthorized/i.test(lastError)) {
                    return {
                        success: false,
                        status: 503,
                        message: "Gemini rejected the API key. Replace GEMINI_API_KEY in backend/.env with a valid Google AI Studio key, then restart the backend."
                    };
                }
                if (result.status === 404 || /no longer available|not found|not supported/i.test(lastError)) {
                    break;
                }
                if (result.status === 429 || result.status === 503 || /high demand|unavailable|overloaded|quota/i.test(lastError)) {
                    console.log(`Gemini ${model} busy:`, lastError);
                    break;
                }
                break;
            } catch (err) {
                lastError = err.message;
            }
        }
    }
    return { success: false, message: lastError };
}

// AI Chat
router.post("/chat", async (req, res) => {
    try {
        const question = String(req.body.question || "");
        if (!question.trim()) {
            return res.status(400).json({ success: false, message: "Please enter a question." });
        }
        if (question.length > 4000) {
            return res.status(400).json({ success: false, message: "That question is too long." });
        }
        const apiKey = getGeminiKey();
        if (!apiKey) {
            return res.status(503).json({ success: false, message: "AI not configured." });
        }

        const body = {
            system_instruction: {
                parts: [{ text: "You are DHARA, a helpful farming assistant for Indian farmers. Answer clearly and simply in short, practical points about crops, soil, weather, fertilizers, irrigation, and pest control." }]
            },
            contents: [{ role: "user", parts: [{ text: question }] }]
        };

        const result = await tryModels(apiKey, body);
        if (result.success) {
            return res.json({ success: true, answer: result.answer });
        }
        res.status(result.status || 502).json({ success: false, message: result.message });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Disease Detection
router.post("/disease", async (req, res) => {
    try {
        const { image, mimeType } = req.body;
        if (!image) return res.status(400).json({ success: false, message: "No image provided." });
        if (!/^image\/(jpeg|png|webp)$/.test(mimeType || "")) {
            return res.status(400).json({ success: false, message: "Use a JPG, PNG, or WebP crop image." });
        }
        if (!/^[A-Za-z0-9+/]+={0,2}$/.test(image)) {
            return res.status(400).json({ success: false, message: "The image data is invalid." });
        }
        if (image.length > 8 * 1024 * 1024) {
            return res.status(413).json({ success: false, message: "Image is too large." });
        }

        const apiKey = getGeminiKey();
        if (!apiKey) return res.status(503).json({ success: false, message: "AI not configured." });

        const body = {
            contents: [{
                parts: [
                    { text: "You are a plant pathology expert helping an Indian farmer. Look at this crop/leaf image and respond in short, clear points with these headings: **Plant**, **Disease**, **Confidence**, **Symptoms**, **Treatment**. Keep it brief and practical." },
                    { inline_data: { mime_type: mimeType || "image/jpeg", data: image } }
                ]
            }]
        };

        const result = await tryModels(apiKey, body);
        if (result.success) {
            return res.json({ success: true, answer: result.answer });
        }
        res.status(result.status || 502).json({ success: false, message: result.message });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;