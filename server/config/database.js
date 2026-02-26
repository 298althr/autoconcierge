const { Pool } = require('pg');
const env = require('./env');

const pool = new Pool({
    connectionString: env.DATABASE_URL,
    max: 100, // Scaled for high-concurrency auction bidding
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000, // Wait longer for a free client under load
});

pool.on('error', (err) => {
    console.error('Unexpected error on idle database client', err);
});

module.exports = {
    query: (text, params) => pool.query(text, params),
    pool,
};
