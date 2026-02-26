const { pool } = require('../config/database');
const walletService = require('./walletService');
const socketService = require('./socketService');
const emailService = require('./emailService');

class BidService {
    async placeBid(userId, auctionId, amount) {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

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

            const currentPrice = parseFloat(auction.current_price);
            const minBid = currentPrice + parseFloat(auction.bid_increment);
            if (amount < minBid) throw { status: 400, message: `Min bid is ₦${minBid.toLocaleString()}` };

            const depositAmount = amount * 0.10; // 10% commitment hold
            await walletService.executeTransaction(userId, {
                type: 'bid_hold',
                amount: depositAmount,
                description: `Bid deposit for Auction #${auctionId.slice(0, 8)}`
            }, client);

            if (auction.winner_id && auction.winner_id !== userId) {
                const prevWinnerBid = await client.query('SELECT amount FROM bids WHERE auction_id = $1 AND user_id = $2 AND is_winning = true', [auctionId, auction.winner_id]);
                if (prevWinnerBid.rows[0]) {
                    const prevHold = parseFloat(prevWinnerBid.rows[0].amount) * 0.10;
                    await walletService.executeTransaction(auction.winner_id, {
                        type: 'bid_release',
                        amount: prevHold,
                        description: `Deposit release (Outbid) for Auction #${auctionId.slice(0, 8)}`
                    }, client);
                }
                await client.query('UPDATE bids SET is_winning = false WHERE auction_id = $1 AND user_id = $2', [auctionId, auction.winner_id]);
            }

            let newEndTime = new Date(auction.end_time);
            const timeRemaining = newEndTime.getTime() - now.getTime();
            const twoMinutes = 2 * 60 * 1000;
            let extended = false;
            if (timeRemaining < twoMinutes && (auction.snipe_extensions || 0) < 3) {
                newEndTime = new Date(now.getTime() + twoMinutes);
                extended = true;
            }

            const bidRes = await client.query(`
                INSERT INTO bids (auction_id, user_id, amount, is_winning)
                VALUES ($1, $2, $3, true) RETURNING *
            `, [auctionId, userId, amount]);

            await client.query(`
                UPDATE auctions 
                SET current_price = $1, 
                    winner_id = $2, 
                    bid_count = bid_count + 1,
                    end_time = $3,
                    snipe_extensions = COALESCE(snipe_extensions, 0) + $4,
                    updated_at = NOW()
                WHERE id = $5
            `, [amount, userId, newEndTime, extended ? 1 : 0, auctionId]);

            await client.query('COMMIT');
            socketService.broadcastBid(auctionId, { auction_id: auctionId, user_id: userId, amount, end_time: newEndTime });
            if (extended) socketService.broadcastAuctionStatus(auctionId, 'extended', { end_time: newEndTime });

            return bidRes.rows[0];
        } catch (err) {
            await client.query('ROLLBACK');
            throw err;
        } finally {
            client.release();
        }
    }

    async buyNow(userId, auctionId) {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            const auctionRes = await client.query(`
                SELECT a.*, c.make, c.model 
                FROM auctions a
                JOIN vehicles v ON a.vehicle_id = v.id
                JOIN vehicle_catalog c ON v.catalog_id = c.id
                WHERE a.id = $1 FOR UPDATE
            `, [auctionId]);
            if (!auctionRes.rows[0]) throw { status: 404, message: 'Auction not found' };
            const auction = auctionRes.rows[0];

            if (auction.status !== 'live') throw { status: 400, message: 'Auction is not live' };
            if (!auction.buy_now_price) throw { status: 400, message: 'Buy Now not available' };

            const amount = parseFloat(auction.buy_now_price);
            const depositAmount = amount * 0.10;
            await walletService.executeTransaction(userId, {
                type: 'bid_hold',
                amount: depositAmount,
                description: `Buy Now commitment for Auction #${auctionId.slice(0, 8)}`
            }, client);

            if (auction.winner_id && auction.winner_id !== userId) {
                const prevWinnerBid = await client.query('SELECT amount FROM bids WHERE auction_id = $1 AND user_id = $2 AND is_winning = true', [auctionId, auction.winner_id]);
                if (prevWinnerBid.rows[0]) {
                    const prevHold = parseFloat(prevWinnerBid.rows[0].amount) * 0.10;
                    await walletService.executeTransaction(auction.winner_id, {
                        type: 'bid_release',
                        amount: prevHold,
                        description: `Deposit release (Buy Now win) for Auction #${auctionId.slice(0, 8)}`
                    }, client);
                }
                await client.query('UPDATE bids SET is_winning = false WHERE auction_id = $1 AND user_id = $2', [auctionId, auction.winner_id]);
            }

            await client.query('INSERT INTO bids (auction_id, user_id, amount, is_winning) VALUES ($1, $2, $3, true)', [auctionId, userId, amount]);
            await client.query("UPDATE auctions SET current_price = $1, winner_id = $2, status = 'ended', updated_at = NOW() WHERE id = $3", [amount, userId, auctionId]);

            const escrowService = require('./escrowService');
            await escrowService.initiateEscrow(auctionId, userId, amount, client);

            await client.query('COMMIT');
            socketService.broadcastBid(auctionId, { auction_id: auctionId, user_id: userId, amount, status: 'ended' });
            socketService.broadcastAuctionStatus(auctionId, 'ended', { winner_id: userId });

            return { success: true, amount };
        } catch (err) {
            await client.query('ROLLBACK');
            throw err;
        } finally {
            client.release();
        }
    }

    async getUserBids(userId, auctionId) {
        const result = await pool.query('SELECT * FROM bids WHERE user_id = $1 AND auction_id = $2 ORDER BY created_at DESC', [userId, auctionId]);
        return result.rows.map(row => ({ ...row, amount: parseFloat(row.amount) }));
    }
}

module.exports = new BidService();
