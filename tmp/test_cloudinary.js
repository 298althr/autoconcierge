const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../server/.env') });

async function testUpload() {
    console.log('--- Cloudinary Integration Test ---');
    console.log('API URL:', process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api');

    const apiBase = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api').replace(/\/$/, '');

    // 1. Create a dummy image for testing
    const testImagePath = path.join(__dirname, 'test_car.png');
    // Using a tiny base64 png
    const base64Data = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==";
    fs.writeFileSync(testImagePath, Buffer.from(base64Data, 'base64'));

    const formData = new FormData();
    formData.append('images', fs.createReadStream(testImagePath));

    try {
        console.log('Attempting upload to /upload/bulk...');
        const response = await axios.post(`${apiBase}/upload/bulk`, formData, {
            headers: {
                ...formData.getHeaders(),
                // Mocking a token if needed, or if the route is protected we might need to skip auth for this test
                // 'Authorization': 'Bearer <token>' 
            }
        });

        console.log('✅ Upload Success!');
        console.log('Response:', JSON.stringify(response.data, null, 2));
    } catch (err) {
        console.error('❌ Upload Failed!');
        if (err.response) {
            console.error('Status:', err.response.status);
            console.error('Data:', JSON.stringify(err.response.data, null, 2));
        } else {
            console.error('Error:', err.message);
        }
    } finally {
        // Cleanup
        if (fs.existsSync(testImagePath)) fs.unlinkSync(testImagePath);
    }
}

testUpload();
