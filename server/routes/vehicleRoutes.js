const express = require('express');
const router = express.Router();
const vehicleController = require('../controllers/vehicleController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', vehicleController.getVehicles);
router.get('/:id', vehicleController.getVehicle);
router.post('/', protect, vehicleController.createVehicle);
router.post('/:id/certify', protect, vehicleController.certifyVehicle);

module.exports = router;
