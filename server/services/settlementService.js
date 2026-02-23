const { pool } = require('../config/database');
const walletService = require('./walletService');
const notificationService = require('./notificationService');
const emailService = require('./emailService');

class SettlementService {
    /**
     * Finalizes an auction by charging the winner and releasing/refunding others.
     * This is called manually by user or automatically after some period if we want,
     * but usually for MVP, the winner initiates the "Payment" from their garage.
     */
    async settleAuction(auctionId, winnerId) {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            // 1. Lock auction and verify status
            const auctionRes = await client.query('SELECT * FROM auctions WHERE id = $1 FOR UPDATE', [auctionId]);
            const auction = auctionRes.rows[0];

            if (!auction) throw { status: 404, message: 'Auction not found' };
            if (auction.status !== 'ended') throw { status: 400, message: 'Auction is not in ended state' };
            if (auction.winner_id !== winnerId) throw { status: 403, message: 'You are not the winner' };

            const finalPrice = parseFloat(auction.current_price);
            const depositPct = parseFloat(auction.deposit_pct) || 20;
            const depositAmount = finalPrice * (depositPct / 100);
            const remainingBalanceNeeded = finalPrice - depositAmount;

            // 2. Lock user for wallet check
            const userRes = await client.query('SELECT wallet_balance, held_amount FROM users WHERE id = $1 FOR UPDATE', [winnerId]);
            const user = userRes.rows[0];

            if (parseFloat(user.wallet_balance) < remainingBalanceNeeded) {
                throw { status: 400, message: `Insufficient balance. You need ₦${remainingBalanceNeeded.toLocaleString()} more (Price: ₦${finalPrice.toLocaleString()}, already held: ₦${depositAmount.toLocaleString()})` };
            }

            // 3. Move funds
            // a. Final Price deduction (remaining part)
            const newBalance = parseFloat(user.wallet_balance) - remainingBalanceNeeded;
            // b. Release the held deposit and deduct it (net effect: held_amount decreases)
            const newHeld = parseFloat(user.held_amount) - depositAmount;

            await client.query('UPDATE users SET wallet_balance = $1, held_amount = $2 WHERE id = $3', [newBalance, newHeld, winnerId]);

            // 4. Record Transaction
            await client.query(`
                INSERT INTO transactions (user_id, type, amount, balance_after, status, description, reference_id, reference_type)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            `, [winnerId, 'auction_payment', finalPrice, newBalance, 'completed', `Final payment for Auction #${auctionId.slice(0, 8)}`, auctionId, 'auction']);

            // 5. Calculate & Record Commission (deducted from the Sale, or just logged for platform)
            // For MVP: We just log it as a separate transaction or record it in the auction
            const commissionRate = parseFloat(auction.commission_rate) || 0.05;
            const commissionAmt = finalPrice * commissionRate;

            // 6. Update Auction and Vehicle Status
            await client.query(`
                UPDATE auctions 
                SET status = 'settled', settled_at = NOW() 
                WHERE id = $1
            `, [auctionId]);

            await client.query(`
                UPDATE vehicles 
                SET status = 'sold', owner_id = $1, updated_at = NOW() 
                WHERE id = $2
            `, [winnerId, auction.vehicle_id]);

            await client.query('COMMIT');

            // 7. Notify User
            notificationService.notifyFundingStatusUpdate({ id: winnerId, email: user.email }, {
                id: auctionId,
                status: 'completed',
                amount: finalPrice,
                description: 'Vehicle Purchase Successful'
            });

            // Send Email in background
            try {
                const vehicleRes = await client.query(`
                    SELECT c.make, c.model 
                    FROM vehicles v 
                    JOIN vehicle_catalog c ON v.catalog_id = c.id 
                    WHERE v.id = $1
                `, [auction.vehicle_id]);
                const vehicleName = `${vehicleRes.rows[0].make} ${vehicleRes.rows[0].model}`;
                emailService.sendPaymentSuccessEmail({ email: user.email, display_name: user.display_name }, vehicleName, finalPrice);
            } catch (err) {
                console.error('[Settlement Email Error]:', err.message);
            }

            return { success: true, auction_id: auctionId, vehicle_id: auction.vehicle_id };
        } catch (err) {
            await client.query('ROLLBACK');
            throw err;
        } finally {
            client.release();
        }
    }

    /**
     * Cron task to expire unpaid auctions after 48 hours
     */
    async processSettlementTimeouts() {
        const threshold = new Date(Date.now() - (48 * 60 * 60 * 1000));

        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            // Find ended auctions with winners that haven't settled within 48h
            const expiredRes = await client.query(`
                SELECT id, winner_id, current_price, deposit_pct, vehicle_id
                FROM auctions 
                WHERE status = 'ended' AND winner_id IS NOT NULL AND end_time <= $1
            `, [threshold]);

            for (const auction of expiredRes.rows) {
                // 1. Penalize: Keep the deposit (commission for platform)
                // 2. Revert vehicle to available
                // 3. Mark auction as cancelled/failed

                await client.query("UPDATE auctions SET status = 'cancelled' WHERE id = $1", [auction.id]);
                await client.query("UPDATE vehicles SET status = 'available' WHERE id = $1", [auction.vehicle_id]);

                // Note: The deposit is already in 'held_amount'. 
                // To penalty, we decrease held_amount but DON'T add it back to wallet_balance.
                const depositPct = parseFloat(auction.deposit_pct) || 20;
                const depositAmt = parseFloat(auction.current_price) * (depositPct / 100);

                await client.query("UPDATE users SET held_amount = held_amount - $1 WHERE id = $2", [depositAmt, auction.winner_id]);

                // Record the penalty/forfeit
                await client.query(`
                    INSERT INTO transactions (user_id, type, amount, status, description, reference_id, reference_type)
                    VALUES ($1, $2, $3, $4, $5, $6, $7)
                `, [auction.winner_id, 'commission', depositAmt, 'completed', `Forfeited deposit (non-payment) for Auction #${auction.id.slice(0, 8)}`, auction.id, 'auction']);
            }

            await client.query('COMMIT');
            return expiredRes.rowCount;
        } catch (err) {
            await client.query('ROLLBACK');
            throw err;
        } finally {
            client.release();
        }
    }
}

module.exports = new SettlementService();
