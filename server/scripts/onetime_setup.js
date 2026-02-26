const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const connectionString = "postgresql://postgres:pSqGlclZvUKMLiQXQeiccKYhanHzeRys@yamanote.proxy.rlwy.net:18967/railway";
const pool = new Pool({ connectionString });

async function runMaintenance() {
    // List of target models for the seed
    const targetModels = [
        { make: 'Toyota', models: ['Camry', 'Corolla', 'RAV4', 'Hilux', 'Highlander', 'Sienna'] },
        { make: 'Honda', models: ['Accord', 'Civic'] },
        { make: 'Lexus', models: ['IS', 'RX', 'ES', 'GX'] },
        { make: 'Mercedes-Benz', models: ['C-Class', 'GLE', 'GLK', 'ML'] },
        { make: 'Hyundai', models: ['Sonata', 'Elantra'] }
    ];

    console.log('--- Reseeding with 20 Targeted Market-Relevant Auctions ---');
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        // 1. Identify Super Admin
        const saRes = await client.query("SELECT id FROM users WHERE email ILIKE '%298althr%' LIMIT 1");
        if (saRes.rows.length === 0) throw new Error("Super Admin 298althr not found.");
        const saId = saRes.rows[0].id;

        // 2. Clear Existing Demo Data
        console.log('  -> Clearing previous demo data...');
        await client.query('DELETE FROM auctions WHERE created_by = $1', [saId]);
        await client.query('DELETE FROM vehicles WHERE listed_by = $1', [saId]);

        // 3. Find Targeted Vehicles
        console.log('  -> Extracting targeted models with unique photos from automobiles table...');

        let allUniqueRows = [];
        let usedPhotos = new Set();

        for (const brand of targetModels) {
            for (const modelName of brand.models) {
                const res = await client.query(`
                    SELECT a.id, a.name, a.photos, b.name as brand_name, e.specs
                    FROM automobiles a
                    JOIN brands b ON a.brand_id = b.id
                    LEFT JOIN engines e ON a.id = e.automobile_id
                    WHERE b.name ILIKE $1 
                      AND a.name ILIKE $2
                      AND a.photos IS NOT NULL 
                      AND a.photos != '[]' 
                      AND a.photos != ''
                    ORDER BY a.photos, a.id
                `, [brand.make, `%${modelName}%`]);

                for (const row of res.rows) {
                    if (allUniqueRows.length >= 20) break;
                    if (!usedPhotos.has(row.photos)) {
                        allUniqueRows.push(row);
                        usedPhotos.add(row.photos);
                        break; // Grab one unique instance per model if possible
                    }
                }
                if (allUniqueRows.length >= 20) break;
            }
            if (allUniqueRows.length >= 20) break;
        }

        // Fallback: If we don't have enough, grab some generic ones
        if (allUniqueRows.length < 20) {
            const fallback = await client.query(`
                SELECT DISTINCT ON (a.photos) a.id, a.name, a.photos, b.name as brand_name, e.specs
                FROM automobiles a
                JOIN brands b ON a.brand_id = b.id
                LEFT JOIN engines e ON a.id = e.automobile_id
                WHERE a.photos IS NOT NULL AND a.photos != '[]' AND a.photos != ''
                ORDER BY a.photos, a.id
                LIMIT $1
            `, [20 - allUniqueRows.length]);
            allUniqueRows.push(...fallback.rows);
        }

        // 2b. Create Dummy Sellers
        console.log('  -> Creating dummy sellers...');
        const sellers = [];
        const sellerEmails = ['premium_imports@dealer.com', 'lagos_luxury@dealer.com', 'auto_concierge_ng@dealer.com', 'heritage_motors@dealer.com', 'sigma_auto@dealer.com'];
        for (const email of sellerEmails) {
            let sRes = await client.query("SELECT id FROM users WHERE email = $1", [email]);
            if (sRes.rows.length === 0) {
                const dummyHash = '$2a$10$Xm8O.DovBntP.qD.Yv.mO.Yv.mO.Yv.mO.Yv.mO.Yv.mO.Yv.m'; // Dummy hash
                sRes = await client.query("INSERT INTO users (email, display_name, role, kyc_status, password_hash) VALUES ($1, $2, 'user', 'verified', $3) RETURNING id", [email, email.split('@')[0].toUpperCase(), dummyHash]);
            }
            sellers.push(sRes.rows[0].id);
        }

        const now = new Date();
        const end = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

        for (let i = 0; i < allUniqueRows.length; i++) {
            const row = allUniqueRows[i];
            const make = row.brand_name;
            const model = row.name;
            const ownerId = sellers[i % sellers.length];

            // Get/Create Catalog
            let catRes = await client.query("SELECT id FROM vehicle_catalog WHERE make ILIKE $1 AND model ILIKE $2 LIMIT 1", [make, `%${model}%`]);
            let catId;
            if (catRes.rows.length > 0) {
                catId = catRes.rows[0].id;
            } else {
                const insertCat = await client.query(`
                    INSERT INTO vehicle_catalog (make, model, year_start, year_end, body_type, transmission, fuel_type)
                    VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id
                `, [make, model, 2018, 2024, 'Sedan/SUV', 'Automatic', 'Gasoline/Petrol']);
                catId = insertCat.rows[0].id;
            }

            // Photo Parsing
            let images = [];
            try {
                images = JSON.parse(row.photos);
                if (!Array.isArray(images)) images = [images];
            } catch (e) {
                images = row.photos.split(',').map(u => u.trim().replace(/^"|"$/g, '').replace(/\\/g, ''));
            }
            images = images.filter(img => img.startsWith('http')).slice(0, 10);
            if (images.length === 0) images = ['https://images.unsplash.com/photo-1542362567-b055002b91f4?w=800'];

            // Spec Flattening
            let specs = {};
            if (row.specs) {
                const s = (typeof row.specs === 'string') ? JSON.parse(row.specs) : row.specs;
                const flattened = {};
                if (s["Engine Specs"]) Object.assign(flattened, s["Engine Specs"]);
                if (s["Transmission Specs"]) Object.assign(flattened, s["Transmission Specs"]);
                if (s["General Specs"]) Object.assign(flattened, s["General Specs"]);

                const keys = ["Cylinders:", "Displacement:", "Horsepower:", "Torque:", "Gearbox:", "Drive Type:"];
                for (const k of keys) { if (flattened[k]) specs[k.replace(':', '')] = flattened[k]; }
            }
            if (Object.keys(specs).length === 0) specs = { "Engine": "V6", "Transmission": "Auto", "Drivetrain": "FWD" };
            await client.query("UPDATE vehicle_catalog SET specs = $1 WHERE id = $2", [JSON.stringify(specs), catId]);

            const price = (Math.floor(Math.random() * 30) + 12) * 1000000;
            const vin = Math.random().toString(36).substring(2, 17).toUpperCase();

            // Insert Vehicle
            const veh = await client.query(
                `INSERT INTO vehicles (catalog_id, listed_by, owner_id, vin, year, make, model, condition, mileage_km, price, status, location, images) 
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) RETURNING id`,
                [catId, saId, ownerId, vin, 2019 + (i % 5), make, model, 'foreign_used', 25000 + (i * 1500), price, 'in_auction', 'Lagos Hub', JSON.stringify(images)]
            );

            // Insert Auction
            await client.query(
                `INSERT INTO auctions (vehicle_id, created_by, start_price, reserve_price, current_price, status, start_time, end_time, bid_count) 
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
                [veh.rows[0].id, ownerId, price, price * 0.9, price, 'live', now, end, Math.floor(Math.random() * 8)]
            );
        }

        await client.query('COMMIT');
        console.log(`✅ Successfully reseeded with 20 targeted, high-demand auctions.`);
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('❌ Error:', err);
    } finally {
        client.release();
        await pool.end();
    }
}
runMaintenance();
