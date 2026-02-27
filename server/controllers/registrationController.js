const registrationService = require('../services/registrationService');

class RegistrationController {
    async initiate(req, res) {
        try {
            const vehicle = await registrationService.initiateRegistration(req.user.id, req.body);
            res.status(201).json({
                success: true,
                data: vehicle
            });
        } catch (err) {
            res.status(err.status || 500).json({ message: err.message });
        }
    }

    async uploadDocs(req, res) {
        try {
            const { vehicleId } = req.params;
            const { documents } = req.body; // Array of { type, url }
            const result = await registrationService.uploadDocuments(vehicleId, documents);
            res.json({
                success: true,
                data: result
            });
        } catch (err) {
            res.status(err.status || 500).json({ message: err.message });
        }
    }

    async submit(req, res) {
        try {
            const { vehicleId } = req.params;
            const result = await registrationService.submitForVerification(req.user.id, vehicleId);
            res.json(result);
        } catch (err) {
            res.status(err.status || 500).json({ message: err.message });
        }
    }

    async getStatus(req, res) {
        try {
            const { vehicleId } = req.params;
            const status = await registrationService.getRegistrationStatus(vehicleId);
            res.json({
                success: true,
                data: status
            });
        } catch (err) {
            res.status(err.status || 500).json({ message: err.message });
        }
    }
}

module.exports = new RegistrationController();
