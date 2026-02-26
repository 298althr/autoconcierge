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
                const terms = q.trim().split(/\s+/).filter(t => t.length > 0);
                const conditions = terms.map((_, i) => `(a.name ILIKE $${i + 1} OR b.name ILIKE $${i + 1})`).join(' AND ');
                const params = terms.map(t => `%${t}%`);

                result = await pool.query(`
                    SELECT a.id, a.name, a.brand_id, a.photos, b.name as brand_name 
                    FROM automobiles a 
                    JOIN brands b ON a.brand_id = b.id 
                    WHERE ${conditions}
                    ORDER BY b.name ASC, a.name ASC 
                    LIMIT 20
                `, params);
            } else if (makeId) {
                result = await pool.query('SELECT id, name, photos FROM automobiles WHERE brand_id = $1 ORDER BY name ASC', [makeId]);
            } else {
                result = await pool.query('SELECT id, name, brand_id, photos FROM automobiles ORDER BY name ASC');
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
            const data = result.rows.map(row => {
                let parsedSpecs = row.specs;
                if (typeof row.specs === 'string') {
                    try {
                        parsedSpecs = JSON.parse(row.specs);
                    } catch (e) {
                        parsedSpecs = {};
                    }
                }
                return { ...row, specs: parsedSpecs };
            });

            res.status(200).json({
                success: true,
                data
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
                SELECT a.id, a.name as model, b.name as make, a.year_start, a.year_end, a.photos, a.description, a.press_release
                FROM automobiles a
                JOIN brands b ON a.brand_id = b.id
                WHERE a.id = ANY($1)
            `, [idArray]);

            const automobiles = result.rows.map(row => {
                let parsedPhotos = [];
                if (row.photos) {
                    try {
                        parsedPhotos = typeof row.photos === 'string' && row.photos.startsWith('[')
                            ? JSON.parse(row.photos)
                            : row.photos.split(',');
                    } catch (e) {
                        parsedPhotos = [row.photos];
                    }
                }

                // Sanitize description and press release (strip HTML tags and decode entities)
                const sanitize = (str) => {
                    if (!str) return '';
                    return str
                        .replace(/<[^>]*>/g, '')
                        .replace(/&amp;/g, '&')
                        .replace(/&nbsp;/g, ' ')
                        .replace(/&quot;/g, '"')
                        .replace(/&apos;/g, "'")
                        .replace(/&lt;/g, '<')
                        .replace(/&gt;/g, '>')
                        .trim();
                };

                return {
                    ...row,
                    description: sanitize(row.description),
                    press_release: sanitize(row.press_release),
                    photos: Array.isArray(parsedPhotos) ? parsedPhotos : [parsedPhotos]
                };
            });

            for (let auto of automobiles) {
                const engines = await pool.query('SELECT id, name, specs FROM engines WHERE automobile_id = $1', [auto.id]);
                auto.engines = engines.rows.map(row => {
                    let parsedSpecs = row.specs;
                    if (typeof row.specs === 'string') {
                        try {
                            parsedSpecs = JSON.parse(row.specs);
                        } catch (e) {
                            console.error(`Failed to parse specs for engine ${row.id}:`, e);
                            parsedSpecs = {};
                        }
                    }
                    return { ...row, specs: parsedSpecs };
                });
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
