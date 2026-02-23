const walletService = require('../services/walletService');
const paymentService = require('../services/paymentService');
const notificationService = require('../services/notificationService');

class WalletController {
    async getBalance(req, res) {
        try {
            const data = await walletService.getBalance(req.user.id);
            res.json({ status: 'success', data });
        } catch (err) {
            res.status(err.status || 500).json({ status: 'error', message: err.message });
        }
    }

    async getTransactions(req, res) {
        try {
            const limit = parseInt(req.query.limit) || 20;
            const offset = parseInt(req.query.offset) || 0;
            const data = await walletService.getTransactions(req.user.id, limit, offset);
            res.json({ status: 'success', data });
        } catch (err) {
            res.status(err.status || 500).json({ status: 'error', message: err.message });
        }
    }

    async initializeFunding(req, res) {
        try {
            const { amount } = req.body;
            if (!amount || amount < 1000) return res.status(400).json({ status: 'error', message: 'Min 1,000' });
            const result = await paymentService.initializeTransaction({
                email: req.user.email,
                amount: amount,
                metadata: { user_id: req.user.id, type: 'funding' }
            });
            res.json(result);
        } catch (err) {
            res.status(err.status || 500).json({ status: 'error', message: err.message });
        }
    }

    async verifyFunding(req, res) {
        try {
            const { reference, amount } = req.body;
            const verification = await paymentService.verifyTransaction(reference);
            if (verification.status && verification.data.status === 'success') {
                const finalAmt = reference.startsWith('MOCK_TX_') ? parseFloat(amount) : (verification.data.amount / 100);
                const result = await walletService.executeTransaction(req.user.id, {
                    type: 'funding',
                    amount: finalAmt,
                    paystack_ref: reference,
                    description: 'Funded via Paystack'
                });
                res.json({ status: 'success', data: result });
            } else {
                res.status(400).json({ status: 'error', message: 'Verification failed' });
            }
        } catch (err) {
            res.status(err.status || 500).json({ status: 'error', message: err.message });
        }
    }

    async handleWebhook(req, res) {
        res.status(200).send('OK');
    }

    async initializeManualFunding(req, res) {
        try {
            const { amount } = req.body;
            if (!amount || amount < 1000) return res.status(400).json({ status: 'error', message: 'Min 1,000' });
            const result = await walletService.executeTransaction(req.user.id, {
                type: 'funding',
                amount: parseFloat(amount),
                status: 'processing',
                description: 'Manual Bank Transfer'
            });

            // Notify admin
            notificationService.notifyManualFundingRequest(req.user, result);

            res.json({ status: 'success', data: result });
        } catch (err) {
            res.status(err.status || 500).json({ status: 'error', message: err.message });
        }
    }

    async approveManualFunding(req, res) {
        try {
            const result = await walletService.updateManualFunding(req.params.id, 'completed');
            res.json({ status: 'success', data: result });
        } catch (err) {
            res.status(err.status || 500).json({ status: 'error', message: err.message });
        }
    }

    async declineManualFunding(req, res) {
        try {
            const result = await walletService.updateManualFunding(req.params.id, 'failed');
            res.json({ status: 'success', data: result });
        } catch (err) {
            res.status(err.status || 500).json({ status: 'error', message: err.message });
        }
    }

    async getAllTransactions(req, res) {
        try {
            const limit = parseInt(req.query.limit) || 50;
            const offset = parseInt(req.query.offset) || 0;
            const status = req.query.status || null;
            const data = await walletService.getAllTransactions(limit, offset, status);
            res.json({ status: 'success', data });
        } catch (err) {
            res.status(err.status || 500).json({ status: 'error', message: err.message });
        }
    }
}

module.exports = new WalletController();