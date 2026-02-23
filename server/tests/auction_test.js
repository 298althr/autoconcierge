const { pool } = require('../config/database');
const bidService = require('../services/bidService');
const walletService = require('../services/walletService');

async function createTestUser(email, name) {
    const res = await pool.query(
        `INSERT INTO users (email, password_hash, display_name, wallet_balance) 
         VALUES ($1, 'hash', $2, 10000000) 
         ON CONFLICT (email) DO UPDATE SET wallet_balance = 10000000
         RETURNING id`,
        [email, name]
    );
    return res.rows[0].id;
}

async function createTestVehicle(ownerId) {
    const res = await pool.query(
        `INSERT INTO vehicles (make, model, year, vin, owner_id) 
         VALUES ('Test', 'Car', 2024, 'TESTVIN' || floor(random() * 10000)::text, $1) 
         RETURNING id`,
        [ownerId]
    );
    return res.rows[0].id;
}

async function createTestAuction(vehicleId, adminId) {
    const start = new Date(Date.now() - 10000); // started 10 seconds ago
    const end = new Date(Date.now() + 60000); // ends in 1 min (triggers anti snipe if < 2 mins)
    const res = await pool.query(
        `INSERT INTO auctions (vehicle_id, start_price, current_price, reserve_price, bid_increment, start_time, end_time, status, created_by) 
         VALUES ($1, 500000, 500000, 1000000, 50000, $2, $3, 'live', $4) 
         RETURNING id`,
        [vehicleId, start, end, adminId]
    );
    return res.rows[0].id;
}

async function runTest() {
    try {
        console.log('--- Starting Concurrent Bid & Anti-Snipe Test ---');

        // 1. Setup Data
        const user1 = await createTestUser('bidder1@test.com', 'Bidder 1');
        const user2 = await createTestUser('bidder2@test.com', 'Bidder 2');
        const adminId = await createTestUser('admin_test@test.com', 'Admin');

        const vehicleId = await createTestVehicle(adminId);
        const auctionId = await createTestAuction(vehicleId, adminId);

        console.log(`Setup complete. Auction ID: ${auctionId}`);

        // 2. Race Condition Test: 5 concurrent bids from user1 and user2
        console.log('\n[Test 8F & 8H] Sending 5 concurrent bids...');
        const bids = [
            bidService.placeBid(user1, auctionId, 550000),
            bidService.placeBid(user2, auctionId, 600000),
            bidService.placeBid(user1, auctionId, 650000),
            bidService.placeBid(user2, auctionId, 700000),
            bidService.placeBid(user1, auctionId, 520000) // Deliberate low bid to fail
        ];

        const results = await Promise.allSettled(bids);

        let successCount = 0;
        let failCount = 0;
        results.forEach((r, i) => {
            if (r.status === 'fulfilled') {
                console.log(`Bid ${i + 1} SUCCESS: Amount ${r.value.amount}`);
                successCount++;
            } else {
                console.log(`Bid ${i + 1} FAILED: ${r.reason.message || r.reason}`);
                failCount++;
            }
        });

        // 3. Verify Final State
        const auctionRes = await pool.query('SELECT * FROM auctions WHERE id = $1', [auctionId]);
        const finalAuction = auctionRes.rows[0];
        console.log(`\\n--- Final Auction State ---`);
        console.log(`Current Price: ${finalAuction.current_price}`);
        console.log(`Bid Count: ${finalAuction.bid_count}`);
        console.log(`Winner ID: ${finalAuction.winner_id}`);
        console.log(`Extensions: ${finalAuction.snipe_extensions}`);

        if (finalAuction.snipe_extensions > 0) {
            console.log('✅ Anti-snipe extension triggered successfully! (Test 8H Passed)');
        }
        if (successCount > 0 && failCount > 0 && finalAuction.bid_count === successCount) {
            console.log('✅ Concurrent race conditions handled correctly! (Test 8F Passed)');
        }

    } catch (err) {
        console.error('Test script failed:', err);
    } finally {
        await pool.end();
    }
}

runTest();
