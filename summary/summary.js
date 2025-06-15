const BASE_URL = "https://join473-22469-default-rtdb.europe-west1.firebasedatabase.app/";

// Update username from localStorage
function updateUsername() {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    const usernameElement = document.querySelector('.username');
    if (user && usernameElement) {
        usernameElement.textContent = user.name;
    }
}

// Count tasks by status
async function countTasksByStatus() {
    try {
        const response = await fetch(`${BASE_URL}tasks.json`);
        const tasks = await response.json();
        
        let counts = {
            todo: 0,
            inProgress: 0,
            awaitingFeedback: 0,
            done: 0,
            urgent: 0
        };

        // Get current date for urgent tasks
        const currentDate = new Date();
        
        for (const key in tasks) {
            const task = tasks[key];
            switch(task.status) {
                case 'todo':
                    counts.todo++;
                    break;
                case 'inProgress':
                    counts.inProgress++;
                    break;
                case 'awaitingFeedback':
                    counts.awaitingFeedback++;
                    break;
                case 'done':
                    counts.done++;
                    break;
            }
            
            // Check if task is urgent (due date within 7 days)
            if (task.dueDate) {
                const dueDate = new Date(task.dueDate);
                const diffTime = dueDate - currentDate;
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                if (diffDays <= 7 && diffDays >= 0) {
                    counts.urgent++;
                }
            }
        }

        // Update the UI with counts
        document.querySelector('.metric-box1 h3').textContent = `Task in Board (${counts.todo + counts.inProgress + counts.awaitingFeedback + counts.done})`;
        document.querySelector('.metric-box2 h3').textContent = `Task to do (${counts.todo})`;
        document.querySelector('.metric-box3 h3').textContent = `Task in Progress (${counts.inProgress})`;
        document.querySelector('.metric-box4 h3').textContent = `Awaiting Feedback (${counts.awaitingFeedback})`;
        document.querySelector('.metric-box5 h3').textContent = `Task Done (${counts.done})`;
        document.querySelector('.urgent-task-count-number').textContent = counts.urgent;

        // Find next urgent deadline
        let nextDeadline = null;
        for (const key in tasks) {
            const task = tasks[key];
            if (task.dueDate) {
                const dueDate = new Date(task.dueDate);
                if (dueDate > currentDate && (!nextDeadline || dueDate < nextDeadline)) {
                    nextDeadline = dueDate;
                }
            }
        }

        // Update deadline display
        const deadlineElement = document.querySelector('.deadline-info p:first-child');
        if (nextDeadline && deadlineElement) {
            deadlineElement.textContent = nextDeadline.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        }

    } catch (error) {
        console.error('Error fetching tasks:', error);
    }
}

// Add click handlers to metric boxes
function addClickHandlers() {
    const boxes = {
        '.metric-box1': 'board',
        '.metric-box2': 'todo',
        '.metric-box3': 'inProgress',
        '.metric-box4': 'awaitingFeedback',
        '.metric-box5': 'done'
    };

    for (const [selector, status] of Object.entries(boxes)) {
        const box = document.querySelector(selector);
        if (box) {
            box.style.cursor = 'pointer';
            box.addEventListener('click', () => {
                // Store the selected status in localStorage
                localStorage.setItem('selectedStatus', status);
                // Redirect to board page
                window.location.href = '../board/board.html';
            });
        }
    }
}

// Initialize the page
async function initSummary() {
    updateUsername();
    await countTasksByStatus();
    addClickHandlers();
}

// Run initialization when the page loads
document.addEventListener('DOMContentLoaded', initSummary); 