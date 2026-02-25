const { Client } = require('pg');

async function testConnection() {
    console.log("Testing connection...");
    // The previous run command outputted 'yammanote...' but DNS resolved 'yamanote...'
    // Railway's public domains are usually like xxx.proxy.rlwy.net
    // Let's use the provided URL but try both yammanote and yamanote if one fails.

    let url = "postgresql://postgres:pSqGlclZvUKMLiQXQeiccKYhanHzeRys@yammanote.proxy.rlwy.net:18967/railway";
    let client = new Client({ connectionString: url, statement_timeout: 10000 });

    try {
        await client.connect();
        console.log("Connected to yammanote successfully!");
        client.end();
        return;
    } catch (e) {
        console.log("Failed yammanote:", e.message);
    }

    url = "postgresql://postgres:pSqGlclZvUKMLiQXQeiccKYhanHzeRys@yamanote.proxy.rlwy.net:18967/railway";
    client = new Client({ connectionString: url, statement_timeout: 10000 });

    try {
        await client.connect();
        console.log("Connected to yamanote successfully!");
        client.end();
        return;
    } catch (e) {
        console.log("Failed yamanote:", e.message);
    }
}

testConnection();
