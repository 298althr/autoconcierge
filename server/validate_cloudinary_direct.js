const cloudinary = require('cloudinary').v2;
const env = require('./config/env');
const fs = require('fs');

async function testConnection() {
    try {
        console.log("Cloudinary Configured with:", {
            cloud_name: env.CLOUDINARY_CLOUD_NAME,
            api_key: env.CLOUDINARY_API_KEY,
            secure: true
        });

        cloudinary.config({
            cloud_name: env.CLOUDINARY_CLOUD_NAME,
            api_key: env.CLOUDINARY_API_KEY,
            api_secret: env.CLOUDINARY_API_SECRET,
            secure: true
        });

        // Test API with ping
        const result = await cloudinary.api.ping();
        console.log('✅ Cloudinary Ping Response:', result);
    } catch (e) {
        console.error('❌ Cloudinary Error:', e.message);
    }
}

testConnection();
