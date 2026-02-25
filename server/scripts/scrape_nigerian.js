const https = require('https');
const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '../data');
const NIGERIAN_FILE = path.join(DATA_DIR, 'market_valuations_nigerian.json');

if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR);

let nigerianData = {};
if (fs.existsSync(NIGERIAN_FILE)) {
    try {
        nigerianData = JSON.parse(fs.readFileSync(NIGERIAN_FILE, 'utf8'));
    } catch (e) { nigerianData = {}; }
}

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

async function scrapeNigerian() {
    console.log("🇳🇬 Starting STRICT Nigerian Used Scraper (2007-2024)...");

    for (const [make, models] of Object.entries(targetModels)) {
        if (!nigerianData[make]) nigerianData[make] = {};
        for (const model of models) {
            if (!nigerianData[make][model]) nigerianData[make][model] = {};
            console.log(`\n🚙 Model: ${make} ${model}`);
            for (let year = 2007; year <= 2024; year++) {
                if (nigerianData[make][model][year]) continue;

                const price = await fetchJijiMedianPrice(make, model, year, "nigerian+used");
                if (price) {
                    nigerianData[make][model][year] = price;
                    console.log(`   ✅ ${year}: ₦${price.toLocaleString()}`);
                    fs.writeFileSync(NIGERIAN_FILE, JSON.stringify(nigerianData, null, 2));
                }
                await delay(3500 + Math.random() * 3000);
            }
        }
    }
    console.log("🎉 Nigerian Used Scrape Complete!");
}

scrapeNigerian();
