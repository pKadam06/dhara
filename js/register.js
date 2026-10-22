// =============================
// DHARA REGISTER
// =============================

const form = document.getElementById("registerForm");
const registerBtn = document.getElementById("registerBtn");
const message = document.getElementById("message");
const sendOtpBtn = document.getElementById("sendOtpBtn");
const locationBtn = document.getElementById("locationBtn");
const password = document.getElementById("password");
const confirmPassword = document.getElementById("confirmPassword");

let verifiedSignup = null;

const togglePassword = document.getElementById("togglePassword");
const toggleConfirm = document.getElementById("toggleConfirm");
const isLocalFrontend = window.location.protocol === "file:"
    || ["localhost", "127.0.0.1", "::1"].includes(window.location.hostname);
const API_BASE_URL = window.DHARA_API_BASE_URL || (isLocalFrontend
    ? `http://${window.location.hostname || "localhost"}:5000/api`
    : `${window.location.origin}/api`);


// =============================
// SHOW / HIDE PASSWORD
// =============================

togglePassword?.addEventListener("click", () => {

    if (password.type === "password") {

        password.type = "text";

        togglePassword.innerHTML =
            '<i class="fa-solid fa-eye-slash"></i>';

    } else {

        password.type = "password";

        togglePassword.innerHTML =
            '<i class="fa-solid fa-eye"></i>';

    }

});

toggleConfirm?.addEventListener("click", () => {

    if (confirmPassword.type === "password") {

        confirmPassword.type = "text";

        toggleConfirm.innerHTML =
            '<i class="fa-solid fa-eye-slash"></i>';

    } else {

        confirmPassword.type = "password";

        toggleConfirm.innerHTML =
            '<i class="fa-solid fa-eye"></i>';

    }

});


// =============================
// REGISTER
// =============================

form.addEventListener("submit", async (e) => {

    e.preventDefault();

    const fullName = document.getElementById("fullName").value.trim();
    const email = document.getElementById("email").value.trim();
    const phone = document.getElementById("phone").value.trim();
    const otp = document.getElementById("otp").value.trim();
    const state = document.getElementById("state").value.trim();
    const district = document.getElementById("district").value.trim();
    const village = document.getElementById("village").value.trim();

    const userPassword = password.value.trim();
    const confirm = confirmPassword.value.trim();

    const terms = document.getElementById("terms").checked;


    if (
        !fullName ||
        !email ||
        !phone ||
        !state ||
        !district ||
        !village ||
        !userPassword ||
        !confirm ||
        !otp
    ) {

        message.className = "error";
        message.innerHTML = "Please fill all fields.";

        return;

    }

    if (!/^\d{4,8}$/.test(otp)) {
        message.className = "error";
        message.innerHTML = "Enter the OTP sent to your email.";
        return;
    }

    if (!/^\d{10}$/.test(phone)) {
        message.className = "error";
        message.innerHTML = "Enter a 10-digit phone number.";
        return;
    }

    if (userPassword.length < 8) {
        message.className = "error";
        message.innerHTML = "Password must be at least 8 characters.";
        return;
    }

    if (userPassword !== confirm) {

        message.className = "error";
        message.innerHTML = "Passwords do not match.";

        return;

    }

    if (!terms) {

        message.className = "error";
        message.innerHTML = "Please accept Terms & Conditions.";

        return;

    }

    registerBtn.disabled = true;
    registerBtn.innerHTML = "Creating Account...";

    try {

        const normalizedEmail = email.toLowerCase();
        if (!verifiedSignup || verifiedSignup.email !== normalizedEmail) {
            const verifyResponse = await fetch(`${API_BASE_URL}/otp/verify`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: normalizedEmail, otp })
            });
            const verifyData = await verifyResponse.json().catch(() => ({}));

            if (!verifyResponse.ok || !verifyData.success || !verifyData.verificationToken) {
                throw new Error(verifyData.message || "Invalid OTP");
            }
            verifiedSignup = {
                email: normalizedEmail,
                token: verifyData.verificationToken
            };
        }

        const response = await fetch(

            `${API_BASE_URL}/auth/register`,

            {

                method: "POST",

                headers: {

                    "Content-Type": "application/json"

                },

                body: JSON.stringify({

                    fullName,
                    email,
                    password: userPassword,
                    phone,
                    state,
                    district,
                    village,
                    verificationToken: verifiedSignup.token

                })

            }

        );

        const data = await response.json().catch(() => ({}));

        if (!response.ok) {

            throw new Error(data.message || "Registration failed");

        }

        message.className = "success";
        message.innerHTML = "Registration Successful!";

        form.reset();

        setTimeout(() => {

            window.location.href = "login.html";

        }, 1500);

    }

    catch (error) {

        message.className = "error";
        message.innerHTML = error instanceof TypeError
            ? "Cannot reach the DHARA server. Check that the backend is running and try again."
            : error.message;

    }

    registerBtn.disabled = false;
    registerBtn.innerHTML = "Create Account";

});
// =====================
// SEND OTP
// =====================

sendOtpBtn.addEventListener("click", async () => {

    const email = document.getElementById("email").value.trim();

    if (!email) {
        alert("Enter email first");
        return;
    }

    sendOtpBtn.disabled = true;
    sendOtpBtn.innerHTML = "Sending...";

    try {

        const response = await fetch(`${API_BASE_URL}/otp/send`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                email: email
            })
        });

        const data = await response.json().catch(() => ({}));

        console.log("Status:", response.status);
        console.log("Response:", data);

        if (!response.ok || !data.success) {
            throw new Error(data.message || "Failed to send OTP");
        }

        message.className = "success";
        message.innerHTML = data.message;

    } catch (err) {

        console.error("OTP Error:", err);

        message.className = "error";
        message.innerHTML = err.message || "Failed to send OTP";

    }

    sendOtpBtn.disabled = false;
    sendOtpBtn.innerHTML = "Send OTP";

});
locationBtn?.addEventListener("click", () => {

    console.log("Location button clicked");

    navigator.geolocation.getCurrentPosition(
        fillLocation,
        locationError
    );

});

function locationError(error) {

    console.log(error);

    alert(error.message);

}

async function fillLocation(position) {

    const lat = position.coords.latitude;
    const lon = position.coords.longitude;

    try {

        const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}`
        );

        const data = await response.json();

        document.getElementById("state").value =
            data.address.state || "";

        document.getElementById("district").value =
            data.address.state_district || data.address.county || "";

        document.getElementById("village").value =
            data.address.village ||
            data.address.town ||
            data.address.city ||
            "";

    } catch (err) {

        console.log(err);

        alert("Unable to fetch location");

    }

}