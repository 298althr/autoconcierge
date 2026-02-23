const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const pool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgresql://autoconcierge:password@localhost:5432/autoconcierge'
});

async function run() {
    const client = await pool.connect();
    try {
        console.log('🔄 DEEP CLEANING START...');

        const emails = ["demo@user.com", "298saviour@gmail.com"];

        // 1. Delete bids
        await client.query("DELETE FROM bids WHERE user_id IN (SELECT id FROM users WHERE email = ANY($1))", [emails]);

        // 2. Delete transactions
        await client.query("DELETE FROM transactions WHERE user_id IN (SELECT id FROM users WHERE email = ANY($1))", [emails]);

        // 3. Clear auctions (winner_id or created_by)
        await client.query("DELETE FROM auctions WHERE created_by IN (SELECT id FROM users WHERE email = ANY($1)) OR winner_id IN (SELECT id FROM users WHERE email = ANY($1))", [emails]);

        // 4. Delete valuations
        await client.query("DELETE FROM valuations WHERE email = ANY($1)", [emails]);

        // 5. Delete vehicles owned by them
        await client.query("DELETE FROM vehicles WHERE owner_id IN (SELECT id FROM users WHERE email = ANY($1))", [emails]);

        // 6. Finally delete users
        await client.query("DELETE FROM users WHERE email = ANY($1)", [emails]);

        const hashedPassword = await bcrypt.hash('saviour1@', 10);

        await client.query(`
      INSERT INTO users (email, password_hash, display_name, role, wallet_balance, kyc_status)
      VALUES ($1, $2, $3, $4, $5, $6)
    `, ['298saviour@gmail.com', hashedPassword, 'Saviour', 'user', 0, 'none']);

        console.log('✅ User 298saviour@gmail.com created successfully.');
    } catch (err) {
        console.error('❌ Error:', err.message);
    } finally {
        client.release();
        await pool.end();
    }
}

run();
