const axios = require('axios');

class NotificationService {
    /**
     * Notify administrators about a new manual funding request
     */
    async notifyManualFundingRequest(user, transaction) {
        const payload = {
            event: 'wallet.manual_funding_initialized',
            timestamp: new Date().toISOString(),
            data: {
                transaction_id: transaction.id,
                user_id: user.id,
                user_name: user.display_name || 'Dealer User',
                user_email: user.email,
                amount: transaction.amount,
                currency: 'NGN',
                description: transaction.description
            }
        };

        console.log(`[Notification] Manual funding request from ${user.email} for ₦${transaction.amount}`);

        // Trigger N8N Webhook if configured
        if (process.env.N8N_WEBHOOK_URL) {
            try {
                await axios.post(process.env.N8N_WEBHOOK_URL, payload);
            } catch (err) {
                console.error('[Notification Error] Failed to send to N8N:', err.message);
            }
        }
    }

    /**
     * Notify user when their manual funding is approved or declined
     */
    async notifyFundingStatusUpdate(user, transaction) {
        const payload = {
            event: 'wallet.payment_status_updated',
            timestamp: new Date().toISOString(),
            data: {
                transaction_id: transaction.id,
                user_email: user.email,
                status: transaction.status,
                amount: transaction.amount,
                message: transaction.status === 'completed'
                    ? 'Your wallet has been credited.'
                    : 'Your payment was declined. Please contact support.'
            }
        };

        console.log(`[Notification] Payment ${transaction.id} for ${user.email} is now ${transaction.status}`);

        if (process.env.N8N_WEBHOOK_URL) {
            try {
                await axios.post(process.env.N8N_WEBHOOK_URL, payload);
            } catch (err) {
                console.error('[Notification Error] Failed to send to N8N:', err.message);
            }
        }
    }
}

module.exports = new NotificationService();
