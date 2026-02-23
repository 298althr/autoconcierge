const express = require('express');
const router = express.Router();
const auctionController = require('../controllers/auctionController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/', auctionController.getAuctions);
router.get('/:id', auctionController.getAuctionById);

router.post('/', protect, authorize('admin'), auctionController.createAuction);
router.post('/:id/bid', protect, auctionController.placeBid);

module.exports = router;
