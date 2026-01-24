const fs = require('fs/promises');
const _ = require('lodash');

async function generateReport() {
    try {
        const data = await fs.readFile('students.json', 'utf-8');
        const students = JSON.parse(data);

        const studentsWithAverage = students.map(student => {
            const grades = Object.values(student.grades);
            const average = _.round(_.mean(grades), 2);
            return {
                ...student,
                average
            };
        });

        const excellentCount = _.filter(studentsWithAverage, s => s.average > 4.5).length;
        const laggingCount = _.filter(studentsWithAverage, s => s.average < 3.0).length;

        const date = new Date().toLocaleDateString('ru-RU');
        let report = `Отчёт по успеваемости студентов\n`;
        report += `--------------------------------\n`;
        report += `Общее количество студентов: ${students.length}\n\n`;
        report += `Средние баллы:\n`;

        studentsWithAverage.forEach(student => {
            report += `- ${student.name}: ${student.average}\n`;
        });

        report += `\n`;
        report += `Отличники (средний балл > 4.5): ${excellentCount}\n`;
        report += `Отстающие (средний балл < 3.0): ${laggingCount}\n\n`;
        report += `Дата генерации: ${date}\n`;

        await fs.writeFile('info.txt', report, 'utf-8');
        console.log('Отчёт успешно записан в info.txt');
    } catch (err) {
        console.error('Ошибка при выполнении программы:', err.message);
    }
}

generateReport();
