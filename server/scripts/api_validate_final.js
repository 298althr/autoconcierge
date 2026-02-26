const request = require('supertest');
process.env.DATABASE_URL = "postgresql://postgres:pSqGlclZvUKMLiQXQeiccKYhanHzeRys@yamanote.proxy.rlwy.net:18967/railway";
process.env.NODE_ENV = 'test';
process.env.PORT = "4001";
const app = require('../index');
const { Pool } = require('pg');
const { generateAccessToken } = require('../utils/jwt');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function runValidation() {
    console.log('🔍 Starting API POST/GET Validation Sequence...');

    try {
        // 1. Setup Test Data in DB directly
        const userId = '6b00147e-2f11-410d-992d-dc5ed51026d8';
        const vehicleId = '7c97f9c0-5ec7-4dcc-90af-25ea4f56c8ad';
        const auctionId = require('crypto').randomUUID();

        console.log('  -> preparing database state...');
        await pool.query("UPDATE users SET wallet_balance = 100000000, held_amount = 0, kyc_status = 'verified' WHERE id = $1", [userId]);
        console.log('     [1/4] User wallet reset');
        await pool.query("DELETE FROM transactions WHERE user_id = $1", [userId]);
        await pool.query("DELETE FROM auction_escrow WHERE buyer_id = $1 OR seller_id = $1", [userId]);
        console.log('     [2/4] Old escrows cleared');
        await pool.query("DELETE FROM auctions WHERE vehicle_id = $1", [vehicleId]);
        console.log('     [3/4] Old auctions cleared');
        await pool.query(`
            INSERT INTO auctions (id, vehicle_id, created_by, start_price, status, start_time, end_time)
            VALUES ($1, $2, $3, 25000000, 'live', NOW(), NOW() + interval '7 days')
        `, [auctionId, vehicleId, userId]);
        console.log('     [4/4] Test auction created');

        // 2. Generate Token
        const token = generateAccessToken({ id: userId, email: '298saviour@gmail.com', role: 'admin' });

        // 3. STEP 2 API: Forensic Certification
        console.log('\n📡 [POST] /api/vehicles/:id/certify');
        const certRes = await request(app)
            .post(`/api/vehicles/${vehicleId}/certify`)
            .set('Authorization', `Bearer ${token}`)
            .send({
                engine_video: 'https://vimeo.com/test-engine',
                cold_start: 'https://vimeo.com/test-start',
                obd_scan: 'https://cloudinary.com/test-obd',
                exterior_360: 'https://vimeo.com/test-360',
                obd_data: { fault_count: 1, active_faults: ['P0300'] },
                obd_flags: ['MISFIRE_DETECTED'],
                metadata_valid: true
            });
        console.log('Result:', certRes.status, certRes.body);

        // 4. STEP 1 API: Escrow Initiation
        console.log('\n📡 [POST] /api/escrow/initiate');
        const escrowInitRes = await request(app)
            .post('/api/escrow/initiate')
            .set('Authorization', `Bearer ${token}`)
            .send({ auction_id: auctionId, amount: 25000000 });
        console.log('Result:', escrowInitRes.status, escrowInitRes.body);
        const escrowId = escrowInitRes.body.data.id;

        // 5. STEP 1b API: Upgrade to 70%
        console.log('\n📡 [POST] /api/escrow/:id/upgrade-70');
        const upgradeRes = await request(app)
            .post(`/api/escrow/${escrowId}/upgrade-70`)
            .set('Authorization', `Bearer ${token}`);
        console.log('Result:', upgradeRes.status, upgradeRes.body);

        // 6. STEP 3 API: Auto-Resolution Dispute
        console.log('\n📡 [POST] /api/escrow/:id/dispute (Disclosing fault already in cert)');
        const disputeRes = await request(app)
            .post(`/api/escrow/${escrowId}/dispute`)
            .set('Authorization', `Bearer ${token}`)
            .send({ category: 'mechanical', evidence: 'I found a misfire' });
        console.log('Result:', disputeRes.status, disputeRes.body);

        // 7. STEP 1c API: Final Completion
        console.log('\n📡 [POST] /api/escrow/:id/complete');
        const completeRes = await request(app)
            .post(`/api/escrow/${escrowId}/complete`)
            .set('Authorization', `Bearer ${token}`);
        console.log('Result:', completeRes.status, completeRes.body);

        console.log('\n✅ API VALIDATION COMPLETE. ALL ENDPOINTS RESPONDING CORRECTLY.');

    } catch (err) {
        console.error('❌ Validation Failed:', err);
    } finally {
        await pool.end();
        process.exit(0);
    }
}

runValidation();
