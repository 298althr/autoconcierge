process.env.DATABASE_URL = "postgresql://postgres:pSqGlclZvUKMLiQXQeiccKYhanHzeRys@yamanote.proxy.rlwy.net:18967/railway";
process.env.JWT_ACCESS_SECRET = "4e8a1f2e4c5d9a0b1c2e3f4g5h6i7j8k9l0m1n2o3p4q5r6s7t8u9v0w1x2y3z4a";
process.env.JWT_REFRESH_SECRET = "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f";
process.env.NODE_ENV = 'test';

const { pool } = require('../config/database');
const bidService = require('../services/bidService');
const walletService = require('../services/walletService');
const crypto = require('crypto');

async function setup() {
    console.log('🚀 Setting up performance test (1,000 concurrent bids)...');

    // 1. Create a clean test user
    const userEmail = `perf_tester_${crypto.randomBytes(4).toString('hex')}@autogaard.ng`;
    const userRes = await pool.query(
        "INSERT INTO users (email, display_name, role, kyc_status, wallet_balance, password_hash) VALUES ($1, $2, 'user', 'verified', 500000000, 'dummy') RETURNING id",
        [userEmail, 'PERF_TESTER']
    );
    const userId = userRes.rows[0].id;
    console.log(`✅ Test User Created: ${userId}`);

    // 2. Pick a vehicle and create/reset a live auction
    const vehicleRes = await pool.query("SELECT id FROM vehicles LIMIT 1");
    if (!vehicleRes.rows[0]) throw new Error('No vehicles found to auction');
    const vehicleId = vehicleRes.rows[0].id;

    // Clear old auctions and bids for this vehicle to avoid unique constraint and FK issues
    const oldAuctions = await pool.query("SELECT id FROM auctions WHERE vehicle_id = $1", [vehicleId]);
    for (const row of oldAuctions.rows) {
        await pool.query("DELETE FROM bids WHERE auction_id = $1", [row.id]);
        await pool.query("DELETE FROM auction_escrow WHERE auction_id = $1", [row.id]);
    }
    await pool.query("DELETE FROM auctions WHERE vehicle_id = $1", [vehicleId]);

    const auctionId = crypto.randomUUID();
    await pool.query(`
        INSERT INTO auctions (id, vehicle_id, created_by, start_price, current_price, bid_increment, status, start_time, end_time)
        VALUES ($1, $2, $3, 10000000, 10000000, 50000, 'live', NOW() - interval '24 hours', NOW() + interval '24 hours')
    `, [auctionId, vehicleId, userId]);

    const dbCheck = await pool.query("SELECT id, start_time, end_time, status FROM auctions WHERE id = $1", [auctionId]);
    const row = dbCheck.rows[0];
    console.log(`✅ Test Auction Row:`, {
        id: row.id,
        status: row.status,
        start_time: row.start_time,
        end_time: row.end_time,
        now: new Date(),
        start_type: typeof row.start_time,
        is_date: row.start_time instanceof Date
    });

    return { userId, auctionId };
}

async function runTest(userId, auctionId) {
    const TOTAL_BIDS = 1000;
    const BATCH_SIZE = 100;
    const BATCH_GAP_MS = 1000;

    console.log(`🔥 Launching ${TOTAL_BIDS} bids in batches of ${BATCH_SIZE}...`);

    const start = Date.now();
    const results = [];

    for (let b = 0; b < TOTAL_BIDS / BATCH_SIZE; b++) {
        const promises = [];
        for (let i = 1; i <= BATCH_SIZE; i++) {
            const bidIndex = (b * BATCH_SIZE) + i;
            const amount = 10000000 + (bidIndex * 50000);
            promises.push(
                bidService.placeBid(userId, auctionId, amount)
                    .then(() => ({ status: 'success' }))
                    .catch(err => ({ status: 'fail', error: err.message }))
            );
        }
        console.log(`  -> Firing batch ${b + 1}/${TOTAL_BIDS / BATCH_SIZE}...`);
        const batchResults = await Promise.all(promises);
        results.push(...batchResults);
        if (b < (TOTAL_BIDS / BATCH_SIZE) - 1) {
            await new Promise(r => setTimeout(r, BATCH_GAP_MS));
        }
    }

    const duration = Date.now() - start;
    const successCount = results.filter(r => r.status === 'success').length;
    const failCount = results.filter(r => r.status === 'fail').length;

    console.log('\n📊 --- Performance Results ---');
    console.log(`Total Attempts: ${CONCURRENT_BIDS}`);
    console.log(`Successes:      ${successCount}`);
    console.log(`Failures:       ${failCount}`);
    console.log(`Total Duration: ${duration}ms`);
    console.log(`Avg Latency:    ${(duration / CONCURRENT_BIDS).toFixed(2)}ms per bid`);
    console.log(`Throughput:     ${((successCount / duration) * 1000).toFixed(2)} bids/sec`);

    if (failCount > 0) {
        console.log('\n⚠️ First failure reason:', results.find(r => r.status === 'fail').error);
    }

    // Verify Final State
    const finalAuction = await pool.query("SELECT current_price, bid_count FROM auctions WHERE id = $1", [auctionId]);
    console.log(`\n🏁 Final Auction Price: ₦${parseFloat(finalAuction.rows[0].current_price).toLocaleString()}`);
    console.log(`🏁 Final Bid Count:    ${finalAuction.rows[0].bid_count}`);
}

async function cleanup(userId, auctionId) {
    console.log('\n🧹 Cleaning up test data...');
    await pool.query("DELETE FROM bids WHERE auction_id = $1", [auctionId]);
    await pool.query("DELETE FROM auctions WHERE id = $1", [auctionId]);
    await pool.query("DELETE FROM transactions WHERE user_id = $1", [userId]);
    await pool.query("DELETE FROM users WHERE id = $1", [userId]);
    console.log('✨ Performance test complete.');
    await pool.end();
}

async function main() {
    try {
        const { userId, auctionId } = await setup();
        await runTest(userId, auctionId);
        await cleanup(userId, auctionId);
    } catch (err) {
        console.error('❌ Test failed:', err);
        await pool.end();
    }
}

main();
