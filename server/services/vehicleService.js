const { query } = require('../config/database');

class VehicleService {
    async getAllVehicles({ make, model, condition, minPrice, maxPrice, status, sort = 'recommended' }) {
        let sql = `
      SELECT v.*, 
             vc.resell_rank, vc.popularity_index, 
             a.id as auction_id, a.bid_count, a.bidder_count, a.current_price as auction_current_price
      FROM vehicles v
      LEFT JOIN vehicle_catalog vc ON v.catalog_id = vc.id
      LEFT JOIN auctions a ON v.id = a.vehicle_id AND a.status = 'live'
      WHERE 1=1
    `;
        const params = [];

        if (status) {
            params.push(status);
            sql += ` AND v.status = $${params.length}`;
        }

        if (make) {
            params.push('%' + make + '%');
            sql += ` AND v.make ILIKE $${params.length}`;
        }

        if (model) {
            params.push('%' + model + '%');
            sql += ` AND v.model ILIKE $${params.length}`;
        }

        if (condition) {
            params.push(condition);
            sql += ` AND v.condition = $${params.length}`;
        }

        if (minPrice) {
            params.push(minPrice);
            sql += ` AND v.price >= $${params.length}`;
        }

        if (maxPrice) {
            params.push(maxPrice);
            sql += ` AND v.price <= $${params.length}`;
        }

        // Sorting Algorithm
        if (sort === 'popularity') {
            sql += ' ORDER BY COALESCE(a.bid_count, 0) DESC, COALESCE(vc.popularity_index, 0) DESC, v.created_at DESC';
        } else {
            // Default: 'recommended'
            sql += ' ORDER BY v.featured DESC, COALESCE(vc.resell_rank, 0) DESC, v.created_at DESC';
        }

        const result = await query(sql, params);
        return result.rows;
    }

    async getVehicleById(id) {
        const sql = `
      SELECT v.*, 
             vc.*, 
             a.id as auction_id, a.status as auction_status, a.current_price as auction_current_price
      FROM vehicles v
      LEFT JOIN vehicle_catalog vc ON v.catalog_id = vc.id
      LEFT JOIN auctions a ON v.id = a.vehicle_id AND a.status != 'cancelled'
      WHERE v.id = $1
    `;
        const result = await query(sql, [id]);
        return result.rows[0];
    }

    async createVehicle(data) {
        // Find catalog_id if not provided
        let catalogId = data.catalog_id;
        if (!catalogId) {
            const catRes = await query(
                'SELECT id FROM vehicle_catalog WHERE make ILIKE $1 AND model ILIKE $2 LIMIT 1',
                [data.make, data.model]
            );
            if (catRes.rows.length > 0) {
                catalogId = catRes.rows[0].id;
            }
        }

        const sql = `
      INSERT INTO vehicles (
        catalog_id, owner_id, vin, year, make, model, trim, 
        condition, mileage_km, color, price, status, location, images, features
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
      RETURNING *
    `;
        const params = [
            catalogId, data.owner_id, data.vin, data.year, data.make, data.model, data.trim,
            data.condition, data.mileage_km, data.color, data.price, data.status || 'available',
            data.location, JSON.stringify(data.images || []), JSON.stringify(data.features || [])
        ];

        const result = await query(sql, params);
        return result.rows[0];
    }
}

module.exports = new VehicleService();
