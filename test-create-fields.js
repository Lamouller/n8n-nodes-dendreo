const https = require('https');

const API_KEY = 'bppsyVg1LsEth21XGoBo';
const BASE_URL = 'https://pro.dendreo.com/efco_formation/api';

// Endpoints à tester pour les champs obligatoires de création
const endpointsToTest = [
    'entreprises.php',
    'contacts.php', 
    'modules.php',
    'actions_de_formation.php',
    'sessions.php',
    'participants.php',
    'factures.php',
    'categories_produit.php',
    'categories_module.php',
    'centres_de_formation.php',
    'salles_de_formation.php',
    'creneaux.php',
    'etapes.php',
    'laps.php',
    'lafs.php',
    'laes.php',
    'lcfs.php',
    'reponses_questionnaire_satisfaction.php',
    'sessions_permanentes.php'
];

function makePostRequest(url, data) {
    const postData = JSON.stringify(data);
    
    return new Promise((resolve, reject) => {
        const options = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(postData)
            }
        };
        
        const req = https.request(url, options, (res) => {
            let responseData = '';
            res.on('data', (chunk) => responseData += chunk);
            res.on('end', () => {
                try {
                    const parsed = JSON.parse(responseData);
                    resolve({ status: res.statusCode, data: parsed });
                } catch (e) {
                    resolve({ status: res.statusCode, error: 'Invalid JSON', raw: responseData.substring(0, 200) });
                }
            });
        });
        
        req.on('error', (err) => reject(err));
        req.write(postData);
        req.end();
    });
}

async function testCreateEndpoint(endpoint) {
    const url = `${BASE_URL}/${endpoint}`;
    
    try {
        console.log(`\n🔍 Testing CREATE for ${endpoint}:`);
        
        // Test avec seulement la clé API
        const result = await makePostRequest(url, { key: API_KEY });
        
        if (result.status === 422 && result.data && result.data.errors) {
            const errors = Array.isArray(result.data.errors) ? result.data.errors : [result.data.errors];
            console.log(`   ✅ CREATE available - Required fields detected:`);
            errors.forEach((error, index) => {
                console.log(`   ${index + 1}. ${error}`);
            });
            
            return {
                endpoint,
                status: 'create_available',
                requiredFields: errors,
                fieldCount: errors.length
            };
        } else if (result.status === 201) {
            console.log(`   ⚠️  CREATE succeeded with empty data (unusual)`);
            return { endpoint, status: 'create_no_validation' };
        } else if (result.status === 404) {
            console.log(`   ❌ Endpoint not found`);
            return { endpoint, status: 'not_found' };
        } else if (result.status === 401) {
            console.log(`   ❌ Unauthorized`);
            return { endpoint, status: 'unauthorized' };
        } else {
            console.log(`   ❓ Unexpected response: ${result.status}`);
            if (result.data) {
                console.log(`   📝 Response: ${JSON.stringify(result.data).substring(0, 100)}...`);
            }
            return { endpoint, status: 'unexpected', httpStatus: result.status };
        }
    } catch (error) {
        console.log(`   ❌ EXCEPTION: ${error.message}`);
        return { endpoint, status: 'exception', error: error.message };
    }
}

async function main() {
    console.log('🚀 Testing CREATE operations for required fields...\n');
    
    const results = [];
    
    for (const endpoint of endpointsToTest) {
        const result = await testCreateEndpoint(endpoint);
        results.push(result);
        
        // Pause entre les requêtes
        await new Promise(resolve => setTimeout(resolve, 300));
    }
    
    console.log('\n\n📊 SUMMARY:');
    console.log('============');
    
    const categories = {
        createAvailable: results.filter(r => r.status === 'create_available'),
        noValidation: results.filter(r => r.status === 'create_no_validation'),
        notFound: results.filter(r => r.status === 'not_found'),
        unauthorized: results.filter(r => r.status === 'unauthorized'),
        unexpected: results.filter(r => r.status === 'unexpected' || r.status === 'exception')
    };
    
    console.log(`\n✅ CREATE available with validation (${categories.createAvailable.length}):`);
    categories.createAvailable
        .sort((a, b) => a.fieldCount - b.fieldCount)
        .forEach(r => {
            console.log(`   - ${r.endpoint} (${r.fieldCount} required fields)`);
        });
    
    console.log(`\n⚠️  CREATE without validation (${categories.noValidation.length}):`);
    categories.noValidation.forEach(r => console.log(`   - ${r.endpoint}`));
    
    console.log(`\n❌ Not found (${categories.notFound.length}):`);
    categories.notFound.forEach(r => console.log(`   - ${r.endpoint}`));
    
    console.log(`\n🔐 Unauthorized (${categories.unauthorized.length}):`);
    categories.unauthorized.forEach(r => console.log(`   - ${r.endpoint}`));
    
    console.log(`\n❓ Unexpected/Errors (${categories.unexpected.length}):`);
    categories.unexpected.forEach(r => console.log(`   - ${r.endpoint} (${r.httpStatus || r.error})`));
    
    // Endpoints qui ont besoin de champs spécialisés
    console.log(`\n🎯 ENDPOINTS NEEDING SPECIALIZED FIELDS:`);
    const needSpecializedFields = categories.createAvailable.filter(r => r.fieldCount >= 2);
    needSpecializedFields.forEach(r => {
        console.log(`\n📝 ${r.endpoint} (${r.fieldCount} fields):`);
        r.requiredFields.forEach((field, index) => {
            console.log(`   ${index + 1}. ${field}`);
        });
    });
}

main().catch(console.error);
