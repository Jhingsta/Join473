// Komplett ersetzen: scripts/board.js

const BASE_URL = "https://join473-22469-default-rtdb.europe-west1.firebasedatabase.app/";

let tasks = [];
let contacts = [];
let currentMobileStatus = 'to-do';
let draggedTaskId = null;

// Initialize board when DOM is loaded
document.addEventListener('DOMContentLoaded', async () => {
    await initBoard();
});

/**
 * Initialize the board
 */
async function initBoard() {
    try {
        await loadTasks();
        await loadContacts();
        renderBoard();
        setupEventListeners();
        
        if (window.innerWidth <= 768) {
            initMobileView();
        }
    } catch (error) {
        console.error('Error initializing board:', error);
        showNotification('Error loading board', 'error');
    }
}

/**
 * Load tasks from Firebase
 */
async function loadTasks() {
    try {
        const response = await fetch(`${BASE_URL}tasks.json`);
        if (!response.ok) throw new Error('Failed to load tasks');
        
        const data = await response.json();
        tasks = data ? Object.entries(data).map(([id, task]) => ({ ...task, id })) : [];
        console.log('Loaded tasks:', tasks.length);
    } catch (error) {
        console.error('Error loading tasks:', error);
        tasks = [];
    }
}

/**
 * Load contacts from Firebase
 */
async function loadContacts() {
    try {
        const response = await fetch(`${BASE_URL}contacts.json`);
        if (!response.ok) throw new Error('Failed to load contacts');
        
        const data = await response.json();
        contacts = data ? Object.entries(data).map(([id, contact]) => ({ ...contact, id })) : [];
        console.log('Loaded contacts:', contacts.length);
    } catch (error) {
        console.error('Error loading contacts:', error);
        contacts = [];
    }
}

/**
 * Render the board based on screen size
 */
function renderBoard() {
    if (window.innerWidth <= 768) {
        renderMobileBoard();
    } else {
        renderDesktopBoard();
    }
    updateTaskCounts();
}

/**
 * Render desktop board
 */
function renderDesktopBoard() {
    const statuses = ['to-do', 'in-progress', 'awaiting-feedback', 'done'];
    
    statuses.forEach(status => {
        const container = document.querySelector(`.task-container[data-status="${status}"]`);
        if (!container) return;
        
        container.innerHTML = '';
        const statusTasks = getTasksByStatus(status);
        
        if (statusTasks.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    No tasks ${getStatusDisplay(status)}
                </div>
            `;
        } else {
            statusTasks.forEach(task => {
                container.appendChild(createTaskCard(task));
            });
        }
    });
}

/**
 * Render mobile board
 */
function renderMobileBoard() {
    const taskList = document.querySelector('.mobile-task-list');
    if (!taskList) return;
    
    taskList.innerHTML = '';
    const statusTasks = getTasksByStatus(currentMobileStatus);
    
    if (statusTasks.length === 0) {
        taskList.innerHTML = `
            <div class="mobile-empty-state">
                <img src="assets/empty-tasks.svg" alt="No tasks">
                <p>No tasks ${getStatusDisplay(currentMobileStatus)}</p>
            </div>
        `;
    } else {
        statusTasks.forEach(task => {
            taskList.appendChild(createTaskCard(task));
        });
    }
}

/**
 * Get tasks by status
 */
function getTasksByStatus(status) {
    return tasks.filter(task => {
        const taskStatus = (task.status || 'to-do').toLowerCase().trim();
        const targetStatus = status.toLowerCase();
        
        // Handle status variations
        const statusMap = {
            'to-do': ['to-do', 'todo', 'to do'],
            'in-progress': ['in-progress', 'in progress', 'inprogress'],
            'awaiting-feedback': ['awaiting-feedback', 'awaiting feedback', 'await feedback'],
            'done': ['done', 'completed', 'finished']
        };
        
        return statusMap[targetStatus]?.includes(taskStatus) || taskStatus === targetStatus;
    });
}

/**
 * Create task card element
 */
function createTaskCard(task) {
    const card = document.createElement('div');
    card.className = 'task-card';
    card.draggable = true;
    card.dataset.taskId = task.id;
    
    // Task menu (3 dots)
    const menu = `<div class="task-menu" onclick="event.stopPropagation(); toggleTaskMenu('${task.id}')"></div>`;
    
    // Task category
    const categoryClass = getCategoryClass(task.category);
    const category = `<div class="task-category ${categoryClass}">${task.category || 'General'}</div>`;
    
    // Task title
    const title = `<h3 class="task-title">${task.title || 'Untitled Task'}</h3>`;
    
    // Task description
    const description = task.description ? 
        `<p class="task-description">${task.description}</p>` : '';
    
    // Progress bar
    let progressHtml = '';
    if (task.subtasks && task.subtasks.length > 0) {
        const completed = task.subtasks.filter(st => st.done).length;
        const total = task.subtasks.length;
        const percentage = (completed / total) * 100;
        
        progressHtml = `
            <div class="task-progress">
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${percentage}%"></div>
                </div>
                <span class="progress-text">${completed}/${total} Subtasks</span>
            </div>
        `;
    }
    
    // Assigned users
    const assignedHtml = createAssignedHtml(task.assigned);
    
    // Priority
    const priorityHtml = createPriorityHtml(task.priority);
    
    // Build card
    card.innerHTML = `
        ${menu}
        ${category}
        ${title}
        ${description}
        ${progressHtml}
        <div class="task-footer">
            <div class="task-assigned">${assignedHtml}</div>
            ${priorityHtml}
        </div>
    `;
    
    // Add event listeners
    card.addEventListener('dragstart', handleDragStart);
    card.addEventListener('dragend', handleDragEnd);
    card.addEventListener('click', () => openTaskDetails(task));
    
    return card;
}

/**
 * Get category CSS class
 */
function getCategoryClass(category) {
    const categoryLower = (category || '').toLowerCase();
    if (categoryLower.includes('user story')) return 'category-user-story';
    if (categoryLower.includes('technical')) return 'category-technical-task';
    return 'category-default';
}

/**
 * Create assigned users HTML
 */
function createAssignedHtml(assignedIds) {
    if (!assignedIds || assignedIds.length === 0) return '';
    
    const assignedContacts = assignedIds
        .map(id => contacts.find(c => c.id === id))
        .filter(Boolean);
    
    const avatars = assignedContacts.slice(0, 3).map(contact => {
        const initials = getInitials(contact.name);
        const color = getContactColor(contact.name);
        return `<div class="assigned-avatar" style="background-color: ${color}">${initials}</div>`;
    }).join('');
    
    const moreCount = assignedContacts.length - 3;
    const moreAvatar = moreCount > 0 ? 
        `<div class="assigned-avatar assigned-more">+${moreCount}</div>` : '';
    
    return avatars + moreAvatar;
}

/**
 * Create priority HTML
 */
function createPriorityHtml(priority) {
    const priorityLower = (priority || 'medium').toLowerCase();
    const icons = {
        urgent: 'urgent.png',
        high: 'high.png',
        medium: 'medium.png',
        low: 'low.png'
    };
    
    const icon = icons[priorityLower] || icons.medium;
    return `<div class="task-priority"><img src="assets/${icon}" alt="${priority}" class="priority-icon"></div>`;
}

/**
 * Get contact initials
 */
function getInitials(name) {
    if (!name) return '?';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
        return parts[0][0] + parts[parts.length - 1][0];
    }
    return parts[0].substring(0, 2);
}

/**
 * Get contact color
 */
function getContactColor(name) {
    const colors = [
        '#FF7A00', '#FF5EB3', '#6E52FF', '#9327FF', '#00BEE8',
        '#1FD7C1', '#FF745E', '#FFA35E', '#FC71FF', '#FFC701',
        '#0038FF', '#C3FF2B', '#FFE62B', '#FF4646', '#FFBB2B'
    ];
    
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
}

/**
 * Get status display name
 */
function getStatusDisplay(status) {
    const displayNames = {
        'to-do': 'to do',
        'in-progress': 'in progress',
        'awaiting-feedback': 'awaiting feedback',
        'done': 'done'
    };
    return displayNames[status] || status;
}

/**
 * Setup event listeners
 */
function setupEventListeners() {
    // Desktop search
    const desktopSearch = document.getElementById('boardSearch');
    if (desktopSearch) {
        desktopSearch.addEventListener('input', handleSearch);
    }
    
    // Mobile search
    const mobileSearch = document.getElementById('mobileSearch');
    if (mobileSearch) {
        mobileSearch.addEventListener('input', handleSearch);
    }
    
    // Drag and drop for containers
    document.querySelectorAll('.task-container').forEach(container => {
        container.addEventListener('dragover', handleDragOver);
        container.addEventListener('drop', handleDrop);
        container.addEventListener('dragleave', handleDragLeave);
    });
    
    // Window resize
    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            renderBoard();
            if (window.innerWidth <= 768) {
                initMobileView();
            }
        }, 250);
    });
}

/**
 * Initialize mobile view
 */
function initMobileView() {
    const statusTabs = document.querySelectorAll('.status-tab');
    statusTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const status = tab.dataset.status;
            switchMobileStatus(status);
        });
    });
}

/**
 * Switch mobile status
 */
function switchMobileStatus(status) {
    currentMobileStatus = status;
    
    // Update active tab
    document.querySelectorAll('.status-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    document.querySelector(`.status-tab[data-status="${status}"]`)?.classList.add('active');
    
    // Render mobile board
    renderMobileBoard();
}

/**
 * Update task counts
 */
function updateTaskCounts() {
    const statuses = ['to-do', 'in-progress', 'awaiting-feedback', 'done'];
    
    statuses.forEach(status => {
        const count = getTasksByStatus(status).length;
        const countElement = document.querySelector(`.status-tab[data-status="${status}"] .status-count`);
        if (countElement) {
            countElement.textContent = count;
        }
    });
}

/**
 * Handle search
 */
function handleSearch(e) {
    const searchTerm = e.target.value.toLowerCase();
    const isMobile = window.innerWidth <= 768;
    
    if (searchTerm === '') {
        renderBoard();
        return;
    }
    
    const cards = document.querySelectorAll('.task-card');
    cards.forEach(card => {
        const taskId = card.dataset.taskId;
        const task = tasks.find(t => t.id === taskId);
        
        if (task) {
            const matchesSearch = 
                task.title?.toLowerCase().includes(searchTerm) ||
                task.description?.toLowerCase().includes(searchTerm) ||
                task.category?.toLowerCase().includes(searchTerm);
            
            card.style.display = matchesSearch ? 'block' : 'none';
        }
    });
}

/**
 * Drag and drop handlers
 */
function handleDragStart(e) {
    draggedTaskId = e.target.dataset.taskId;
    e.target.classList.add('dragging');
}

function handleDragEnd(e) {
    e.target.classList.remove('dragging');
}

function handleDragOver(e) {
    e.preventDefault();
    e.currentTarget.classList.add('drag-over');
}

function handleDragLeave(e) {
    if (e.currentTarget === e.target) {
        e.currentTarget.classList.remove('drag-over');
    }
}

async function handleDrop(e) {
    e.preventDefault();
    e.currentTarget.classList.remove('drag-over');
    
    const newStatus = e.currentTarget.dataset.status;
    const task = tasks.find(t => t.id === draggedTaskId);
    
    if (task && task.status !== newStatus) {
        const oldStatus = task.status;
        task.status = newStatus;
        
        try {
            const response = await fetch(`${BASE_URL}tasks/${task.id}.json`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            });
            
            if (!response.ok) throw new Error('Failed to update task');
            
            renderBoard();
            showNotification('Task moved successfully', 'success');
        } catch (error) {
            console.error('Error updating task:', error);
            task.status = oldStatus;
            renderBoard();
            showNotification('Failed to move task', 'error');
        }
    }
}

/**
 * Toggle task menu
 */
function toggleTaskMenu(taskId) {
    console.log('Toggle menu for task:', taskId);
    // Hier können Sie später ein Dropdown-Menü implementieren
    // Vorerst nur als Platzhalter
}

/**
 * Open task details
 */
function openTaskDetails(task) {
    console.log('Opening task details:', task);
    // Später wird hier ein Modal oder eine Detail-Ansicht geöffnet
    // Vorerst zeigen wir die Details in einem Alert
    const assignedNames = task.assigned ? 
        task.assigned.map(id => {
            const contact = contacts.find(c => c.id === id);
            return contact ? contact.name : 'Unknown';
        }).join(', ') : 'None';
    
    alert(`
Task: ${task.title}
Category: ${task.category || 'General'}
Description: ${task.description || 'No description'}
Status: ${task.status}
Priority: ${task.priority || 'Medium'}
Assigned to: ${assignedNames}
Due Date: ${task.dueDate || 'Not set'}
    `);
}

/**
 * Show notification
 */
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    const styles = {
        position: 'fixed',
        top: '20px',
        right: '20px',
        padding: '12px 24px',
        borderRadius: '8px',
        color: 'white',
        fontSize: '14px',
        fontWeight: '500',
        zIndex: '9999',
        animation: 'slideIn 0.3s ease'
    };
    
    const colors = {
        success: '#2A9D8F',
        error: '#E63946',
        info: '#4589FF'
    };
    
    Object.assign(notification.style, styles, {
        backgroundColor: colors[type] || colors.info
    });
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(style);

/**
 * Open Add Task Modal
 */
function openAddTaskModal(preselectedStatus = null) {
    const modal = document.getElementById('addTaskModal');
    if (modal) {
        modal.style.display = 'flex';

        // Wenn ein Status vorausgewählt wurde, setze ihn als verstecktes Feld
        if (preselectedStatus) {
            // Erstelle ein verstecktes Input-Feld für den vorausgewählten Status
            let statusInput = document.getElementById('preselectedStatus');
            if (!statusInput) {
                statusInput = document.createElement('input');
                statusInput.type = 'hidden';
                statusInput.id = 'preselectedStatus';
                document.getElementById('addTaskForm').appendChild(statusInput);
            }
            statusInput.value = preselectedStatus;
        }

        // Lade Kontakte in das Dropdown
        loadContactsIntoSelect();

        // Fokus auf das erste Eingabefeld
        setTimeout(() => {
            const titleInput = document.getElementById('taskTitle');
            if (titleInput) titleInput.focus();
        }, 100);
    }
}

/**
 * Close Add Task Modal
 */
function closeAddTaskModal() {
    const modal = document.getElementById('addTaskModal');
    if (modal) {
        modal.style.display = 'none';
        clearForm();
    }
}

/**
 * Load contacts into select dropdown
 */
function loadContactsIntoSelect() {
    const select = document.getElementById('taskAssigned');
    if (!select) return;

    // Leere das Select und füge die Standard-Option hinzu
    select.innerHTML = '<option value="">Select contacts to assign</option>';

    // Füge alle Kontakte hinzu
    contacts.forEach(contact => {
        const option = document.createElement('option');
        option.value = contact.id;
        option.textContent = contact.name;
        select.appendChild(option);
    });
}

/**
 * Handle Add Task Form Submission
 */
async function handleAddTask(event) {
    event.preventDefault();

    const formData = new FormData(event.target);
    const preselectedStatus = document.getElementById('preselectedStatus')?.value;

    // Sammle Formulardaten
    const taskData = {
        title: document.getElementById('taskTitle').value,
        description: document.getElementById('taskDescription').value,
        dueDate: document.getElementById('taskDueDate').value,
        assigned: [document.getElementById('taskAssigned').value].filter(Boolean),
        priority: document.querySelector('.priority-btn.active')?.dataset.priority || 'medium',
        category: document.getElementById('taskCategory').value,
        status: preselectedStatus || 'to-do',
        subtasks: getSubtasksFromForm(),
        createdAt: new Date().toISOString()
    };

    try {
        // Sende Task an Firebase
        const response = await fetch(`${BASE_URL}tasks.json`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(taskData)
        });

        if (!response.ok) throw new Error('Failed to create task');

        const result = await response.json();
        taskData.id = result.name;

        // Füge Task zur lokalen Liste hinzu
        tasks.push(taskData);

        // Schließe Modal und aktualisiere Board
        closeAddTaskModal();
        renderBoard();
        showNotification('Task created successfully!', 'success');

    } catch (error) {
        console.error('Error creating task:', error);
        showNotification('Failed to create task', 'error');
    }
}

/**
 * Get subtasks from form
 */
function getSubtasksFromForm() {
    const subtasksList = document.getElementById('subtasksList');
    if (!subtasksList) return [];

    const subtaskItems = subtasksList.querySelectorAll('.subtask-item');
    return Array.from(subtaskItems).map(item => ({
        text: item.querySelector('.subtask-text').textContent,
        done: false
    }));
}

/**
 * Add subtask to form
 */
function addSubtask() {
    const input = document.getElementById('subtaskInput');
    const list = document.getElementById('subtasksList');

    if (!input || !list || !input.value.trim()) return;

    const li = document.createElement('li');
    li.className = 'subtask-item';
    li.innerHTML = `
        <span class="subtask-text">${input.value.trim()}</span>
        <button type="button" class="subtask-delete" onclick="removeSubtask(this)">×</button>
    `;

    list.appendChild(li);
    input.value = '';
}

/**
 * Remove subtask from form
 */
function removeSubtask(button) {
    button.closest('.subtask-item').remove();
}

/**
 * Clear form
 */
function clearForm() {
    const form = document.getElementById('addTaskForm');
    if (form) {
        form.reset();

        // Reset priority buttons
        document.querySelectorAll('.priority-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector('.priority-btn[data-priority="medium"]')?.classList.add('active');

        // Clear subtasks
        const subtasksList = document.getElementById('subtasksList');
        if (subtasksList) subtasksList.innerHTML = '';

        // Clear selected contacts
        const selectedContacts = document.getElementById('selectedContacts');
        if (selectedContacts) selectedContacts.innerHTML = '';

        // Remove preselected status
        const statusInput = document.getElementById('preselectedStatus');
        if (statusInput) statusInput.remove();
    }
}

// Event Listeners für Priority Buttons
document.addEventListener('DOMContentLoaded', () => {
    // Priority button event listeners
    document.querySelectorAll('.priority-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.priority-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });

    // Modal close on outside click
    document.getElementById('addTaskModal')?.addEventListener('click', (e) => {
        if (e.target.id === 'addTaskModal') {
            closeAddTaskModal();
        }
    });

    // Subtask input enter key
    document.getElementById('subtaskInput')?.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            addSubtask();
        }
    });
});
