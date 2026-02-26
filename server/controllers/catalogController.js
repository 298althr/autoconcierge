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
            const { makeId } = req.query;
            let result;
            if (makeId) {
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
}

module.exports = new CatalogController();
