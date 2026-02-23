const { pool } = require('./server/config/database');

async function check() {
    try {
        const res = await pool.query('SELECT a.id, a.status, a.winner_id, c.model FROM auctions a JOIN vehicles v ON a.vehicle_id = v.id JOIN vehicle_catalog c ON v.catalog_id = c.id WHERE c.model ILIKE \'%Corolla%\'');
        console.log(JSON.stringify(res.rows));
    } catch (e) {
        console.error(e);
    } finally {
        await pool.end();
    }
}

check();
