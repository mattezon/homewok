const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;

// Путь к папке с публичными файлами
const publicDir = path.join(__dirname, 'public');

// Чтение количества посещений из файла
function getVisitsCount() {
    try {
        const data = fs.readFileSync('visits.txt', 'utf8');
        return parseInt(data, 10) || 0;
    } catch (err) {
        return 0;
    }
}

// Увеличение счётчика посещений
function incrementVisits() {
    const count = getVisitsCount() + 1;
    fs.writeFileSync('visits.txt', count.toString());
}

// Определение MIME-типа по расширению файла
function getMimeType(filePath) {
    const ext = path.extname(filePath).toLowerCase();
    const mimeTypes = {
        '.html': 'text/html',
        '.css': 'text/css',
        '.js': 'application/javascript',
        '.ico': 'image/x-icon',
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.gif': 'image/gif'
    };
    return mimeTypes[ext] || 'application/octet-stream';
}

// Проверка существования файла
function fileExists(filePath) {
    try {
        fs.accessSync(filePath, fs.constants.F_OK);
        return true;
    } catch (err) {
        return false;
    }
}

// Обработка запросов
const server = http.createServer((req, res) => {
    // Игнорируем запросы на favicon, если не обработано явно
    if (req.url === '/favicon.ico') {
        res.writeHead(404);
        res.end();
        return;
    }

    let filePath;
    let contentType;

    switch (req.url) {
        case '/':
            filePath = path.join(publicDir, 'index.html');
            contentType = 'text/html';
            incrementVisits(); // Увеличиваем счётчик при заходе на главную
            break;
        case '/page1':
            filePath = path.join(publicDir, 'page1.html');
            contentType = 'text/html';
            break;
        case '/page2':
            filePath = path.join(publicDir, 'page2.html');
            contentType = 'text/html';
            break;
        case '/page3':
            filePath = path.join(publicDir, 'page3.html');
            contentType = 'text/html';
            break;
        case '/page4':
            // Возвращаем JSON
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ 
                message: 'Это ответ в формате JSON',
                timestamp: new Date().toISOString()
            }));
            return;
        case '/page5':
            // Возвращаем текст с количеством посещений
            const visits = getVisitsCount();
            res.writeHead(200, { 'Content-Type': 'text/plain' });
            res.end(`visited times: ${visits}`);
            return;
        case '/style.css':
            filePath = path.join(publicDir, 'style.css');
            contentType = 'text/css';
            break;
        case '/script.js':
            filePath = path.join(publicDir, 'script.js');
            contentType = 'application/javascript';
            break;
        default:
            // Обработка несуществующих роутов (404)
            res.writeHead(404, { 'Content-Type': 'text/html' });
            res.end('<h1>404 Not Found</h1><p>Страница не найдена.</p>');
            return;
    }

    // Проверяем существование файла
    if (!fileExists(filePath)) {
        res.writeHead(404, { 'Content-Type': 'text/html' });
        res.end('<h1>404 Not Found</h1><p>Файл не найден.</p>');
        return;
    }

    // Чтение и отправка файла
    fs.readFile(filePath, (err, content) => {
        if (err) {
            console.error('Ошибка чтения файла:', err);
            res.writeHead(500, { 'Content-Type': 'text/html' });
            res.end('<h1>500 Internal Server Error</h1>');
            return;
        }
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(content);
    });
});

// Запуск сервера
server.listen(PORT, () => {
    console.log(`Сервер запущен на порту ${PORT}`);
});
