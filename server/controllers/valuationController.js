const valuationService = require('../services/valuationService');

class ValuationController {
    async predict(req, res, next) {
        try {
            const { make, model, year, condition, mileage_km, trim, transmission, year_of_entry, accident_history } = req.body;

            const prediction = await valuationService.predictValue({
                make, model, year, condition, mileage_km, trim, transmission, year_of_entry, accident_history
            });

            if (req.user) {
                await valuationService.saveValuation(req.user.email, req.body, prediction);
            }

            res.status(200).json({
                success: true,
                data: prediction
            });
        } catch (err) {
            next(err);
        }
    }

    async getHistory(req, res, next) {
        try {
            const { query } = require('../config/database');
            const result = await query(
                'SELECT * FROM valuations WHERE email =  ORDER BY created_at DESC',
                [req.user.email]
            );
            res.status(200).json({
                success: true,
                data: result.rows
            });
        } catch (err) {
            next(err);
        }
    }
}

module.exports = new ValuationController();
