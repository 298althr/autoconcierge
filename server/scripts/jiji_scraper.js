const https = require('https');
const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

const VALUATIONS_FILE = path.join(__dirname, '../data/market_valuations.json');

const pool = new Pool({
    connectionString: "postgresql://postgres:pSqGlclZvUKMLiQXQeiccKYhanHzeRys@yamanote.proxy.rlwy.net:18967/railway",
    ssl: false
});

async function exportAndScrape() {
    console.log("🚀 Syncing Database Seed and Starting Scraper...");

    // 1. Ensure directory exists
    if (!fs.existsSync(path.join(__dirname, '../data'))) {
        fs.mkdirSync(path.join(__dirname, '../data'));
    }

    // 2. Load existing JSON or init
    let allValuations = {};
    if (fs.existsSync(VALUATIONS_FILE)) {
        try {
            allValuations = JSON.parse(fs.readFileSync(VALUATIONS_FILE, 'utf8'));
        } catch (e) { allValuations = {}; }
    }

    // 3. SECURE THE INITIAL SEEDED DATA FROM DATABASE
    console.log("📥 Pulling initial seeded results from Railway...");
    const client = await pool.connect();
    try {
        const res = await client.query('SELECT make, model, year_start, year_end, price_foreign_used, price_nigerian_used FROM vehicle_catalog WHERE price_foreign_used IS NOT NULL');

        for (const row of res.rows) {
            if (!allValuations[row.make]) allValuations[row.make] = {};
            if (!allValuations[row.make][row.model]) allValuations[row.make][row.model] = {};

            // Map the range to individual years for the JSON cache
            for (let y = row.year_start; y <= row.year_end; y++) {
                if (!allValuations[row.make][row.model][y]) allValuations[row.make][row.model][y] = {};
                allValuations[row.make][row.model][y].foreign = parseFloat(row.price_foreign_used);
                allValuations[row.make][row.model][y].nigerian = parseFloat(row.price_nigerian_used);
            }
        }
        fs.writeFileSync(VALUATIONS_FILE, JSON.stringify(allValuations, null, 2));
        console.log(`✅ Recovered and synced ${res.rowCount} model ranges from Database.`);
    } finally {
        client.release();
    }

    // 4. Continue Scraping
    const targetModels = {
        'Toyota': ['Camry', 'Corolla', 'RAV4', 'Hilux', 'Land Cruiser', 'Prado', 'Sienna', 'Highlander', 'Venza'],
        'Lexus': ['ES', 'GS', 'IS', 'LS', 'RX', 'GX', 'LX'],
        'Mercedes-Benz': ['C-Class', 'E-Class', 'S-Class', 'GLC-Class', 'GLE-Class', 'GLS-Class', 'GLK-Class'],
        'Honda': ['Accord', 'Civic', 'CR-V', 'Pilot'],
        'Hyundai': ['Elantra', 'Sonata', 'Tucson', 'Santa Fe'],
        'Land Rover': ['Range Rover', 'Discovery', 'Defender'],
        'Ford': ['F-150', 'Explorer', 'Mustang', 'Focus', 'Edge'],
        'Kia': ['Optima', 'Sorento', 'Sportage', 'Soul'],
        'BMW': ['3-Series', '5-Series', '7-Series', 'X3', 'X5', 'X7'],
        'Audi': ['A4', 'A6', 'A8', 'Q5', 'Q7', 'Q8'],
        'Nissan': ['Altima', 'Maxima', 'Rogue', 'Pathfinder', 'Murano']
    };

    const delay = ms => new Promise(res => setTimeout(res, ms));

    async function fetchJijiMedianPrice(make, model, year, conditionParam) {
        const query = encodeURIComponent(`${make} ${model} ${year}`);
        const url = `https://jiji.ng/api_web/v1/listing?query=${query}+${conditionParam}&category_id=74`;
        const options = { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)', 'Accept': 'application/json', 'Referer': 'https://jiji.ng/' } };

        return new Promise((resolve) => {
            https.get(url, options, (res) => {
                let data = '';
                res.on('data', chunk => data += chunk);
                res.on('end', () => {
                    if (res.statusCode === 200) {
                        try {
                            const json = JSON.parse(data);
                            const adverts = json.adverts_list?.adverts || [];
                            let prices = adverts.map(ad => ad.price_obj?.value).filter(p => p > 500000).sort((a, b) => a - b);
                            if (prices.length === 0) return resolve(null);
                            const mid = Math.floor(prices.length / 2);
                            resolve(prices.length % 2 !== 0 ? prices[mid] : (prices[mid - 1] + prices[mid]) / 2);
                        } catch (e) { resolve(null); }
                    } else resolve(null);
                });
            }).on('error', () => resolve(null));
        });
    }

    for (const [make, models] of Object.entries(targetModels)) {
        if (!allValuations[make]) allValuations[make] = {};
        for (const model of models) {
            if (!allValuations[make][model]) allValuations[make][model] = {};
            console.log(`\n🚙 Processing ${make} ${model}...`);
            for (let year = 2007; year <= 2024; year++) {
                if (allValuations[make][model][year]?.foreign && allValuations[make][model][year]?.nigerian) continue;
                if (!allValuations[make][model][year]) allValuations[make][model][year] = {};

                if (!allValuations[make][model][year].foreign) {
                    const f = await fetchJijiMedianPrice(make, model, year, "foreign+used");
                    if (f) { allValuations[make][model][year].foreign = f; console.log(`   🛳️  ${year} Foreign: ₦${f.toLocaleString()}`); }
                    await delay(3500 + Math.random() * 2000);
                }
                if (!allValuations[make][model][year].nigerian) {
                    const n = await fetchJijiMedianPrice(make, model, year, "nigerian+used");
                    if (n) { allValuations[make][model][year].nigerian = n; console.log(`   🇳🇬  ${year} Nigerian: ₦${n.toLocaleString()}`); }
                    await delay(3500 + Math.random() * 2000);
                }
                fs.writeFileSync(VALUATIONS_FILE, JSON.stringify(allValuations, null, 2));
            }
        }
    }
    console.log("🎉 Scraping complete!");
    await pool.end();
}

exportAndScrape();
