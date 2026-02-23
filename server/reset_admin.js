const bcrypt = require('bcryptjs');
const { Pool } = require('pg');

const pool = new Pool({
    connectionString: 'postgresql://autoconcierge:password@localhost:5432/autoconcierge'
});

async function reset() {
    try {
        const hash = await bcrypt.hash('Password123!', 10);
        const res = await pool.query('UPDATE users SET password_hash = $1 WHERE email = $2', [hash, 'admin@autoconcierge.com']);
        console.log('Update result:', res.rowCount);
        if (res.rowCount === 0) {
            console.log('User not found. Creating admin...');
            await pool.query(
                `INSERT INTO users (email, password_hash, display_name, role, is_active) 
                 VALUES ($1, $2, $3, $4, $5)`,
                ['admin@autoconcierge.com', hash, 'Admin User', 'admin', true]
            );
            console.log('Admin created.');
        } else {
            console.log('Password reset successfully.');
        }
    } catch (err) {
        console.error(err);
    } finally {
        await pool.end();
    }
}

reset();
