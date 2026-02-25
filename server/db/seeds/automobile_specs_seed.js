const fs = require('fs');
const path = require('path');
const { pool } = require('../../config/database');
const readline = require('readline');

async function seed() {
    console.log('🌱 Starting Automobile Specs Seeding...');

    const brandsFile = path.join(__dirname, 'brands.sql');
    const autosFile = path.join(__dirname, 'automobiles.sql');
    const enginesFile = path.join(__dirname, 'engines.sql');

    const client = await pool.connect();

    try {
        // 1. Seed Brands
        console.log('  🏢 Seeding brands...');
        await parseAndInsert(brandsFile, 'brands', ['id', 'url_hash', 'url', 'name', 'logo', 'deleted_at', 'created_at', 'updated_at'], client);

        // 2. Seed Automobiles
        console.log('  🚗 Seeding automobiles...');
        await parseAndInsert(autosFile, 'automobiles', ['id', 'url_hash', 'url', 'brand_id', 'name', 'description', 'press_release', 'photos', 'created_at', 'updated_at'], client);

        // 3. Seed Engines
        console.log('  ⚙️ Seeding engines...');
        await parseAndInsert(enginesFile, 'engines', ['id', 'other_id', 'automobile_id', 'name', 'specs', 'created_at', 'updated_at'], client);

        console.log('✅ Automobile Specs Seeding completed!');
    } catch (err) {
        console.error('❌ Seeding failed:', err);
    } finally {
        client.release();
        await pool.end();
    }
}

async function parseAndInsert(filePath, tableName, columns, client) {
    const fileStream = fs.createReadStream(filePath);
    const rl = readline.createInterface({
        input: fileStream,
        crlfDelay: Infinity
    });

    let isInsert = false;
    let valuesBuffer = '';

    for await (const line of rl) {
        // MariaDB dumps usually have one big INSERT INTO ... VALUES (...) statement per table or chunk.
        if (line.startsWith(`INSERT INTO \`${tableName}\` VALUES`)) {
            isInsert = true;
            valuesBuffer = line.substring(line.indexOf('VALUES') + 7);
        } else if (isInsert) {
            valuesBuffer += line;
        }

        // If we found the end of the statement
        if (isInsert && line.trim().endsWith(';')) {
            isInsert = false;
            let cleaned = valuesBuffer.trim();
            if (cleaned.endsWith(';')) cleaned = cleaned.slice(0, -1);

            // PostgreSQL uses different escaping and standard for quotes.
            // MariaDB uses \' for literal quotes; PG uses ''.
            let postgresValues = cleaned
                .replace(/\\'/g, "''")
                .replace(/\\n/g, ' ')
                .replace(/\\r/g, ' ')
                .replace(/\\"/g, '"');

            const colString = columns.map(c => `"${c}"`).join(', ');

            try {
                const query = `INSERT INTO "${tableName}" (${colString}) VALUES ${postgresValues} ON CONFLICT DO NOTHING`;
                await client.query(query);
            } catch (err) {
                // If it fails, maybe the chunk is too big or syntax is weird. Let's try splitting.
                // This regex attempts to find rows ),( but it's not perfect for all cases.
                const individualRows = postgresValues.split(/\),\(/g);
                for (let i = 0; i < individualRows.length; i++) {
                    let row = individualRows[i];
                    if (i === 0) row = row.substring(1);
                    if (i === individualRows.length - 1) row = row.substring(0, row.length - 1);

                    try {
                        await client.query(`INSERT INTO "${tableName}" (${colString}) VALUES (${row}) ON CONFLICT DO NOTHING`);
                    } catch (rowErr) {
                        // Silent fail for individual rows to allow progress
                    }
                }
            }
            valuesBuffer = '';
        }
    }
}

seed();
