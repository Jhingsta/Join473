const BASE_URL = "https://join473-22469-default-rtdb.europe-west1.firebasedatabase.app/"

/**
 * Retrieves form data from the sign-up form inputs
 * @returns {Object} Object containing name, email, password, and confirmPassword values
 */
function getSignUpFormData() {
    const name = document.getElementById('sign-up-name').value;
    const email = document.getElementById('sign-up-email').value;
    const password = document.getElementById('sign-up-password').value;
    const confirmPassword = document.getElementById('sign-up-confirm-password').value;
    
    return { name, email, password, confirmPassword };
}

/**
 * Validates if the password and confirm password match
 * @param {string} password - The password entered by user
 * @param {string} confirmPassword - The password confirmation entered by user
 * @returns {boolean} True if passwords match, false otherwise
 */
function isPasswordValid(password, confirmPassword) {
    return password === confirmPassword;
}

/**
 * Saves user data to the Firebase database
 * @param {string} name - User's name
 * @param {string} email - User's email address
 * @param {string} password - User's password
 * @returns {Promise<boolean>} True if save was successful, false otherwise
 */
async function saveUserToDatabase(name, email, password) {
    try {
        const response = await fetch(`${BASE_URL}contacts.json`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password })
        });
        return response.ok;
    } catch (error) {
        return false;
    }
}

/**
 * Handles the sign-up form submission
 * Validates passwords, saves user data, and redirects on success
 * @param {Event} event - The form submission event
 */
async function handleSignUp(event) {
    event.preventDefault();
    const { name, email, password, confirmPassword } = getSignUpFormData();
    
    if (!isPasswordValid(password, confirmPassword)) {
        
        togglePasswordAnimation();
        
        return; // Beendet die Funktion, wenn die Passwörter nicht übereinstimmen
    }
    
    const success = await saveUserToDatabase(name, email, password);
    if (success) {
        document.getElementById('sign-up-success-container').classList.remove('d-none');
        
        setTimeout(() => {
            window.location.href = '../index.html';
        }, 2000);
    }
}

/**
 * Displays an animated error message when passwords don't match
 * Shows the message for 3 seconds with a CSS animation
 */
function togglePasswordAnimation(){
    const errorMessage = document.getElementById('error-message');

        // Animation zurücksetzen (damit sie neu startet)
        errorMessage.classList.remove('error-message');
        void errorMessage.offsetWidth; // Reflow erzwingen
        errorMessage.classList.add('error-message');

        errorMessage.textContent = 'Passwords do not match';
        
        // Timeout-Logik
        setTimeout(() => {
            errorMessage.textContent = '';
            errorMessage.classList.remove('error-message'); // Optional: Animation zurücksetzen, wenn ausgeblendet
        }, 3000);
}

/**
 * Updates the background image of password input fields based on content
 * Shows lock icon when empty, eye-closed icon when has content
 * @param {HTMLInputElement} input - The password input field to update
 */
function updateBackgroundOnInput(input) {
    if (input.value.length > 0) {
        input.style.backgroundImage = 'url("../assets/eye-closed.png")';
        input.style.backgroundSize = '21.65px 18.95px';
    } else {
        input.style.backgroundImage = 'url("../assets/lock.png")';
        input.style.backgroundSize = 'auto';
    }
}

/**
 * Toggles password visibility when clicking on the eye icon area
 * Changes input type between 'password' and 'text' and updates icon
 * @param {Event} event - The click event
 * @param {HTMLInputElement} input - The password input field
 */
function togglePasswordVisibilityOnClick(event, input) {
    // Nur fortfahren, wenn das Feld nicht leer ist
    if (input.value.length === 0) return;
    
    const clickPosition = event.offsetX;
    const inputWidth = input.clientWidth;
    const iconWidth = 40; // Geschätzte Breite des Icon-Bereichs
    
    if (clickPosition > inputWidth - iconWidth) {
        if (input.type === 'password') {
            input.type = 'text';
            input.style.backgroundImage = 'url("../assets/eye.png")';
            input.style.backgroundSize = '21.65px 15px';
        } else {
            input.type = 'password';
            input.style.backgroundImage = 'url("../assets/eye-closed.png")';
            input.style.backgroundSize = '21.65px 18.95px';
        }
    }
}

/**
 * Initializes password field functionality for both password inputs
 * Sets up event listeners for input changes and click events
 * Configures initial background images and toggle behavior
 */
function initPasswordFieldToggle() {
    const passwordFields = [
        document.getElementById('sign-up-password'),
        document.getElementById('sign-up-confirm-password')
    ];
    
    passwordFields.forEach(input => {
        // Initialer Status setzen
        updateBackgroundOnInput(input);
        
        input.addEventListener('input', () => updateBackgroundOnInput(input));
        input.addEventListener('click', (event) => togglePasswordVisibilityOnClick(event, input));
    });
}

// Initialisierung beim Laden der Seite
document.addEventListener('DOMContentLoaded', initPasswordFieldToggle);




