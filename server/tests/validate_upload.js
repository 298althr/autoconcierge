const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

const API_URL = 'http://127.0.0.1:4000/api';
const ADMIN_EMAIL = 'admin@autoconcierge.com';
const ADMIN_PASSWORD = 'admin123';

async function validateUpload() {
    console.log('🚀 Starting Upload Validation...');

    try {
        // 1. Login
        console.log('🔑 Registering / Logging in...');
        let token;
        try {
            const regRes = await axios.post(`${API_URL}/auth/register`, {
                email: 'test_uploader@autoconcierge.com',
                password: 'testpassword123',
                display_name: 'Test Uploader'
            });
            token = regRes.data.data.accessToken;
        } catch (e) {
            const loginRes = await axios.post(`${API_URL}/auth/login`, {
                email: 'test_uploader@autoconcierge.com',
                password: 'testpassword123'
            });
            token = loginRes.data.data.accessToken;
        }
        console.log('✅ Logged in successfully.');

        // 2. Prepare dummy image
        const imgPath = path.join(__dirname, 'test-image.png');
        // Create a tiny 1x1 png (base64 string for transparent 1x1 png)
        const base64Data = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';
        fs.writeFileSync(imgPath, Buffer.from(base64Data, 'base64'));
        console.log('🖼️ Created test image.');

        // 3. Upload to Cloudinary
        console.log('☁️ Uploading to Cloudinary...');
        const form = new FormData();
        form.append('image', fs.createReadStream(imgPath));

        const uploadRes = await axios.post(`${API_URL}/upload/vehicle`, form, {
            headers: {
                ...form.getHeaders(),
                'Authorization': `Bearer ${token}`
            }
        });

        console.log('📊 Response status:', uploadRes.status);
        console.log('🔗 Uploaded URL:', uploadRes.data.url);

        if (uploadRes.data.url.includes('cloudinary.com')) {
            console.log('✅ SUCCESS: Image was uploaded to Cloudinary!');
        } else if (uploadRes.data.url.includes('/uploads/')) {
            console.log('⚠️ SEMI-SUCCESS: Upload worked, but used LOCAL FALLBACK. Check CLOUDINARY_URL.');
        } else {
            console.log('❌ FAILURE: Unexpected URL format.');
        }

        // Cleanup
        fs.unlinkSync(imgPath);

    } catch (err) {
        console.error('❌ Validation Failed:', err.response?.data || err.message);
    }
}

validateUpload();
