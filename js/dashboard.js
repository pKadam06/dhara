// =============================
// DHARA DASHBOARD
// =============================

const isLocalFrontend = window.location.protocol === "file:"
    || ["localhost", "127.0.0.1", "::1"].includes(window.location.hostname);
const API_BASE_URL = window.DHARA_API_BASE_URL || (isLocalFrontend
    ? `http://${window.location.hostname || "localhost"}:5000/api`
    : `${window.location.origin}/api`);

function authHeaders(extra = {}) {
    return {
        ...extra,
        Authorization: `Bearer ${localStorage.getItem("dharaToken") || ""}`
    };
}

function redirectToLogin() {
    localStorage.removeItem("dharaToken");
    localStorage.removeItem("dharaUser");
    window.location.replace("login.html");
}

if (!localStorage.getItem("dharaToken")) {
    window.location.replace("login.html");
}

const translations = {
    en: {
        welcomeBack: "Welcome Back 👋",
        dashboard: "Dashboard",
        weather: "Weather",
        cropRecommendation: "Crop Recommendation",
        soilHealth: "Soil Health",
        fertilizerCalculator: "Fertilizer Calculator",
        govtSchemes: "Govt Schemes",
        diseaseDetection: "Disease Detection",
        marketPrices: "Market Prices",
        aiAssistant: "AI Assistant",
        logout: "Logout",
        rainProbability: "Rain Probability:",
        moisture: "Moisture:",
        aiAdvice: "AI Advice",
        confidence: "Confidence",
        alternative: "Alternative",
        farmAlerts: "Farm Alerts",
        liveWeather: "Live Weather",
        detectingLocation: "Detecting location...",
        humidity: "Humidity",
        wind: "Wind",
        soilSensor: "Soil Sensor",
        refreshReadings: "Refresh Readings",
        fertilizerText: "Enter your soil NPK values or connect the sensor.",
        nitrogenLabel: "Nitrogen (N)",
        phosphorusLabel: "Phosphorus (P)",
        potassiumLabel: "Potassium (K)",
        areaLabel: "Area (Acres)",
        calculateRecommendation: "Calculate Recommendation",
        waitingForCalculation: "Waiting for calculation...",
        soilHealthAnalysis: "Soil Health Analysis",
        uploadCropImage: "Upload crop image",
        detectDisease: "Detect Disease",
        todayMarketPrices: "Today's Market Prices",
        loadingPrices: "Loading prices...",
        cropRecommendationText: "Enter your soil nutrients and weather conditions to receive the best crop recommendations for your farm.",
        temperatureLabel: "Temperature (°C)",
        humidityLabel: "Humidity (%)",
        rainfallLabel: "Rainfall (mm)",
        soilPHLabel: "Soil pH",
        predictCrops: "Predict Crops",
        topCropRecommendations: "Top Crop Recommendations",
        topCropDescription: "DHARA analyzes soil nutrients and weather to recommend the most suitable crops.",
        waitingForPrediction: "Waiting for Prediction",
        enterValuesAndClick: "Enter all values and click",
        askDharaAi: "Ask DHARA AI",
        askAi: "Ask AI",
        waitingAnswer: "Waiting...",
        chatPlaceholder: "Ask anything about farming...",
        community: "Community",
        communityIntro: "Ask questions, share farm experience, and get practical advice from growers in your network.",
        sharePost: "Share Post",
        communityAll: "All",
        communityCrops: "Crops",
        communityPest: "Pest Control",
        communityEquipment: "Equipment & Tools",
        communityGeneral: "General Chat",
        communityPostTitle: "Post title",
        communityPostMessage: "Share your farming experience or ask a question...",
    },
    hi: {
        welcomeBack: "वापस स्वागत है 👋",
        dashboard: "डैशबोर्ड",
        weather: "मौसम",
        cropRecommendation: "फसल सिफारिश",
        soilHealth: "मिट्टी स्वास्थ्य",
        fertilizerCalculator: "उर्वरक कैलकुलेटर",
        govtSchemes: "सरकारी योजनाएँ",
        diseaseDetection: "रोग पहचान",
        marketPrices: "बाज़ार कीमतें",
        aiAssistant: "एआई सहायक",
        logout: "लॉगआउट",
        rainProbability: "बारिश की संभावना:",
        moisture: "नमी:",
        aiAdvice: "एआई सलाह",
        confidence: "विश्वास",
        alternative: "वैकल्पिक",
        farmAlerts: "खेती अलर्ट",
        liveWeather: "लाइव मौसम",
        detectingLocation: "स्थान पता किया जा रहा है...",
        humidity: "नमी",
        wind: "हवा",
        soilSensor: "मिट्टी सेंसर",
        refreshReadings: "रीडिंग रीफ्रेश करें",
        fertilizerText: "अपनी मिट्टी के NPK मान दर्ज करें या सेंसर कनेक्ट करें।",
        nitrogenLabel: "नाइट्रोजन (N)",
        phosphorusLabel: "फॉस्फोरस (P)",
        potassiumLabel: "पोटेशियम (K)",
        areaLabel: "क्षेत्र (एकड़)",
        calculateRecommendation: "सिफारिश गणना करें",
        waitingForCalculation: "गणना का इंतजार...",
        soilHealthAnalysis: "मिट्टी स्वास्थ्य विश्लेषण",
        uploadCropImage: "फसल की तस्वीर अपलोड करें",
        detectDisease: "रोग पहचानें",
        todayMarketPrices: "आज की बाजार कीमतें",
        loadingPrices: "कीमतें लोड हो रही हैं...",
        cropRecommendationText: "अपनी मिट्टी और मौसम की स्थिति दर्ज करें ताकि सबसे अच्छी फसल सिफारिश मिल सके।",
        temperatureLabel: "तापमान (°C)",
        humidityLabel: "नमी (%)",
        rainfallLabel: "बारिश (mm)",
        soilPHLabel: "मिट्टी pH",
        predictCrops: "फसल भविष्यवाणी",
        topCropRecommendations: "टॉप फसल सिफारिशें",
        topCropDescription: "DHARA मिट्टी के पोषक तत्व और मौसम का विश्लेषण करके सबसे उपयुक्त फसल सुझाता है।",
        waitingForPrediction: "भविष्यवाणी का इंतजार",
        enterValuesAndClick: "सभी मान दर्ज करें और क्लिक करें",
        askDharaAi: "DHARA AI से पूछें",
        askAi: "एआई पूछें",
        waitingAnswer: "प्रतीक्षा...",
        chatPlaceholder: "खेती के बारे में कुछ भी पूछें...",
        community: "समुदाय",
        communityIntro: "प्रश्न पूछें, कृषि अनुभव साझा करें और अपने नेटवर्क के किसानों से व्यावहारिक सलाह पाएं।",
        sharePost: "पोस्ट साझा करें",
        communityAll: "सभी",
        communityCrops: "फसल",
        communityPest: "कीट नियंत्रण",
        communityEquipment: "उपकरण और टूल्स",
        communityGeneral: "सामान्य चैट",
        communityPostTitle: "पोस्ट शीर्षक",
        communityPostMessage: "अपना कृषि अनुभव साझा करें या प्रश्न पूछें...",
    },
    te: {
        welcomeBack: "మళ్లీ స్వాగతం 👋",
        dashboard: "డాష్‌బోర్డ్",
        weather: "వాతావరణం",
        cropRecommendation: "పంట సిఫార్సు",
        soilHealth: "మట్టి ఆరోగ్యం",
        fertilizerCalculator: "రసాయన గణన",
        govtSchemes: "ప్రభుత్వ పథకాలు",
        diseaseDetection: "వ్యాధి గుర్తింపు",
        marketPrices: "మార్కెట్ ధరలు",
        aiAssistant: "AI సహాయకుడు",
        logout: "లాగ్‌ఆఫ్",
        rainProbability: "వర్ష సంభావ్యత:",
        moisture: "తేమ:",
        aiAdvice: "AI సలహా",
        confidence: "నమ్మకం",
        alternative: "ఓప్షన్",
        farmAlerts: "ఫార్మ్ అలర్ట్స్",
        liveWeather: "Live వాతావరణం",
        detectingLocation: "స్థానం గుర్తిస్తోంది...",
        humidity: "తేమ",
        wind: "గాలి",
        soilSensor: "మట్టి సెన్సార్",
        refreshReadings: "రీడింగ్‌లను రిఫ్రెష్ చేయండి",
        fertilizerText: "మీ మట్టిలో NPK విలువలు నమోదు చేయండి లేదా సెన్సార్‌ను కనెక్ట్ చేయండి.",
        nitrogenLabel: "నైట్రోజన్ (N)",
        phosphorusLabel: "ఫాస్పరస్ (P)",
        potassiumLabel: "పొటాషియం (K)",
        areaLabel: "ప్రాంతం (ఎకరాలు)",
        calculateRecommendation: "సిఫార్సు గణించండి",
        waitingForCalculation: "గణన కోసం వేచి ఉంది...",
        soilHealthAnalysis: "మట్టి ఆరోగ్య విశ్లేషణ",
        uploadCropImage: "పంట చిత్రాన్ని అప్‌లోడ్ చేయండి",
        detectDisease: "వ్యాధిని గుర్తించండి",
        todayMarketPrices: "ఈరోజు మార్కెట్ ధరలు",
        loadingPrices: "ధరలు లోడ్ అవుతున్నాయి...",
        cropRecommendationText: "మీ మట్టి మరియు వాతావరణ పరిస్థితులను నమోదు చేసి ఉత్తమ పంట సిఫార్సును పొందండి.",
        temperatureLabel: "ఉష్ణోగ్రత (°C)",
        humidityLabel: "తేమ (%)",
        rainfallLabel: "వర్షం (mm)",
        soilPHLabel: "మట్టి pH",
        predictCrops: "పంటలను అంచనా వేయండి",
        topCropRecommendations: "అత్యుత్తమ పంట సిఫార్సులు",
        topCropDescription: "DHARA మీ మట్టి పోషకాలు మరియు వాతావరణాన్ని విశ్లేషించి ఉత్తమ పంటను సిఫార్సు చేస్తుంది.",
        waitingForPrediction: "అంచనా కోసం వేచి ఉంది",
        enterValuesAndClick: "అన్ని విలువలు నమోదు చేసి క్లిక్ చేయండి",
        askDharaAi: "DHARA AIని అడగండి",
        askAi: "AI అడగండి",
        waitingAnswer: "వేచి ఉంది...",
        chatPlaceholder: "పంట గురించి ఏమైనా అడగండి...",
        community: "కమ్యూనిటీ",
        communityIntro: "ప్రశ్నలు అడగండి, పంట అనుభవాలను పంచుకోండి, మరియు మీ నెట్‌వర్క్‌లోని రైతుల నుండి ఆచరణాత్మక సలహాలు పొందండి.",
        sharePost: "పోస్ట్ షేర్ చేయండి",
        communityAll: "అన్ని",
        communityCrops: "పంటలు",
        communityPest: "పురుగుల నియంత్రణ",
        communityEquipment: "సామాగ్రి & సాధనాలు",
        communityGeneral: "సాధారణ చాట్",
        communityPostTitle: "పోస్ట్ శీర్షిక",
        communityPostMessage: "మీ వ్యవసాయ అనుభవాన్ని పంచుకోండి లేదా ప్రశ్న అడగండి...",
    },
    mr: {
        welcomeBack: "परत आपले स्वागत आहे 👋",
        dashboard: "डॅशबोर्ड",
        weather: "हवामान",
        cropRecommendation: "पीक शिफारस",
        soilHealth: "मातीची गुणवत्ता",
        fertilizerCalculator: "खते कॅल्क्युलेटर",
        govtSchemes: "सरकारी योजना",
        diseaseDetection: "रोग ओळख",
        marketPrices: "बाजार भाव",
        aiAssistant: "AI सहाय्यक",
        logout: "लॉगआउट",
        rainProbability: "पाऊस संभाव्यता:",
        moisture: "आर्द्रता:",
        aiAdvice: "AI सल्ला",
        confidence: "विश्वास",
        alternative: "पर्यायी",
        farmAlerts: "शेत अलर्ट",
        liveWeather: "Live हवामान",
        detectingLocation: "स्थान शोधत आहे...",
        humidity: "आर्द्रता",
        wind: "वारा",
        soilSensor: "माती सेंसर",
        refreshReadings: "रीडिंग रीफ्रेश करा",
        fertilizerText: "मातीचे NPK मूल्य प्रविष्ट करा किंवा सेंसर जोडा.",
        nitrogenLabel: "नायट्रोजन (N)",
        phosphorusLabel: "फॉस्फरस (P)",
        potassiumLabel: "पोटॅशियम (K)",
        areaLabel: "क्षेत्र (एकर)",
        calculateRecommendation: "शिफारस काढा",
        waitingForCalculation: "गणनाची प्रतिक्षा...",
        soilHealthAnalysis: "माती आरोग्य विश्लेषण",
        uploadCropImage: "पीक चित्र अपलोड करा",
        detectDisease: "रोग ओळखा",
        todayMarketPrices: "आजचे बाजार भाव",
        loadingPrices: "भाव लोड होत आहेत...",
        cropRecommendationText: "मातीचे पोषक घटक आणि हवामानाचा विचार करून सर्वोत्तम पीक शिफारस मिळवा.",
        temperatureLabel: "तापमान (°C)",
        humidityLabel: "आर्द्रता (%)",
        rainfallLabel: "पाऊस (mm)",
        soilPHLabel: "माती pH",
        predictCrops: "पीक अंदाज करा",
        topCropRecommendations: "सर्वोत्तम पीक शिफारसी",
        topCropDescription: "DHARA मातीचे पोषक घटक आणि हवामान विश्लेषण करून योग्य पीक शिफारस देते.",
        waitingForPrediction: "अंदाजाची प्रतिक्षा",
        enterValuesAndClick: "सर्व मूल्ये भरा आणि क्लिक करा",
        askDharaAi: "DHARA AI विचारा",
        askAi: "AI विचारा",
        waitingAnswer: "प्रतीक्षा...",
        chatPlaceholder: "शेतीबद्दल काहीही विचारा...",
        community: "सामुदायिक",
        communityIntro: "प्रश्न विचारा, शेताचा अनुभव सामायिक करा आणि तुमच्या नेटवर्कमधील शेतकऱ्यांकडून व्यावहारिक सल्ले मिळवा.",
        sharePost: "पोस्ट शेअर करा",
        communityAll: "सर्व",
        communityCrops: "पीके",
        communityPest: "कीटक नियंत्रण",
        communityEquipment: "उपकरण आणि साधने",
        communityGeneral: "सामान्य चर्चा",
        communityPostTitle: "पोस्ट शीर्षक",
        communityPostMessage: "तुमचा कृषी अनुभव शेअर करा किंवा प्रश्न विचारा...",
    },
    bn: {
        welcomeBack: "ফিরে স্বাগতম 👋",
        dashboard: "ড্যাশবোর্ড",
        weather: "আবহাওয়া",
        cropRecommendation: "ফসল সুপারিশ",
        soilHealth: "মাটির স্বাস্থ্য",
        fertilizerCalculator: "সার ক্যালকুলেটর",
        govtSchemes: "সরকারি স্কিম",
        diseaseDetection: "রোগ শনাক্তকরণ",
        marketPrices: "বাজার দর",
        aiAssistant: "AI সহকারী",
        logout: "লগআউট",
        rainProbability: "বৃষ্টিপাতের সম্ভাবনা:",
        moisture: "আর্দ্রতা:",
        aiAdvice: "AI পরামর্শ",
        confidence: "বিশ্বাস",
        alternative: "বিকল্প",
        farmAlerts: "ফার্ম অ্যালার্ট",
        liveWeather: "লাইভ আবহাওয়া",
        detectingLocation: "অবস্থান শনাক্ত করা হচ্ছে...",
        humidity: "আর্দ্রতা",
        wind: "বাতাস",
        soilSensor: "মাটি সেন্সর",
        refreshReadings: "রিডিং রিফ্রেশ করুন",
        fertilizerText: "মাটির NPK মান লিখুন অথবা সেন্সর কানেক্ট করুন।",
        nitrogenLabel: "নাইট্রোজেন (N)",
        phosphorusLabel: "ফসফরাস (P)",
        potassiumLabel: "পটাশিয়াম (K)",
        areaLabel: "এলাকা (একর)",
        calculateRecommendation: "সুপারিশ গণনা করুন",
        waitingForCalculation: "গণনার জন্য অপেক্ষা...",
        soilHealthAnalysis: "মাটি স্বাস্থ্য বিশ্লেষণ",
        uploadCropImage: "ফসলের ছবি আপলোড করুন",
        detectDisease: "রোগ শনাক্ত করুন",
        todayMarketPrices: "আজকের বাজার দর",
        loadingPrices: "দর লোড হচ্ছে...",
        cropRecommendationText: "মাটির পুষ্টি ও আবহাওয়ার ভিত্তিতে শীর্ষ ফসল সুপারিশ পান।",
        temperatureLabel: "তাপমাত্রা (°C)",
        humidityLabel: "আর্দ্রতা (%)",
        rainfallLabel: "বৃষ্টি (mm)",
        soilPHLabel: "মাটি pH",
        predictCrops: "ফসল ভবিষ্যদ্বাণী",
        topCropRecommendations: "শীর্ষ ফসল সুপারিশ",
        topCropDescription: "DHARA মাটির পুষ্টি ও আবহাওয়া বিশ্লেষণ করে সেরা ফসল সুপারিশ দেয়।",
        waitingForPrediction: "ভবিষ্যদ্বাণীর জন্য অপেক্ষা",
        enterValuesAndClick: "সব মান লিখে ক্লিক করুন",
        askDharaAi: "DHARA AI জিজ্ঞেস করুন",
        askAi: "AI জিজ্ঞেস করুন",
        waitingAnswer: "অপেক্ষা...",
        chatPlaceholder: "কৃষি নিয়ে কিছু জিজ্ঞেস করুন...",
        community: "কমিউনিটি",
        communityIntro: "প্রশ্ন করুন, কৃষি অভিজ্ঞতা শেয়ার করুন এবং আপনার নেটওয়ার্কের চাষীদের কাছ থেকে ব্যবহারিক পরামর্শ পান।",
        sharePost: "পোস্ট শেয়ার করুন",
        communityAll: "সব",
        communityCrops: "ফসল",
        communityPest: "কীট নিয়ন্ত্রণ",
        communityEquipment: "উপকরণ ও টুলস",
        communityGeneral: "সাধারণ চ্যাট",
        communityPostTitle: "পোস্টের শিরোনাম",
        communityPostMessage: "আপনার কৃষি অভিজ্ঞতা শেয়ার করুন বা প্রশ্ন করুন...",
    },
};

let latitude = null;
let longitude = null;
let weatherRefreshTimer = null;
let marketRefreshTimer = null;
let marketRevision = "";
const marketPricesSeen = new Map();
let sensorRefreshTimer = null;
let sensorConnected = false;
let sensorPH = null;
let liveWeather = { temp: null, humidity: null, rainfall: null };
let lastPredictionKey = "";
let currentLanguage = "en";
const refreshSensorButton = document.getElementById("refreshSensorBtn");
const sensorApiUrl = `${API_BASE_URL}/sensor/latest`;
const locationCache = new Map();
const indianStates = [
    "Andaman and Nicobar Islands", "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar",
    "Chandigarh", "Chhattisgarh", "Dadra and Nagar Haveli and Daman and Diu", "Delhi", "Goa",
    "Gujarat", "Haryana", "Himachal Pradesh", "Jammu and Kashmir", "Jharkhand", "Karnataka",
    "Kerala", "Ladakh", "Lakshadweep", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya",
    "Mizoram", "Nagaland", "Odisha", "Puducherry", "Punjab", "Rajasthan", "Sikkim",
    "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal"
];

const communityPosts = [
    {
        id: 1,
        title: "Best practice for paddy after heavy rain",
        category: "Crops",
        message: "After heavy rain, draining the field early in the morning helped reduce fungal stress in paddy. We also avoided overwatering for two days.",
        votes: 18,
        comments: ["Good advice — drainage timing matters a lot.", "We used neem spray after the field dried slightly."],
    },
    {
        id: 2,
        title: "How to spot early pest attack in tomato",
        category: "Pest Control",
        message: "Look for curled leaves and small bite marks on the underside of the plant. Early scouting reduces damage by a lot.",
        votes: 11,
        comments: ["I check under the leaves every morning.", "Sticky traps helped me catch the pest faster."],
    },
    {
        id: 3,
        title: "Portable sprinkler for small farms",
        category: "Equipment & Tools",
        message: "A 12-meter portable sprinkler is perfect for smaller plots and helps with even residue distribution during summer.",
        votes: 9,
        comments: ["Works well for vegetable plots.", "Best used before noon when wind is low."],
    },
];


// =============================
// GET LOCATION
// =============================

function getLocation() {

    if (!navigator.geolocation) {

        loadIpFallback().catch((error) => console.error("IP fallback error:", error));
        return;

    }

    navigator.geolocation.getCurrentPosition(

        success,
        async () => {
            await loadIpFallback();
        },

        {
            enableHighAccuracy: true,
            maximumAge: 60000,
            timeout: 10000
        }

    );

}

async function loadIpFallback() {
    try {
        const response = await fetch("https://ipapi.co/json/");
        const data = await response.json();

        if (!data.latitude || !data.longitude) {
            throw new Error("Location fallback unavailable");
        }

        latitude = Number(data.latitude);
        longitude = Number(data.longitude);

        await reverseGeocode();
        await loadWeather();
        await loadForecast();
    } catch (err) {
        console.error("IP fallback error:", err);
        setText("city", "Location unavailable");
        setText("condition", "Enable location to load weather");
    }
}

async function success(position) {

    latitude = position.coords.latitude;
    longitude = position.coords.longitude;

    await reverseGeocode();

    await loadWeather();

    await loadForecast();

    if (!weatherRefreshTimer) {
        weatherRefreshTimer = setInterval(async () => {
            if (latitude !== null && longitude !== null) {
                await loadWeather();
                await loadForecast();
            }
        }, 5 * 60 * 1000);
    }

}

function error(err) {

    console.log(err);
    setText("city", "Location unavailable");
    setText("condition", "Enable location to load weather");

}


// =============================
// REVERSE GEOCODING
// =============================

async function reverseGeocode() {

    try {

        const response = await fetch(

            `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`

        );

        const data = await response.json();

        const address = data.address || {};
        setText("city",
            address.city ||
            address.town ||
            address.village ||
            "Unknown");

        setText("district",
            address.county ||
            address.state_district ||
            address.suburb ||
            address.city_district ||
            "");

        setText("state", address.state || "N/A");

    }

    catch(err){

        console.log(err);

    }

}


// =============================
// WEATHER (current)
// =============================

async function loadWeather(){

    if (latitude === null || longitude === null) return;

    try{

        const response = await fetch(
            `${API_BASE_URL}/weather/current?lat=${encodeURIComponent(latitude)}&lon=${encodeURIComponent(longitude)}`
        );

        const weather = await response.json();
        if (!response.ok || !weather.main || !weather.weather?.length) {
            throw new Error(weather.message || "Weather unavailable");
        }

        console.log(weather);

        const temp = Math.round(weather.main.temp);
        const condition = weather.weather[0].main;
        const rainfall = Number(weather.rain?.["1h"] ?? weather.rain?.["3h"]);
        liveWeather = {
            temp,
            humidity: Number(weather.main.humidity),
            rainfall: Number.isFinite(rainfall) ? rainfall : null
        };

        setText("temperature", temp + "°C");

        setText("temp", temp + "°C");

        setText("humidity", weather.main.humidity + "%");

        const windKmh = Number(weather.wind?.speed) * 3.6;
        setText("wind", Number.isFinite(windKmh) ? `${windKmh.toFixed(1)} km/h` : "--");

        setText("condition", condition);
        setText("weatherStatus", condition + " • " + temp + "°C");
        setText("temp", temp + "°C");

        // Match the weather icon to the real condition
        setWeatherIcon(condition);

        // Farm alerts based on real weather
        updateFarmAlerts(condition, temp);
        if (sensorConnected) {
            applyWeatherToCropForm();
            refreshPrediction();
        }

    }

    catch(err){

        console.error("Weather error:", err);
        setText("condition", err.message || "Weather unavailable");
        setText("weatherStatus", "Weather unavailable");

    }

}


// =============================
// FORECAST (real rain probability)
// =============================

async function loadForecast(){

    if (latitude === null || longitude === null) return;

    try{

        const response = await fetch(
            `${API_BASE_URL}/weather/forecast?lat=${encodeURIComponent(latitude)}&lon=${encodeURIComponent(longitude)}`
        );

        const data = await response.json();
        if (!response.ok || !data.list?.length) {
            throw new Error(data.message || "Forecast unavailable");
        }

        const next24 = data.list.slice(0, 8);
        const maxPop = Math.max(...next24.map(item => Number(item.pop || 0)));
        const rainChance = Math.round(maxPop * 100);

        setText("rainChance", rainChance + "%");

    }

    catch(err){

        console.error("Forecast error:", err);

    }

}


// =============================
// WEATHER ICON (animated Meteocons, matches condition)
// =============================

function setWeatherIcon(condition) {

    const box = document.querySelector(".weather-icon");
    if (!box) return;

    const c = (condition || "").toLowerCase();
    let icon = "partly-cloudy-day";   // default

    if (c.includes("thunder") || c.includes("storm")) {
        icon = "thunderstorms";
    } else if (c.includes("drizzle")) {
        icon = "drizzle";
    } else if (c.includes("rain")) {
        icon = "rain";
    } else if (c.includes("snow")) {
        icon = "snow";
    } else if (c.includes("clear")) {
        icon = "clear-day";
    } else if (c.includes("cloud")) {
        icon = "cloudy";
    } else if (c.includes("mist") || c.includes("fog") || c.includes("haze")) {
        icon = "fog";
    }

    box.innerHTML =
        `<img src="https://cdn.jsdelivr.net/npm/@meteocons/svg/fill/${icon}.svg" alt="${condition}" width="110" height="110">`;
}


// =============================
// FARM ALERTS (weather-based)
// =============================

function updateFarmAlerts(condition, temp) {

    let title = "✅ No Alerts";
    let message = "Farm conditions look good.";

    const c = (condition || "").toLowerCase();

    if (c.includes("thunder") || c.includes("storm")) {
        title = "⛈ Storm Warning";
        message = "Secure young plants and drain excess water from fields.";
    } else if (c.includes("rain") || c.includes("drizzle")) {
        title = "🌧 Rain Expected";
        message = "Delay irrigation and avoid spraying pesticides today.";
    } else if (temp >= 35) {
        title = "🌡 High Heat";
        message = "Water crops early morning or evening to reduce heat stress.";
    } else if (temp <= 10) {
        title = "❄ Cold Alert";
        message = "Protect crops from frost, especially during the night.";
    }

    setText("alertTitle", title);
    setText("alertMessage", message);
    setText("alertTime", "Updated just now");
}


refreshSensorButton?.addEventListener("click", () => {
    loadSensorReading().catch((error) => console.error("Sensor reading error:", error));
});

async function loadSensorReading() {
    try {
        const response = await fetch(sensorApiUrl);
        const data = await response.json();
        const reading = data.reading || {};
        const hasReading = [reading.n, reading.p, reading.k]
            .every((value) => Number.isFinite(Number(value)));
        const isArduino = reading.source === "arduino" && reading.connected === true;
        const isDemo = reading.source === "demo" && hasReading;

        if ((!isArduino && !isDemo) || !hasReading) {
            clearSensorDisplay(data.hardware?.message);
            return;
        }

        setText("nitrogen", reading.n);
        setText("phosphorus", reading.p);
        setText("potassium", reading.k);
        setText("soilCardNitrogen", reading.n);
        setText("soilCardPhosphorus", reading.p);
        setText("soilCardPotassium", reading.k);
        setText("soilScore", getSoilScore(reading));
        setText("soilMoisture", "N/A");
        setText("sensorStatus", reading.source === "demo"
            ? "🟡 Demo NPK. Plug in the Arduino for live soil values."
            : "🟢 Live Arduino Reading");
        setText("soilHealthStatus", `NPK readings received at ${formatReadingTime(reading.updatedAt)}`);
        setText("soilSuggestion", getSoilSuggestion(reading));
        sensorPH = Number.isFinite(Number(reading.ph)) ? Number(reading.ph) : null;
        sensorConnected = isArduino;
        if (isArduino) {
            const age = Date.now() - new Date(reading.updatedAt).getTime();
            if (!Number.isFinite(age) || age > 30000) {
                clearSensorDisplay("Arduino connected, but no soil reading has arrived in the last 30 seconds.");
                return;
            }
            setLiveInput("nValue", reading.n, "sensor");
            setLiveInput("pValue", reading.p, "sensor");
            setLiveInput("kValue", reading.k, "sensor");
            setLiveInput("cropN", reading.n, "sensor");
            setLiveInput("cropP", reading.p, "sensor");
            setLiveInput("cropK", reading.k, "sensor");
            if (sensorPH !== null) setLiveInput("cropPH", sensorPH, "sensor");
            applyWeatherToCropForm();
            refreshPrediction();
            setText("fertilizerSensorStatus", `Live Arduino values updated at ${formatReadingTime(reading.updatedAt)}.`);
        } else {
            setText("fertilizerSensorStatus", "Demo values are for preview only. Connect the Arduino before calculating fertilizer.");
        }
    } catch (error) {
        console.error("Sensor reading error:", error);
        clearSensorDisplay();
    }
}

function clearSensorDisplay(message) {
    ["nitrogen", "phosphorus", "potassium", "soilCardNitrogen", "soilCardPhosphorus", "soilCardPotassium"]
        .forEach((id) => setText(id, "--"));
    sensorConnected = false;
    sensorPH = null;
    setText("soilScore", "--");
    setText("soilMoisture", "--%");
    setText("sensorStatus", message ? `⚪ ${message}` : "⚪ No Sensor Connected");
    setText("soilHealthStatus", "Waiting for sensor...");
    setText("soilSuggestion", message || "Connect the physical sensor hardware to unlock live readings.");
    setText("fertilizerSensorStatus", message || "No Arduino connected. Fertilizer calculation is unavailable.");
    clearLiveInputs("sensor");
    lastPredictionKey = "";
}

function formatReadingTime(updatedAt) {
    if (!updatedAt) return "just now";
    return new Date(updatedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function getSoilScore(reading) {
    const values = [Number(reading.n), Number(reading.p), Number(reading.k)];
    const balanced = values.filter((value) => value >= 30 && value <= 120).length;
    
    if (balanced === 3) {
        return "Good";
    }
    if (balanced === 2) {
        return "Fair";
    }
    return "Needs attention";
}

function getSoilSuggestion(reading) {
    const low = [];
    if (Number(reading.n) < 30) low.push("nitrogen");
    if (Number(reading.p) < 20) low.push("phosphorus");
    if (Number(reading.k) < 20) low.push("potassium");
    return low.length
        ? `Consider a soil test and improve ${low.join(", ")}.`
        : "NPK levels are in a healthy range. Maintain balanced fertilization.";
}

function buildSoilHealthCard() {
    const name = document.getElementById("farmerName").value.trim();
    const area = document.getElementById("farmerArea").value.trim();
    const card = document.getElementById("soilHealthCard");
    const nitrogen = document.getElementById("soilCardNitrogen").textContent;
    const phosphorus = document.getElementById("soilCardPhosphorus").textContent;
    const potassium = document.getElementById("soilCardPotassium").textContent;

    if (!name || !area || [nitrogen, phosphorus, potassium].includes("--")) {
        card.hidden = false;
        card.innerHTML = "<strong>Complete the farmer name, farm area, and connect the Arduino sensor first.</strong>";
        return;
    }

    const details = [
        ["Phone", document.getElementById("farmerPhone").value.trim()],
        ["Village", document.getElementById("farmerVillage").value.trim()],
        ["District", document.getElementById("farmerDistrict").value.trim()],
        ["State", document.getElementById("farmerState").value.trim()],
        ["Farm area", `${area} acres`],
        ["Current crop", document.getElementById("farmerCrop").value.trim()]
    ].filter(([, value]) => value);

    card.hidden = false;
    card.innerHTML = `
        <div class="soil-health-card-header">
            <div><span>DHARA</span><h3>Soil Health Card</h3></div>
            <strong>${new Date().toLocaleDateString()}</strong>
        </div>
        <p><strong>Farmer:</strong> ${escapeHtml(name)}</p>
        <div class="soil-health-details">${details.map(([label, value]) => `<span><b>${label}</b>${escapeHtml(value)}</span>`).join("")}</div>
        <div class="soil-health-npk"><span>N <b>${nitrogen}</b></span><span>P <b>${phosphorus}</b></span><span>K <b>${potassium}</b></span></div>
        <p><strong>Assessment:</strong> ${escapeHtml(document.getElementById("soilScore").textContent)}. ${escapeHtml(document.getElementById("soilSuggestion").textContent)}</p>
        <button type="button" class="print-card-btn" onclick="downloadSoilCardPdf()">Download / Print PDF</button>
    `;
}

function downloadSoilCardPdf() {
    const card = document.getElementById("soilHealthCard");
    if (!card || card.hidden) return;
    window.print();
}

function escapeHtml(value) {
    return String(value ?? "").replace(/[&<>'"]/g, (character) => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "'": "&#39;",
        '"': "&quot;"
    }[character]));
}


// =============================
// FERTILIZER
// =============================

function setLiveInput(id, value, source) {
    const input = document.getElementById(id);
    if (!input || !Number.isFinite(Number(value))) return;
    input.value = value;
    input.dataset.filledBy = source;
}

function clearLiveInputs(source) {
    document.querySelectorAll("input").forEach((input) => {
        if (input.dataset.filledBy === source) {
            input.value = "";
            delete input.dataset.filledBy;
        }
    });
}

function applyWeatherToCropForm() {
    if (Number.isFinite(liveWeather.temp)) setLiveInput("cropTemp", liveWeather.temp, "weather");
    if (Number.isFinite(liveWeather.humidity)) setLiveInput("cropHumidity", liveWeather.humidity, "weather");
}

function optionalNumber(id) {
    const input = document.getElementById(id);
    if (!input || String(input.value).trim() === "") return null;
    const value = Number(input.value);
    return Number.isFinite(value) ? value : null;
}

function refreshPrediction() {
    const key = ["cropN", "cropP", "cropK", "cropPH", "cropTemp", "cropHumidity", "cropRainfall"]
        .map((id) => optionalNumber(id))
        .join("|");
    if (key === lastPredictionKey) return;
    lastPredictionKey = key;
    predictCrop();
}

function calculateFertilizer(){

    const n=Number(document.getElementById("nValue").value) || 0;
    const p=Number(document.getElementById("pValue").value) || 0;
    const k=Number(document.getElementById("kValue").value) || 0;
    const area=Number(document.getElementById("area").value) || 0;
    const soilPH = sensorPH ?? 6.5;
    const pHSource = sensorPH === null ? "automatic working estimate" : "live sensor";

    if (!sensorConnected) {
        document.getElementById("fertilizerResult").textContent = "Connect the Arduino sensor to receive real-time fertilizer data.";
        return;
    }

    if(area<=0){
        document.getElementById("fertilizerResult").textContent = "Enter a farm area greater than zero.";
        return;
    }

    // Recommended plant nutrient demand in kg per acre (N, P2O5, K2O).
    // Soil sensor values are mg/kg, so they are used as sufficiency bands,
    // not directly converted to kilograms of fertilizer.
    const cropDemand = {
        general: [40, 20, 20], rice: [50, 25, 25], wheat: [45, 20, 20],
        maize: [55, 25, 25], cotton: [45, 20, 20], soybean: [20, 30, 20],
        sugarcane: [80, 35, 35], tomato: [60, 30, 40], potato: [60, 30, 40]
    };
    const crop = document.getElementById("fertilizerCrop").value;
    const [demandN, demandP, demandK] = cropDemand[crop] || cropDemand.general;
    const soilFactor = (value, sufficient, medium) => {
        if (value >= sufficient) {
            return 0.25;
        }
        if (value >= medium) {
            return 0.60;
        }
        return 1;
    };
    let phFactor = 1;
    if (soilPH !== null && !(soilPH >= 6 && soilPH <= 7.5)) {
        if (soilPH >= 5.5 && soilPH <= 8) {
            phFactor = 1.1;
        } else {
            phFactor = 1.25;
        }
    }
    const nitrogenNeed = demandN * soilFactor(n, 120, 60) * area * phFactor;
    const phosphorusNeed = demandP * soilFactor(p, 60, 30) * area * phFactor;
    const potassiumNeed = demandK * soilFactor(k, 80, 40) * area * phFactor;
    const dap = phosphorusNeed / 0.46;
    const dapNitrogen = dap * 0.18;
    const urea = Math.max(0, nitrogenNeed - dapNitrogen) / 0.46;
    const mop = potassiumNeed / 0.60;
    const compost=1000*area;

    const amountLabel = (amount) => amount < 0.1 ? "Not required" : `${amount.toFixed(1)} kg`;
    const phAdjustmentText = phFactor === 1 ? "normal" : `${Math.round((phFactor - 1) * 100)}%`;
    const phMessage = sensorPH === null
        ? "This neutral value is used because the connected Arduino sketch measures NPK only; it is not a measured soil pH."
        : `A ${phAdjustmentText} pH efficiency adjustment was applied.`;

    document.getElementById("fertilizerResult").innerHTML=`

        <h3>🌱 Recommendation</h3>

        <hr><br>

        Urea : <b>${amountLabel(urea)}</b><br><br>

        DAP : <b>${amountLabel(dap)}</b><br><br>

        MOP : <b>${amountLabel(mop)}</b><br><br>

        Organic Compost : <b>${compost.toFixed(1)} kg</b><br><br>

        <small>Soil pH: <b>${soilPH.toFixed(1)} (${pHSource})</b>. ${phMessage} Urea supplies 46% N, DAP supplies 46% P₂O₅ and MOP supplies 60% K₂O. Confirm with a local soil laboratory.</small>

    `;

}


// =============================
// CROP PREDICTION
// =============================

function predictCrop() {

    const measured = {
        n: optionalNumber("cropN"),
        p: optionalNumber("cropP"),
        k: optionalNumber("cropK"),
        ph: optionalNumber("cropPH"),
        temp: optionalNumber("cropTemp"),
        humidity: optionalNumber("cropHumidity"),
        rainfall: optionalNumber("cropRainfall")
    };

    const cropProfiles = [
        { name: "🌾 Rice", profit: "₹60,000", water: "High", n: [50, 140], p: [15, 70], k: [30, 120], ph: [5.5, 7.2], temp: [22, 35], humidity: [70, 95], rainfall: [150, 400] },
        { name: "🌾 Wheat", profit: "₹50,000", water: "Medium", n: [40, 130], p: [15, 60], k: [30, 120], ph: [6, 7.5], temp: [12, 25], humidity: [40, 75], rainfall: [40, 120] },
        { name: "🌽 Maize", profit: "₹45,000", water: "Medium", n: [50, 160], p: [15, 70], k: [35, 140], ph: [5.8, 7.5], temp: [20, 34], humidity: [45, 85], rainfall: [50, 160] },
        { name: "🧵 Cotton", profit: "₹1,00,000", water: "Medium", n: [40, 140], p: [15, 60], k: [40, 150], ph: [6, 8], temp: [22, 36], humidity: [40, 75], rainfall: [50, 140] },
        { name: "🌱 Soybean", profit: "₹55,000", water: "Medium", n: [20, 90], p: [20, 70], k: [35, 140], ph: [6, 7.5], temp: [20, 32], humidity: [50, 85], rainfall: [60, 150] },
        { name: "🍃 Sugarcane", profit: "₹1,20,000", water: "High", n: [70, 200], p: [20, 80], k: [50, 180], ph: [6, 7.8], temp: [22, 36], humidity: [60, 95], rainfall: [120, 320] },
        { name: "🍅 Tomato", profit: "₹80,000", water: "Medium", n: [60, 160], p: [25, 80], k: [50, 160], ph: [5.8, 7.2], temp: [18, 32], humidity: [50, 85], rainfall: [40, 130] },
        { name: "🥔 Potato", profit: "₹70,000", water: "Medium", n: [50, 150], p: [25, 80], k: [60, 180], ph: [5.2, 6.8], temp: [14, 26], humidity: [55, 90], rainfall: [40, 120] }
    ];

    const factorNames = { n: "nitrogen", p: "phosphorus", k: "potassium", ph: "soil pH", temp: "temperature", humidity: "humidity", rainfall: "rainfall" };
    let crops = cropProfiles.map((profile) => {
        const matched = [];
        const missed = [];
        Object.keys(factorNames).forEach((factor) => {
            const value = measured[factor];
            if (value === null) return;
            const [min, max] = profile[factor];
            if (value >= min && value <= max) matched.push(factorNames[factor]);
            else missed.push(factorNames[factor]);
        });
        const checked = matched.length + missed.length;
        return {
            name: profile.name,
            profit: profile.profit,
            water: profile.water,
            score: checked ? Math.round((matched.length / checked) * 100) : 0,
            reason: matched.length
                ? `Matches ${matched.slice(0, 3).join(", ")}.`
                : "The current readings are outside this crop's preferred range."
        };
    }).filter((crop) => crop.score > 0);

    crops.sort((a, b) => b.score - a.score);
    crops = crops.slice(0, 3);

    // Update the "AI Advice" card on the dashboard
    if (crops.length > 0) {
        setText("topCrop", crops[0].name);
        setText("confidence", "Confidence : " + crops[0].score + "%");
        setText("altCrop", "Alternative : " + (crops[1] ? crops[1].name : "None"));
    } else {
        setText("topCrop", "No match");
        setText("confidence", "Confidence : --");
        setText("altCrop", "Alternative : --");
    }

    let html = "";

    crops.slice(0,3).forEach((crop,index)=>{

        let medal;
        if (index == 0) {
            medal = "🥇";
        } else if (index == 1) {
            medal = "🥈";
        } else {
            medal = "🥉";
        }

        html += `

        <div class="crop-result-card">

            <h3>

            ${medal}

            ${crop.name}

            </h3>

            <p><strong>Suitability:</strong> ${crop.score}%</p>

            <p><strong>Profit:</strong> ${crop.profit}</p>

            <p><strong>Water:</strong> ${crop.water}</p>

            <p>${crop.reason}</p>

        </div>

        `;

    });

    const rainfallNote = measured.rainfall === null
        ? "<p>Seasonal rainfall was not measured, so it was left out of the score. Add it if you know the local rainfall.</p>"
        : "";
    const result = document.getElementById("cropResult");
    if (!result) return;
    result.innerHTML = (html ||
        "<div class=\"crop-item\"><h3>No suitable crop found</h3><p>Connect the sensor or enter soil and weather values.</p></div>") + rainfallNote;

}

// =============================

window.addEventListener("DOMContentLoaded", () => {
    if (!localStorage.getItem("dharaToken")) return;
    initLanguageSwitcher();
    attachMarketSearch();
    attachCommunityEvents();
    renderCommunityFeed();
    getLocation();
    startMarketUpdates();
});

function scrollToSection(id) {

    document.getElementById(id).scrollIntoView({

        behavior: "smooth"

    });

}

function logout() {

    localStorage.clear();

    window.location.href = "login.html";

}

function setText(id, value) {
    const element = document.getElementById(id);
    if (element) element.textContent = value;
}

function applyLanguage(language = currentLanguage) {
    currentLanguage = language;
    const dictionary = translations[language] || translations.en;

    document.querySelectorAll("[data-i18n]").forEach((node) => {
        const key = node.dataset.i18n;
        if (dictionary[key]) {
            node.textContent = dictionary[key];
        }
    });

    document.querySelectorAll("[data-i18n-placeholder]").forEach((node) => {
        const key = node.dataset.i18nPlaceholder;
        if (dictionary[key]) {
            node.setAttribute("placeholder", dictionary[key]);
        }
    });
}

function initLanguageSwitcher() {
    const switcher = document.getElementById("languageSwitcher");
    if (!switcher) return;

    switcher.addEventListener("change", (event) => {
        applyLanguage(event.target.value);
    });

    applyLanguage();
}

function getCommunityCategoryLabel(category) {
    if (category === "Pest Control") return "Pest Control";
    if (category === "Equipment & Tools") return "Equipment & Tools";
    if (category === "General Chat") return "General Chat";
    return "Crops";
}

function renderCommunityFeed(filter = "All") {
    const feed = document.getElementById("communityFeed");
    if (!feed) return;

    const filteredPosts = filter === "All"
        ? communityPosts
        : communityPosts.filter((post) => post.category === filter);

    if (!filteredPosts.length) {
        feed.innerHTML = '<div class="community-empty">No posts in this category yet.</div>';
        return;
    }

    feed.innerHTML = filteredPosts.map((post) => `
        <article class="community-post" data-id="${post.id}">
            <div class="community-post-header">
                <span class="badge">${escapeHtml(post.category)}</span>
                <strong>${post.votes} 👍</strong>
            </div>
            <h3>${escapeHtml(post.title)}</h3>
            <p>${escapeHtml(post.message)}</p>
            <div class="community-actions">
                <button class="vote-btn" type="button" data-vote="${post.id}">Upvote</button>
                <button class="comment-toggle" type="button" data-comments="${post.id}">Comments (${post.comments.length})</button>
            </div>
            <div class="community-comments" id="comments-${post.id}">
                <div class="community-comment-list">
                    ${post.comments.map((comment) => `<div class="community-comment-item">${escapeHtml(comment)}</div>`).join("")}
                </div>
                <div class="comment-box">
                    <input type="text" class="comment-input" data-comment-input="${post.id}" placeholder="Add a comment...">
                    <button class="comment-submit" type="button" data-comment-submit="${post.id}">Post</button>
                </div>
            </div>
        </article>
    `).join("");
}

function attachCommunityEvents() {
    document.querySelectorAll(".filter-chip").forEach((button) => {
        button.addEventListener("click", () => {
            document.querySelectorAll(".filter-chip").forEach((chip) => chip.classList.remove("active"));
            button.classList.add("active");
            renderCommunityFeed(button.dataset.filter);
        });
    });

    const postBtn = document.getElementById("communityPostBtn");
    if (postBtn) {
        postBtn.addEventListener("click", () => {
            const title = document.getElementById("communityTitle")?.value.trim();
            const message = document.getElementById("communityMessage")?.value.trim();
            const category = document.getElementById("communityCategory")?.value || "Crops";

            if (!title || !message) return;

            communityPosts.unshift({
                id: Date.now(),
                title,
                category,
                message,
                votes: 1,
                comments: [],
            });

            document.getElementById("communityTitle").value = "";
            document.getElementById("communityMessage").value = "";
            renderCommunityFeed(document.querySelector(".filter-chip.active")?.dataset.filter || "All");
        });
    }

    document.addEventListener("click", (event) => {
        const voteBtn = event.target.closest("[data-vote]");
        if (voteBtn) {
            const postId = Number(voteBtn.dataset.vote);
            const post = communityPosts.find((item) => item.id === postId);
            if (post) post.votes += 1;
            renderCommunityFeed(document.querySelector(".filter-chip.active")?.dataset.filter || "All");
            return;
        }

        const commentToggle = event.target.closest("[data-comments]");
        if (commentToggle) {
            const postId = Number(commentToggle.dataset.comments);
            const panel = document.getElementById(`comments-${postId}`);
            if (panel) {
                panel.classList.toggle("open");
            }
            return;
        }

        const commentSubmit = event.target.closest("[data-comment-submit]");
        if (commentSubmit) {
            const postId = Number(commentSubmit.dataset.commentSubmit);
            const input = document.querySelector(`[data-comment-input="${postId}"]`);
            if (!input?.value.trim()) return;
            const post = communityPosts.find((item) => item.id === postId);
            if (post) {
                post.comments.push(input.value.trim());
                renderCommunityFeed(document.querySelector(".filter-chip.active")?.dataset.filter || "All");
            }
        }
    });
}

function marketRowKey(item) {
    return [item.commodity, item.market, item.state, item.variety, item.arrival_date].join("|").toLowerCase();
}

function setMarketStatus(message) {
    const status = document.getElementById("marketLiveStatus");
    if (status) status.textContent = message;
}

function marketClock(value) {
    const date = value ? new Date(value) : new Date();
    if (Number.isNaN(date.getTime())) return "";
    return date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

function startMarketUpdates() {
    const searchInput = document.getElementById("marketSearch");
    loadMarketPrices(searchInput?.value.trim() || "").catch((error) => console.error("Market prices error:", error));
    if (marketRefreshTimer) clearInterval(marketRefreshTimer);
    marketRefreshTimer = setInterval(() => {
        const currentSearch = document.getElementById("marketSearch")?.value.trim() || "";
        loadMarketPrices(currentSearch, true).catch((error) => console.error("Market prices error:", error));
    }, 15000);
}

async function loadMarketPrices(searchTerm = "", silent = false) {
    const marketBox = document.getElementById("marketData");
    if (!marketBox) return;

    try {
        const params = new URLSearchParams();
        if (searchTerm.trim()) {
            params.set("commodity", searchTerm.trim());
        }

        const hasTable = Boolean(marketBox.querySelector("table"));
        if (!silent || !hasTable) {
            marketBox.className = "";
            marketBox.innerHTML = searchTerm.trim()
                ? "Loading live market prices..."
                : "Loading all live market prices...";
        }

        const response = await fetch(`${API_BASE_URL}/market?${params}`);
        const data = await response.json();

        if (!response.ok) {
            if (hasTable && silent) {
                setMarketStatus(data.message || "Could not refresh market prices. Showing the last rates.");
                return;
            }
            marketBox.innerHTML = `<p>${escapeHtml(data.message || "Market prices could not be loaded.")}</p>`;
            return;
        }

        if (!Array.isArray(data.records) || !data.records.length) {
            marketRevision = "";
            marketBox.innerHTML = searchTerm.trim()
                ? "<p>No live market price data found for that search.</p>"
                : "<p>No live market price data available.</p>";
            setMarketStatus("Waiting for published mandi rates.");
            return;
        }

        const changed = data.revision && data.revision !== marketRevision;
        if (!changed && hasTable) {
            const checked = marketClock(data.updatedAt);
            setMarketStatus(data.stale
                ? `Showing the last published rates${checked ? " from " + checked : ""}. The price service is busy, so this will refresh when it responds.`
                : `Prices unchanged${checked ? " as of " + checked : ""}. This table updates automatically when a mandi rate changes.`);
            return;
        }

        const cell = (value, fallback) => escapeHtml(value || fallback);
        const rows = data.records.map((item) => {
            const key = marketRowKey(item);
            const previous = marketPricesSeen.get(key);
            const modal = String(item.modal_price ?? "");
            const rateChanged = previous !== undefined && previous !== modal;
            marketPricesSeen.set(key, modal);
            return `
            <tr>
                <td>${cell(item.commodity, "Commodity")}</td>
                <td>${cell(item.market, "Market")}</td>
                <td>${cell(item.state, "State")}</td>
                <td>${cell(item.arrival_date, "Date")}</td>
                <td>₹${cell(item.min_price, "--")}</td>
                <td>₹${cell(item.max_price, "--")}</td>
                <td class="${rateChanged ? "market-rate-changed" : ""}">₹${cell(item.modal_price, "--")}</td>
            </tr>`;
        }).join("");

        marketRevision = data.revision || "";
        marketBox.className = "";
        marketBox.innerHTML = `
            <table class="market-table">
                <thead>
                    <tr>
                        <th>Commodity</th>
                        <th>Market</th>
                        <th>State</th>
                        <th>Date</th>
                        <th>Min</th>
                        <th>Max</th>
                        <th>Modal</th>
                    </tr>
                </thead>
                <tbody>${rows}</tbody>
            </table>
        `;
        const checked = marketClock(data.updatedAt);
        setMarketStatus(changed && hasTable
            ? `Rates updated${checked ? " at " + checked : ""}. Changed prices are highlighted.`
            : `Live mandi rates${checked ? " as of " + checked : ""}. This table updates automatically when a published price changes.`);
    } catch (err) {
        console.error("Market error:", err);
        if (silent && marketBox.querySelector("table")) {
            setMarketStatus("Could not refresh market prices. Showing the last rates.");
            return;
        }
        marketBox.innerHTML = "<p>Could not load live market prices.</p>";
    }
}

function attachMarketSearch() {
    const searchInput = document.getElementById("marketSearch");
    const searchBtn = document.getElementById("marketSearchBtn");
    if (!searchInput || !searchBtn) return;

    searchBtn.addEventListener("click", () => {
        loadMarketPrices(searchInput.value.trim()).catch((error) => console.error("Market prices error:", error));
    });

    searchInput.addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
            loadMarketPrices(searchInput.value.trim()).catch((error) => console.error("Market prices error:", error));
        }
    });
}


// =============================
// HONEST DEFAULTS (before a sensor is connected)
// =============================

function initDashboard() {
    sensorConnected = false;
    setText("soilScore", "--");
    setText("sensorStatus", "⚪ No Sensor Connected");
    setText("soilMoisture", "--%");
    setText("soilHealthStatus", "Waiting for sensor...");
    setText("soilSuggestion", "No soil readings are available yet.");
    setText("weatherStatus", "🌤 Safe Farming Weather");
    setText("rainChance", "--%");
    document.getElementById("generateSoilCardBtn")?.addEventListener("click", buildSoilHealthCard);
    initLocationSelectors();
    loadSensorReading().catch((error) => console.error("Sensor reading error:", error));
    sensorRefreshTimer = setInterval(loadSensorReading, 3000);
}

if (localStorage.getItem("dharaToken")) {
    initDashboard();
}

function initLocationSelectors() {
    const stateSelect = document.getElementById("farmerState");
    const districtSelect = document.getElementById("farmerDistrict");
    const villageSelect = document.getElementById("farmerVillage");
    if (!stateSelect || !districtSelect || !villageSelect) return;

    indianStates.forEach((state) => stateSelect.add(new Option(state, state)));
    stateSelect.addEventListener("change", async () => {
        districtSelect.replaceChildren(new Option("Loading districts...", ""));
        villageSelect.replaceChildren(new Option("Select district first", ""));
        districtSelect.disabled = true;
        villageSelect.disabled = true;
        const offices = await loadStateLocations(stateSelect.value);
        const districts = [...new Set(offices.map((office) => office.District).filter(Boolean))].sort((a, b) =>
            a.localeCompare(b, undefined, { sensitivity: "base" })
        );
        districtSelect.replaceChildren(new Option("Select district", ""), ...districts.map((district) => new Option(district, district)));
        districtSelect.disabled = districts.length === 0;
    });
    districtSelect.addEventListener("change", async () => {
        villageSelect.replaceChildren(new Option("Loading villages...", ""));
        villageSelect.disabled = true;
        const villages = await loadDistrictVillages(districtSelect.value);
        villageSelect.replaceChildren(new Option("Select village", ""), ...villages.map((village) => new Option(village, village)));
        villageSelect.disabled = villages.length === 0;
    });
}

async function loadStateLocations(state) {
    if (!state) return [];
    if (locationCache.has(state)) return locationCache.get(state);
    try {
        const response = await fetch("https://countriesnow.space/api/v0.1/countries/state/cities", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ country: "India", state })
        });
        const data = await response.json();
        const offices = (data.data || []).map((city) => ({ District: city, Name: city }));
        locationCache.set(state, offices);
        return offices;
    } catch (error) {
        console.error("Location options error:", error);
        return [];
    }
}

async function loadDistrictVillages(district) {
    try {
        const response = await fetch(`https://api.postalpincode.in/postoffice/${encodeURIComponent(district)}`);
        const data = await response.json();
        const villages = [...new Set((data[0]?.PostOffice || []).map((office) => office.Name).filter(Boolean))];

        villages.sort((left, right) =>
            left.localeCompare(right, undefined, { sensitivity: "base" })
        );

        return villages;
    } catch (error) {
        console.error("Village options error:", error);
        return [];
    }
}


// =============================
// AI ASSISTANT (with live location + weather)
// =============================

async function askAI() {
    const input = document.getElementById("chatInput");
    const answerBox = document.getElementById("chatAnswer");
    const askButton = document.getElementById("askAiBtn");
    const question = input.value.trim();

    if (!question) {
        answerBox.textContent = "Please type a question first.";
        return;
    }

    // Pull location + weather already shown on the dashboard
    const city = document.getElementById("city")?.textContent || "";
    const district = document.getElementById("district")?.textContent || "";
    const state = document.getElementById("state")?.textContent || "";
    const temp = document.getElementById("temperature")?.textContent || "";
    const humidity = document.getElementById("humidity")?.textContent || "";
    const condition = document.getElementById("condition")?.textContent || "";
    const nitrogen = document.getElementById("nitrogen")?.textContent || "--";
    const phosphorus = document.getElementById("phosphorus")?.textContent || "--";
    const potassium = document.getElementById("potassium")?.textContent || "--";

    // Build a question that already includes the farmer's real context
    const fullQuestion = `
${question}

Farmer's current details (use these directly, do NOT ask for them):
- Location: ${city}, ${district}, ${state}
- Temperature: ${temp}
- Humidity: ${humidity}
- Weather: ${condition}
- Live soil NPK: N ${nitrogen}, P ${phosphorus}, K ${potassium}
`;

    answerBox.style.whiteSpace = "normal";
    answerBox.textContent = "Thinking...";
    askButton.disabled = true;

    try {
        const response = await fetch(`${API_BASE_URL}/ai/chat`, {
            method: "POST",
            headers: authHeaders({ "Content-Type": "application/json" }),
            body: JSON.stringify({ question: fullQuestion })
        });

        const data = await response.json().catch(() => ({}));

        if (response.status === 401) {
            redirectToLogin();
            return;
        }

        if (response.ok && data.success && data.answer) {
            answerBox.innerHTML = formatMarkdown(data.answer);
        } else {
            answerBox.textContent = data.message || `Assistant request failed (${response.status}).`;
        }

    } catch (err) {
        console.error("AI error:", err);
        answerBox.textContent = "Could not reach the AI assistant. Check that the backend is running.";
    } finally {
        askButton.disabled = false;
    }
}


function formatMarkdownLine(inputLine) {
    const line = inputLine.endsWith("\r") ? inputLine.slice(0, -1) : inputLine;
    const listLine = line.trimStart();

    if (listLine.startsWith("- ") || listLine.startsWith("* ")) {
        return { html: `<li>${formatInlineMarkdown(listLine.slice(2))}</li>`, isListItem: true };
    }
    const heading = [
        ["#### ", "h4"],
        ["### ", "h4"],
        ["## ", "h3"],
        ["# ", "h3"]
    ].find(([prefix]) => line.startsWith(prefix));
    if (heading) {
        return {
            html: `<${heading[1]}>${formatInlineMarkdown(line.slice(heading[0].length))}</${heading[1]}>`,
            isListItem: false
        };
    }
    if (line === "---") return { html: "<hr>", isListItem: false };

    return { html: formatInlineMarkdown(line), isListItem: false };
}

function formatInlineMarkdown(text) {
    return escapeHtml(text).replace(/\*\*([^*\r\n]+)\*\*/g, "<b>$1</b>");
}

// Turns the AI's markdown (###, **bold**, * bullets, ---) into clean HTML.
function formatMarkdown(text) {
    const wrappedLines = [];
    let listItems = [];

    for (const inputLine of text.split("\n")) {
        const formattedLine = formatMarkdownLine(inputLine);
        if (formattedLine.isListItem) {
            listItems.push(formattedLine.html);
            continue;
        }

        if (listItems.length > 0) {
            wrappedLines.push(`<ul>${listItems.join("")}</ul>`);
            listItems = [];
        }
        wrappedLines.push(formattedLine.html);
    }

    if (listItems.length > 0) {
        wrappedLines.push(`<ul>${listItems.join("")}</ul>`);
    }

    return wrappedLines.join("<br>");
}


// =============================
// DISEASE DETECTION
// =============================

let diseaseCameraStream = null;
let capturedDiseaseFile = null;

function previewDisease() {
    const file = document.getElementById("diseaseImage").files[0];
    const preview = document.getElementById("diseasePreview");
    capturedDiseaseFile = null;
    if (!file) { preview.style.display = "none"; return; }
    preview.src = URL.createObjectURL(file);
    preview.style.display = "block";
}

async function startDiseaseCamera() {
    const camera = document.getElementById("diseaseCamera");
    const captureButton = document.getElementById("captureCameraBtn");
    const resultBox = document.getElementById("diseaseResult");

    if (!navigator.mediaDevices?.getUserMedia) {
        resultBox.textContent = "Camera access is not supported. Use the image upload option.";
        return;
    }

    try {
        diseaseCameraStream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: { ideal: "environment" } },
            audio: false
        });
        camera.srcObject = diseaseCameraStream;
        camera.hidden = false;
        captureButton.hidden = false;
    } catch (error) {
        console.error("Camera error:", error);
        resultBox.textContent = "Camera permission was denied or the camera is unavailable.";
    }
}

function captureDiseaseImage() {
    const camera = document.getElementById("diseaseCamera");
    const canvas = document.getElementById("diseaseCanvas");
    const preview = document.getElementById("diseasePreview");
    if (!diseaseCameraStream || !camera.videoWidth) return;

    canvas.width = camera.videoWidth;
    canvas.height = camera.videoHeight;
    canvas.getContext("2d").drawImage(camera, 0, 0, canvas.width, canvas.height);
    canvas.toBlob((blob) => {
        if (!blob) return;
        capturedDiseaseFile = new File([blob], "camera-crop.jpg", { type: "image/jpeg" });
        preview.src = URL.createObjectURL(blob);
        preview.style.display = "block";
        camera.hidden = true;
        document.getElementById("captureCameraBtn").hidden = true;
        diseaseCameraStream.getTracks().forEach((track) => track.stop());
        diseaseCameraStream = null;
    }, "image/jpeg", 0.92);
}

function compressDiseaseImage(file) {
    return new Promise((resolve, reject) => {
        const image = new Image();
        const objectUrl = URL.createObjectURL(file);
        image.onload = () => {
            const maxDimension = 1600;
            const scale = Math.min(1, maxDimension / Math.max(image.width, image.height));
            const canvas = document.createElement("canvas");
            canvas.width = Math.max(1, Math.round(image.width * scale));
            canvas.height = Math.max(1, Math.round(image.height * scale));
            canvas.getContext("2d").drawImage(image, 0, 0, canvas.width, canvas.height);
            canvas.toBlob((blob) => {
                URL.revokeObjectURL(objectUrl);
                if (!blob) {
                    reject(new Error("Could not prepare the image."));
                    return;
                }
                resolve(blob);
            }, "image/jpeg", 0.82);
        };
        image.onerror = () => {
            URL.revokeObjectURL(objectUrl);
            reject(new Error("Could not read the image."));
        };
        image.src = objectUrl;
    });
}

async function detectDisease() {
    const fileInput = document.getElementById("diseaseImage");
    const resultBox = document.getElementById("diseaseResult");
    const detectButton = document.getElementById("detectDiseaseBtn");
    const file = capturedDiseaseFile || fileInput.files[0];

    if (!file) {
        resultBox.textContent = "Please choose an image first.";
        return;
    }

    resultBox.style.whiteSpace = "normal";
    resultBox.textContent = "Preparing image...";
    detectButton.disabled = true;

    try {
        const compressedBlob = await compressDiseaseImage(file);
        const base64 = await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result.split(",")[1]);
            reader.onerror = () => reject(new Error("The image could not be read."));
            reader.readAsDataURL(compressedBlob);
        });
        resultBox.textContent = "Analyzing crop image...";
        const response = await fetch(`${API_BASE_URL}/ai/disease`, {
            method: "POST",
            headers: authHeaders({ "Content-Type": "application/json" }),
            body: JSON.stringify({ image: base64, mimeType: "image/jpeg" })
        });
        if (response.status === 401) {
            redirectToLogin();
            return;
        }
        const data = await response.json().catch(() => ({}));
        resultBox.innerHTML = data.success
            ? formatMarkdown(data.answer)
            : `<strong>Detection failed:</strong> ${escapeHtml(data.message || "The AI service returned no result.")}`;
    } catch (error) {
        console.error("Disease error:", error);
        resultBox.textContent = error.message || "Could not analyze this image.";
    } finally {
        detectButton.disabled = false;
    }
}

document.getElementById("startCameraBtn")?.addEventListener("click", startDiseaseCamera);
document.getElementById("captureCameraBtn")?.addEventListener("click", captureDiseaseImage);

