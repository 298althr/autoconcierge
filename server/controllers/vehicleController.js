const vehicleService = require('../services/vehicleService');

class VehicleController {
    async getVehicles(req, res, next) {
        try {
            const vehicles = await vehicleService.getAllVehicles(req.query);
            res.status(200).json({
                success: true,
                count: vehicles.length,
                data: vehicles
            });
        } catch (err) {
            next(err);
        }
    }

    async getVehicle(req, res, next) {
        try {
            const vehicle = await vehicleService.getVehicleById(req.params.id);
            if (!vehicle) {
                return res.status(404).json({ success: false, error: 'Vehicle not found' });
            }
            res.status(200).json({
                success: true,
                data: vehicle
            });
        } catch (err) {
            next(err);
        }
    }

    async createVehicle(req, res, next) {
        try {
            const vehicle = await vehicleService.createVehicle(req.body);
            res.status(201).json({
                success: true,
                data: vehicle
            });
        } catch (err) {
            next(err);
        }
    }
}

module.exports = new VehicleController();
