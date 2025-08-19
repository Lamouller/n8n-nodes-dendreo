/**
 * Script pour débugger les problèmes de listes dans les resourceLocators
 */

const https = require('https');

const CONFIG = {
    slug: 'efco_formation',
    apiKey: 'bppsyVg1LsEth21XGoBo',
    baseUrl: 'https://pro.dendreo.com'
};

// Test des endpoints utilisés par les listes déroulantes
const LIST_ENDPOINTS = [
    {
        name: 'Companies',
        endpoint: 'entreprises.php',
        idField: 'id_entreprise',
        nameField: 'raison_sociale'
    },
    {
        name: 'Contacts',
        endpoint: 'contacts.php',
        idField: 'id_contact',
        nameField: ['nom', 'prenom']
    },
    {
        name: 'Modules',
        endpoint: 'modules.php',
        idField: 'id_module',
        nameField: 'nom'
    },
    {
        name: 'Training Actions',
        endpoint: 'actions_de_formation.php',
        idField: 'id_action_de_formation',
        nameField: 'nom'
    },
    {
        name: 'Sessions',
        endpoint: 'sessions_permanentes.php',
        idField: 'id_session_permanente',
        nameField: 'nom'
    },
    {
        name: 'Trainers',
        endpoint: 'formateurs.php',
        idField: 'id_formateur',
        nameField: ['nom', 'prenom']
    },
    {
        name: 'Participants',
        endpoint: 'participants.php',
        idField: 'id_participant',
        nameField: ['nom', 'prenom']
    },
    {
        name: 'Invoices',
        endpoint: 'factures.php',
        idField: 'id_facture',
        nameField: 'numero'
    }
];

function testListEndpoint(config) {
    return new Promise((resolve) => {
        const url = `${CONFIG.baseUrl}/${CONFIG.slug}/api/${config.endpoint}`;
        const urlParts = new URL(url);
        
        const options = {
            hostname: urlParts.hostname,
            path: urlParts.pathname + '?limit=5',
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Authorization': `Token token="${CONFIG.apiKey}"`
            },
            timeout: 10000
        };

        const req = https.request(options, (res) => {
            let data = '';
            
            res.on('data', (chunk) => {
                data += chunk;
            });
            
            res.on('end', () => {
                const result = {
                    name: config.name,
                    endpoint: config.endpoint,
                    status: res.statusCode,
                    success: false,
                    records: 0,
                    hasValidFields: false,
                    sampleRecord: null
                };

                if (res.statusCode === 200) {
                    try {
                        const parsed = JSON.parse(data);
                        if (Array.isArray(parsed)) {
                            result.success = true;
                            result.records = parsed.length;
                            
                            if (parsed.length > 0) {
                                const firstRecord = parsed[0];
                                result.sampleRecord = firstRecord;
                                
                                // Test des champs utilisés pour les listes
                                const hasIdField = firstRecord[config.idField] !== undefined;
                                let hasNameField = false;
                                
                                if (Array.isArray(config.nameField)) {
                                    hasNameField = config.nameField.some(field => firstRecord[field] !== undefined);
                                } else {
                                    hasNameField = firstRecord[config.nameField] !== undefined;
                                }
                                
                                result.hasValidFields = hasIdField && hasNameField;
                                
                                console.log(`✅ ${config.name}: ${result.records} records`);
                                console.log(`   ID Field (${config.idField}): ${hasIdField ? '✅' : '❌'}`);
                                console.log(`   Name Field (${JSON.stringify(config.nameField)}): ${hasNameField ? '✅' : '❌'}`);
                                
                                if (!result.hasValidFields) {
                                    console.log(`   Available fields: ${Object.keys(firstRecord).slice(0, 10).join(', ')}...`);
                                }
                            } else {
                                console.log(`⚠️  ${config.name}: Aucun enregistrement trouvé`);
                            }
                        }
                    } catch (e) {
                        console.log(`❌ ${config.name}: Erreur JSON - ${e.message}`);
                    }
                } else {
                    console.log(`❌ ${config.name}: Status ${res.statusCode}`);
                }
                
                resolve(result);
            });
        });

        req.on('error', (error) => {
            console.log(`❌ ${config.name}: ${error.message}`);
            resolve({
                name: config.name,
                endpoint: config.endpoint,
                status: 'error',
                success: false,
                error: error.message
            });
        });

        req.on('timeout', () => {
            req.destroy();
            console.log(`⏱️  ${config.name}: Timeout`);
            resolve({
                name: config.name,
                endpoint: config.endpoint,
                status: 'timeout',
                success: false,
                error: 'Timeout'
            });
        });

        req.end();
    });
}

async function debugAllLists() {
    console.log('🔍 Debug des listes déroulantes Dendreo\n');
    
    const results = [];
    for (const config of LIST_ENDPOINTS) {
        const result = await testListEndpoint(config);
        results.push(result);
        console.log(''); // Ligne vide entre les tests
    }
    
    // Résumé
    console.log('📊 Résumé:');
    const working = results.filter(r => r.success && r.hasValidFields);
    const hasData = results.filter(r => r.success && r.records > 0);
    const errors = results.filter(r => !r.success);
    
    console.log(`✅ Listes fonctionnelles: ${working.length}/${results.length}`);
    console.log(`📋 Avec données: ${hasData.length}/${results.length}`);
    console.log(`❌ En erreur: ${errors.length}/${results.length}`);
    
    if (errors.length > 0) {
        console.log('\n❌ Listes en erreur:');
        errors.forEach(r => console.log(`   - ${r.name}: ${r.error || r.status}`));
    }
    
    const emptyLists = results.filter(r => r.success && r.records === 0);
    if (emptyLists.length > 0) {
        console.log('\n⚠️  Listes vides:');
        emptyLists.forEach(r => console.log(`   - ${r.name}`));
    }
    
    return results;
}

if (require.main === module) {
    debugAllLists().catch(console.error);
}

module.exports = { debugAllLists, testListEndpoint };
