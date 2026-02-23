const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authenticate, authorize } = require('../middleware/authMiddleware');

router.use(authenticate);
router.use(authorize('admin'));

router.get('/stats', adminController.getDashboardStats);
router.get('/users', adminController.getUsers);
router.post('/kyc/status', adminController.updateKYCStatus);
router.get('/audit-logs', adminController.getAuditLogs);

module.exports = router;
