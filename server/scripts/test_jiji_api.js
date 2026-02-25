const https = require('https');

async function testJijiApi() {
    console.log("🔍 Attempting to query Jiji.ng API directly...");

    // Jiji has a public API endpoint used by their web client.
    // Example: Searching for "toyota camry 2010"
    const url = 'https://jiji.ng/api_web/v1/listing?query=toyota+camry+2010&category_id=74';

    const options = {
        headers: {
            // Need to spoof a real browser to bypass immediate bad-bot blocks
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'application/json, text/plain, */*',
            'Accept-Language': 'en-US,en;q=0.9',
            'Referer': 'https://jiji.ng/cars/toyota-camry-2010',
            'Origin': 'https://jiji.ng'
        }
    };

    return new Promise((resolve) => {
        https.get(url, options, (res) => {
            console.log(`📡 Status Code: ${res.statusCode}`);

            let data = '';
            res.on('data', chunk => data += chunk);

            res.on('end', () => {
                if (res.statusCode === 200) {
                    try {
                        const json = JSON.parse(data);
                        console.log(`✅ Success! Found ${json.adverts_list?.adverts?.length || 0} listings in response.`);

                        // Pick out the top 3 prices to show the user
                        const listings = json.adverts_list?.adverts || [];
                        console.log("\nSample Prices found:");
                        listings.slice(0, 3).forEach(ad => {
                            console.log(`- ${ad.title}: ₦${ad.price_obj?.value?.toLocaleString()}`);
                        });
                        resolve(true);
                    } catch (e) {
                        console.log("❌ Failed to parse JSON. Might be a Cloudflare Captcha HTML page.");
                        console.log(data.substring(0, 300) + "...");
                        resolve(false);
                    }
                } else if (res.statusCode === 403) {
                    console.log("❌ 403 Forbidden: Cloudflare or WAF blocked the request.");
                    resolve(false);
                } else {
                    console.log(`⚠️ Unexpected response code ${res.statusCode}.`);
                    console.log(data.substring(0, 300));
                    resolve(false);
                }
            });
        }).on('error', (err) => {
            console.error("❌ Request Error:", err.message);
            resolve(false);
        });
    });
}

testJijiApi();
