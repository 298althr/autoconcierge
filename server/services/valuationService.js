const axios = require('axios');
const env = require('../config/env');
const { query } = require('../config/database');

class ValuationService {
    async predictValue({ make, model, year, condition, mileage_km, trim, transmission, year_of_entry, accident_history }) {
        const marketResult = await query(
            'SELECT market_type, estimated_value_ngn FROM market_valuations WHERE make ILIKE $1 AND model ILIKE $2 AND year = $3',
            [make, model, year]
        );

        let baselineText = "No direct exact match found in our scraped database. Extrapolate from general knowledge.";
        let baselineValue = 5000000;

        if (marketResult.rows.length > 0) {
            baselineText = marketResult.rows.map(r => `${r.market_type}: ₦${r.estimated_value_ngn.toLocaleString()}`).join(', ');
            baselineValue = parseInt(marketResult.rows[0].estimated_value_ngn, 10);
        }

        if (env.GROQ_API_KEY) {
            try {
                const prompt = `
          You are a professional automotive appraiser specializing in the NIGERIAN car market.
           Estimate the NIGERIAN MARKET VALUE (in Naira) for the following vehicle:
          - Year: ${year}
          - Make: ${make}
          - Model: ${model}
          - Trim: ${trim || 'Standard'}
          - Transmission: ${transmission || 'Automatic'}
          - Condition: ${condition} (Excellent/Good/Fair/Poor)
          - Mileage: ${mileage_km.toLocaleString()} km
          - Year of Entry to Nigeria: ${year_of_entry || 'Not specified'}
          - Accident History: ${accident_history ? 'YES' : 'No'}
          
          MANDATORY REAL MARKET DATA BASELINE (from recent Nigerian listings for this exact Year/Make/Model):
          ${baselineText}

          Instructions:
          1. Use the REAL MARKET DATA BASELINE above as your strict anchor if it exists. Re-evaluate purely based on Condition, Mileage, Trim, and Accident History.
          2. E.g. If the car is 'Foreign Used' and the baseline says 'foreign_used: 15,000,000', start around 15m. Deduct heavily if it has accident history or poor condition. Deduct moderately for high mileage. Add value for rare Trims.
          3. Respond ONLY with a valid JSON object. Do NOT include markdown blocks.

          Expected JSON Format:
          {
            "estimated_value": number,
            "confidence": number,
            "reasoning": "string"
          }
        `;

                const response = await axios.post('https://api.groq.com/openai/v1/chat/completions', {
                    model: 'llama-3.3-70b-versatile',
                    messages: [
                        { role: 'system', content: 'You are an elite Nigerian car pricing engine. Always output raw JSON.' },
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

        // Fallback Algorithm
        const age = new Date().getFullYear() - year;
        let multiplier = 1.0;
        if (accident_history) multiplier -= 0.3;
        if (trim && typeof trim === 'string' && trim.toLowerCase().includes('x')) multiplier += 0.15;

        const estimated_value = Math.round(baselineValue * Math.max(0.4, multiplier));

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
