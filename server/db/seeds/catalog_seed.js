const { pool } = require('../../config/database');

const vehicles = [
    {
        make: 'Toyota',
        model: 'Corolla',
        year_start: 2010,
        year_end: 2013,
        trim: 'LE',
        body_type: 'Sedan',
        engine_code: '2ZR-FE',
        displacement_cc: 1800,
        horsepower: 132,
        transmission: 'Automatic',
        fuel_type: 'Petrol',
        price_foreign_used: 4500000,
        price_nigerian_used: 2800000,
        clearing_cost_est: 1200000,
        resell_rank: 10,
        popularity_index: 95
    },
    {
        make: 'Toyota',
        model: 'Camry',
        year_start: 2007,
        year_end: 2011,
        trim: 'XLE',
        body_type: 'Sedan',
        engine_code: '2AR-FE',
        displacement_cc: 2500,
        horsepower: 169,
        transmission: 'Automatic',
        fuel_type: 'Petrol',
        price_foreign_used: 5500000,
        price_nigerian_used: 3500000,
        clearing_cost_est: 1500000,
        resell_rank: 9,
        popularity_index: 90
    },
    {
        make: 'Lexus',
        model: 'ES350',
        year_start: 2007,
        year_end: 2012,
        trim: 'Base',
        body_type: 'Sedan',
        engine_code: '2GR-FE',
        displacement_cc: 3500,
        horsepower: 272,
        transmission: 'Automatic',
        fuel_type: 'Petrol',
        price_foreign_used: 7500000,
        price_nigerian_used: 4500000,
        clearing_cost_est: 2200000,
        resell_rank: 9,
        popularity_index: 85
    },
    {
        make: 'Honda',
        model: 'Accord',
        year_start: 2013,
        year_end: 2017,
        trim: 'EX-L',
        body_type: 'Sedan',
        engine_code: 'K24W1',
        displacement_cc: 2400,
        horsepower: 185,
        transmission: 'CVT',
        fuel_type: 'Petrol',
        price_foreign_used: 8500000,
        price_nigerian_used: 5500000,
        clearing_cost_est: 2500000,
        resell_rank: 8,
        popularity_index: 80
    }
];

async function seed() {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        console.log('🌱 Seeding vehicle catalog...');

        for (const v of vehicles) {
            await client.query(`
        INSERT INTO vehicle_catalog (
          make, model, year_start, year_end, trim, body_type, 
          engine_code, displacement_cc, horsepower, transmission, 
          fuel_type, price_foreign_used, price_nigerian_used, 
          clearing_cost_est, resell_rank, popularity_index
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
        ON CONFLICT DO NOTHING
      `, [
                v.make, v.model, v.year_start, v.year_end, v.trim, v.body_type,
                v.engine_code, v.displacement_cc, v.horsepower, v.transmission,
                v.fuel_type, v.price_foreign_used, v.price_nigerian_used,
                v.clearing_cost_est, v.resell_rank, v.popularity_index
            ]);
        }

        await client.query('COMMIT');
        console.log('✅ Catalog seeding completed!');
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('❌ Seeding failed:', err);
    } finally {
        client.release();
        await pool.end();
    }
}

seed();
