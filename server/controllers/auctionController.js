const auctionService = require('../services/auctionService');
const bidService = require('../services/bidService');

class AuctionController {
    async createAuction(req, res) {
        try {
            const data = await auctionService.createAuction(req.user.id, req.body);
            res.status(201).json({ status: 'success', data });
        } catch (err) {
            res.status(err.status || 500).json({ status: 'error', message: err.message });
        }
    }

    async getAuctions(req, res) {
        try {
            const filters = {
                status: req.query.status,
                limit: parseInt(req.query.limit) || 20,
                offset: parseInt(req.query.offset) || 0
            };
            const data = await auctionService.getAuctions(filters);
            res.json({ status: 'success', data });
        } catch (err) {
            res.status(err.status || 500).json({ status: 'error', message: err.message });
        }
    }

    async getAuctionById(req, res) {
        try {
            const data = await auctionService.getAuctionById(req.params.id);
            res.json({ status: 'success', data });
        } catch (err) {
            res.status(err.status || 500).json({ status: 'error', message: err.message });
        }
    }

    async placeBid(req, res) {
        try {
            const { amount } = req.body;
            const { id: auctionId } = req.params;
            const data = await bidService.placeBid(req.user.id, auctionId, amount);
            res.json({ status: 'success', data });
        } catch (err) {
            res.status(err.status || 500).json({ status: 'error', message: err.message });
        }
    }
    async getMyBids(req, res) {
        try {
            const { id: auctionId } = req.params;
            const data = await bidService.getUserBids(req.user.id, auctionId);
            res.json({ status: 'success', data });
        } catch (err) {
            res.status(err.status || 500).json({ status: 'error', message: err.message });
        }
    }
}

module.exports = new AuctionController();
