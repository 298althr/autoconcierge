const fs = require('fs');
const path = require('path');

const migrationsDir = path.join(__dirname, 'migrations');
const files = fs.readdirSync(migrationsDir).sort();

console.log('Files found:', files);

for (const file of files) {
    if (file.endsWith('.sql')) {
        const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
        console.log(`File: ${file}, Length: ${sql.length}, First 50 chars: |${sql.substring(0, 50)}|`);
    }
}
