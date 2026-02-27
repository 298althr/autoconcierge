const axios = require('axios');
const env = require('../config/env');
const { query } = require('../config/database');
const notificationService = require('./notificationService');

class ConciergeService {
    /**
     * Process a new concierge request
     */
    async processRequest(userId, { type, details }) {
        let aiAnalysis = null;

        if (env.GROQ_API_KEY) {
            aiAnalysis = await this.analyzeWithAI(type, details);
        }

        const result = await query(
            `INSERT INTO concierge_requests (user_id, request_type, details, ai_analysis)
             VALUES ($1, $2, $3, $4)
             RETURNING *`,
            [userId, type, JSON.stringify(details), aiAnalysis ? JSON.stringify(aiAnalysis) : null]
        );

        const request = result.rows[0];

        // Notify Admins
        const userRes = await query('SELECT id, display_name FROM users WHERE id = $1', [userId]);
        if (userRes.rows[0]) {
            notificationService.notifyNewConciergeRequest(userRes.rows[0], request);
        }

        return request;
    }

    /**
     * Use Groq to analyze the request based on its type
     */
    async analyzeWithAI(type, details) {
        try {
            const prompt = this.getPromptForType(type, details);

            const response = await axios.post('https://api.groq.com/openai/v1/chat/completions', {
                model: 'llama-3.3-70b-versatile',
                messages: [
                    {
                        role: 'system',
                        content: 'You are an advanced Concierge AI for Autogaard, a premium Nigerian automotive platform. Your goal is to provide expert analysis, cost estimates, and logistical plans. Always respond in valid JSON format.'
                    },
                    { role: 'user', content: prompt }
                ],
                response_format: { type: 'json_object' },
                temperature: 0.2
            }, {
                headers: { 'Authorization': `Bearer ${env.GROQ_API_KEY}` }
            });

            return JSON.parse(response.data.choices[0].message.content);
        } catch (err) {
            console.error('Groq Concierge Analysis Error:', err.message);
            return { error: 'AI Analysis failed', message: err.message };
        }
    }

    /**
     * Define specialized prompts for different nodes
     */
    getPromptForType(type, details) {
        const baseInstructions = `Analyze the following concierge request and provide a JSON response with:
        1. "summary": A professional summary of the request.
        2. "complexity": (low/medium/high)
        3. "estimated_costs": (A breakdown of potential costs in NGN if applicable)
        4. "next_steps": (A list of actionable steps for the user or concierge team)
        5. "category_node": The specific processing node this belongs to.`;

        switch (type) {
            case 'sourcing':
                return `${baseInstructions}
                REQUEST TYPE: Car Sourcing
                DETAILS: ${JSON.stringify(details)}
                Specific Focus: Availability in Nigerian vs. Foreign markets, approximate clearing costs, and liquidity ranking.`;

            case 'clearing':
                return `${baseInstructions}
                REQUEST TYPE: Customs Clearing
                DETAILS: ${JSON.stringify(details)}
                Specific Focus: Nigeria Customs Service (NCS) duty estimates based on vehicle year/make/model, and expected timeline.`;

            case 'shipping':
                return `${baseInstructions}
                REQUEST TYPE: International Shipping
                DETAILS: ${JSON.stringify(details)}
                Specific Focus: RoRo vs Container shipping costs, insurance, and transit times to Lagos (Tincan/Apapa).`;

            default:
                return `${baseInstructions}
                REQUEST TYPE: General Automotive Concierge
                DETAILS: ${JSON.stringify(details)}`;
        }
    }

    async getRequests(userId, isAdmin = false) {
        let result;
        if (isAdmin) {
            result = await query('SELECT cr.*, u.display_name, u.email FROM concierge_requests cr JOIN users u ON cr.user_id = u.id ORDER BY cr.created_at DESC');
        } else {
            result = await query('SELECT * FROM concierge_requests WHERE user_id = $1 ORDER BY created_at DESC', [userId]);
        }
        return result.rows;
    }

    async updateStatus(requestId, status) {
        const result = await query(
            'UPDATE concierge_requests SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
            [status, requestId]
        );
        const request = result.rows[0];

        if (request) {
            notificationService.createNotification(request.user_id, {
                title: 'Concierge Request Update',
                message: `Your ${request.request_type} request status is now ${status}.`,
                type: 'concierge_update',
                link: '/dashboard/concierge',
                metadata: { request_id: requestId, status }
            });
        }

        return request;
    }

    // Placeholder for logWorkflowEvent - assuming it exists elsewhere or needs to be added
    async logWorkflowEvent(requestId, workflowId, eventType, actorId, actorType, description) {
        // This is a placeholder. Implement actual logging logic here.
        console.log(`Workflow Event: Request ID ${requestId}, Event Type ${eventType}, Actor ${actorType}:${actorId}, Description: ${description}`);
        // Example: await query('INSERT INTO workflow_events (...) VALUES (...)', [...]);
    }
}

module.exports = new ConciergeService();
