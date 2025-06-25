const BASE_URL = "https://join473-22469-default-rtdb.europe-west1.firebasedatabase.app/";

async function fetchUserNameByEmail(email) {
    const response = await fetch(`${BASE_URL}contacts.json`);
    const users = await response.json();
    for (const key in users) {
        if (users[key].email === email) {
            return users[key].name;
        }
    }
    return null;
}

async function showUserName() {
    const email = localStorage.getItem('userEmail');
    if (!email) return;
    const name = await fetchUserNameByEmail(email);
    if (name) {
        const greetingName = document.querySelector('.greeting-name');
        if (greetingName) {
            greetingName.textContent = name;
        }
    }
}

document.addEventListener('DOMContentLoaded', showUserName);
