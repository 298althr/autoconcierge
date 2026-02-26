const express = require('express');
const router = express.Router();
const escrowService = require('../services/escrowService');
const autoResolutionService = require('../services/autoResolutionService');
const { protect } = require('../middleware/authMiddleware');

/**
 * Step 1: Initiate 10% Escrow
 */
router.post('/initiate', protect, async (req, res, next) => {
    try {
        const { auction_id, amount } = req.body;
        const result = await escrowService.initiateEscrow(auction_id, req.user.id, amount);
        res.status(201).json({ success: true, data: result });
    } catch (err) { next(err); }
});

/**
 * Step 1b: Upgrade to 70%
 */
router.post('/:id/upgrade-70', protect, async (req, res, next) => {
    try {
        const result = await escrowService.upgradeTo70Percent(req.params.id);
        res.status(200).json({ success: true, data: result });
    } catch (err) { next(err); }
});

/**
 * Step 3: Dispute & Auto-Resolution
 */
router.post('/:id/dispute', protect, async (req, res, next) => {
    try {
        const { category, evidence } = req.body;
        const result = await autoResolutionService.evaluateDispute(req.params.id, category, evidence);
        res.status(200).json({ success: true, data: result });
    } catch (err) { next(err); }
});

/**
 * Step 1c: Final Completion (100% Release)
 */
router.post('/:id/complete', protect, async (req, res, next) => {
    try {
        const result = await escrowService.completeTransaction(req.params.id);
        res.status(200).json({ success: true, data: result });
    } catch (err) { next(err); }
});

module.exports = router;
