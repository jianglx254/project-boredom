// 🚨 PASTE YOUR GOOGLE APPS SCRIPT WEB APP URL HERE
const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzSEJKlrbjpdQcsZvqK9FNe7yd5ab5KQ9a9tIi-z0UJlkLa6Ybe2CMpHEz82x3gYyMjYA/exec"; 

// Task Management
let tasks = [];

// Initialize the dashboard
document.addEventListener('DOMContentLoaded', function() {
    clearOldTasks();
    setupIntroAnimation();
    initializeMorningBrief();
    loadTasks();
    setupTaskInput();
    fetchProductivityData();
});

// Intro Animation Handler
function setupIntroAnimation() {
    const introAnimation = document.getElementById('introAnimation');
    const mainContent = document.getElementById('mainContent');
    
    // Remove hidden class from main content after animation
    setTimeout(() => {
        mainContent.classList.remove('hidden');
    }, 2500);
    
    // Hide intro animation after fade out
    setTimeout(() => {
        introAnimation.classList.add('hidden');
    }, 3000);
}

// Morning Brief Functions
function initializeMorningBrief() {
    const now = new Date();
    const hour = now.getHours();
    
    // Set greeting based on time of day
    let greeting = "Good Morning!";
    if (hour >= 12 && hour < 17) {
        greeting = "Good Afternoon!";
    } else if (hour >= 17 || hour < 5) {
        greeting = "Good Evening!";
    }
    
    document.getElementById('greeting').textContent = greeting;
    
    // Set date display
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    document.getElementById('dateDisplay').textContent = now.toLocaleDateString('en-US', options);
    
    updateBriefStats();
}

function updateBriefStats() {
    const totalTasks = tasks.length;
    const completedCount = tasks.filter(t => t.completed).length;
    
    document.getElementById('todayFocus').textContent = totalTasks;
    document.getElementById('completedTasks').textContent = completedCount;
}

// Task Management Functions
function setupTaskInput() {
    const taskInput = document.getElementById('taskInput');
    const addBtn = document.getElementById('addTaskBtn');
    
    addBtn.addEventListener('click', addTask);
    taskInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            addTask();
        }
    });
}

function addTask() {
    const taskInput = document.getElementById('taskInput');
    const taskText = taskInput.value.trim();
    
    if (taskText === '') {
        return;
    }
    
    const task = {
        id: Date.now(),
        text: taskText,
        completed: false,
        createdAt: new Date().toISOString()
    };
    
    tasks.push(task);
    taskInput.value = '';
    saveTasks();
    renderTasks();
    updateBriefStats();
}

function deleteTask(taskId) {
    tasks = tasks.filter(t => t.id !== taskId);
    saveTasks();
    renderTasks();
    updateBriefStats();
}

function toggleTask(taskId) {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
        task.completed = !task.completed;
        saveTasks();
        renderTasks();
        updateBriefStats();
    }
}

function renderTasks() {
    const container = document.getElementById('tasksContainer');
    
    if (tasks.length === 0) {
        container.innerHTML = '<p class="empty-state">No tasks yet. Add one to get started!</p>';
        return;
    }
    
    container.innerHTML = tasks.map(task => `
        <div class="task-item ${task.completed ? 'completed' : ''}" data-id="${task.id}">
            <input 
                type="checkbox" 
                class="task-checkbox" 
                data-task-id="${task.id}"
                ${task.completed ? 'checked' : ''}
            >
            <span class="task-text">${escapeHtml(task.text)}</span>
            <button class="delete-btn" data-task-id="${task.id}" aria-label="Delete task">×</button>
        </div>
    `).join('');
    
    // Attach event listeners to checkboxes and delete buttons
    container.querySelectorAll('.task-checkbox').forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            const taskId = parseInt(this.dataset.taskId);
            toggleTask(taskId);
        });
    });
    
    container.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const taskId = parseInt(this.dataset.taskId);
            deleteTask(taskId);
        });
    });
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Local Storage Functions
function saveTasks() {
    // Filter tasks to only save today's tasks
    const today = new Date().toDateString();
    const todayTasks = tasks.filter(task => {
        const taskDate = new Date(task.createdAt).toDateString();
        return taskDate === today;
    });
    
    localStorage.setItem('dailyTasks', JSON.stringify(todayTasks));
}

function loadTasks() {
    const saved = localStorage.getItem('dailyTasks');
    if (saved) {
        try {
            const savedTasks = JSON.parse(saved);
            const today = new Date().toDateString();
            
            // Only load tasks from today
            tasks = savedTasks.filter(task => {
                const taskDate = new Date(task.createdAt).toDateString();
                return taskDate === today;
            });
        } catch (e) {
            console.error('Error loading tasks:', e);
            tasks = [];
        }
    }
    renderTasks();
    updateBriefStats();
}

// Clear old tasks daily (called on page load)
function clearOldTasks() {
    const today = new Date().toDateString();
    const lastClear = localStorage.getItem('lastTaskClear');
    
    if (lastClear !== today) {
        localStorage.removeItem('dailyTasks');
        localStorage.setItem('lastTaskClear', today);
        tasks = [];
    }
}

// Productivity Metrics Functions
async function fetchProductivityData() {
    try {
        // 1. Fetch data from your Google Sheet API
        const response = await fetch(APPS_SCRIPT_URL);
        const data = await response.json();
        
        // 2. Find the last entry (the latest data you entered)
        const dailyLogs = data.daily_data; 
        const latestLog = dailyLogs[dailyLogs.length - 1]; 
        
        // 3. Extract the Deep Work Hours value. 
        // NOTE: This key must exactly match the header in your Google Sheet!
        const deepWorkHours = latestLog['Deep Work Hours']; 
        
        // 4. Update the HTML element on the dashboard
        const deepWorkElement = document.getElementById('deepWorkValue');
        
        // Ensure the value is a number before using toFixed
        if (typeof deepWorkHours === 'number') {
            deepWorkElement.textContent = `${deepWorkHours.toFixed(1)} hrs`;
        } else {
             deepWorkElement.textContent = `${deepWorkHours} hrs`;
        }
        
    } catch (error) {
        console.error("Error fetching or processing data:", error);
        document.getElementById('deepWorkValue').textContent = "Connection Error";
    }
}
