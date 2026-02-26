const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const connectionString = "postgresql://postgres:pSqGlclZvUKMLiQXQeiccKYhanHzeRys@yamanote.proxy.rlwy.net:18967/railway";
const pool = new Pool({ connectionString });

async function runMaintenance() {
    console.log('--- Reseeding with 20 Unique Auctions (No Duplicate Photos) ---');
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        // 1. Identify Super Admin
        const saRes = await client.query("SELECT id FROM users WHERE email ILIKE '%298althr%' LIMIT 1");
        if (saRes.rows.length === 0) throw new Error("Super Admin 298althr not found.");
        const saId = saRes.rows[0].id;

        // 2. Clear Existing Demo Data
        console.log('  -> Clearing previous demo data...');
        // Delete all auctions and vehicles created by Super Admin to reset
        await client.query('DELETE FROM auctions WHERE created_by = $1', [saId]);
        await client.query('DELETE FROM vehicles WHERE listed_by = $1', [saId]);

        // 3. Search for 20 Unique Vehicles with Distinct Photos
        console.log('  -> Querying automobiles for 20 unique cars with unique photos...');

        // This query finds vehicles with distinct photos.
        // We use split_part or similar if photos is a string, but here it seems to be stored consistently.
        const vehicleSet = await client.query(`
            SELECT DISTINCT ON (a.photos) 
                a.id, a.name, a.photos, b.name as make, e.specs
            FROM automobiles a
            JOIN brands b ON a.brand_id = b.id
            LEFT JOIN engines e ON a.id = e.automobile_id
            WHERE a.photos IS NOT NULL 
              AND a.photos != '[]' 
              AND a.photos != ''
              AND a.photos != '[""]'
            ORDER BY a.photos, a.id
            LIMIT 20
        `);

        if (vehicleSet.rows.length < 20) {
            console.warn(`Only found ${vehicleSet.rows.length} unique records. Seeding what we have.`);
        }

        const now = new Date();
        const end = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days from now

        for (let i = 0; i < vehicleSet.rows.length; i++) {
            const row = vehicleSet.rows[i];
            const make = row.make;
            const model = row.name;

            // 1. Get or Create Catalog Entry
            let catRes = await client.query("SELECT id FROM vehicle_catalog WHERE make ILIKE $1 AND model ILIKE $2 LIMIT 1", [make, `%${model}%`]);
            let catId;

            if (catRes.rows.length > 0) {
                catId = catRes.rows[0].id;
            } else {
                // Insert into catalog if missing
                const insertCat = await client.query(`
                    INSERT INTO vehicle_catalog (make, model, year_start, year_end, body_type, transmission, fuel_type)
                    VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id
                `, [make, model, 2015, 2024, 'Sedan', 'Automatic', 'Gasoline']);
                catId = insertCat.rows[0].id;
            }

            // 2. Parse Photos
            let images = [];
            try {
                const parsed = JSON.parse(row.photos);
                images = Array.isArray(parsed) ? parsed : [parsed];
            } catch (e) {
                images = row.photos.split(',').map(u => u.trim().replace(/^"|"$/g, '').replace(/\\/g, ''));
            }
            // Ensure photos are valid URLs
            images = images.filter(img => img.startsWith('http')).slice(0, 10);
            if (images.length === 0) images = ['https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=800'];

            // 3. Flatten Specs
            let specs = {};
            if (row.specs) {
                const s = (typeof row.specs === 'string') ? JSON.parse(row.specs) : row.specs;
                const flattened = {};
                if (s["Engine Specs"]) Object.assign(flattened, s["Engine Specs"]);
                if (s["Transmission Specs"]) Object.assign(flattened, s["Transmission Specs"]);
                if (s["General Specs"]) Object.assign(flattened, s["General Specs"]);

                // Keep only a few key specs for "Asset Overview"
                const keysToKeep = ["Cylinders:", "Displacement:", "Horsepower:", "Torque:", "Gearbox:", "Drive Type:", "Top Speed:"];
                for (const k of keysToKeep) {
                    if (flattened[k]) specs[k.replace(':', '')] = flattened[k];
                }
            }
            if (Object.keys(specs).length === 0) {
                specs = { "Engine": "V6 Turbo", "Transmission": "8-Speed Auto", "Drivetrain": "AWD" };
            }

            // Update Catalog with these specific specs
            await client.query("UPDATE vehicle_catalog SET specs = $1 WHERE id = $2", [JSON.stringify(specs), catId]);

            const price = (Math.floor(Math.random() * 40) + 10) * 1000000;
            const vin = Math.random().toString(36).substring(2, 17).toUpperCase();

            // 4. Insert Vehicle
            const veh = await client.query(
                `INSERT INTO vehicles (catalog_id, listed_by, vin, year, make, model, condition, mileage_km, price, status, location, images) 
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING id`,
                [catId, saId, vin, 2018 + (i % 6), make, model, 'foreign_used', 15000 + (i * 2000), price, 'in_auction', 'Lagos Hub', JSON.stringify(images)]
            );

            // 5. Insert Auction (Remove specs column insertion as it doesn't exist in auctions table)
            await client.query(
                `INSERT INTO auctions (vehicle_id, created_by, start_price, reserve_price, current_price, status, start_time, end_time, bid_count) 
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
                [veh.rows[0].id, saId, price, price * 0.9, price, 'live', now, end, Math.floor(Math.random() * 5)]
            );
        }

        await client.query('COMMIT');
        console.log(`✅ Successfully seeded ${vehicleSet.rows.length} unique auctions with different cars and distinct photos.`);
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('❌ Error:', err);
    } finally {
        client.release();
        await pool.end();
    }
}
runMaintenance();
