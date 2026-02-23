const axios = require('axios');

async function testApi() {
    try {
        console.log('Testing Valuation API...');
        const res = await axios.post('http://127.0.0.1:4000/api/valuation/predict', {
            make: 'Toyota',
            model: 'Camry',
            year: 2018,
            condition: 'good',
            mileage_km: 150000,
            trim: 'XSE',
            transmission: 'automatic',
            year_of_entry: 2025,
            accident_history: false
        });
        console.log('API Status:', res.status);
        console.log('API Data:', JSON.stringify(res.data, null, 2));
    } catch (e) {
        console.error('API Error:', e.response?.data || e.message);
    }
}

testApi();
