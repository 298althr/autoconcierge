const { pool } = require('../config/database');
const walletService = require('./walletService');

class EscrowService {
    /**
     * Step 1: Initialize Escrow (10% commitment)
     * Supports participation in an external transaction
     */
    async initiateEscrow(auctionId, buyerId, amount, externalClient = null) {
        console.log(`[EscrowService] Starting initiateEscrow for Auction ${auctionId}`);
        const client = externalClient || await pool.connect();
        const isInternal = !externalClient;

        try {
            if (isInternal) {
                await client.query('BEGIN');
            }

            // Get Auction and Seller
            const auctionRes = await client.query('SELECT created_by FROM auctions WHERE id = $1', [auctionId]);
            const auction = auctionRes.rows[0];
            if (!auction) throw { status: 404, message: 'Auction not found' };

            // 1. Create Escrow Record
            const escrowRes = await client.query(`
                INSERT INTO auction_escrow (auction_id, buyer_id, seller_id, total_deal_amount, held_amount, stage, status)
                VALUES ($1, $2, $3, $4, 0, 'waiting_seller_acceptance', 'active') RETURNING *
            `, [auctionId, buyerId, auction.created_by, amount]);
            const escrow = escrowRes.rows[0];

            // 2. Perform 10% Hold
            const commitmentAmount = amount * 0.10;
            await walletService.executeTransaction(buyerId, {
                type: 'escrow_hold',
                amount: commitmentAmount,
                description: `10% commitment for vehicle purchase (Auction ${auctionId.slice(0, 8)})`,
                escrow_id: escrow.id
            }, client);

            await client.query('UPDATE auction_escrow SET held_amount = $1 WHERE id = $2', [commitmentAmount, escrow.id]);

            if (isInternal) {
                await client.query('COMMIT');
            }
            return { ...escrow, held_amount: commitmentAmount };
        } catch (err) {
            if (isInternal) {
                await client.query('ROLLBACK');
            }
            throw err;
        } finally {
            if (isInternal) {
                client.release();
            }
        }
    }

    /**
     * Step 1.5: Seller Accepts the Deal
     */
    async acceptDeal(escrowId, sellerId) {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');
            const escrowRes = await client.query('SELECT * FROM auction_escrow WHERE id = $1 FOR UPDATE', [escrowId]);
            const escrow = escrowRes.rows[0];
            if (!escrow) throw { status: 404, message: 'Escrow not found' };
            if (escrow.seller_id !== sellerId) throw { status: 403, message: 'Only the vehicle owner/seller can accept the deal' };

            await client.query(`
                UPDATE auction_escrow 
                SET stage = 'commitment_10', updated_at = NOW() 
                WHERE id = $1
            `, [escrowId]);

            await client.query('COMMIT');
            return { success: true, message: 'Deal accepted by seller. Buyer notified for remaining payment.' };
        } catch (err) {
            await client.query('ROLLBACK');
            throw err;
        } finally {
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

            const remaining30 = totalDeal - currentHeld;
            if (remaining30 > 0) {
                await walletService.executeTransaction(escrow.buyer_id, {
                    type: 'escrow_hold',
                    amount: remaining30,
                    description: `Final 30% payment for vehicle purchase`,
                    escrow_id: escrowId
                }, client);
            }

            const commissionRate = 0.05;
            const commission = totalDeal * commissionRate;
            const sellerPayout = totalDeal - commission;

            await walletService.executeTransaction(escrow.buyer_id, {
                type: 'escrow_release',
                amount: totalDeal,
                description: `Purchase completed. Releasing funds for payout.`,
                escrow_id: escrowId
            }, client);

            await walletService.executeTransaction(escrow.seller_id, {
                type: 'funding',
                amount: sellerPayout,
                description: `Payout for Auction sold. Sale total: ₦${totalDeal.toLocaleString()}`,
                escrow_id: escrowId
            }, client);

            await client.query(`
                UPDATE auction_escrow 
                SET stage = 'completed', status = 'released', 
                    held_amount = 0, seller_payout_amount = $1, 
                    commission_amount = $2, updated_at = NOW() 
                WHERE id = $3
            `, [sellerPayout, commission, escrowId]);

            await client.query("UPDATE auctions SET status = 'settled', settled_at = NOW() WHERE id = $1", [escrow.auction_id]);

            // === AUTOMATED OWNERSHIP TRANSFER ===
            const auctionRes = await client.query('SELECT vehicle_id FROM auctions WHERE id = $1', [escrow.auction_id]);
            const vehicleId = auctionRes.rows[0]?.vehicle_id;

            if (vehicleId) {
                // 1. Log the transfer
                await client.query(`
                    INSERT INTO vehicle_ownership_transfers (
                        vehicle_id, previous_owner_id, new_owner_id, 
                        auction_id, escrow_id, sale_price, transfer_type
                    ) VALUES ($1, $2, $3, $4, $5, $6, 'sale')
                `, [vehicleId, escrow.seller_id, escrow.buyer_id, escrow.auction_id, escrowId, totalDeal]);

                // 2. Update vehicle record (Move to buyer's garage)
                await client.query(`
                    UPDATE vehicles 
                    SET owner_id = $1, status = 'available', updated_at = NOW() 
                    WHERE id = $2
                `, [escrow.buyer_id, vehicleId]);
            }

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
