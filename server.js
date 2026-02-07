const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = 3000;

// Импортируем middleware
const authMiddleware = require('./middleware/authMiddleware');

// Парсим JSON из тела запроса
app.use(express.json());

// Роут /users/:id — возвращает HTML-страницу с данными пользователя
app.get('/users/:id', (req, res) => {
  const userId = parseInt(req.params.id);
  const users = JSON.parse(fs.readFileSync('users.json', 'utf8'));
  const user = users.find(u => u.id === userId);

  if (user) {
    const html = `
      <!DOCTYPE html>
      <html>
      <head><title>Профиль пользователя</title></head>
      <body>
        <h1>Пользователь</h1>
        <p>Имя: ${user.name}</p>
        <p>Возраст: ${user.age}</p>
      </body>
      </html>
    `;
    res.send(html);
  } else {
    res.status(404).send('Пользователь не найден');
  }
});

// Роут /search?query=... — возвращает JSON с результатами поиска
app.get('/search', (req, res) => {
  const query = req.query.query || '';
  const searchResults = ['apple', 'application', 'app', 'banana', 'band'].filter(word => word.includes(query));
  res.json(searchResults);
});

// Роут /admin — доступен только с заголовком X-Admin: true
app.get('/admin', authMiddleware, (req, res) => {
  fs.readdir(path.join(__dirname, 'public'), (err, files) => {
    if (err) {
      res.status(500).json({ error: 'Ошибка при чтении директории' });
    } else {
      const html = `
        <!DOCTYPE html>
        <html>
        <head><title>Админ-панель</title></head>
        <body>
          <h1>Список файлов в папке public:</h1>
          <ul>
            ${files.map(file => `<li>${file}</li>`).join('')}
          </ul>
        </body>
        </html>
      `;
      res.send(html);
    }
  });
});

// Динамическая страница /time — отображает текущее время в формате HH:MM:SS
app.get('/time', (req, res) => {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  const currentTime = `${hours}:${minutes}:${seconds}`;
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head><title>Текущее время</title></head>
    <body>
      <h1>Текущее время сервера:</h1>
      <p>${currentTime}</p>
    </body>
    </html>
  `;
  res.send(html);
});

app.get('/download', (req, res) => {
  const filePath = path.join(__dirname, 'public', 'docs', 'example.pdf');
  
  // Проверяем, существует ли файл
  if (!fs.existsSync(filePath)) {
    return res.status(404).send('Файл не найден');
  }
  
  res.download(filePath, 'example.pdf', (err) => {
    if (err) {
      res.status(500).send('Ошибка при скачивании файла');
    }
  });
});

// Запуск сервера
app.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT}`);
});
