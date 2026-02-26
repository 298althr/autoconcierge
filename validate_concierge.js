const conciergeService = require('./server/services/conciergeService');
const env = require('./server/config/env');

async function validateConciergeAI() {
    console.log('🧪 Validating Concierge AI (Groq)...');

    if (!env.GROQ_API_KEY) {
        console.error('❌ GROQ_API_KEY not found in env');
        return;
    }

    const testDetails = {
        model: 'Toyota Camry',
        year: 2022,
        location: 'United States',
        destination: 'Lagos, Nigeria'
    };

    console.log('  Testing Sourcing Node...');
    const sourcingRes = await conciergeService.analyzeWithAI('sourcing', testDetails);
    console.log('  Result:', JSON.stringify(sourcingRes, null, 2));

    if (sourcingRes && sourcingRes.category_node) {
        console.log('✅ Sourcing Node Analysis successful');
    } else {
        console.error('❌ Sourcing Node Analysis failed or returned unexpected format');
    }

    console.log('\n  Testing Clearing Node...');
    const clearingRes = await conciergeService.analyzeWithAI('clearing', testDetails);
    console.log('  Result:', JSON.stringify(clearingRes, null, 2));

    if (clearingRes && clearingRes.category_node) {
        console.log('✅ Clearing Node Analysis successful');
    } else {
        console.error('❌ Clearing Node Analysis failed');
    }
}

// Mocking database query for validation script
require('./server/config/database').query = async () => ({ rows: [{ id: 1 }] });

validateConciergeAI();
