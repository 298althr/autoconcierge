const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

async function testUpload() {
    const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImY2MThkZGYzLTEyY2YtNDMxZC1iMjRkLWRjYmI5ZjQ1YTg5MCIsImVtYWlsIjoicHJlbWl1bV9pbXBvcnRzQGRlYWxlci5jb20iLCJpYXQiOjE3NzI0MjA2ODIsImV4cCI6MTc3MjQyNDI4Mn0.-n_7jjAYW3RtYJ5mzBbYSWtt9rmvrMGmYAYJX7yHehk0';
    const apiBase = 'https://autogaard.up.railway.app/api';

    console.log('--- Cloudinary Production Testing ---');
    console.log('Testing Production URL:', apiBase);

    const testImagePath = path.join(__dirname, 'test_car.png');
    // Using a simple 1x1 black png
    const base64Data = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==";
    fs.writeFileSync(testImagePath, Buffer.from(base64Data, 'base64'));

    const formData = new FormData();
    formData.append('images', fs.createReadStream(testImagePath));

    try {
        console.log('Sending upload request to production /upload/bulk...');
        const response = await axios.post(`${apiBase}/upload/bulk`, formData, {
            headers: {
                ...formData.getHeaders(),
                'Authorization': `Bearer ${token}`
            },
            timeout: 60000
        });

        console.log('✅ Production Upload Success!');
        console.log('URLs:', JSON.stringify(response.data.urls, null, 2));
    } catch (err) {
        console.error('❌ Production Upload Failed!');
        if (err.response) {
            console.error('Status:', err.response.status);
            console.error('Data:', JSON.stringify(err.response.data, null, 2));
        } else {
            console.error('Error:', err.message);
        }
    } finally {
        if (fs.existsSync(testImagePath)) fs.unlinkSync(testImagePath);
    }
}

testUpload();
