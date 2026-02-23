const { pool } = require('../config/database');
const settlementService = require('../services/settlementService');

async function createTestData() {
    const adminRes = await pool.query(
        `INSERT INTO users (email, password_hash, display_name, wallet_balance) 
         VALUES ('admin_settle@test.com', 'hash', 'Admin Settlement', 0) 
         ON CONFLICT (email) DO UPDATE SET wallet_balance = 0 RETURNING id`
    );
    const adminId = adminRes.rows[0].id;

    const vehicleRes = await pool.query(
        `INSERT INTO vehicles (make, model, year, vin, owner_id, status) 
         VALUES ('Test', 'Timeout', 2024, 'TM' || floor(random() * 10000)::text, $1, 'in_auction') 
         RETURNING id`,
        [adminId]
    );
    const vehicleId = vehicleRes.rows[0].id;

    const userRes = await pool.query(
        `INSERT INTO users (email, password_hash, display_name, wallet_balance, held_amount) 
         VALUES ('timeout_winner@test.com', 'hash', 'Winner', 1000000, 100000) 
         ON CONFLICT (email) DO UPDATE SET wallet_balance = 1000000, held_amount = 100000 RETURNING id`
    );
    const winnerId = userRes.rows[0].id;

    const pastEnd = new Date(Date.now() - (50 * 60 * 60 * 1000)); // Ended 50 hours ago
    const pastStart = new Date(Date.now() - (60 * 60 * 60 * 1000));
    const auctionRes = await pool.query(
        `INSERT INTO auctions (vehicle_id, start_price, current_price, deposit_pct, start_time, end_time, status, winner_id, created_by) 
         VALUES ($1, 500000, 500000, 20, $2, $3, 'ended', $4, $5) 
         RETURNING id`,
        [vehicleId, pastStart, pastEnd, winnerId, adminId]
    );

    return { auctionId: auctionRes.rows[0].id, vehicleId, winnerId };
}

async function runTest() {
    try {
        console.log('--- Starting 48hr Settlement Timeout Test ---');
        const data = await createTestData();

        console.log(`[Test 8I] Processing settlement timeouts...`);
        // Manually trigger the cron task function
        await settlementService.processSettlementTimeouts();

        // Assertions
        const auction = (await pool.query('SELECT status FROM auctions WHERE id = $1', [data.auctionId])).rows[0];
        const vehicle = (await pool.query('SELECT status FROM vehicles WHERE id = $1', [data.vehicleId])).rows[0];
        const user = (await pool.query('SELECT held_amount FROM users WHERE id = $1', [data.winnerId])).rows[0];

        const heldAmt = parseFloat(user.held_amount);

        if (auction.status === 'cancelled' && vehicle.status === 'available' && heldAmt === 0) {
            console.log('✅ Auction cancelled, vehicle available, deposit forfeited! (Test 8I Passed)');
        } else {
            console.log('❌ FAIL: Expected state mismatch');
            console.log('Auction Status:', auction.status);
            console.log('Vehicle Status:', vehicle.status);
            console.log('User Held Amount:', heldAmt);
        }
    } catch (err) {
        console.error('Test script failed:', err);
    } finally {
        await pool.end();
    }
}

runTest();
