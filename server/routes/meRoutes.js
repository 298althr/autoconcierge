const express = require('express');
const router = express.Router();
const meController = require('../controllers/meController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect); // All routes in /api/me require authentication

router.get('/garage', meController.getMyGarage);
router.get('/bids', meController.getMyBids);
router.get('/sales', meController.getMySales);
router.patch('/profile', meController.updateProfile);
router.post('/settle/:auctionId', meController.settleAuction);

module.exports = router;
