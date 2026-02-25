const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
const readline = require('readline');

const pool = new Pool({
    connectionString: "postgresql://postgres:pSqGlclZvUKMLiQXQeiccKYhanHzeRys@yamanote.proxy.rlwy.net:18967/railway",
    ssl: false // usually railway internal is false, external might require true, but worked earlier
});

const CHUNK_SIZE = 500; // rows per insert

async function seed() {
    console.log('🚀 Starting Chunked Railway Seeding...');

    const brandsFile = path.join(__dirname, 'brands.sql');
    const autosFile = path.join(__dirname, 'automobiles.sql');
    const enginesFile = path.join(__dirname, 'engines.sql');

    const client = await pool.connect();

    try {
        console.log('  🏢 Seeding brands...');
        await parseAndInsert(brandsFile, 'brands', ['id', 'url_hash', 'url', 'name', 'logo', 'deleted_at', 'created_at', 'updated_at'], client);

        console.log('  🚗 Seeding automobiles...');
        await parseAndInsert(autosFile, 'automobiles', ['id', 'url_hash', 'url', 'brand_id', 'name', 'description', 'press_release', 'photos', 'created_at', 'updated_at'], client);

        console.log('  ⚙️ Seeding engines...');
        await parseAndInsert(enginesFile, 'engines', ['id', 'other_id', 'automobile_id', 'name', 'specs', 'created_at', 'updated_at'], client);

        console.log('✅ Seeding completed!');
    } catch (err) {
        console.error('❌ Seeding failed:', err);
    } finally {
        client.release();
        await pool.end();
    }
}

async function parseAndInsert(filePath, tableName, columns, client) {
    if (!fs.existsSync(filePath)) {
        console.warn(`File missing: ${filePath}`);
        return;
    }

    const fileStream = fs.createReadStream(filePath);
    const rl = readline.createInterface({
        input: fileStream,
        crlfDelay: Infinity
    });

    let isInsert = false;
    let valuesBuffer = '';
    const colString = columns.map(c => `"${c}"`).join(', ');

    for await (const line of rl) {
        if (line.startsWith(`INSERT INTO \`${tableName}\` VALUES`)) {
            isInsert = true;
            valuesBuffer = line.substring(line.indexOf('VALUES') + 7);
        } else if (isInsert) {
            valuesBuffer += line;
        }

        if (isInsert && line.trim().endsWith(';')) {
            isInsert = false;
            let cleaned = valuesBuffer.trim();
            if (cleaned.endsWith(';')) cleaned = cleaned.slice(0, -1);

            let postgresValues = cleaned
                .replace(/\\'/g, "''")
                .replace(/\\n/g, ' ')
                .replace(/\\r/g, ' ')
                .replace(/\\"/g, '"');

            const individualRows = postgresValues.split(/\),\(/g);
            let chunks = [];
            let currentRowChunk = [];

            for (let i = 0; i < individualRows.length; i++) {
                let row = individualRows[i];
                if (i === 0) row = row.substring(1);
                if (i === individualRows.length - 1) row = row.substring(0, row.length - 1);

                currentRowChunk.push(`(${row})`);

                if (currentRowChunk.length >= CHUNK_SIZE || i === individualRows.length - 1) {
                    chunks.push([...currentRowChunk]);
                    currentRowChunk = [];
                }
            }

            console.log(`    Preparing to insert ${individualRows.length} rows in ${chunks.length} chunks...`);

            for (let j = 0; j < chunks.length; j++) {
                const chunkValues = chunks[j].join(', ');
                try {
                    await client.query(`INSERT INTO "${tableName}" (${colString}) VALUES ${chunkValues} ON CONFLICT DO NOTHING`);
                    if (j % 10 === 0) console.log(`      -> Progress: ${j}/${chunks.length} chunks inserted`);
                } catch (err) {
                    console.error(`      -> Chunk ${j} failed. Retrying sequentially layer...`);
                    // Fallback to individual
                    for (const r of chunks[j]) {
                        try {
                            await client.query(`INSERT INTO "${tableName}" (${colString}) VALUES ${r} ON CONFLICT DO NOTHING`);
                        } catch (e2) { }
                    }
                }
            }
            valuesBuffer = '';
        }
    }
}

seed();
