const BASE_URL = "https://join473-22469-default-rtdb.europe-west1.firebasedatabase.app/"

function getSignUpFormData() {
    const name = document.getElementById('sign-up-name').value;
    const email = document.getElementById('sign-up-email').value;
    const password = document.getElementById('sign-up-password').value;
    const confirmPassword = document.getElementById('sign-up-confirm-password').value;
    
    return { name, email, password, confirmPassword };
}

function isPasswordValid(password, confirmPassword) {
    return password === confirmPassword;
}

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

async function handleSignUp(event) {
    event.preventDefault();
    const { name, email, password, confirmPassword } = getSignUpFormData();
    
    if (!isPasswordValid(password, confirmPassword)) {
        
        togglePasswordAnimation();
        
        return; // Beendet die Funktion, wenn die Passwörter nicht übereinstimmen
    }
    
    const success = await saveUserToDatabase(name, email, password);
    if (success) {
        window.location.href = '../index.html';
    }
}

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

function updateBackgroundOnInput(input) {
    if (input.value.length > 0) {
        input.style.backgroundImage = 'url("../assets/eye-closed.png")';
        input.style.backgroundSize = '21.65px 18.95px';
    } else {
        input.style.backgroundImage = 'url("../assets/lock.png")';
        input.style.backgroundSize = 'auto';
    }
}

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




