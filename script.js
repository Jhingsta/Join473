const BASE_URL = "https://join473-22469-default-rtdb.europe-west1.firebasedatabase.app/";

let users = []; // Store users data

async function loadUsers() {
    try {
        const response = await fetch(`${BASE_URL}contacts.json`);
        const data = await response.json();
        users = data;
    } catch (error) {
        console.error('Error loading users:', error);
    }
}

function validateCredentials(email, password) {
    for (const key in users) {
        const user = users[key];
        if (user.email === email && user.password === password) {
            return true;
        }
    }
    return false;
}

function updateLoginButtonState() {
    const email = document.getElementById('log-in-email').value;
    const password = document.getElementById('log-in-password').value;
    const loginButton = document.querySelector('.log-in-button');
    
    if (email && password && validateCredentials(email, password)) {
        loginButton.disabled = false;
        loginButton.style.opacity = '1';
        loginButton.style.cursor = 'pointer';
    } else {
        loginButton.disabled = true;
        loginButton.style.opacity = '0.5';
        loginButton.style.cursor = 'not-allowed';
    }
}

async function loginUser(email, password) {
    try {
        // Find user with matching email and password
        for (const key in users) {
            const user = users[key];
            if (user.email === email && user.password === password) {
                // Store user info in localStorage
                localStorage.setItem('currentUser', JSON.stringify({
                    name: user.name,
                    email: user.email
                }));
                return true;
            }
        }
        return false;
    } catch (error) {
        console.error('Login error:', error);
        return false;
    }
}

async function handleLogin(event) {
    event.preventDefault();
    
    const email = document.getElementById('log-in-email').value;
    const password = document.getElementById('log-in-password').value;
    
    const success = await loginUser(email, password);
    
    if (success) {
        window.location.href = 'summary/summary.html';
    } else {
        alert('Invalid email or password');
    }
}

async function handleGuestLogin() {
    // Store guest user info
    localStorage.setItem('currentUser', JSON.stringify({
        name: 'Guest',
        email: 'guest@join.com'
    }));
    window.location.href = 'summary/summary.html';
}

function updateBackgroundOnInput(input) {
    if (input.value.length > 0) {
        input.style.backgroundImage = 'url("assets/eye-closed.png")';
        input.style.backgroundSize = '21.65px 18.95px';
    } else {
        input.style.backgroundImage = 'url("assets/lock.png")';
        input.style.backgroundSize = 'auto';
    }
}

function togglePasswordVisibilityOnClick(event, input) {
    // Only proceed if the field is not empty
    if (input.value.length === 0) return;
    
    const clickPosition = event.offsetX;
    const inputWidth = input.clientWidth;
    const iconWidth = 40; // Estimated width of the icon area
    
    if (clickPosition > inputWidth - iconWidth) {
        if (input.type === 'password') {
            input.type = 'text';
            input.style.backgroundImage = 'url("assets/eye.png")';
            input.style.backgroundSize = '21.65px 15px';
        } else {
            input.type = 'password';
            input.style.backgroundImage = 'url("assets/eye-closed.png")';
            input.style.backgroundSize = '21.65px 18.95px';
        }
    }
}

function initPasswordFieldToggle() {
    const passwordInput = document.getElementById('log-in-password');
    
    // Set initial status
    updateBackgroundOnInput(passwordInput);
    
    passwordInput.addEventListener('input', () => updateBackgroundOnInput(passwordInput));
    passwordInput.addEventListener('click', (event) => togglePasswordVisibilityOnClick(event, passwordInput));
}

// Add event listeners when the document is loaded
document.addEventListener('DOMContentLoaded', async () => {
    const loginForm = document.querySelector('.log-in-form');
    const guestLoginButton = document.querySelector('.guest-login-button');
    const emailInput = document.getElementById('log-in-email');
    const passwordInput = document.getElementById('log-in-password');
    
    // Load users data
    await loadUsers();
    
    // Initialize password toggle functionality
    initPasswordFieldToggle();
    
    // Add input event listeners for real-time validation
    emailInput.addEventListener('input', updateLoginButtonState);
    passwordInput.addEventListener('input', updateLoginButtonState);
    
    loginForm.addEventListener('submit', handleLogin);
    guestLoginButton.addEventListener('click', handleGuestLogin);
    
    // Initial button state
    updateLoginButtonState();
});
