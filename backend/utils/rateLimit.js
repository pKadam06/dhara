function createRateLimit({ windowMs, max, keyFn }) {
    const hits = new Map();

    return (req, res, next) => {
        const now = Date.now();
        const key = keyFn(req);
        const recent = (hits.get(key) || []).filter((time) => now - time < windowMs);

        if (recent.length >= max) {
            return res.status(429).json({
                success: false,
                message: "Too many requests. Please wait and try again."
            });
        }

        recent.push(now);
        hits.set(key, recent);

        if (hits.size > 5000) {
            for (const [entryKey, times] of hits) {
                if (times.every((time) => now - time >= windowMs)) hits.delete(entryKey);
            }
        }

        next();
    };
}

function clientKey(req) {
    return req.ip || req.socket?.remoteAddress || "unknown";
}

module.exports = { createRateLimit, clientKey };
