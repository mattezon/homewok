// Константы API
const API_URL = 'http://localhost:3000/tasks';
let currentFilter = 'all';
let currentSort = 'newest';

// Элементы DOM
const taskForm = document.getElementById('taskForm');
const tasksContainer = document.getElementById('tasksContainer');
const filterButtons = document.querySelectorAll('.filter-btn');
const sortSelect = document.getElementById('sortSelect');
const refreshBtn = document.getElementById('refreshBtn');
const editModal = document.getElementById('editModal');
const editForm = document.getElementById('editForm');
const serverStatus = document.getElementById('serverStatus');
const totalTasksEl = document.getElementById('totalTasks');
const completedTasksEl = document.getElementById('completedTasks');
const activeTasksEl = document.getElementById('activeTasks');

// Инициализация приложения
document.addEventListener('DOMContentLoaded', () => {
    checkServerStatus();
    loadTasks();
    setupEventListeners();
});

// Проверка статуса сервера
async function checkServerStatus() {
    try {
        const response = await fetch(API_URL);
        if (response.ok) {
            serverStatus.textContent = 'Подключен';
            serverStatus.classList.add('connected');
            serverStatus.classList.remove('disconnected');
        } else {
            throw new Error('Сервер не отвечает');
        }
    } catch (error) {
        serverStatus.textContent = 'Отключен';
        serverStatus.classList.add('disconnected');
        serverStatus.classList.remove('connected');
        console.error('Ошибка подключения к серверу:', error);
    }
}

// Настройка обработчиков событий
function setupEventListeners() {
    // Добавление новой задачи
    taskForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const title = document.getElementById('title').value.trim();
        const description = document.getElementById('description').value.trim();
        const priority = document.getElementById('priority').value;
        
        if (!title) {
            alert('Пожалуйста, введите название задачи');
            return;
        }
        
        const newTask = {
            title,
            description: description || 'Нет описания',
            priority,
            completed: false,
            date: new Date().toISOString()
        };
        
        try {
            await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(newTask)
            });
            
            taskForm.reset();
            document.getElementById('priority').value = 'средний';
            loadTasks();
        } catch (error) {
            console.error('Ошибка при добавлении задачи:', error);
            alert('Не удалось добавить задачу');
        }
    });
    
    // Фильтрация задач
    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            filterButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentFilter = btn.dataset.filter;
            loadTasks();
        });
    });
    
    // Сортировка задач
    sortSelect.addEventListener('change', () => {
        currentSort = sortSelect.value;
        loadTasks();
    });
    
    // Обновление списка задач
    refreshBtn.addEventListener('click', () => {
        loadTasks();
        checkServerStatus();
    });
    
    // Закрытие модального окна
    document.querySelectorAll('.close-modal').forEach(btn => {
        btn.addEventListener('click', () => {
            editModal.style.display = 'none';
        });
    });
    
    // Закрытие модального окна при клике вне его
    window.addEventListener('click', (e) => {
        if (e.target === editModal) {
            editModal.style.display = 'none';
        }
    });
    
    // Редактирование задачи
    editForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const id = document.getElementById('editId').value;
        const title = document.getElementById('editTitle').value.trim();
        const description = document.getElementById('editDescription').value.trim();
        const priority = document.getElementById('editPriority').value;
        const completed = document.getElementById('editCompleted').checked;
        
        if (!title) {
            alert('Пожалуйста, введите название задачи');
            return;
        }
        
        try {
            await fetch(`${API_URL}/${id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    title,
                    description: description || 'Нет описания',
                    priority,
                    completed
                })
            });
            
            editModal.style.display = 'none';
            loadTasks();
        } catch (error) {
            console.error('Ошибка при обновлении задачи:', error);
            alert('Не удалось обновить задачу');
        }
    });
}

// Загрузка задач с сервера
async function loadTasks() {
    try {
        tasksContainer.innerHTML = '<div class="loading"><i class="fas fa-spinner fa-spin"></i> Загрузка задач...</div>';
        
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error('Ошибка загрузки задач');
        
        let tasks = await response.json();
        
        // Применяем фильтрацию
        tasks = filterTasks(tasks);
        
        // Применяем сортировку
        tasks = sortTasks(tasks);
        
        // Обновляем статистику
        updateStats(tasks);
        
        // Отображаем задачи
        displayTasks(tasks);
    } catch (error) {
        console.error('Ошибка при загрузке задач:', error);
        tasksContainer.innerHTML = `
            <div class="empty-tasks">
                <i class="fas fa-exclamation-triangle"></i>
                <h3>Ошибка загрузки задач</h3>
                <p>Не удалось загрузить задачи с сервера. Убедитесь, что json-server запущен на порту 3000.</p>
                <button onclick="loadTasks()" class="btn btn-primary">Повторить попытку</button>
            </div>
        `;
    }
}

// Фильтрация задач
function filterTasks(tasks) {
    switch (currentFilter) {
        case 'active':
            return tasks.filter(task => !task.completed);
        case 'completed':
            return tasks.filter(task => task.completed);
        default:
            return tasks;
    }
}

// Сортировка задач
function sortTasks(tasks) {
    return tasks.sort((a, b) => {
        switch (currentSort) {
            case 'oldest':
                return new Date(a.date) - new Date(b.date);
            case 'priority':
                const priorityOrder = { 'высокий': 3, 'средний': 2, 'низкий': 1 };
                return (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0);
            default: // newest
                return new Date(b.date) - new Date(a.date);
        }
    });
}

// Обновление статистики
function updateStats(tasks) {
    const total = tasks.length;
    const completed = tasks.filter(task => task.completed).length;
    const active = total - completed;
    
    totalTasksEl.textContent = total;
    completedTasksEl.textContent = completed;
    activeTasksEl.textContent = active;
}

// Отображение задач
function displayTasks(tasks) {
    if (tasks.length === 0) {
        tasksContainer.innerHTML = `
            <div class="empty-tasks">
                <i class="fas fa-clipboard-list"></i>
                <h3>Задачи не найдены</h3>
                <p>${currentFilter === 'all' ? 'Добавьте первую задачу!' : 'Нет задач с выбранным фильтром.'}</p>
            </div>
        `;
        return;
    }
    
    const tasksHTML = tasks.map(task => createTaskCard(task)).join('');
    tasksContainer.innerHTML = `<div class="tasks-container">${tasksHTML}</div>`;
    
    // Добавляем обработчики событий для кнопок задач
    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            const id = e.target.closest('.task-card').dataset.id;
            if (confirm('Вы уверены, что хотите удалить эту задачу?')) {
                try {
                    await fetch(`${API_URL}/${id}`, {
                        method: 'DELETE'
                    });
                    loadTasks();
                } catch (error) {
                    console.error('Ошибка при удалении задачи:', error);
                    alert('Не удалось удалить задачу');
                }
            }
        });
    });
    
    document.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = e.target.closest('.task-card').dataset.id;
            openEditModal(id, tasks.find(task => task.id == id));
        });
    });
    
    document.querySelectorAll('.complete-checkbox').forEach(checkbox => {
        checkbox.addEventListener('change', async (e) => {
            const id = e.target.closest('.task-card').dataset.id;
            const completed = e.target.checked;
            
            try {
                await fetch(`${API_URL}/${id}`, {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ completed })
                });
                loadTasks();
            } catch (error) {
                console.error('Ошибка при обновлении статуса задачи:', error);
                alert('Не удалось обновить статус задачи');
            }
        });
    });
}

// Создание карточки задачи
function createTaskCard(task) {
    const date = new Date(task.date).toLocaleDateString('ru-RU', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
    
    const priorityClass = `priority-${task.priority === 'высокий' ? 'high' : task.priority === 'средний' ? 'medium' : 'low'}`;
    
    return `
        <div class="task-card ${task.completed ? 'completed' : ''} ${task.priority}-priority" data-id="${task.id}">
            <div class="task-header">
                <div class="task-title">${escapeHtml(task.title)}</div>
                <span class="task-priority ${priorityClass}">${task.priority}</span>
            </div>
            
            <div class="task-description">${escapeHtml(task.description)}</div>
            
            <div class="task-footer">
                <div class="task-date">
                    <i class="far fa-calendar"></i> ${date}
                </div>
                
                <div class="task-actions">
                    <label class="task-checkbox">
                        <input type="checkbox" class="complete-checkbox" ${task.completed ? 'checked' : ''}>
                        ${task.completed ? 'Выполнена' : 'Выполнить'}
                    </label>
                    
                    <button class="btn btn-warning edit-btn">
                        <i class="fas fa-edit"></i> Редактировать
                    </button>
                    
                    <button class="btn btn-danger delete-btn">
                        <i class="fas fa-trash"></i> Удалить
                    </button>
                </div>
            </div>
        </div>
    `;
}

// Открытие модального окна редактирования
function openEditModal(id, task) {
    document.getElementById('editId').value = id;
    document.getElementById('editTitle').value = task.title;
    document.getElementById('editDescription').value = task.description;
    document.getElementById('editPriority').value = task.priority;
    document.getElementById('editCompleted').checked = task.completed;
    
    editModal.style.display = 'flex';
}

// Экранирование HTML
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Экспорт функций для глобального использования
window.loadTasks = loadTasks;