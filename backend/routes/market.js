const express = require("express");
const crypto = require("node:crypto");
const router = express.Router();

const RESOURCE = "9ef84268-d588-465a-a308-a864a43d0070";
const SAMPLE_KEY = "579b464db66ec23bdd000001cdd3946e44ce4aad7209ff7b23ac571b";
const REFRESH_MS = 60 * 1000;
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

async function fetchRecords() {
    if (cachedRecords && Date.now() - cachedAt < REFRESH_MS) {
        return { records: cachedRecords, stale: false };
    }

    const params = new URLSearchParams({
        "api-key": apiKey(),
        format: "json",
        limit: "40"
    });

    const response = await fetch(`https://api.data.gov.in/resource/${RESOURCE}?${params}`);
    const data = await response.json().catch(() => ({}));

    if ((response.status === 429 || data.error) && cachedRecords) {
        return { records: cachedRecords, stale: true };
    }

    if (!response.ok || data.error) {
        const error = new Error(
            response.status === 429
                ? "Market data is busy right now. Try again in a few minutes."
                : "Market price service failed"
        );
        error.status = response.status === 429 ? 429 : 502;
        throw error;
    }

    const records = Array.isArray(data.records) ? data.records : [];
    if (records.length) {
        cachedRecords = records;
        cachedAt = Date.now();
        sourceUpdated = data.updated_date || null;
    }
    return { records, stale: false };
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
        console.error("MARKET ERROR:", error.message);
        res.status(error.status || 500).json({
            success: false,
            message: error.status ? error.message : "Could not load market prices."
        });
    }
});

module.exports = router;
