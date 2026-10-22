// =============================
// DHARA LOGIN
// =============================

const form = document.getElementById("loginForm");
const loginBtn = document.getElementById("loginBtn");
const message = document.getElementById("message");
const togglePassword = document.getElementById("togglePassword");
const password = document.getElementById("password");
const googleLoginBtn = document.getElementById("googleLoginBtn");
const isLocalFrontend = window.location.protocol === "file:"
    || ["localhost", "127.0.0.1", "::1"].includes(window.location.hostname);
const API_BASE_URL = window.DHARA_API_BASE_URL || (isLocalFrontend
    ? `http://${window.location.hostname || "localhost"}:5000/api`
    : `${window.location.origin}/api`);

googleLoginBtn?.addEventListener("click", () => {
    googleLoginBtn.disabled = true;
    googleLoginBtn.textContent = "Connecting to Google...";
    window.location.href = `${API_BASE_URL}/auth/google`;
});

const googleParams = new URLSearchParams(window.location.hash.slice(1));
const googleToken = googleParams.get("google_token");
const googleUser = googleParams.get("google_user");
const googleError = googleParams.get("google_error");

if (googleToken && googleUser) {
    try {
        localStorage.setItem("dharaToken", googleToken);
        localStorage.setItem("dharaUser", googleUser);
        window.history.replaceState(null, "", window.location.pathname + window.location.search);
        window.location.href = "dashboard.html";
    } catch {
        message.className = "error";
        message.textContent = "Google sign-in succeeded, but your browser could not save the login. Enable site storage and try again.";
    }
} else if (googleError) {
    message.className = "error";
    message.textContent = googleError;
    window.history.replaceState(null, "", window.location.pathname + window.location.search);
}

// Show / Hide Password

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

// Login

form.addEventListener("submit", async (e) => {

    e.preventDefault();

    const email = document
        .getElementById("email")
        .value
        .trim();

    const userPassword = password.value;

    if (!email || !userPassword) {

        message.textContent = "Please fill all fields.";

        message.className = "error";

        return;

    }

    loginBtn.innerHTML = "Signing In...";

    loginBtn.disabled = true;

    try {

        const response = await fetch(
            `${API_BASE_URL}/auth/login`,
            {

                method: "POST",

                headers: {

                    "Content-Type":
                        "application/json"

                },

                body: JSON.stringify({

                    email: email,

                    password: userPassword

                })

            }
        );

        const data = await response.json().catch(() => ({}));

        if (!response.ok) {

            throw new Error(data.message || "Login failed");

        }

        if (!data.token || !data.user) {
            throw new Error("The server returned an incomplete login response. Please try again.");
        }

        localStorage.setItem(
            "dharaToken",
            data.token
        );

        localStorage.setItem(
            "dharaUser",
            JSON.stringify(data.user)
        );

        message.className = "success";

        message.textContent =
            "Login Successful! Redirecting...";

        setTimeout(() => {

            window.location.href =
                "dashboard.html";

        }, 1200);

    } catch (error) {

        message.className = "error";

        message.textContent = error instanceof TypeError
            ? "Cannot reach the DHARA server. Check that the backend is running and try again."
            : error.message;

    }

    loginBtn.innerHTML = "Login";

    loginBtn.disabled = false;

});


// Already Logged In

const token = localStorage.getItem("dharaToken");

if (token && !googleToken && !googleError) {
    window.location.replace("dashboard.html");
}