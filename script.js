const BASE_URL =
  "https://join473-22469-default-rtdb.europe-west1.firebasedatabase.app/";

let users = []; // Store users data

/**
 * Loads user data from Firebase database and stores it in the users array
 * This function fetches contact information from the Firebase Realtime Database
 */
async function loadUsers() {
  try {
    const response = await fetch(`${BASE_URL}contacts.json`);
    const data = await response.json();
    users = data;
  } catch (error) {
    console.error("Error loading users:", error);
  }
}

/**
 * Validates user credentials by checking email and password against stored user data
 * @param {string} email - The email address to validate
 * @param {string} password - The password to validate
 * @returns {boolean} - Returns true if credentials match, false otherwise
 */
function validateCredentials(email, password) {
  for (const key in users) {
    const user = users[key];
    if (user.email === email && user.password === password) {
      return true;
    }
  }
  return false;
}

/**
 * Updates the login button state based on input validation
 * Enables/disables the login button and changes its visual appearance
 * based on whether valid credentials are entered
 */
function updateLoginButtonState() {
  const email = document.getElementById("log-in-email").value;
  const password = document.getElementById("log-in-password").value;
  const loginButton = document.querySelector(".log-in-button");

  if (email && password && validateCredentials(email, password)) {
    loginButton.disabled = false;
    loginButton.style.opacity = "1";
    loginButton.style.cursor = "pointer";
  } else {
    loginButton.disabled = true;
    loginButton.style.opacity = "0.5";
    loginButton.style.cursor = "not-allowed";
  }
}

/**
 * Authenticates a user with provided email and password
 * If successful, stores user information in localStorage and returns true
 * @param {string} email - The user's email address
 * @param {string} password - The user's password
 * @returns {boolean} - Returns true if login successful, false otherwise
 */
async function loginUser(email, password) {
  try {
    // Find user with matching email and password
    for (const key in users) {
      const user = users[key];
      if (user.email === email && user.password === password) {
        // Store user info in localStorage
        localStorage.setItem(
          "currentUser",
          JSON.stringify({
            name: user.name,
            email: user.email,
          })
        );
        return true;
      }
    }
    return false;
  } catch (error) {
    console.error("Login error:", error);
    return false;
  }
}

/**
 * Handles the login form submission
 * Attempts to log in the user and redirects to summary page on success
 * Shows error message if login fails
 * @param {Event} event - The form submission event
 */
async function handleLogin(event) {
  event.preventDefault();

  const email = document.getElementById("log-in-email").value;
  const password = document.getElementById("log-in-password").value;

  const success = await loginUser(email, password);

  if (success) {
    window.location.href = "./summary.html";
  } else {
    alert("Invalid email or password");
  }
}

/**
 * Handles guest login functionality
 * Creates a guest user session and redirects to summary page
 * Stores guest user information in localStorage
 */
async function handleGuestLogin() {
  // Store guest user info
  localStorage.setItem(
    "currentUser",
    JSON.stringify({
      name: "Guest",
      email: "guest@join.com",
    })
  );
  window.location.href = "./summary.html";
}

/**
 * Updates the background image of password input field based on content
 * Shows different icons depending on whether the field has content
 * @param {HTMLInputElement} input - The password input element
 */
function updateBackgroundOnInput(input) {
  if (input.value.length > 0) {
    input.style.backgroundImage = 'url("assets/eye-closed.png")';
    input.style.backgroundSize = "21.65px 18.95px";
  } else {
    input.style.backgroundImage = 'url("assets/lock.png")';
    input.style.backgroundSize = "auto";
  }
}

/**
 * Toggles password visibility when clicking on the eye icon area
 * Changes input type between 'password' and 'text' and updates icon accordingly
 * Only works if the password field has content
 * @param {Event} event - The click event
 * @param {HTMLInputElement} input - The password input element
 */
function togglePasswordVisibilityOnClick(event, input) {
  // Only proceed if the field is not empty
  if (input.value.length === 0) return;

  const clickPosition = event.offsetX;
  const inputWidth = input.clientWidth;
  const iconWidth = 40; // Estimated width of the icon area

  if (clickPosition > inputWidth - iconWidth) {
    if (input.type === "password") {
      input.type = "text";
      input.style.backgroundImage = 'url("assets/eye.png")';
      input.style.backgroundSize = "21.65px 15px";
    } else {
      input.type = "password";
      input.style.backgroundImage = 'url("assets/eye-closed.png")';
      input.style.backgroundSize = "21.65px 18.95px";
    }
  }
}

/**
 * Initializes the password field toggle functionality
 * Sets up event listeners for input changes and clicks on the password field
 * Configures the initial visual state of the password input
 */
function initPasswordFieldToggle() {
  const passwordInput = document.getElementById("log-in-password");

  // Set initial status
  updateBackgroundOnInput(passwordInput);

  passwordInput.addEventListener("input", () =>
    updateBackgroundOnInput(passwordInput)
  );
  passwordInput.addEventListener("click", (event) =>
    togglePasswordVisibilityOnClick(event, passwordInput)
  );
}

/**
 * Main initialization function that runs when the DOM is loaded
 * Sets up all event listeners, loads user data, and initializes the login form
 * Configures real-time validation and form submission handling
 */
// Add event listeners when the document is loaded
document.addEventListener("DOMContentLoaded", async () => {
  const loginForm = document.querySelector(".log-in-form");
  const guestLoginButton = document.querySelector(".guest-login-button");
  const emailInput = document.getElementById("log-in-email");
  const passwordInput = document.getElementById("log-in-password");

  // Load users data
  await loadUsers();

  // Initialize password toggle functionality
  initPasswordFieldToggle();

  // Add input event listeners for real-time validation
  emailInput.addEventListener("input", updateLoginButtonState);
  passwordInput.addEventListener("input", updateLoginButtonState);

  loginForm.addEventListener("submit", handleLogin);
  guestLoginButton.addEventListener("click", handleGuestLogin);

  // Initial button state
  updateLoginButtonState();
});
