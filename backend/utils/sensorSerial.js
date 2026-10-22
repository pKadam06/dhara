const BAUD_RATE = 9600;
const SCAN_MS = 4000;

let latestReading = { n: null, p: null, k: null, ph: null, updatedAt: null, connected: false };
let hardware = {
    state: "searching",
    port: null,
    message: "Looking for the soil sensor."
};
let activePort = null;
let scanTimer = null;
let demoTimer = null;
let started = false;

function clearReading() {
    latestReading = { n: null, p: null, k: null, ph: null, updatedAt: null, connected: false };
}

function setHardware(state, port, message) {
    hardware = { state, port, message };
}

function saveReading(n, p, k, ph = null, source = "arduino") {
    if (source === "arduino") stopDemo();
    latestReading = {
        n,
        p,
        k,
        ph,
        source,
        updatedAt: new Date().toISOString(),
        connected: true
    };
    if (source === "arduino") {
        setHardware("connected", hardware.port, `Live soil readings from ${hardware.port || "the Arduino"}.`);
    }
    console.log("Sensor reading:", latestReading);
}

function stopDemo() {
    if (!demoTimer) return;
    clearInterval(demoTimer);
    demoTimer = null;
}

function startDemoReadings() {
    if (demoTimer || latestReading.source === "arduino") return;
    console.log("Sensor demo enabled. These are sample NPK values, not the hardware.");
    const tick = () => {
        if (latestReading.source === "arduino") {
            stopDemo();
            return;
        }
        saveReading(
            75 + Math.floor(Math.random() * 26),
            35 + Math.floor(Math.random() * 21),
            120 + Math.floor(Math.random() * 31),
            null,
            "demo"
        );
    };
    tick();
    demoTimer = setInterval(tick, 2000);
}

function usableNutrient(value) {
    return Number.isFinite(value) && value >= 0 && value <= 2000;
}

function usablePh(value) {
    return Number.isFinite(value) && value >= 3.5 && value <= 10 ? value : null;
}

function parseSerialLine(line) {
    line = String(line || "").replace(/\0/g, "").trim();
    const dataLine = line.match(/^data\s*,\s*(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)(?:\s*,\s*(-?\d+(?:\.\d+)?))?/i);
    const labeledLine = line.match(/n(?:itrogen)?\s*[:=]?\s*(-?\d+(?:\.\d+)?)[\s,;]+p(?:hosphorus)?\s*[:=]?\s*(-?\d+(?:\.\d+)?)[\s,;]+k(?:potassium)?\s*[:=]?\s*(-?\d+(?:\.\d+)?)(?:[\s,;]+ph\s*[:=]?\s*(-?\d+(?:\.\d+)?))?/i);
    const match = dataLine || labeledLine;
    if (!match) return;

    const nitrogen = Number(match[1]);
    const phosphorus = Number(match[2]);
    const potassium = Number(match[3]);
    if (![nitrogen, phosphorus, potassium].every(usableNutrient)) return;
    if (nitrogen === 0 && phosphorus === 0 && potassium === 0) return;

    saveReading(nitrogen, phosphorus, potassium, usablePh(Number(match[4])));
}

function wantedPort() {
    return (process.env.ARDUINO_PORT || "auto").trim();
}

function looksLikeSensor(port) {
    const label = [port.manufacturer, port.friendlyName, port.pnpId, port.vendorId].join(" ");
    return /arduino|wch|1a86|ch340|ch341|cp210|silicon|ftdi|usb serial|usb-serial/i.test(label);
}

function pickPort(ports, wanted) {
    if (wanted && wanted !== "auto") {
        const exact = ports.find((port) => port.path.toLowerCase() === wanted.toLowerCase());
        if (exact) return exact;
    }
    return ports.find(looksLikeSensor) || ((!wanted || wanted === "auto") ? ports[0] : null) || null;
}

function closePort() {
    const port = activePort;
    activePort = null;
    if (!port) return;
    try {
        if (port.isOpen) port.close();
    } catch (error) {
        console.log("Could not close sensor port:", error.message);
    }
}

async function scanForSensor() {
    if (activePort) return;

    const wanted = wantedPort();
    if (!wanted || wanted === "none" || wanted === "disabled") {
        setHardware("disabled", null, "Sensor hardware is turned off. Set ARDUINO_PORT to auto when the Arduino is plugged in.");
        if (process.env.SENSOR_DEMO === "true") startDemoReadings();
        return;
    }

    let SerialPort;
    let ReadlineParser;
    try {
        ({ SerialPort } = require("serialport"));
        ({ ReadlineParser } = require("@serialport/parser-readline"));
    } catch (error) {
        setHardware("error", null, "The serial port library is not installed, so the sensor cannot connect.");
        return;
    }

    let ports = [];
    try {
        ports = await SerialPort.list();
    } catch (error) {
        setHardware("error", null, "Could not check USB ports for the sensor.");
        return;
    }

    const match = pickPort(ports, wanted);
    if (!match) {
        const where = wanted !== "auto" ? ` Configured port ${wanted} is not present.` : "";
        setHardware("disconnected", null, `No sensor is plugged in.${where} Connect the Arduino with a data USB cable.`);
        if (process.env.SENSOR_DEMO === "true") startDemoReadings();
        return;
    }

    const port = new SerialPort({ path: match.path, baudRate: BAUD_RATE, autoOpen: false });
    activePort = port;
    const parser = port.pipe(new ReadlineParser({ delimiter: "\n" }));
    parser.on("data", parseSerialLine);

    port.on("close", () => {
        if (activePort === port) activePort = null;
        clearReading();
        setHardware("disconnected", null, "Sensor unplugged. Connect the Arduino USB cable again.");
    });

    port.on("error", (error) => {
        console.log(`Arduino serial error (${match.path}):`, error.message);
        if (activePort === port) activePort = null;
        setHardware("disconnected", match.path, `Could not read ${match.path}. Unplug the Arduino and plug it back in.`);
    });

    port.open((error) => {
        if (error) {
            if (activePort === port) activePort = null;
            console.log(`Arduino serial error (${match.path}):`, error.message);
            setHardware("disconnected", match.path, `Could not open ${match.path}. Close the Arduino IDE serial monitor and plug the board in again.`);
            return;
        }
        setHardware("waiting", match.path, `Arduino found on ${match.path}. Waiting for soil readings.`);
        console.log(`Arduino connected on ${match.path}`);
    });
}

function startSensorListener() {
    if (started) return;
    started = true;
    scanForSensor().catch((error) => console.log("Sensor scan failed:", error.message));
    scanTimer = setInterval(() => {
        scanForSensor().catch((error) => console.log("Sensor scan failed:", error.message));
    }, SCAN_MS);
    scanTimer.unref?.();
}

function getLatestReading() {
    return latestReading;
}

function getHardwareStatus() {
    return hardware;
}

module.exports = { startSensorListener, getLatestReading, getHardwareStatus, parseSerialLine, closePort };
