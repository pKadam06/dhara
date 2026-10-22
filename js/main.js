console.log("MAIN JS LOADED");
const isLocalFrontend = window.location.protocol === "file:"
    || ["localhost", "127.0.0.1", "::1"].includes(window.location.hostname);
const API_BASE_URL = window.DHARA_API_BASE_URL || (isLocalFrontend
    ? `http://${window.location.hostname || "localhost"}:5000/api`
    : `${window.location.origin}/api`);

window.addEventListener("load", () => {
console.log("Window Loaded");
    if (!navigator.geolocation) {
        loadWeatherFromIp();
        return;
    }

    navigator.geolocation.getCurrentPosition(
        success,
        () => loadWeatherFromIp(),
        { enableHighAccuracy: false, maximumAge: 60000, timeout: 8000 }
    );
});

async function success(position){

    const lat = position.coords.latitude;
    const lon = position.coords.longitude;

    getWeather(lat,lon);

}

async function loadWeatherFromIp() {
    try {
        const response = await fetch("https://ipapi.co/json/");
        const data = await response.json();
        if (!data.latitude || !data.longitude) {
            throw new Error("Location unavailable");
        }
        getWeather(Number(data.latitude), Number(data.longitude), data.city);
    } catch (err) {
        console.error("Location fallback error:", err);
        setWeatherText("weatherLocation", "Location unavailable");
        setWeatherText("condition", "Allow location to load weather");
    }
}

async function getWeather(lat,lon,placeName){

    try{

        const response = await fetch(

            `${API_BASE_URL}/weather/current?lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lon)}`

        );

        const data = await response.json();
        if (!response.ok || !data.main || !data.weather?.length) {
            throw new Error(data.message || "Weather unavailable");
        }
        console.log(data);
console.log(document.getElementById("weatherLocation"));
console.log(document.getElementById("temperature"));
console.log(document.getElementById("condition"));
console.log(document.getElementById("humidity"));
console.log(document.getElementById("wind"));
        setWeatherText("weatherLocation", data.name || placeName || "Unknown location");

        setWeatherHtml("temperature", `${Math.round(data.main.temp)}<sup>°C</sup>`);

        setWeatherText("condition", data.weather[0].main);

        setWeatherText("humidity", data.main.humidity + "%");

        const windKmh = Number(data.wind?.speed) * 3.6;
        setWeatherText("wind", Number.isFinite(windKmh) ? `${windKmh.toFixed(1)} km/h` : "--");

    }

    catch(err){

        console.error("Weather error:", err);
        setWeatherText("weatherLocation", "Weather unavailable");
        setWeatherText("condition", err.message || "Could not load weather");

    }

}

function setWeatherText(id, value) {
    const element = document.getElementById(id);
    if (element) element.textContent = value;
}

function setWeatherHtml(id, value) {
    const element = document.getElementById(id);
    if (element) element.innerHTML = value;
}