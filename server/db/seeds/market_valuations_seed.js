require('dotenv').config();
const { pool } = require('../../config/database');
const fs = require('fs');
const path = require('path');

async function seedMarketValuations() {
    console.log('Seeding market valuations...');
    try {
        const dataDir = path.join(__dirname, '../../data');
        const foreignDataPath = path.join(dataDir, 'market_valuations_foreign.json');
        const nigerianDataPath = path.join(dataDir, 'market_valuations_nigerian.json');

        const foreignData = JSON.parse(fs.readFileSync(foreignDataPath, 'utf8'));
        const nigerianData = JSON.parse(fs.readFileSync(nigerianDataPath, 'utf8'));

        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            // Helper to insert data
            const insertData = async (dataObj, marketType) => {
                for (const make in dataObj) {
                    for (const model in dataObj[make]) {
                        for (const yearStr in dataObj[make][model]) {
                            const year = parseInt(yearStr);
                            const estimatedValue = Math.round(dataObj[make][model][yearStr]);

                            await client.query(`
                                INSERT INTO market_valuations (make, model, year, market_type, estimated_value_ngn)
                                VALUES ($1, $2, $3, $4, $5)
                                ON CONFLICT (make, model, year, market_type) 
                                DO UPDATE SET estimated_value_ngn = $5, updated_at = CURRENT_TIMESTAMP
                            `, [make, model, year, marketType, estimatedValue]);
                        }
                    }
                }
            };

            console.log('Processing foreign used data...');
            await insertData(foreignData, 'foreign_used');

            console.log('Processing nigerian used data...');
            await insertData(nigerianData, 'nigerian_used');

            await client.query('COMMIT');
            console.log('Market valuations seeded successfully!');
        } catch (e) {
            await client.query('ROLLBACK');
            throw e;
        } finally {
            client.release();
        }
    } catch (err) {
        console.error('Error seeding market valuations:', err);
    } finally {
        process.exit(0);
    }
}

seedMarketValuations();
