const express = require("express");
const crypto = require("node:crypto");
const dns = require("node:dns");
const https = require("node:https");
const axios = require("axios");
const router = express.Router();

dns.setDefaultResultOrder("ipv4first");
const ipv4Agent = new https.Agent({ family: 4, keepAlive: true });

const RESOURCE = "9ef84268-d588-465a-a308-a864a43d0070";
const SAMPLE_KEY = "579b464db66ec23bdd000001cdd3946e44ce4aad7209ff7b23ac571b";
const REFRESH_MS = 5 * 60 * 1000;
const MANDI_STATES = ["Maharashtra", "Uttar Pradesh", "Punjab", "Madhya Pradesh", "Karnataka"];
let cachedRecords = null;
let cachedAt = 0;
let sourceUpdated = null;

function apiKey() {
    return process.env.DATA_GOV_KEY?.trim() || SAMPLE_KEY;
}

function revisionOf(records) {
    const body = records.map((item) => [
        item.state,
        item.district,
        item.market,
        item.commodity,
        item.variety,
        item.arrival_date,
        item.min_price,
        item.max_price,
        item.modal_price
    ].join("|")).join("\n");
    return crypto.createHash("sha1").update(body).digest("hex").slice(0, 12);
}

function remember(records, updated) {
    if (!records.length) return;
    cachedRecords = mixRecords(records);
    cachedAt = Date.now();
    sourceUpdated = updated || null;
}

function mixRecords(records) {
    const groups = new Map();
    for (const item of records) {
        const key = item.state || "Other";
        if (!groups.has(key)) groups.set(key, []);
        groups.get(key).push(item);
    }
    const mixed = [];
    const lists = [...groups.values()];
    let pending = true;
    while (pending) {
        pending = false;
        for (const list of lists) {
            if (list.length) {
                mixed.push(list.shift());
                pending = true;
            }
        }
    }
    return mixed;
}

function normalizeMandi(item) {
    return {
        state: item.state,
        district: item.district,
        market: String(item.market || "").trim(),
        commodity: item.commodity,
        variety: item.variety,
        arrival_date: item.arrival_date,
        min_price: item.min_price,
        max_price: item.max_price,
        modal_price: item.modal_price
    };
}

async function fetchOfficial() {
    const response = await axios.get(`https://api.data.gov.in/resource/${RESOURCE}`, {
        params: {
            "api-key": apiKey(),
            format: "json",
            limit: "40"
        },
        timeout: 8000,
        httpsAgent: ipv4Agent,
        headers: {
            Accept: "application/json",
            "User-Agent": "DHARA/1.0"
        },
        validateStatus: () => true
    });
    const data = response.data && typeof response.data === "object" ? response.data : {};
    if (response.status >= 400 || data.error || !Array.isArray(data.records) || !data.records.length) {
        const error = new Error(response.status === 429 ? "busy" : "official-unavailable");
        error.status = response.status;
        throw error;
    }
    return { records: data.records, updated: data.updated_date || null };
}

async function fetchMandi() {
    const batches = await Promise.all(MANDI_STATES.map(async (state) => {
        const response = await axios.get("https://mandi-api.onrender.com/v1/prices", {
            params: { state },
            timeout: 30000,
            headers: { Accept: "application/json", "User-Agent": "DHARA/1.0" },
            validateStatus: () => true
        });
        const rows = response.data?.data;
        if (response.status >= 400 || !Array.isArray(rows)) return [];
        return rows.map(normalizeMandi);
    }));
    const records = batches.flat();
    return { records, updated: records.find((item) => item.arrival_date)?.arrival_date || null };
}

async function fetchRecords() {
    if (cachedRecords && Date.now() - cachedAt < REFRESH_MS) {
        return { records: cachedRecords, stale: false };
    }

    try {
        const official = await fetchOfficial();
        remember(official.records, official.updated);
        return { records: cachedRecords, stale: false };
    } catch (officialError) {
        try {
            const mandi = await fetchMandi();
            if (mandi.records.length) {
                remember(mandi.records, mandi.updated);
                return { records: cachedRecords, stale: false };
            }
        } catch (error) {
            console.error("MARKET FALLBACK:", error.code || error.message);
        }

        if (cachedRecords) {
            return { records: cachedRecords, stale: true };
        }

        const wrapped = new Error(
            officialError.status === 429
                ? "Market data is busy right now. Try again in a few minutes."
                : "Market price service failed"
        );
        wrapped.status = officialError.status === 429 ? 429 : 502;
        wrapped.code = officialError.code || officialError.message;
        throw wrapped;
    }
}

router.get("/", async (req, res) => {
    try {
        const commodity = (req.query.commodity || req.query.q || "").trim().toLowerCase();
        const state = (req.query.state || "").trim().toLowerCase();
        const fetched = await fetchRecords();
        let records = fetched.records;

        if (state) {
            records = records.filter((item) => String(item.state || "").toLowerCase().includes(state));
        }

        if (commodity) {
            records = records.filter((item) => {
                const haystack = [
                    item.commodity,
                    item.variety,
                    item.market,
                    item.state,
                    item.district
                ].join(" ").toLowerCase();
                return haystack.includes(commodity);
            });
        }

        const visible = records.slice(0, 40);
        res.json({
            success: true,
            records: visible,
            revision: revisionOf(visible),
            updatedAt: cachedAt ? new Date(cachedAt).toISOString() : null,
            sourceUpdated,
            stale: fetched.stale
        });
    } catch (error) {
        console.error("MARKET ERROR:", error.code || error.message);
        res.status(error.status || 500).json({
            success: false,
            message: error.status ? error.message : "Could not load market prices."
        });
    }
});

module.exports = router;
