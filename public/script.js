alert('Привет! Это скрипт на странице 3.');

// Обновляем время каждую секунду
setInterval(() => {
    const now = new Date();
    document.getElementById('server-time').textContent = now.toLocaleTimeString();
}, 1000);
