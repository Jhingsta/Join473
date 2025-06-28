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

async function fetchTasks() {
    try {
        const response = await fetch(`${BASE_URL}tasks.json`);
        if (!response.ok) {
            console.warn(`HTTP error! status: ${response.status}`);
            return {};
        }
        const tasks = await response.json();
        console.log('Fetched tasks:', tasks);
        return tasks || {};
    } catch (error) {
        console.error("Error fetching tasks:", error);
        return {};
    }
}

function countTasksByStatus(tasks) {
    const counts = {
        'to-do': 0,
        'in-progress': 0,
        'awaiting-feedback': 0,
        'done': 0,
        'urgent': 0
    };

    console.log('Counting tasks by status...');
    
    for (const key in tasks) {
        const task = tasks[key];
        console.log(`Task ${key}:`, task);
        
        if (task.status) {
            switch (task.status.toLowerCase()) {
                case 'to-do':
                case 'todo':
                    counts['to-do']++;
                    break;
                case 'in-progress':
                case 'in progress':
                    counts['in-progress']++;
                    break;
                case 'awaiting-feedback':
                case 'awaiting feedback':
                    counts['awaiting-feedback']++;
                    break;
                case 'done':
                    counts['done']++;
                    break;
                default:
                    console.log(`Unknown status: ${task.status}`);
            }
        }
        
        // Count urgent tasks
        if (task.priority === 'urgent') {
            counts['urgent']++;
        }
    }

    console.log('Task counts:', counts);
    return counts;
}

function findUpcomingDeadline(tasks) {
    const today = new Date();
    let upcomingTask = null;
    let earliestDate = null;

    for (const key in tasks) {
        const task = tasks[key];
        if (task.dueDate && task.status !== 'done') {
            const dueDate = new Date(task.dueDate);
            if (dueDate >= today) {
                if (!earliestDate || dueDate < earliestDate) {
                    earliestDate = dueDate;
                    upcomingTask = task;
                }
            }
        }
    }

    return upcomingTask;
}

function updateTaskCounts(counts) {
    // Update urgent tasks count
    const urgentCountElement = document.getElementById('urgent-count');
    if (urgentCountElement) {
        urgentCountElement.textContent = counts['urgent'];
    }

    // Update tasks in board count
    const totalTasks = counts['to-do'] + counts['in-progress'] + counts['awaiting-feedback'] + counts['done'];
    const tasksInBoardElement = document.getElementById('total-tasks');
    if (tasksInBoardElement) {
        tasksInBoardElement.textContent = totalTasks;
    }

    // Update individual category counts
    const todoCountElement = document.getElementById('todo-count');
    if (todoCountElement) {
        todoCountElement.textContent = counts['to-do'];
    }

    const inProgressCountElement = document.getElementById('in-progress-count');
    if (inProgressCountElement) {
        inProgressCountElement.textContent = counts['in-progress'];
    }

    const awaitingFeedbackCountElement = document.getElementById('awaiting-feedback-count');
    if (awaitingFeedbackCountElement) {
        awaitingFeedbackCountElement.textContent = counts['awaiting-feedback'];
    }

    const doneCountElement = document.getElementById('done-count');
    if (doneCountElement) {
        doneCountElement.textContent = counts['done'];
    }
}

function updateUpcomingDeadline(upcomingTask) {
    const dateElement = document.querySelector('.middle-row-left-right-top');
    const labelElement = document.querySelector('.middle-row-left-right-bottom');
    
    if (upcomingTask && upcomingTask.dueDate) {
        const dueDate = new Date(upcomingTask.dueDate);
        const formattedDate = dueDate.toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric'
        });
        
        if (dateElement) {
            dateElement.textContent = formattedDate;
        }
        if (labelElement) {
            labelElement.textContent = 'Upcoming Deadline';
        }
    } else {
        if (dateElement) {
            dateElement.textContent = 'No upcoming deadlines';
        }
        if (labelElement) {
            labelElement.textContent = 'All tasks completed';
        }
    }
}

async function loadSummaryData() {
    try {
        const tasks = await fetchTasks();
        const counts = countTasksByStatus(tasks);
        const upcomingTask = findUpcomingDeadline(tasks);
        
        updateTaskCounts(counts);
        updateUpcomingDeadline(upcomingTask);
    } catch (error) {
        console.error("Error loading summary data:", error);
    }
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

function updateGreetingTime() {
    const hour = new Date().getHours();
    let greeting = '';
    
    if (hour < 12) {
        greeting = 'Good morning';
    } else if (hour < 18) {
        greeting = 'Good afternoon';
    } else {
        greeting = 'Good evening';
    }
    
    const greetingTimeElement = document.querySelector('.greeting-time');
    if (greetingTimeElement) {
        const nameSpan = greetingTimeElement.querySelector('.greeting-name');
        if (nameSpan) {
            greetingTimeElement.innerHTML = `${greeting}, <span class="greeting-name">${nameSpan.textContent}</span>`;
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    showUserName();
    loadSummaryData();
    updateGreetingTime();
});
