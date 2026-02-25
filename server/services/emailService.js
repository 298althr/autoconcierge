const sgMail = require('@sendgrid/mail');
const env = require('../config/env');

if (env.SENDGRID_API_KEY) {
    sgMail.setApiKey(env.SENDGRID_API_KEY);
}

class EmailService {
    constructor() {
        this.from = env.SENDGRID_FROM_EMAIL;
        this.enabled = !!env.SENDGRID_API_KEY;
    }

    async send(to, subject, html, text) {
        if (!this.enabled) {
            console.log(`[Email Mock] To: ${to} | Subject: ${subject}`);
            return;
        }

        const msg = {
            to,
            from: this.from,
            subject,
            text: text || subject,
            html,
        };

        try {
            await sgMail.send(msg);
            console.log(`[Email Sent] To: ${to} | Subject: ${subject}`);
        } catch (error) {
            console.error('[Email Error] Failed to send email:', error.message);
            if (error.response) {
                console.error(error.response.body);
            }
        }
    }

    async sendWelcomeEmail(user) {
        const subject = 'Welcome to Autogaard';
        const html = `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                <h1 style="color: #800020;">Welcome to Autogaard, ${user.display_name || 'Dealer'}!</h1>
                <p>We're thrilled to have you join Nigeria's smartest car marketplace.</p>
                <p>Start exploring our latest high-end vehicle auctions and use our AI valuation tool to trade with confidence.</p>
                <div style="margin: 30px 0;">
                    <a href="${env.CLIENT_URL}/vehicles" style="background-color: #800020; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">Explore Inventory</a>
                </div>
                <p>Stay sharp,<br>The Autogaard Team</p>
            </div>
        `;
        return this.send(user.email, subject, html);
    }

    async sendOutbidNotification(user, vehicleName, newPrice) {
        const subject = `You've been outbid! - ${vehicleName}`;
        const html = `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                <h2 style="color: #800020;">Quick! You've been outbid</h2>
                <p>Someone just placed a higher bid on the <strong>${vehicleName}</strong>.</p>
                <p>Current highest bid is now: <span style="font-size: 1.2em; font-weight: bold; color: #800020;">₦${newPrice.toLocaleString()}</span></p>
                <p>Don't let your dream car slip away. Place a new bid now to stay in the running.</p>
                <div style="margin: 30px 0;">
                    <a href="${env.CLIENT_URL}/auctions" style="background-color: #800020; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">Return to Auction</a>
                </div>
                <p>Good luck!</p>
            </div>
        `;
        return this.send(user.email, subject, html);
    }

    async sendAuctionWonNotification(user, vehicleName, finalPrice) {
        const subject = `Congratulations! You won the auction for ${vehicleName}`;
        const html = `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                <h1 style="color: #10B981;">Winner!</h1>
                <p>Congratulations ${user.display_name || 'there'}, you've successfully won the auction for the <strong>${vehicleName}</strong>!</p>
                <p>Winning Bid: <span style="font-size: 1.2em; font-weight: bold; color: #10B981;">₦${finalPrice.toLocaleString()}</span></p>
                <p>Please complete your settlement within the next 48 hours to secure your new asset.</p>
                <div style="margin: 30px 0;">
                    <a href="${env.CLIENT_URL}/garage" style="background-color: #800020; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">Complete Settlement</a>
                </div>
                <p>Welcome to the elite club.<br>The Autogaard Team</p>
            </div>
        `;
        return this.send(user.email, subject, html);
    }

    async sendSettlementReminder(user, vehicleName, hoursLeft) {
        const subject = `Urgent: Settlement Deadline Approaching - ${vehicleName}`;
        const html = `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                <h2 style="color: #800020;">Action Required: Settlement Deadline</h2>
                <p>This is a friendly reminder that you have <strong>${hoursLeft} hours left</strong> to complete the settlement for your <strong>${vehicleName}</strong>.</p>
                <p>Failure to settle within the deadline may result in a penalty and the vehicle being relisted.</p>
                <div style="margin: 30px 0;">
                    <a href="${env.CLIENT_URL}/wallet" style="background-color: #800020; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">Settle Now</a>
                </div>
                <p>Need help? Reply to this email and our team will assist you.</p>
            </div>
        `;
        return this.send(user.email, subject, html);
    }

    async sendPaymentSuccessEmail(user, vehicleName, amount) {
        const subject = `Payment Successful: ${vehicleName} is yours!`;
        const html = `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                <h1 style="color: #10B981;">Deal Closed!</h1>
                <p>We've successfully processed your final payment for the <strong>${vehicleName}</strong>.</p>
                <p>Total amount paid: <span style="font-size: 1.1em; font-weight: bold;">₦${amount.toLocaleString()}</span></p>
                <p>The vehicle has been officially transferred to your garage. You can now view the full spec sheet and ownership details.</p>
                <div style="margin: 30px 0;">
                    <a href="${env.CLIENT_URL}/garage" style="background-color: #800020; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">View in Garage</a>
                </div>
                <p>Thank you for choosing Autogaard.</p>
            </div>
        `;
        return this.send(user.email, subject, html);
    }
}

module.exports = new EmailService();

