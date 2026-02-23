const { pool } = require('../config/database');
const walletService = require('../services/walletService');

async function createTestUser() {
    const res = await pool.query(
        `INSERT INTO users (email, password_hash, display_name, wallet_balance) 
         VALUES ('webhook@test.com', 'hash', 'Webhook Tester', 0) 
         ON CONFLICT (email) DO UPDATE SET wallet_balance = 0
         RETURNING id`
    );
    return res.rows[0].id;
}

async function runTest() {
    try {
        console.log('--- Starting Webhook Idempotency Test ---');
        const userId = await createTestUser();
        const paystackRef = `REF_${Date.now()}`;

        console.log(`[Test 8G] Simulating first webhook payload (Ref: ${paystackRef})...`);
        const firstTx = await walletService.executeTransaction(userId, {
            type: 'funding',
            amount: 50000,
            paystack_ref: paystackRef,
            description: 'Idempotency Test Funding'
        });
        console.log('First payload SUCCESS. Balance after:', firstTx.balance_after);

        console.log(`[Test 8G] Simulating duplicate webhook payload (Ref: ${paystackRef})...`);
        try {
            await walletService.executeTransaction(userId, {
                type: 'funding',
                amount: 50000,
                paystack_ref: paystackRef,
                description: 'Idempotency Test Funding Duplicate'
            });
            console.log('❌ FAIL: Duplicate payload was processed successfully!');
        } catch (err) {
            if (err.code === '23505') {
                console.log('✅ Duplicate payload ignored! Unique constraint triggered (23505).');
                console.log('✅ Webhook Idempotency handled correctly! (Test 8G Passed)');
            } else {
                console.log('⚠️ Duplicate payload failed but not due to uniqueness constraint:', err);
            }
        }

        const finalBal = await walletService.getBalance(userId);
        console.log(`\\nFinal Wallet Balance: ${finalBal.balance} (Should be 50000)`);

    } catch (err) {
        console.error('Test script failed:', err);
    } finally {
        await pool.end();
    }
}

runTest();
