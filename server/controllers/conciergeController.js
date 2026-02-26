const conciergeService = require('../services/conciergeService');

class ConciergeController {
    /**
     * Submit a new concierge request
     */
    async submitRequest(req, res, next) {
        try {
            const { type, details } = req.body;
            if (!type || !details) {
                return res.status(400).json({ success: false, message: 'Type and details are required' });
            }

            const request = await conciergeService.processRequest(req.user.id, { type, details });

            res.status(201).json({
                success: true,
                data: request
            });
        } catch (err) {
            next(err);
        }
    }

    /**
     * Get requests for current user
     */
    async getMyRequests(req, res, next) {
        try {
            const requests = await conciergeService.getRequests(req.user.id);
            res.status(200).json({
                success: true,
                data: requests
            });
        } catch (err) {
            next(err);
        }
    }

    /**
     * Admin: Get all requests
     */
    async getAllRequests(req, res, next) {
        try {
            const requests = await conciergeService.getRequests(null, true);
            res.status(200).json({
                success: true,
                data: requests
            });
        } catch (err) {
            next(err);
        }
    }

    /**
     * Admin: Update status
     */
    async updateStatus(req, res, next) {
        try {
            const { id } = req.params;
            const { status } = req.body;

            const request = await conciergeService.updateStatus(id, status);
            res.status(200).json({
                success: true,
                data: request
            });
        } catch (err) {
            next(err);
        }
    }
}

module.exports = new ConciergeController();
