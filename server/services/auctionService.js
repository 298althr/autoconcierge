const { pool } = require('../config/database');
const emailService = require('./emailService');

class AuctionService {
    async createAuction(userId, auctionData) {
        const {
            vehicle_id,
            start_price,
            reserve_price,
            bid_increment,
            start_time,
            end_time
        } = auctionData;

        // Verify vehicle exists and is available
        const vehicle = await pool.query('SELECT status FROM vehicles WHERE id = $1', [vehicle_id]);
        if (!vehicle.rows[0]) throw { status: 404, message: 'Vehicle not found' };
        if (vehicle.rows[0].status !== 'available') throw { status: 400, message: 'Vehicle not available for auction' };

        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            const result = await client.query(`
                INSERT INTO auctions (
                    vehicle_id, created_by, start_price, reserve_price, 
                    current_price, bid_increment, start_time, end_time, status
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
                RETURNING *
            `, [
                vehicle_id, userId, start_price, reserve_price,
                start_price, bid_increment || 50000, start_time, end_time, 'scheduled'
            ]);

            // Update vehicle status
            await client.query('UPDATE vehicles SET status = $1 WHERE id = $2', ['in_auction', vehicle_id]);

            await client.query('COMMIT');
            return result.rows[0];
        } catch (err) {
            await client.query('ROLLBACK');
            throw err;
        } finally {
            client.release();
        }
    }

    async getAuctions(filters = {}) {
        const { status, limit = 50, offset = 0 } = filters;
        let query = `
            SELECT a.*, v.year, v.images, v.mileage_km, c.make, c.model 
            FROM auctions a
            JOIN vehicles v ON a.vehicle_id = v.id
            JOIN vehicle_catalog c ON v.catalog_id = c.id
        `;
        const params = [];

        if (status) {
            params.push(status);
            query += ` WHERE a.status = $${params.length}`;
        }

        query += ` ORDER BY a.start_time DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
        params.push(limit, offset);

        const result = await pool.query(query, params);
        return result.rows.map(row => ({
            ...row,
            start_price: parseFloat(row.start_price),
            current_price: parseFloat(row.current_price),
            reserve_price: row.reserve_price ? parseFloat(row.reserve_price) : null
        }));
    }

    async getAuctionById(id) {
        const query = `
            SELECT a.*, v.year, v.images, v.mileage_km, v.condition, v.location, c.make, c.model, c.specs
            FROM auctions a
            JOIN vehicles v ON a.vehicle_id = v.id
            JOIN vehicle_catalog c ON v.catalog_id = c.id
            WHERE a.id = $1
        `;
        const result = await pool.query(query, [id]);
        if (!result.rows[0]) throw { status: 404, message: 'Auction not found' };

        const auction = result.rows[0];

        // Fetch recent bids
        const bids = await pool.query(`
            SELECT b.*, u.display_name 
            FROM bids b
            JOIN users u ON b.user_id = u.id
            WHERE b.auction_id = $1
            ORDER BY b.amount DESC, b.created_at DESC
            LIMIT 50
        `, [id]);

        return {
            ...auction,
            start_price: parseFloat(auction.start_price),
            current_price: parseFloat(auction.current_price),
            reserve_price: auction.reserve_price ? parseFloat(auction.reserve_price) : null,
            bid_increment: parseFloat(auction.bid_increment),
            bids: bids.rows.map(b => ({ ...b, amount: parseFloat(b.amount) }))
        };
    }

    /**
     * Called by a cron job to transition auction states
     */
    async processAuctionTransitions() {
        const now = new Date();

        // 1. Scheduled -> Live
        const toLive = await pool.query(`
            UPDATE auctions 
            SET status = 'live' 
            WHERE status = 'scheduled' AND start_time <= $1
            RETURNING id
        `, [now]);

        // 2. Live -> Ended
        const toEnd = await pool.query(`
            UPDATE auctions 
            SET status = 'ended' 
            WHERE status = 'live' AND end_time <= $1
            RETURNING id, vehicle_id, current_price, reserve_price, winner_id
        `, [now]);

        if (toEnd.rows.length > 0) {
            for (const auction of toEnd.rows) {
                // If reserve price not met or no winner, set to unsold
                if ((auction.reserve_price && parseFloat(auction.current_price) < parseFloat(auction.reserve_price)) || !auction.winner_id) {
                    await pool.query("UPDATE auctions SET status = 'unsold' WHERE id = $1", [auction.id]);
                } else if (auction.winner_id) {
                    // Start Escrow Process
                    try {
                        const escrowService = require('./escrowService');
                        await escrowService.initiateEscrow(auction.id, auction.winner_id, parseFloat(auction.current_price));
                        await pool.query("UPDATE auctions SET status = 'sold_pending_70' WHERE id = $1", [auction.id]);
                    } catch (err) {
                        console.error('[Escrow Init Error]:', err.message);
                    }

                    // Notify winner
                    try {
                        const winnerRes = await pool.query('SELECT email, display_name FROM users WHERE id = $1', [auction.winner_id]);
                        const vehicleRes = await pool.query(`
                            SELECT c.make, c.model 
                            FROM vehicles v 
                            JOIN vehicle_catalog c ON v.catalog_id = c.id 
                            WHERE v.id = $1
                        `, [auction.vehicle_id]);

                        if (winnerRes.rows[0] && vehicleRes.rows[0]) {
                            const user = winnerRes.rows[0];
                            const vehicleName = `${vehicleRes.rows[0].make} ${vehicleRes.rows[0].model}`;
                            emailService.sendAuctionWonNotification(user, vehicleName, parseFloat(auction.current_price));
                        }
                    } catch (err) {
                        console.error('[Auction Finish Email Error]:', err.message);
                    }
                }
            }
        }

        return {
            activated: toLive.rowCount,
            ended: toEnd.rowCount
        };
    }
}

module.exports = new AuctionService();
