const { pool } = require('../config/database');

class CatalogController {
    /**
     * Get all unique brands (makes)
     */
    async getBrands(req, res, next) {
        try {
            const result = await pool.query('SELECT id, name FROM brands ORDER BY name ASC');
            res.status(200).json({
                success: true,
                data: result.rows
            });
        } catch (err) {
            next(err);
        }
    }

    /**
     * Get models for a specific brand
     */
    async getModels(req, res, next) {
        try {
            const { makeId, q } = req.query;
            let result;
            if (q) {
                result = await pool.query('SELECT id, name, brand_id FROM automobiles WHERE name ILIKE $1 ORDER BY name ASC LIMIT 20', [`%${q}%`]);
            } else if (makeId) {
                result = await pool.query('SELECT id, name FROM automobiles WHERE brand_id = $1 ORDER BY name ASC', [makeId]);
            } else {
                result = await pool.query('SELECT id, name, brand_id FROM automobiles ORDER BY name ASC');
            }
            res.status(200).json({
                success: true,
                data: result.rows
            });
        } catch (err) {
            next(err);
        }
    }

    /**
     * Get engines for a specific model (used for trim/variant selection)
     */
    async getEngines(req, res, next) {
        try {
            const { modelId } = req.query;
            let result;
            if (modelId) {
                result = await pool.query('SELECT id, name, specs FROM engines WHERE automobile_id = $1 ORDER BY name ASC', [modelId]);
            } else {
                result = await pool.query('SELECT id, name, specs FROM engines ORDER BY name ASC');
            }
            res.status(200).json({
                success: true,
                data: result.rows
            });
        } catch (err) {
            next(err);
        }
    }

    /**
     * Compare multiple vehicles
     */
    async compare(req, res, next) {
        try {
            const { ids } = req.query;
            if (!ids) {
                return res.status(400).json({ success: false, message: 'IDs are required' });
            }
            const idArray = ids.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id));
            if (idArray.length === 0) {
                return res.status(400).json({ success: false, message: 'Valid IDs are required' });
            }

            const result = await pool.query(`
                SELECT a.id, a.name as model, b.name as make, a.year_start, a.year_end, a.photos
                FROM automobiles a
                JOIN brands b ON a.brand_id = b.id
                WHERE a.id = ANY($1)
            `, [idArray]);

            const automobiles = result.rows;
            for (let auto of automobiles) {
                const engines = await pool.query('SELECT id, name, specs FROM engines WHERE automobile_id = $1', [auto.id]);
                auto.engines = engines.rows;
            }

            res.status(200).json({
                success: true,
                data: automobiles
            });
        } catch (err) {
            next(err);
        }
    }
}

module.exports = new CatalogController();
