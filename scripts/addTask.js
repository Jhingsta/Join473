// Komplett: scripts/addTask.js

const BASE_URL = "https://join473-22469-default-rtdb.europe-west1.firebasedatabase.app/";

/**
 * Clear the form
 */
function clearForm() {
    // Clear title, description and date
    document.getElementById('title').value = '';
    document.getElementById('desc').value = '';
    document.getElementById('due-date-custom').value = '';

    // Reset priority to medium
    document.getElementById('priority-urgent').classList.remove('active-urgent');
    document.getElementById('priority-low').classList.remove('active-low');
    document.getElementById('priority-medium').classList.add('active-medium');

    // Reset category selection
    document.getElementById('category-selected-label').innerText = 'Select task category';
    document.getElementById('category-select').classList.remove('has-value');

    // Clear assigned field
    document.getElementById('assigned-search').value = '';
    document.getElementById('selected-avatars').innerHTML = '';

    // Clear subtasks
    const subtaskList = document.getElementById('subtask-list');
    if (subtaskList) subtaskList.innerHTML = '';
    if (typeof subtasks !== 'undefined') {
        subtasks.length = 0;
    }

    // Remove error messages
    const titleError = document.getElementById('title-error');
    if (titleError) titleError.innerText = '';
    const dueDateError = document.getElementById('due-date-error');
    if (dueDateError) dueDateError.innerText = '';

    // Remove error styling
    document.querySelectorAll('.input-error').forEach(el => {
        el.classList.remove('input-error');
    });
}

/**
 * Setup priority buttons
 */
function setupPriorityButtons() {
    const priorityButtons = document.querySelectorAll('.priority-btn');
    
    priorityButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Remove active class from all buttons
            priorityButtons.forEach(btn => {
                btn.classList.remove('active-urgent', 'active-medium', 'active-low');
            });
            
            // Add active class to clicked button
            if (this.id === 'priority-urgent') {
                this.classList.add('active-urgent');
            } else if (this.id === 'priority-medium') {
                this.classList.add('active-medium');
            } else if (this.id === 'priority-low') {
                this.classList.add('active-low');
            }
        });
    });
}

/**
 * Setup date input functionality
 */
function setupDateInput() {
    const dateInput = document.getElementById('due-date-custom');
    const calendarBtn = document.getElementById('calendarBtn');
    
    if (!dateInput || !calendarBtn) return;
    
    // Create hidden date input
    const hiddenDateInput = document.createElement('input');
    hiddenDateInput.type = 'date';
    hiddenDateInput.style.display = 'none';
    hiddenDateInput.id = 'hiddenDateInput';
    document.body.appendChild(hiddenDateInput);
    
    function openDatePicker() {
        if (hiddenDateInput.showPicker) {
            hiddenDateInput.showPicker();
        } else {
            hiddenDateInput.click();
        }
    }
    
    // Event listeners
    dateInput.addEventListener('click', openDatePicker);
    dateInput.addEventListener('focus', openDatePicker);
    calendarBtn.addEventListener('click', (e) => {
        e.preventDefault();
        openDatePicker();
    });
    
    // Prevent manual typing
    dateInput.addEventListener('keydown', (e) => {
        e.preventDefault();
    });
    
    // Handle date selection
    hiddenDateInput.addEventListener('change', function() {
        if (this.value) {
            const date = new Date(this.value);
            const day = String(date.getDate()).padStart(2, '0');
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const year = date.getFullYear();
            dateInput.value = `${day}/${month}/${year}`;
            
            // Remove error styling if date is selected
            const dueDateRow = document.querySelector('.custom-date-row');
            if (dueDateRow) {
                dueDateRow.classList.remove('input-error');
            }
            const dueDateError = document.getElementById('due-date-error');
            if (dueDateError) {
                dueDateError.textContent = '';
            }
        }
    });
}

/**
 * Save task to Firebase
 */
async function saveTask(taskData) {
    try {
        const response = await fetch(`${BASE_URL}tasks.json`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(taskData)
        });
        
        if (response.ok) {
            return await response.json();
        } else {
            throw new Error('Failed to save task');
        }
    } catch (error) {
        console.error('Error saving task:', error);
        throw error;
    }
}

/**
 * Get form data and create task object
 */
function getTaskData() {
    const title = document.getElementById('title').value.trim();
    const description = document.getElementById('desc').value.trim();
    const dueDate = document.getElementById('due-date-custom').value;
    
    // Get priority
    const priorityButtons = document.querySelectorAll('.priority-btn');
    let priority = 'medium'; // default
    priorityButtons.forEach(btn => {
        if (btn.classList.contains('active-urgent')) priority = 'urgent';
        else if (btn.classList.contains('active-low')) priority = 'low';
        else if (btn.classList.contains('active-medium')) priority = 'medium';
    });
    
    // Get category
    const categoryLabel = document.getElementById('category-selected-label');
    const category = categoryLabel.textContent !== 'Select task category' ? 
                    categoryLabel.textContent : null;
    
    // Get assigned contacts (simplified)
    const assignedContacts = [];
    const selectedAvatars = document.querySelectorAll('.selected-avatar');
    selectedAvatars.forEach(avatar => {
        const contactId = avatar.dataset.contactId;
        if (contactId) assignedContacts.push(contactId);
    });
    
    // Get subtasks
    let subtaskData = [];
    if (typeof subtasks !== 'undefined' && Array.isArray(subtasks)) {
        subtaskData = subtasks.map(subtask => ({
            id: subtask.id,
            title: subtask.title,
            done: subtask.done || false
        }));
    }
    
    return {
        title,
        description,
        dueDate: dueDate ? convertDateFormat(dueDate) : null,
        priority,
        category,
        assigned: assignedContacts,
        subtasks: subtaskData,
        status: 'to-do',
        createdAt: new Date().toISOString()
    };
}

/**
 * Convert date from DD/MM/YYYY to YYYY-MM-DD
 */
function convertDateFormat(dateString) {
    if (!dateString) return null;
    const [day, month, year] = dateString.split('/');
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
}

/**
 * Validate task data
 */
function validateTaskData(taskData) {
    const errors = [];
    
    if (!taskData.title) {
        errors.push('Title is required');
    }
    
    if (!taskData.dueDate) {
        errors.push('Due date is required');
    }
    
    if (!taskData.category) {
        errors.push('Category is required');
    }
    
    return errors;
}

/**
 * Show success message
 */
function showSuccessMessage() {
    const successOverlay = document.createElement('div');
    successOverlay.className = 'task-success-overlay';
    successOverlay.innerHTML = `
        <div class="task-success-content">
            <div class="task-success-icon">✓</div>
            <div class="task-success-text">Task added to board</div>
        </div>
    `;
    
    document.body.appendChild(successOverlay);
    
    setTimeout(() => {
        successOverlay.remove();
        window.location.href = 'board.html';
    }, 1500);
}

/**
 * Show error messages
 */
function showErrors(errors) {
    document.querySelectorAll('.input-error-message').forEach(el => {
        el.textContent = '';
    });
    
    document.querySelectorAll('.input-error').forEach(el => {
        el.classList.remove('input-error');
    });
    
    if (errors.includes('Title is required')) {
        const titleError = document.getElementById('title-error');
        const titleInput = document.getElementById('title');
        if (titleError && titleInput) {
            titleError.textContent = 'This field is required';
            titleInput.classList.add('input-error');
        }
    }
    
    if (errors.includes('Due date is required')) {
        const dueDateError = document.getElementById('due-date-error');
        const dueDateRow = document.querySelector('.custom-date-row');
        if (dueDateError && dueDateRow) {
            dueDateError.textContent = 'This field is required';
            dueDateRow.classList.add('input-error');
        }
    }
    
    if (errors.includes('Category is required')) {
        const categorySelect = document.getElementById('category-select');
        if (categorySelect) {
            categorySelect.classList.add('input-error');
        }
    }
}

/**
 * Handle create task button click
 */
async function handleCreateTask() {
    try {
        const taskData = getTaskData();
        const errors = validateTaskData(taskData);
        
        if (errors.length > 0) {
            showErrors(errors);
            return;
        }
        
        await saveTask(taskData);
        showSuccessMessage();
        
    } catch (error) {
        console.error('Error creating task:', error);
        alert('Error creating task. Please try again.');
    }
}

// Main initialization
document.addEventListener('DOMContentLoaded', () => {
    // Setup functionality
    setupPriorityButtons();
    setupDateInput();
    
    // Event listeners for create button
    const createButton = document.querySelector('.create-btn');
    if (createButton) {
        createButton.addEventListener('click', handleCreateTask);
    }
    
    // Form submission
    const form = document.getElementById('addtask-form');
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            handleCreateTask();
        });
    }
});

// Make functions available globally
window.clearForm = clearForm;
window.handleCreateTask = handleCreateTask;
