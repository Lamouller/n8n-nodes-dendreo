const https = require('https');

const API_KEY = 'bppsyVg1LsEth21XGoBo';
const BASE_URL = 'https://pro.dendreo.com/efco_formation/api';

// Endpoints à tester avec leurs configurations supposées
const endpointsToTest = [
    // Endpoints potentiellement problématiques
    { endpoint: 'factures.php', idField: 'id_facture', nameField: 'numero' },
    { endpoint: 'salles_de_formation.php', idField: 'id_salle_de_formation', nameField: 'intitule' },
    { endpoint: 'etapes.php', idField: 'id_etape_process', nameField: 'intitule' },
    { endpoint: 'centres_de_formation.php', idField: 'id_centre_de_formation', nameField: 'raison_sociale' },
    { endpoint: 'creneaux.php', idField: 'id_creneau', nameField: 'name' },
    { endpoint: 'laps.php', idField: 'id_lap', nameField: 'nom' },
    { endpoint: 'lafs.php', idField: 'id_laf', nameField: 'nom' },
    { endpoint: 'laes.php', idField: 'id_lae', nameField: 'nom' },
    { endpoint: 'lcfs.php', idField: 'id_lcf', nameField: 'nom' },
    { endpoint: 'reponses_questionnaire_satisfaction.php', idField: 'id_reponse', nameField: 'reponse' },
    { endpoint: 'sessions_permanentes.php', idField: 'id_session_permanente', nameField: 'nom' },
    { endpoint: 'categories_produit.php', idField: 'id_categorie_produit', nameField: 'intitule' },
    { endpoint: 'categories_module.php', idField: 'id_categorie_module', nameField: 'intitule' },
];

function makeRequest(url) {
    return new Promise((resolve, reject) => {
        https.get(url, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                try {
                    const parsed = JSON.parse(data);
                    resolve({ status: res.statusCode, data: parsed });
                } catch (e) {
                    resolve({ status: res.statusCode, error: 'Invalid JSON', raw: data.substring(0, 200) });
                }
            });
        }).on('error', (err) => {
            reject(err);
        });
    });
}

async function testEndpoint(config) {
    const url = `${BASE_URL}/${config.endpoint}?key=${API_KEY}&limit=3`;
    
    try {
        console.log(`\n🔍 Testing ${config.endpoint}:`);
        console.log(`   URL: ${url}`);
        
        const result = await makeRequest(url);
        
        if (result.status === 200 && Array.isArray(result.data)) {
            const items = result.data;
            console.log(`   ✅ SUCCESS: ${items.length} items returned`);
            
            if (items.length > 0) {
                const firstItem = items[0];
                const hasIdField = config.idField in firstItem;
                const hasNameField = config.nameField in firstItem;
                
                console.log(`   📋 ID Field '${config.idField}': ${hasIdField ? '✅ FOUND' : '❌ MISSING'}`);
                console.log(`   📋 Name Field '${config.nameField}': ${hasNameField ? '✅ FOUND' : '❌ MISSING'}`);
                
                if (hasIdField && hasNameField) {
                    console.log(`   📝 Sample: ${firstItem[config.idField]} - "${firstItem[config.nameField]}"`);
                } else {
                    console.log(`   📝 Available fields: ${Object.keys(firstItem).slice(0, 5).join(', ')}...`);
                }
                
                return {
                    endpoint: config.endpoint,
                    status: 'ok',
                    count: items.length,
                    hasCorrectFields: hasIdField && hasNameField,
                    availableFields: Object.keys(firstItem)
                };
            } else {
                console.log(`   ⚠️  Empty array returned`);
                return { endpoint: config.endpoint, status: 'empty' };
            }
        } else if (result.status === 422) {
            console.log(`   ❌ ERROR 422: Likely requires parameters`);
            return { endpoint: config.endpoint, status: 'needs_params' };
        } else {
            console.log(`   ❌ ERROR: Status ${result.status}`);
            if (result.error) {
                console.log(`   📝 Error: ${result.error}`);
                console.log(`   📝 Raw: ${result.raw}`);
            }
            return { endpoint: config.endpoint, status: 'error', httpStatus: result.status };
        }
    } catch (error) {
        console.log(`   ❌ EXCEPTION: ${error.message}`);
        return { endpoint: config.endpoint, status: 'exception', error: error.message };
    }
}

async function main() {
    console.log('🚀 Testing endpoints for list functionality...\n');
    
    const results = [];
    
    for (const config of endpointsToTest) {
        const result = await testEndpoint(config);
        results.push(result);
        
        // Pause entre les requêtes
        await new Promise(resolve => setTimeout(resolve, 200));
    }
    
    console.log('\n\n📊 SUMMARY:');
    console.log('============');
    
    const categories = {
        ok: results.filter(r => r.status === 'ok' && r.hasCorrectFields),
        wrongFields: results.filter(r => r.status === 'ok' && !r.hasCorrectFields),
        empty: results.filter(r => r.status === 'empty'),
        needsParams: results.filter(r => r.status === 'needs_params'),
        error: results.filter(r => r.status === 'error' || r.status === 'exception')
    };
    
    console.log(`\n✅ Working correctly (${categories.ok.length}):`);
    categories.ok.forEach(r => console.log(`   - ${r.endpoint} (${r.count} items)`));
    
    console.log(`\n⚠️  Wrong field names (${categories.wrongFields.length}):`);
    categories.wrongFields.forEach(r => {
        console.log(`   - ${r.endpoint} (${r.count} items)`);
        console.log(`     Available fields: ${r.availableFields.slice(0, 8).join(', ')}...`);
    });
    
    console.log(`\n📭 Empty results (${categories.empty.length}):`);
    categories.empty.forEach(r => console.log(`   - ${r.endpoint}`));
    
    console.log(`\n🔐 Needs parameters (${categories.needsParams.length}):`);
    categories.needsParams.forEach(r => console.log(`   - ${r.endpoint}`));
    
    console.log(`\n❌ Errors (${categories.error.length}):`);
    categories.error.forEach(r => console.log(`   - ${r.endpoint} (${r.httpStatus || r.error})`));
}

main().catch(console.error);
