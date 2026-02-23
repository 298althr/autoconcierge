const authService = require('../services/authService');

class AuthController {
    async register(req, res, next) {
        try {
            const user = await authService.register(req.body);
            res.status(201).json({
                success: true,
                data: user
            });
        } catch (err) {
            next(err);
        }
    }

    async login(req, res, next) {
        try {
            const { email, password } = req.body;
            const result = await authService.login(email, password);
            res.status(200).json({
                success: true,
                ...result
            });
        } catch (err) {
            next(err);
        }
    }

    async logout(req, res, next) {
        try {
            res.status(200).json({
                success: true,
                message: 'Logged out successfully'
            });
        } catch (err) {
            next(err);
        }
    }

    async refresh(req, res, next) {
        try {
            const { refreshToken } = req.body;
            const result = await authService.refreshToken(refreshToken);
            res.status(200).json({
                success: true,
                ...result
            });
        } catch (err) {
            next(err);
        }
    }

    async getMe(req, res, next) {
        try {
            const user = await authService.getUserById(req.user.id);
            res.status(200).json({
                success: true,
                data: user
            });
        } catch (err) {
            next(err);
        }
    }

    async submitKYC(req, res, next) {
        try {
            const { address, id_type, id_number, full_name, dob } = req.body;
            const kycData = { address, id_type, id_number, full_name, dob, submitted_at: new Date().toISOString() };

            const { query } = require('../config/database');
            await query(
                'UPDATE users SET kyc_data = $1, kyc_status = $2 WHERE id = $3',
                [JSON.stringify(kycData), 'pending', req.user.id]
            );

            res.status(200).json({
                success: true,
                message: 'KYC submitted successfully'
            });
        } catch (err) {
            next(err);
        }
    }
}

module.exports = new AuthController();
