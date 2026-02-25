const fs = require('fs');
const path = require('path');
const { pool } = require('../config/database');

async function migrate() {
    const migrationsDir = path.join(__dirname, 'migrations');
    const files = fs.readdirSync(migrationsDir).sort();

    console.log('🚀 Starting migrations...');

    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        for (const file of files) {
            if (file.endsWith('.sql')) {
                console.log(`  📄 Running ${file}...`);
                const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
                await client.query(sql);
            }
        }

        await client.query('COMMIT');
        console.log('✅ Migrations completed successfully!');
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('❌ Migration failed:', err);
        process.exit(1);
    } finally {
        client.release();
        await pool.end();
    }
}

migrate();
