// Komplett neue dropdown-menu.js - fehlerfrei

// Globale Variablen
let isDropdownOpen = false;
let isCategoryOpen = false;
let isAssignedOpen = false;

// DOM Ready Handler
document.addEventListener('DOMContentLoaded', function() {
    initializeDropdowns();
    initializeUserDropdown();
    initializeClickOutside();
});

// User Dropdown initialisieren
function initializeUserDropdown() {
    const userButton = document.querySelector('.user-initial-small');
    const dropdown = document.getElementById('userDropdown');
    
    if (userButton) {
        userButton.addEventListener('click', function(e) {
            e.stopPropagation();
            toggleUserDropdown();
        });
    }
}

// User Dropdown umschalten
function toggleUserDropdown() {
    const dropdown = document.getElementById('userDropdown');
    if (!dropdown) return;
    
    isDropdownOpen = !isDropdownOpen;
    
    if (isDropdownOpen) {
        dropdown.style.display = 'block';
        dropdown.classList.add('show');
    } else {
        dropdown.style.display = 'none';
        dropdown.classList.remove('show');
    }
}

// Category Dropdown initialisieren
function initializeCategoryDropdown() {
    const categorySelect = document.getElementById('category-select');
    const categoryOptions = document.getElementById('category-options');
    const categoryArrow = document.getElementById('category-arrow');
    const categoryLabel = document.getElementById('category-selected-label');
    
    if (!categorySelect || !categoryOptions) return;

    categorySelect.addEventListener('click', function(e) {
        e.stopPropagation();
        toggleCategoryDropdown();
    });

    // Category Options Click Handler
    const options = categoryOptions.querySelectorAll('.category-option');
    options.forEach(option => {
        option.addEventListener('click', function(e) {
            e.stopPropagation();
            selectCategoryOption(this);
        });
    });
}

function toggleCategoryDropdown() {
    const categoryOptions = document.getElementById('category-options');
    const categoryArrow = document.getElementById('category-arrow');
    const categorySelect = document.getElementById('category-select');
    
    if (!categoryOptions) return;
    
    isCategoryOpen = !isCategoryOpen;
    
    if (isCategoryOpen) {
        categoryOptions.style.display = 'block';
        if (categoryArrow) {
            categoryArrow.style.transform = 'rotate(180deg)';
        }
        if (categorySelect) {
            categorySelect.classList.add('active');
        }
    } else {
        categoryOptions.style.display = 'none';
        if (categoryArrow) {
            categoryArrow.style.transform = 'rotate(0deg)';
        }
        if (categorySelect) {
            categorySelect.classList.remove('active');
        }
    }
}

function selectCategoryOption(option) {
    const categoryLabel = document.getElementById('category-selected-label');
    const categorySelect = document.getElementById('category-select');
    
    if (categoryLabel) {
        categoryLabel.textContent = option.textContent;
    }
    
    if (categorySelect) {
        categorySelect.classList.add('has-value');
    }
    
    // Andere Optionen deselektieren
    document.querySelectorAll('.category-option').forEach(opt => {
        opt.classList.remove('selected');
    });
    option.classList.add('selected');
    
    // Dropdown schließen
    isCategoryOpen = false;
    toggleCategoryDropdown();
}

// Assigned Dropdown initialisieren
function initializeAssignedDropdown() {
    const assignedSelect = document.getElementById('assigned-select');
    const assignedOptions = document.getElementById('assigned-list');
    
    if (!assignedSelect || !assignedOptions) return;

    assignedSelect.addEventListener('click', function(e) {
        e.stopPropagation();
        toggleAssignedDropdown();
    });

    // Beispiel-Kontakte erstellen falls keine vorhanden
    if (assignedOptions.children.length === 0) {
        createExampleContacts();
    }
}

function toggleAssignedDropdown() {
    const assignedOptions = document.getElementById('assigned-list');
    const assignedArrow = document.getElementById('assigned-arrow');
    const assignedSelect = document.getElementById('assigned-select');
    
    if (!assignedOptions) return;
    
    isAssignedOpen = !isAssignedOpen;
    
    if (isAssignedOpen) {
        assignedOptions.classList.remove('d-none');
        assignedOptions.style.display = 'block';
        if (assignedArrow) {
            assignedArrow.style.transform = 'rotate(180deg)';
        }
        if (assignedSelect) {
            assignedSelect.classList.add('active');
        }
    } else {
        assignedOptions.classList.add('d-none');
        assignedOptions.style.display = 'none';
        if (assignedArrow) {
            assignedArrow.style.transform = 'rotate(0deg)';
        }
        if (assignedSelect) {
            assignedSelect.classList.remove('active');
        }
    }
}

// Beispiel-Kontakte erstellen
function createExampleContacts() {
    const assignedOptions = document.getElementById('assigned-list');
    if (!assignedOptions) return;
    
    const contacts = [
        { id: 'john', name: 'John Doe', color: '#FF7A00' },
        { id: 'jane', name: 'Jane Smith', color: '#FF5EB3' },
        { id: 'mike', name: 'Mike Johnson', color: '#6E52FF' },
        { id: 'sarah', name: 'Sarah Wilson', color: '#9327FF' },
        { id: 'tom', name: 'Tom Brown', color: '#00BEE8' }
    ];
    
    assignedOptions.innerHTML = contacts.map(contact => 
        `<div class="assigned-option" data-id="${contact.id}" data-color="${contact.color}">
            <div class="contact-avatar" style="background-color: ${contact.color}">
                ${getContactInitials(contact.name)}
            </div>
            <span>${contact.name}</span>
        </div>`
    ).join('');
    
    // Event Listeners für Optionen hinzufügen
    assignedOptions.querySelectorAll('.assigned-option').forEach(option => {
        option.addEventListener('click', function(e) {
            e.stopPropagation();
            selectAssignedContact(this);
        });
    });
}

function selectAssignedContact(option) {
    const contactId = option.dataset.id;
    const contactName = option.querySelector('span').textContent;
    const contactColor = option.dataset.color;
    const initials = getContactInitials(contactName);
    
    // Avatar zum Selected Container hinzufügen
    const selectedContainer = document.getElementById('selected-avatars');
    if (selectedContainer) {
        const avatar = document.createElement('div');
        avatar.className = 'selected-avatar';
        avatar.style.backgroundColor = contactColor;
        avatar.textContent = initials;
        avatar.dataset.contactId = contactId;
        avatar.title = contactName;
        
        // Remove Button hinzufügen
        avatar.onclick = function() {
            this.remove();
        };
        
        // Prüfen ob bereits ausgewählt
        const existing = selectedContainer.querySelector(`[data-contact-id="${contactId}"]`);
        if (!existing) {
            selectedContainer.appendChild(avatar);
        }
    }
    
    // Dropdown schließen
    isAssignedOpen = false;
    toggleAssignedDropdown();
}

// Hilfsfunktionen
function getContactInitials(name) {
    if (!name) return '?';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
        return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return parts[0].substring(0, 2).toUpperCase();
}

// Click Outside Handler
function initializeClickOutside() {
    document.addEventListener('click', function(event) {
        // User Dropdown schließen
        const userButton = document.querySelector('.user-initial-small');
        const userDropdown = document.getElementById('userDropdown');
        
        if (userDropdown && isDropdownOpen && !userButton?.contains(event.target)) {
            isDropdownOpen = false;
            userDropdown.style.display = 'none';
            userDropdown.classList.remove('show');
        }
        
        // Category Dropdown schließen
        const categorySelect = document.getElementById('category-select');
        if (isCategoryOpen && categorySelect && !categorySelect.contains(event.target)) {
            isCategoryOpen = false;
            toggleCategoryDropdown();
        }
        
        // Assigned Dropdown schließen
        const assignedSelect = document.getElementById('assigned-select');
        if (isAssignedOpen && assignedSelect && !assignedSelect.contains(event.target)) {
            isAssignedOpen = false;
            toggleAssignedDropdown();
        }
    });
}

// Alle Dropdowns initialisieren
function initializeDropdowns() {
    // Kleine Verzögerung um sicherzustellen dass DOM geladen ist
    setTimeout(() => {
        initializeCategoryDropdown();
        initializeAssignedDropdown();
    }, 100);
}

// Globale Funktionen verfügbar machen
window.toggleUserDropdown = toggleUserDropdown;
window.toggleCategoryDropdown = toggleCategoryDropdown;
window.toggleAssignedDropdown = toggleAssignedDropdown;

// Legacy Support für alte Aufrufe
window.toggleDropdown = toggleUserDropdown;

// Export für Module
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        toggleUserDropdown,
        toggleCategoryDropdown,
        toggleAssignedDropdown,
        initializeDropdowns
    };
}
