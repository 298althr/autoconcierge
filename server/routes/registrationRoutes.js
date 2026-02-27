const express = require('express');
const router = express.Router();
const registrationController = require('../controllers/registrationController');
const { protect } = require('../middleware/authMiddleware');

router.post('/initiate', protect, registrationController.initiate);
router.post('/:vehicleId/documents', protect, registrationController.uploadDocs);
router.post('/:vehicleId/submit', protect, registrationController.submit);
router.get('/:vehicleId/status', protect, registrationController.getStatus);

module.exports = router;
