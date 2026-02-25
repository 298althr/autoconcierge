const axios = require('axios');
const env = require('../config/env');
const crypto = require('crypto');

class PaymentService {
    /**
     * Initialize a Paystack transaction
     */
    async initializeTransaction({ email, amount, metadata }) {
        // Simulated mode for development without keys
        if (env.PAYSTACK_SECRET_KEY === 'sk_test_placeholder' || !env.PAYSTACK_SECRET_KEY) {
            console.log('💳 Simulating Paystack Initialization...');
            const reference = `MOCK_TX_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
            return {
                status: true,
                data: {
                    authorization_url: `${env.CLIENT_URL}/wallet?ref=${reference}&amount=${amount}`,
                    reference: reference,
                    access_code: 'MOCK_CODE',
                    is_mock: true
                }
            };
        }

        try {
            const response = await axios.post(
                'https://api.paystack.co/transaction/initialize',
                {
                    email,
                    amount: Math.round(amount * 100), // Convert to kobo/cents
                    callback_url: `${env.CLIENT_URL}/wallet/callback`,
                    metadata
                },
                {
                    headers: {
                        Authorization: `Bearer ${env.PAYSTACK_SECRET_KEY}`,
                        'Content-Type': 'application/json'
                    }
                }
            );
            return response.data;
        } catch (err) {
            console.error('❌ Paystack Initialization Error:', err.response?.data || err.message);
            throw { status: 500, message: 'Could not connect to payment gateway' };
        }
    }

    /**
     * Verify a transaction via reference
     */
    async verifyTransaction(reference) {
        if (reference.startsWith('MOCK_TX_')) {
            return {
                status: true,
                data: {
                    status: 'success',
                    reference: reference,
                    amount: 0, // In mock mode we trust the client's requested amount captured in callback
                    gateway_response: 'Successful Mock'
                }
            };
        }

        try {
            const response = await axios.get(
                `https://api.paystack.co/transaction/verify/${reference}`,
                {
                    headers: {
                        Authorization: `Bearer ${env.PAYSTACK_SECRET_KEY}`
                    }
                }
            );
            return response.data;
        } catch (err) {
            console.error('❌ Paystack Verification Error:', err.response?.data || err.message);
            return { status: false, data: { status: 'failed' } };
        }
    }

    /**
     * Verify Paystack Webhook Signature
     */
    isValidSignature(signature, body) {
        if (env.PAYSTACK_SECRET_KEY === 'sk_test_placeholder') return true;

        const hash = crypto
            .createHmac('sha512', env.PAYSTACK_SECRET_KEY)
            .update(JSON.stringify(body))
            .digest('hex');
        return hash === signature;
    }
}

module.exports = new PaymentService();
