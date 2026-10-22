const express = require("express");
const router = express.Router();
const { getLatestReading, getHardwareStatus } = require("../utils/sensorSerial");

router.get("/latest", (req, res) => {
    res.json({ success: true, reading: getLatestReading(), hardware: getHardwareStatus() });
});

module.exports = router;