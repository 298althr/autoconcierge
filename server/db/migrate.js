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
                try {
                    await client.query(sql);
                } catch (err) {
                    console.error(`❌ Error in ${file}:`);
                    console.error(`SQL Snippet: ${sql.substring(0, 500)}`);
                    throw err;
                }
            }
        }

        await client.query('COMMIT');
        console.log('✅ Migrations completed successfully!');
    } catch (err) {
        if (client) await client.query('ROLLBACK');
        console.error('❌ Migration failed:', err);
        process.exit(1);
    } finally {
        if (client) client.release();
        await pool.end();
    }
}

migrate();
