const { Pool } = require('pg');
const connectionString = "postgresql://postgres:pSqGlclZvUKMLiQXQeiccKYhanHzeRys@yamanote.proxy.rlwy.net:18967/railway";
const pool = new Pool({ connectionString });

async function killConnections() {
    console.log('💀 Killing all other database connections...');
    try {
        const res = await pool.query(`
            SELECT pg_terminate_backend(pid)
            FROM pg_stat_activity
            WHERE datname = current_database()
              AND pid <> pg_backend_pid();
        `);
        console.log(`✅ Killed ${res.rowCount} connections.`);
    } catch (err) {
        console.error('❌ Failed to kill connections:', err);
    } finally {
        await pool.end();
    }
}
killConnections();
