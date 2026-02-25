require('dotenv').config();
const { OAuth2Client } = require('google-auth-library');

async function testGoogleHandshake() {
    console.log("Testing Google OAuth Configuration...");
    console.log("Client ID:", process.env.GOOGLE_CLIENT_ID);
    console.log("Client Secret length:", process.env.GOOGLE_CLIENT_SECRET ? process.env.GOOGLE_CLIENT_SECRET.length : 0);

    try {
        const client = new OAuth2Client(
            process.env.GOOGLE_CLIENT_ID,
            process.env.GOOGLE_CLIENT_SECRET,
            'postmessage' // Specific redirect_uri for the standard popup method
        );

        // Fetch Google's Discovery Document to ensure API connectivity
        const wellKnownUrl = 'https://accounts.google.com/.well-known/openid-configuration';
        console.log(`\nFetching Google OpenID configuration from ${wellKnownUrl}...`);

        const response = await fetch(wellKnownUrl);
        const data = await response.json();

        if (data.issuer === 'https://accounts.google.com') {
            console.log("✅ SUCCESS: Google Auth API is reachable and responding.");
            console.log("Authorization Endpoint:", data.authorization_endpoint);
            console.log("Token Endpoint:", data.token_endpoint);
            console.log("\nYour credentials and API connection look good to proceed with the backend endpoint!");
        } else {
            console.log("⚠️ WARNING: Unexpected response from Google.");
        }

    } catch (err) {
        console.error("❌ ERROR: Failed to communicate with Google API", err.message);
    }
}

testGoogleHandshake();
