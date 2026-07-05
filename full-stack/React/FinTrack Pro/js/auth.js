const loginForm = document.getElementById("loginForm");
const registerForm = document.getElementById("registerForm");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const confirmPasswordInput = document.getElementById("confirmPassword");
const fullNameInput = document.getElementById("name");
const currencyInput = document.getElementById("currency");
const rememberMe = document.getElementById("rememberMe");
const togglePassword = document.getElementById("togglePassword");
const errorBox = document.getElementById("errorBox");
const loginBtn = document.getElementById("loginBtn");
const registerBtn = document.getElementById("registerBtn");

function showError(message) {
    if (!errorBox) {
        return;
    }

    errorBox.innerText = message;
    errorBox.style.display = "block";
}

function clearError() {
    if (!errorBox) {
        return;
    }

    errorBox.innerText = "";
    errorBox.style.display = "none";
}

function showLoading() {
    if (!loginBtn) {
        return;
    }

    loginBtn.disabled = true;
    loginBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Logging In...';
}

function hideLoading() {
    if (!loginBtn) {
        return;
    }

    loginBtn.disabled = false;
    loginBtn.innerHTML = '<span>Login</span><i class="fa-solid fa-arrow-right"></i>';
}

function showRegisterLoading() {
    if (!registerBtn) {
        return;
    }

    registerBtn.disabled = true;
    registerBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Creating Account...';
}

function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

async function hashPassword(password) {
    if (window.crypto?.subtle) {
        const encoder = new TextEncoder();
        const data = encoder.encode(password);
        const hashBuffer = await crypto.subtle.digest("SHA-256", data);
        return Array.from(new Uint8Array(hashBuffer)).map((byte) => byte.toString(16).padStart(2, "0")).join("");
    }

    return btoa(password.split("").reverse().join(""));
}

function redirectToDashboard() {
    window.location.href = "dashboard.html";
}

if (togglePassword && passwordInput) {
    togglePassword.addEventListener("click", () => {
        if (passwordInput.type === "password") {
            passwordInput.type = "text";
            togglePassword.innerHTML = '<i class="fa-solid fa-eye-slash"></i>';
        }
        else {
            passwordInput.type = "password";
            togglePassword.innerHTML = '<i class="fa-solid fa-eye"></i>';
        }
    });
}

if (registerForm) {
    registerForm.addEventListener("submit", async (event) => {
        event.preventDefault();
        clearError();

        const fullName = fullNameInput?.value.trim() || "";
        const email = emailInput?.value.trim() || "";
        const password = passwordInput?.value.trim() || "";
        const confirmPassword = confirmPasswordInput?.value.trim() || password;
        const currency = currencyInput?.value || window.FinTrackStore.DEFAULT_CURRENCY;

        if (fullName === "") {
            showError("Full name is required.");
            return;
        }

        if (email === "") {
            showError("Email is required.");
            return;
        }

        if (!validateEmail(email)) {
            showError("Please enter a valid email.");
            return;
        }

        if (password.length < 6) {
            showError("Password must contain at least 6 characters.");
            return;
        }

        if (password !== confirmPassword) {
            showError("Passwords do not match.");
            return;
        }

        const users = window.FinTrackStore.getUsers();

        if (users.some((user) => user.email.toLowerCase() === email.toLowerCase())) {
            showError("An account with that email already exists.");
            return;
        }

        showRegisterLoading();

        const newUser = {
            id: crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}`,
            name: fullName,
            email,
            password: await hashPassword(password),
            currency,
            createdAt: new Date().toISOString()
        };

        users.push(newUser);
        window.FinTrackStore.saveUsers(users);
        window.FinTrackStore.setCurrentUser(newUser);
        window.FinTrackStore.ensureDefaultPreferences(newUser);

        setTimeout(() => redirectToDashboard(), 500);
    });
}

if (loginForm) {
    loginForm.addEventListener("submit", async (event) => {
        event.preventDefault();
        clearError();

        const email = emailInput?.value.trim() || "";
        const password = passwordInput?.value.trim() || "";

        if (email === "") {
            showError("Email is required.");
            return;
        }

        if (!validateEmail(email)) {
            showError("Please enter a valid email.");
            return;
        }

        if (password.length < 6) {
            showError("Password must contain at least 6 characters.");
            return;
        }

        showLoading();

        const users = window.FinTrackStore.getUsers();
        const hashedPassword = await hashPassword(password);
        const user = users.find((entry) => entry.email === email && entry.password === hashedPassword);

        setTimeout(() => {
            if (!user) {
                hideLoading();
                showError("Invalid email or password.");
                return;
            }

            window.FinTrackStore.setCurrentUser(user);

            if (rememberMe?.checked) {
                localStorage.setItem("rememberUser", email);
            }
            else {
                localStorage.removeItem("rememberUser");
            }

            redirectToDashboard();
        }, 600);
    });
}

const remembered = localStorage.getItem("rememberUser");

if (remembered && emailInput) {
    emailInput.value = remembered;
}

const currentUser = window.FinTrackStore.getCurrentUser();

if (currentUser && !registerForm) {
    redirectToDashboard();
}