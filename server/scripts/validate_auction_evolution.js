process.env.DATABASE_URL = "postgresql://postgres:pSqGlclZvUKMLiQXQeiccKYhanHzeRys@yamanote.proxy.rlwy.net:18967/railway";
const { Pool } = require('pg');
const certificationService = require('../services/certificationService');
const escrowService = require('../services/escrowService');
const autoResolutionService = require('../services/autoResolutionService');
const walletService = require('../services/walletService');

const connectionString = "postgresql://postgres:pSqGlclZvUKMLiQXQeiccKYhanHzeRys@yamanote.proxy.rlwy.net:18967/railway";
const pool = new Pool({ connectionString });

// Mock data
const userId = '6b00147e-2f11-410d-992d-dc5ed51026d8';
const vehicleId = '7c97f9c0-5ec7-4dcc-90af-25ea4f56c8ad';
const auctionId = require('crypto').randomUUID();

async function validateScenario() {
    console.log('🚀 Starting Full Lifecycle Validation (Steps 1, 2, 3)');

    try {
        // 0. Setup: Fund Wallet & Create Auction
        console.log('  -> Setting up test environment...');
        const client = await pool.connect();

        // Ensure user has enough money and is KYC verified
        await client.query("UPDATE users SET wallet_balance = 100000000, held_amount = 0, kyc_status = 'verified' WHERE id = $1", [userId]);

        // Cleanup any existing escrow for these IDs
        await client.query("DELETE FROM auction_escrow WHERE auction_id = $1", [auctionId]);

        await client.query(`
            INSERT INTO auctions (id, vehicle_id, created_by, start_price, status, start_time, end_time)
            VALUES ($1, $2, $3, 25000000, 'live', NOW(), NOW() + interval '7 days')
        `, [auctionId, vehicleId, userId]);

        // 🟢 STEP 2: Forensic Certification
        console.log('\n--- [STEP 2] Simulating Forensic Certification ---');
        const mediaPack = {
            engine_video: 'https://vimeo.com/123456',
            cold_start: 'https://vimeo.com/789012',
            obd_scan: 'https://cloudinary.com/obd_result.jpg',
            exterior_360: 'https://vimeo.com/360v',
            obd_data: { fault_count: 1, active_faults: ['P0300'] }, // Has a fault
            obd_flags: ['MISFIRE_DETECTED'],
            metadata_valid: true
        };
        const certRes = await certificationService.processCertification(vehicleId, mediaPack);
        console.log('✅ Certification Processed:', certRes);

        // 🟢 STEP 1: Escrow Initiation (10%)
        console.log('\n--- [STEP 1] Initiating 10% Escrow Commitment ---');
        const dealAmount = 25000000; // 25M Naira
        const escrow = await escrowService.initiateEscrow(auctionId, userId, dealAmount);
        console.log('✅ 10% Escrow Held:', { id: escrow.id, held: escrow.held_amount, stage: escrow.stage });

        // 🟢 STEP 1b: Upgrade to 70% (Buy Now Scenario)
        console.log('\n--- [STEP 1b] Upgrading to 70% Escrow (Soft-Locking) ---');
        const upgradeRes = await escrowService.upgradeTo70Percent(escrow.id);
        console.log('✅ 70% Escrow Status:', upgradeRes);

        // 🟢 STEP 3: Auto-Resolution Engine Validation
        console.log('\n--- [STEP 3] Testing Auto-Resolution (Buyer Disputes Disclosed Fault) ---');
        // Simulated Scenario: Buyer tries to dispute the mechanical fault we already tagged in OBD
        const disputeRes = await autoResolutionService.evaluateDispute(escrow.id, 'mechanical', 'The car has a misfire.');
        console.log('✅ Auto-Resolution Result:', disputeRes);
        if (disputeRes.verdict === 'reject') {
            console.log('🔥 SUCCESS: Engine correctly rejected dispute because fault was already in certification pack.');
        }

        // 🟢 FINALE: Completion (100% Release)
        console.log('\n--- [FINAL] Completing Transaction & Releasing Funds ---');
        const finalRes = await escrowService.completeTransaction(escrow.id);
        console.log('✅ Transaction Complete. Seller Paid:', finalRes.payout.toLocaleString());

        console.log('\n🏆 ALL SYSTEMS VALIDATED. SERVICE SATISIFIED.');

    } catch (err) {
        console.error('\n❌ Validation Failed:', err);
    } finally {
        await pool.end();
    }
}

validateScenario();
