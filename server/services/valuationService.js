const axios = require('axios');
const env = require('../config/env');
const { query } = require('../config/database');

class ValuationService {
    async predictValue({ make, model, year, condition, mileage_km, trim, transmission, year_of_entry, accident_history }) {
        const catalogResult = await query(
            'SELECT price_foreign_used AS base_price, resell_rank FROM vehicle_catalog WHERE make ILIKE $1 AND model ILIKE $2 LIMIT 1',
            [make, model]
        );

        const baseline = catalogResult.rows[0] || { base_price: 5000000, resell_rank: 5 };

        if (env.GROQ_API_KEY) {
            try {
                const prompt = `
          You are a professional automotive appraiser specializing in the NIGERIAN car market.
           Estimate the NIGERIAN MARKET VALUE (in Naira) for:
          - Year: ${year}
          - Make: ${make}
          - Model: ${model}
          - Trim: ${trim || 'Standard'}
          - Transmission: ${transmission || 'Automatic'}
          - Condition: ${condition}
          - Mileage: ${mileage_km.toLocaleString()} km
          - Year of Entry to Nigeria: ${year_of_entry || 'Not specified'}
          - Accident History: ${accident_history ? 'YES' : 'No'}
          
          Baseline: ${baseline.base_price.toLocaleString()} NGN.
          Respond ONLY with a JSON object:
          {
            "estimated_value": number,
            "confidence": number,
            "reasoning": "string"
          }
        `;

                const response = await axios.post('https://api.groq.com/openai/v1/chat/completions', {
                    model: 'llama-3.3-70b-versatile',
                    messages: [
                        { role: 'system', content: 'You are a Nigerian car price engine.' },
                        { role: 'user', content: prompt }
                    ],
                    response_format: { type: 'json_object' },
                    temperature: 0.1
                }, {
                    headers: { 'Authorization': `Bearer ${env.GROQ_API_KEY}` }
                });

                const aiData = JSON.parse(response.data.choices[0].message.content);
                return {
                    ...aiData,
                    source: 'AI (Groq)',
                    timestamp: new Date().toISOString()
                };
            } catch (err) {
                console.error('Groq AI Error:', err.message);
            }
        }

        const age = new Date().getFullYear() - year;
        let multiplier = 1.0;
        if (accident_history) multiplier -= 0.3;
        if (trim && typeof trim === 'string' && trim.toLowerCase().includes('x')) multiplier += 0.15;

        const estimated_value = Math.round(baseline.base_price * Math.max(0.4, multiplier));

        return {
            estimated_value,
            confidence: 0.6,
            reasoning: 'Calculated via fallback algorithm. Manual verification recommended.',
            source: 'Internal Algorithm',
            timestamp: new Date().toISOString()
        };
    }

    async saveValuation(userId, vehicleData, valuationResult) {
        const result = await query(
            `INSERT INTO valuations (make, model, year, condition, mileage_km, trim, transmission, year_of_entry, accident_history, email, result)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       RETURNING *`,
            [
                vehicleData.make,
                vehicleData.model,
                vehicleData.year,
                vehicleData.condition,
                vehicleData.mileage_km,
                vehicleData.trim,
                vehicleData.transmission,
                vehicleData.year_of_entry,
                vehicleData.accident_history || false,
                userId,
                JSON.stringify(valuationResult)
            ]
        );
        return result.rows[0];
    }
}

module.exports = new ValuationService();
