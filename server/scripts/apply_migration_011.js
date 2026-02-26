const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const connectionString = "postgresql://postgres:pSqGlclZvUKMLiQXQeiccKYhanHzeRys@yamanote.proxy.rlwy.net:18967/railway";
const pool = new Pool({ connectionString });

async function runMigration() {
    console.log('--- Applying Auction Logic Evolution Migration (Step 1) ---');
    const client = await pool.connect();
    try {
        const sql = fs.readFileSync(path.join(__dirname, '../db/migrations/011_auction_logic_evolution.sql'), 'utf8');
        await client.query(sql);
        console.log('✅ Migration applied successfully.');
    } catch (err) {
        console.error('❌ Migration failed:', err);
    } finally {
        client.release();
        await pool.end();
    }
}
runMigration();
