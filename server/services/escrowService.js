const { pool } = require('../config/database');
const walletService = require('./walletService');

class EscrowService {
    /**
     * Step 1: Initialize Escrow (10% commitment)
     */
    async initiateEscrow(auctionId, buyerId, amount) {
        console.log(`[EscrowService] Starting initiateEscrow for Auction ${auctionId}`);
        const client = await pool.connect();
        try {
            console.log(`[EscrowService] Client connected, starting transaction`);
            await client.query('BEGIN');

            // Get Auction and Seller
            console.log(`[EscrowService] Fetching auction details`);
            const auctionRes = await client.query('SELECT created_by FROM auctions WHERE id = $1', [auctionId]);
            const auction = auctionRes.rows[0];
            if (!auction) throw { status: 404, message: 'Auction not found' };

            // 1. Create Escrow Record
            console.log(`[EscrowService] Creating escrow record`);
            const escrowRes = await client.query(`
                INSERT INTO auction_escrow (auction_id, buyer_id, seller_id, total_deal_amount, held_amount, stage, status)
                VALUES ($1, $2, $3, $4, 0, 'commitment_10', 'active') RETURNING *
            `, [auctionId, buyerId, auction.created_by, amount]);
            const escrow = escrowRes.rows[0];

            // 2. Perform 10% Hold
            const commitmentAmount = amount * 0.10;
            console.log(`[EscrowService] Calling walletService.executeTransaction (10% hold: ${commitmentAmount})`);
            await walletService.executeTransaction(buyerId, {
                type: 'escrow_hold',
                amount: commitmentAmount,
                description: `10% commitment for vehicle purchase (Auction ${auctionId.slice(0, 8)})`,
                escrow_id: escrow.id
            }, client);

            console.log(`[EscrowService] Updating escrow held_amount`);
            await client.query('UPDATE auction_escrow SET held_amount = $1 WHERE id = $2', [commitmentAmount, escrow.id]);

            console.log(`[EscrowService] Committing transaction`);
            await client.query('COMMIT');
            console.log(`[EscrowService] Transaction committed successfully`);
            return { ...escrow, held_amount: commitmentAmount };
        } catch (err) {
            console.log(`[EscrowService] Error occurred: ${err.message}`);
            await client.query('ROLLBACK');
            throw err;
        } finally {
            console.log(`[EscrowService] Releasing client`);
            client.release();
        }
    }

    /**
     * Step 1b: Upgrade to 70% (Buy Now or Post-Auction Win)
     */
    async upgradeTo70Percent(escrowId) {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');
            const escrowRes = await client.query('SELECT * FROM auction_escrow WHERE id = $1 FOR UPDATE', [escrowId]);
            const escrow = escrowRes.rows[0];
            if (!escrow) throw { status: 404, message: 'Escrow not found' };

            // Calculate additional 60% (since 10% is already held)
            const totalDeal = parseFloat(escrow.total_deal_amount);
            const currentHeld = parseFloat(escrow.held_amount);
            const target70 = totalDeal * 0.70;
            const additional60 = target70 - currentHeld;

            if (additional60 > 0) {
                await walletService.executeTransaction(escrow.buyer_id, {
                    type: 'escrow_hold',
                    amount: additional60,
                    description: `Upgrade to 70% escrow for vehicle purchase (Escrow ${escrowId.slice(0, 8)})`,
                    escrow_id: escrowId
                }, client);
            }

            await client.query(`
                UPDATE auction_escrow 
                SET held_amount = $1, stage = 'escrow_70', updated_at = NOW() 
                WHERE id = $2
            `, [target70, escrowId]);

            // Update Auction Status to Sold Pending Validation (Wait for Step 3 Auto-Resolution)
            await client.query("UPDATE auctions SET status = 'sold_pending_validation' WHERE id = $1", [escrow.auction_id]);

            await client.query('COMMIT');
            return { success: true, new_held_amount: target70 };
        } catch (err) {
            await client.query('ROLLBACK');
            throw err;
        } finally {
            client.release();
        }
    }

    /**
     * Step 1c: Release to Seller (Final 30% payment + Escrow Release)
     */
    async completeTransaction(escrowId) {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');
            const escrowRes = await client.query('SELECT * FROM auction_escrow WHERE id = $1 FOR UPDATE', [escrowId]);
            const escrow = escrowRes.rows[0];
            if (!escrow) throw { status: 404, message: 'Escrow not found' };

            const totalDeal = parseFloat(escrow.total_deal_amount);
            const currentHeld = parseFloat(escrow.held_amount);

            // 1. Take remaining 30% from buyer if not already held (usually final step involves charging buyer)
            const remaining30 = totalDeal - currentHeld;
            if (remaining30 > 0) {
                await walletService.executeTransaction(escrow.buyer_id, {
                    type: 'escrow_hold', // Hold it first
                    amount: remaining30,
                    description: `Final 30% payment for vehicle purchase`,
                    escrow_id: escrowId
                }, client);
            }

            // 2. Release total amount to Seller (minus commission)
            const commissionRate = 0.05; // 5% example
            const commission = totalDeal * commissionRate;
            const sellerPayout = totalDeal - commission;

            // Release from Buyer's held funds (in logic, we just move it to seller balance)
            // First release from held to buyer's balance (logical step in walletService)
            await walletService.executeTransaction(escrow.buyer_id, {
                type: 'escrow_release',
                amount: totalDeal,
                description: `Purchase completed. Releasing funds for payout.`,
                escrow_id: escrowId
            }, client);

            // Move to seller balance
            await walletService.executeTransaction(escrow.seller_id, {
                type: 'funding',
                amount: sellerPayout,
                description: `Payout for Auction sold. Sale total: ₦${totalDeal.toLocaleString()}`,
                escrow_id: escrowId
            }, client);

            // Log commission (we can add a system user for this later)

            await client.query(`
                UPDATE auction_escrow 
                SET stage = 'completed', status = 'released', 
                    held_amount = 0, seller_payout_amount = $1, 
                    commission_amount = $2, updated_at = NOW() 
                WHERE id = $3
            `, [sellerPayout, commission, escrowId]);

            await client.query("UPDATE auctions SET status = 'settled', settled_at = NOW() WHERE id = $1", [escrow.auction_id]);

            await client.query('COMMIT');
            return { success: true, payout: sellerPayout };
        } catch (err) {
            await client.query('ROLLBACK');
            throw err;
        } finally {
            client.release();
        }
    }
}

module.exports = new EscrowService();
