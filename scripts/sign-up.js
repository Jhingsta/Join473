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
        console.error('Passwörter stimmen nicht überein!');
        return;
    }
    
    const success = await saveUserToDatabase(name, email, password);
    if (success) {
        window.location.href = '../index.html';
    }
}




