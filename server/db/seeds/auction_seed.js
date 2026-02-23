const { pool } = require('../../config/database');

async function seedAuctions() {
    console.log('[Seed] Seeding auctions...');
    try {
        const vehicles = await pool.query("SELECT id FROM vehicles WHERE status = 'available' LIMIT 3");
        const admin = await pool.query("SELECT id FROM users WHERE role = 'admin' LIMIT 1");

        if (vehicles.rows.length === 0 || !admin.rows[0]) {
            console.log('[Seed] Skipping auctions: No available vehicles or admin found.');
            return;
        }

        const adminId = admin.rows[0].id;

        for (let i = 0; i < vehicles.rows.length; i++) {
            const vehicleId = vehicles.rows[i].id;
            const startTime = new Date();
            const endTime = new Date();
            endTime.setHours(endTime.getHours() + (24 * (i + 1))); // 24h, 48h, 72h

            await pool.query(`
                INSERT INTO auctions (
                    vehicle_id, created_by, start_price, reserve_price, 
                    current_price, bid_increment, start_time, end_time, status
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
                ON CONFLICT (vehicle_id) DO NOTHING
            `, [
                vehicleId, adminId, 5000000, 7500000,
                5000000, 50000, startTime, endTime, 'live'
            ]);

            await pool.query("UPDATE vehicles SET status = 'in_auction' WHERE id = $1", [vehicleId]);
        }
        console.log('[Seed] Auctions seeded successfully.');
    } catch (err) {
        console.error('[Seed Error] Auctions:', err.message);
    }
}

if (require.main === module) {
    seedAuctions().then(() => process.exit());
}

module.exports = seedAuctions;
