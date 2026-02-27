const { query } = require('../config/database');
const notificationService = require('./notificationService');

/**
 * AutoGaard Workshop Service
 * Manages the proprietary 14-step automotive service lifecycle.
 */
class WorkshopService {

    // 1. Service Definitions
    async getServices(category = null) {
        let sql = 'SELECT * FROM workshop_services WHERE is_active = true';
        const params = [];
        if (category) {
            params.push(category);
            sql += ' AND category = $1';
        }
        sql += ' ORDER BY category, title';
        const res = await query(sql, params);
        return res.rows;
    }

    // 2. Request Lifecycle (Step 1)
    async createRequest(userId, vehicleId, serviceId, metadata = {}) {
        const sql = `
            INSERT INTO workshop_requests (user_id, vehicle_id, service_id, metadata, status_step, status_label)
            VALUES ($1, $2, $3, $4, 1, 'Intake Initiated')
            RETURNING *
        `;
        const res = await query(sql, [userId, vehicleId, serviceId, JSON.stringify(metadata)]);
        const request = res.rows[0];

        await this.logWorkflowEvent(request.id, null, 1, userId, 'user', 'Service request initiated by owner.');
        return request;
    }

    // 3. Partner Management (Step 2 & 3)
    async getAvailablePartners(serviceId) {
        // Find partners specializing in this service category
        const svcRes = await query('SELECT category FROM workshop_services WHERE id = $1', [serviceId]);
        if (svcRes.rows.length === 0) return [];
        const category = svcRes.rows[0].category;

        const sql = `
            SELECT id, name, rating, location, specialization 
            FROM workshop_partners 
            WHERE $1 = ANY(specialization) AND is_verified = true
            ORDER BY rating DESC
        `;
        const res = await query(sql, [category]);
        return res.rows;
    }

    async assignPartner(requestId, partnerId, adminId) {
        const sql = `
            UPDATE workshop_requests 
            SET partner_id = $1, status_step = 3, status_label = 'Partner Assigned', updated_at = CURRENT_TIMESTAMP
            WHERE id = $2
            RETURNING *
        `;
        const res = await query(sql, [partnerId, requestId]);
        await this.logWorkflowEvent(requestId, 2, 3, adminId, 'admin', `Assigned to partner ${partnerId}`);
        return res.rows[0];
    }

    // 4. Quoting System (Step 4 & 5)
    async submitQuote(requestId, partnerId, amount, note) {
        const sql = `
            INSERT INTO workshop_quotes (request_id, partner_id, amount, note)
            VALUES ($1, $2, $3, $4)
            RETURNING *
        `;
        const res = await query(sql, [requestId, partnerId, amount, note]);

        await query(
            'UPDATE workshop_requests SET status_step = 4, status_label = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
            ['Quote Received', requestId]
        );

        await this.logWorkflowEvent(requestId, 3, 4, partnerId, 'partner', `Partner submitted quote of ${amount}`);

        // Notify Owner
        const ownerRes = await query('SELECT user_id FROM workshop_requests WHERE id = $1', [requestId]);
        if (ownerRes.rows[0]) {
            notificationService.createNotification(ownerRes.rows[0].user_id, {
                title: 'Service Quote Received',
                message: `A partner has submitted a quote of ₦${amount.toLocaleString()} for your service request.`,
                type: 'service_update',
                link: '/dashboard/garage/workshop/services',
                metadata: { request_id: requestId, quote_amount: amount }
            });
        }

        return res.rows[0];
    }

    async acceptQuote(requestId, quoteId, userId) {
        const quoteRes = await query('SELECT amount FROM workshop_quotes WHERE id = $1', [quoteId]);
        const amount = quoteRes.rows[0].amount;

        await query('UPDATE workshop_quotes SET is_accepted = true WHERE id = $1', [quoteId]);

        const sql = `
            UPDATE workshop_requests 
            SET status_step = 5, 
                status_label = 'Proposal Accepted', 
                total_quoted_amount = $1,
                updated_at = CURRENT_TIMESTAMP 
            WHERE id = $2
            RETURNING *
        `;
        const res = await query(sql, [amount, requestId]);

        await this.logWorkflowEvent(requestId, 4, 5, userId, 'user', 'User accepted partner proposal.');
        return res.rows[0];
    }

    // 5. Secure Status Updates (Step 6-14)
    async updateStatus(requestId, step, label, actorId, actorType, notes = null) {
        const oldStepRes = await query('SELECT status_step FROM workshop_requests WHERE id = $1', [requestId]);
        const oldStep = oldStepRes.rows[0]?.status_step;

        const sql = `
            UPDATE workshop_requests 
            SET status_step = $1, status_label = $2, updated_at = CURRENT_TIMESTAMP
            WHERE id = $3
            RETURNING *
        `;
        const res = await query(sql, [step, label, requestId]);
        const request = res.rows[0];

        // Notify Owner if partner updated it
        if (actorType === 'partner') {
            notificationService.createNotification(request.user_id, {
                title: 'Service Progress Update',
                message: `Your service request is now: ${label}`,
                type: 'service_update',
                link: '/dashboard/garage/workshop/services',
                metadata: { request_id: requestId, step, label }
            });
        }

        // Special logic for financial milestones
        if (step === 7) {
            await query('UPDATE workshop_requests SET escrow_status = $1, payment_received_at = CURRENT_TIMESTAMP WHERE id = $2', ['locked', requestId]);
        }
        if (step === 12) {
            await query('UPDATE workshop_requests SET verified_at = CURRENT_TIMESTAMP WHERE id = $1', [requestId]);
            await this.updateVehicleValue(requestId);
        }
        if (step === 13) {
            await query('UPDATE workshop_requests SET escrow_status = $1, completed_at = CURRENT_TIMESTAMP WHERE id = $2', ['released', requestId]);
        }

        await this.logWorkflowEvent(requestId, oldStep, step, actorId, actorType, notes || `Moved to ${label}`);
        return res.rows[0];
    }

    // 6. Tight Mediation Logic: Mask Sensitive Data
    maskSensitiveData(request, currentUser) {
        // If partner is viewing and hasn't reached Step 6 (Contract), mask user details
        const isPartner = currentUser.role === 'partner';
        if (isPartner && request.status_step < 6) {
            return {
                ...request,
                user_email: '*****@*****',
                user_phone: '**********',
                user_name: 'AutoGaard Member'
            };
        }
        return request;
    }

    // 7. Value Impact (The Digital Twin)
    async updateVehicleValue(requestId) {
        const reqRes = await query(`
            SELECT wr.vehicle_id, wr.total_quoted_amount, ws.impact_multiplier 
            FROM workshop_requests wr
            JOIN workshop_services ws ON wr.service_id = ws.id
            WHERE wr.id = $1
        `, [requestId]);

        if (reqRes.rows.length > 0) {
            const { vehicle_id, total_quoted_amount, impact_multiplier } = reqRes.rows[0];
            const addedValue = total_quoted_amount * impact_multiplier;

            await query(
                'UPDATE vehicles SET current_value = current_value + $1 WHERE id = $2',
                [addedValue, vehicle_id]
            );
        }
    }

    // 8. Audit & Logging
    async logWorkflowEvent(requestId, fromStep, toStep, actorId, actorType, notes) {
        const sql = `
            INSERT INTO workshop_workflow_history (request_id, from_step, to_step, actor_id, actor_type, notes)
            VALUES ($1, $2, $3, $4, $5, $6)
        `;
        await query(sql, [requestId, fromStep, toStep, actorId, actorType, notes]);
    }

    async getHistory(requestId) {
        const sql = 'SELECT * FROM workshop_workflow_history WHERE request_id = $1 ORDER BY created_at DESC';
        const res = await query(sql, [requestId]);
        return res.rows;
    }
}

module.exports = new WorkshopService();
