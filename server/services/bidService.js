const { pool } = require('../config/database');
const walletService = require('./walletService');
const socketService = require('./socketService');
const emailService = require('./emailService');

class BidService {
    async placeBid(userId, auctionId, amount) {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            // 1. Lock auction row and verify status (Join with vehicle info for notifications)
            const auctionRes = await client.query(`
                SELECT a.*, c.make, c.model 
                FROM auctions a
                JOIN vehicles v ON a.vehicle_id = v.id
                JOIN vehicle_catalog c ON v.catalog_id = c.id
                WHERE a.id = $1 FOR UPDATE
            `, [auctionId]);
            if (!auctionRes.rows[0]) throw { status: 404, message: 'Auction not found' };
            const auction = auctionRes.rows[0];
            const vehicleName = `${auction.make} ${auction.model}`;

            if (auction.status !== 'live') throw { status: 400, message: 'Auction is not live' };

            const now = new Date();
            if (now < auction.start_time || now > auction.end_time) throw { status: 400, message: 'Auction is not active' };

            // 2. Validate bid amount
            const currentPrice = parseFloat(auction.current_price);
            const minBid = currentPrice + parseFloat(auction.bid_increment);
            if (amount < minBid) throw { status: 400, message: `Min bid is ₦${minBid.toLocaleString()}` };

            // 3. Handle Wallet Hold (10% commitment hold)
            const depositAmount = amount * 0.10;

            // Check if this user already has a pending hold for this auction
            const prevBidRes = await client.query('SELECT amount FROM bids WHERE auction_id = $1 AND user_id = $2 AND is_winning = true', [auctionId, userId]);

            // For MVP, we will hold the FULL 20% for the NEW bid. 
            // If the user already was the winner, we'll calculate the difference or just release and re-hold.
            // Actually, simpler: just execute the hold. WalletService will check balance.
            await walletService.executeTransaction(userId, {
                type: 'bid_hold',
                amount: depositAmount,
                description: `Bid deposit for Auction #${auctionId.slice(0, 8)}`
            }, client);

            // 4. If there was a previous winner, release their hold and notify them
            if (auction.winner_id && auction.winner_id !== userId) {
                const prevWinnerRes = await client.query('SELECT email FROM users WHERE id = $1', [auction.winner_id]);
                const prevWinnerEmail = prevWinnerRes.rows[0]?.email;

                const prevWinnerBid = await client.query('SELECT amount FROM bids WHERE auction_id = $1 AND user_id = $2 AND is_winning = true', [auctionId, auction.winner_id]);
                if (prevWinnerBid.rows[0]) {
                    const prevHold = parseFloat(prevWinnerBid.rows[0].amount) * (parseFloat(auction.deposit_pct) / 100);
                    await walletService.executeTransaction(auction.winner_id, {
                        type: 'bid_release',
                        amount: prevHold,
                        description: `Deposit release (Outbid) for Auction #${auctionId.slice(0, 8)}`
                    }, client);

                    // Notify previous winner
                    if (prevWinnerEmail) {
                        emailService.sendOutbidNotification({ email: prevWinnerEmail }, vehicleName, amount);
                    }
                }

                // Clear previous winning flag
                await client.query('UPDATE bids SET is_winning = false WHERE auction_id = $1 AND user_id = $2', [auctionId, auction.winner_id]);
            }

            // 5. Anti-Snipe Logic
            let newEndTime = new Date(auction.end_time);
            const timeRemaining = newEndTime.getTime() - now.getTime();
            const twoMinutes = 2 * 60 * 1000;

            let extended = false;
            if (timeRemaining < twoMinutes && auction.snipe_extensions < 3) {
                newEndTime = new Date(now.getTime() + twoMinutes);
                extended = true;
            }

            // 6. Record the bid
            const bidRes = await client.query(`
                INSERT INTO bids (auction_id, user_id, amount, is_winning)
                VALUES ($1, $2, $3, true) RETURNING *
            `, [auctionId, userId, amount]);

            // 7. Update Auction state
            await client.query(`
                UPDATE auctions 
                SET current_price = $1, 
                    winner_id = $2, 
                    bid_count = bid_count + 1,
                    end_time = $3,
                    snipe_extensions = snipe_extensions + $4,
                    updated_at = NOW()
                WHERE id = $5
            `, [amount, userId, newEndTime, extended ? 1 : 0, auctionId]);

            await client.query('COMMIT');

            // 8. Real-time broadcast
            const bidData = {
                auction_id: auctionId,
                user_id: userId,
                amount: amount,
                end_time: newEndTime,
                bid_count: auction.bid_count + 1
            };
            socketService.broadcastBid(auctionId, bidData);
            if (extended) {
                socketService.broadcastAuctionStatus(auctionId, 'extended', { end_time: newEndTime });
            }

            return bidRes.rows[0];
        } catch (err) {
            await client.query('ROLLBACK');
            throw err;
        } finally {
            client.release();
        }
    }
    async getUserBids(userId, auctionId) {
        const result = await pool.query('SELECT * FROM bids WHERE user_id = $1 AND auction_id = $2 ORDER BY created_at DESC', [userId, auctionId]);
        return result.rows.map(row => ({
            ...row,
            amount: parseFloat(row.amount)
        }));
    }
}

module.exports = new BidService();
