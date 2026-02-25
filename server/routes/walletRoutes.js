const express = require('express');
const router = express.Router();
const walletController = require('../controllers/walletController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/webhook', walletController.handleWebhook);
router.use(protect);

router.get('/balance', walletController.getBalance);
router.get('/transactions', walletController.getTransactions);
router.post('/fund/initialize', walletController.initializeFunding);
router.post('/fund/verify', walletController.verifyFunding);
router.post('/fund/manual', walletController.initializeManualFunding);

router.get('/admin/transactions', authorize('admin'), walletController.getAllTransactions);
router.post('/admin/approve/:id', authorize('admin'), walletController.approveManualFunding);
router.post('/admin/decline/:id', authorize('admin'), walletController.declineManualFunding);

module.exports = router;