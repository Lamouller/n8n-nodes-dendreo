/**
 * Script de test pour vérifier les appels API Dendreo
 */

const https = require('https');

// Configuration de test - Credentials fournis
const TEST_CONFIG = {
    slug: 'efco_formation',
    apiKey: 'bppsyVg1LsEth21XGoBo',
    baseUrl: 'https://pro.dendreo.com'
};

// Endpoints à tester
const ENDPOINTS_TO_TEST = [
    'entreprises.php',
    'contacts.php', 
    'actions_de_formation.php',
    'modules.php',
    'formateurs.php',
    'participants.php',
    'factures.php',
    // Ressources génériques ajoutées
    'administrateurs.php',
    'categories_module.php',
    'centres_de_formation.php',
    'checklists.php',
    'creneaux.php',
    'etapes.php',
    'evaluations.php',
    'exports.php',
    'fichiers.php',
    'financements.php',
    'financeurs.php',
    'inscriptions.php',
    'opportunites.php',
    'particuliers.php',
    'reglements.php',
    'salles_de_formation.php',
    'sessions_permanentes.php',
    'sources.php'
];

/**
 * Teste un endpoint avec différentes méthodes d'authentification
 */
function testEndpoint(endpoint, authMode = 'header') {
    return new Promise((resolve, reject) => {
        if (TEST_CONFIG.slug === 'YOUR_SLUG_HERE' || TEST_CONFIG.apiKey === 'YOUR_API_KEY_HERE') {
            console.log(`⚠️  Skipping ${endpoint} - Please configure real credentials`);
            resolve({ endpoint, status: 'skipped', reason: 'No credentials' });
            return;
        }

        const url = `${TEST_CONFIG.baseUrl}/${TEST_CONFIG.slug}/api/${endpoint}`;
        const urlParts = new URL(url);
        
        const options = {
            hostname: urlParts.hostname,
            path: urlParts.pathname + '?limit=1', // Limite à 1 pour des tests rapides
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'User-Agent': 'n8n-nodes-dendreo-test/2.0.1'
            },
            timeout: 10000
        };

        // Ajouter l'authentification selon le mode
        if (authMode === 'header' || authMode === 'both') {
            options.headers['Authorization'] = `Token token="${TEST_CONFIG.apiKey}"`;
        }
        
        if (authMode === 'query' || authMode === 'both') {
            options.path += `&key=${TEST_CONFIG.apiKey}`;
        }

        const req = https.request(options, (res) => {
            let data = '';
            
            res.on('data', (chunk) => {
                data += chunk;
            });
            
            res.on('end', () => {
                const result = {
                    endpoint,
                    status: res.statusCode,
                    authMode,
                    contentType: res.headers['content-type'],
                    dataLength: data.length
                };

                if (res.statusCode === 200) {
                    try {
                        const parsed = JSON.parse(data);
                        result.success = true;
                        result.dataType = Array.isArray(parsed) ? 'array' : typeof parsed;
                        result.recordCount = Array.isArray(parsed) ? parsed.length : 1;
                        console.log(`✅ ${endpoint} - OK (${result.recordCount} records)`);
                    } catch (e) {
                        result.success = false;
                        result.error = 'Invalid JSON response';
                        console.log(`❌ ${endpoint} - Invalid JSON`);
                    }
                } else {
                    result.success = false;
                    result.error = data.substring(0, 200);
                    console.log(`❌ ${endpoint} - Status ${res.statusCode}`);
                }
                
                resolve(result);
            });
        });

        req.on('error', (error) => {
            console.log(`❌ ${endpoint} - Network error: ${error.message}`);
            resolve({
                endpoint,
                status: 'error',
                authMode,
                success: false,
                error: error.message
            });
        });

        req.on('timeout', () => {
            req.destroy();
            console.log(`⏱️  ${endpoint} - Timeout`);
            resolve({
                endpoint,
                status: 'timeout',
                authMode,
                success: false,
                error: 'Request timeout'
            });
        });

        req.end();
    });
}

/**
 * Teste tous les endpoints
 */
async function testAllEndpoints() {
    console.log('🧪 Test des endpoints API Dendreo...\n');
    
    if (TEST_CONFIG.slug === 'YOUR_SLUG_HERE') {
        console.log('⚠️  CONFIGURATION REQUISE:');
        console.log('   Modifiez les variables TEST_CONFIG dans ce script avec vos credentials Dendreo:');
        console.log('   - slug: votre slug d\'organisation');
        console.log('   - apiKey: votre clé API');
        console.log('\n📝 Test de validation de structure seulement...\n');
    }

    const results = [];
    
    // Test par lots pour éviter de surcharger l'API
    const batchSize = 3;
    for (let i = 0; i < ENDPOINTS_TO_TEST.length; i += batchSize) {
        const batch = ENDPOINTS_TO_TEST.slice(i, i + batchSize);
        const batchPromises = batch.map(endpoint => testEndpoint(endpoint));
        const batchResults = await Promise.all(batchPromises);
        results.push(...batchResults);
        
        // Délai entre les lots
        if (i + batchSize < ENDPOINTS_TO_TEST.length) {
            await new Promise(resolve => setTimeout(resolve, 500));
        }
    }

    // Résumé des résultats
    console.log('\n📊 Résumé des tests:');
    const summary = {
        total: results.length,
        success: results.filter(r => r.success).length,
        failed: results.filter(r => r.success === false).length,
        skipped: results.filter(r => r.status === 'skipped').length
    };
    
    console.log(`   Total: ${summary.total}`);
    console.log(`   ✅ Succès: ${summary.success}`);
    console.log(`   ❌ Échecs: ${summary.failed}`);
    console.log(`   ⚠️  Ignorés: ${summary.skipped}`);

    if (summary.failed > 0) {
        console.log('\n❌ Endpoints en échec:');
        results
            .filter(r => r.success === false)
            .forEach(r => console.log(`   - ${r.endpoint}: ${r.error}`));
    }

    if (summary.success > 0) {
        console.log('\n✅ Endpoints fonctionnels:');
        results
            .filter(r => r.success === true)
            .forEach(r => console.log(`   - ${r.endpoint} (${r.recordCount} records)`));
    }

    return results;
}

/**
 * Valide la structure du mapping des endpoints
 */
function validateEndpointMapping() {
    console.log('🔍 Validation du mapping des endpoints...\n');
    
    // Lecture du fichier du node pour vérifier la cohérence
    const fs = require('fs');
    const path = require('path');
    
    try {
        const nodeFile = fs.readFileSync(
            path.join(__dirname, 'nodes', 'DendreoEnhanced.node.ts'), 
            'utf8'
        );
        
        // Extraction des ressources dans les options
        const resourcesMatch = nodeFile.match(/options:\s*\[([\s\S]*?)\]/);
        if (resourcesMatch) {
            const resourcesText = resourcesMatch[1];
            const resources = resourcesText.match(/value:\s*'([^']+)'/g);
            
            if (resources) {
                const resourceValues = resources.map(r => r.match(/'([^']+)'/)[1]);
                console.log(`📋 Ressources dans l'interface: ${resourceValues.length}`);
                
                // Extraction du mapping des endpoints
                const endpointsMatch = nodeFile.match(/resourceEndpoints:\s*{[\s\S]*?}/);
                if (endpointsMatch) {
                    const endpointsText = endpointsMatch[0];
                    const endpoints = endpointsText.match(/(\w+):\s*'([^']+)'/g);
                    
                    if (endpoints) {
                        const endpointMap = {};
                        endpoints.forEach(ep => {
                            const match = ep.match(/(\w+):\s*'([^']+)'/);
                            if (match) {
                                endpointMap[match[1]] = match[2];
                            }
                        });
                        
                        console.log(`🔗 Endpoints mappés: ${Object.keys(endpointMap).length}`);
                        
                        // Vérification de la cohérence
                        const missingEndpoints = resourceValues.filter(r => !endpointMap[r]);
                        const extraEndpoints = Object.keys(endpointMap).filter(e => !resourceValues.includes(e));
                        
                        if (missingEndpoints.length > 0) {
                            console.log(`❌ Ressources sans endpoint: ${missingEndpoints.join(', ')}`);
                        }
                        
                        if (extraEndpoints.length > 0) {
                            console.log(`⚠️  Endpoints sans ressource: ${extraEndpoints.join(', ')}`);
                        }
                        
                        if (missingEndpoints.length === 0 && extraEndpoints.length === 0) {
                            console.log('✅ Mapping cohérent entre ressources et endpoints');
                        }
                        
                        return { resourceValues, endpointMap, missingEndpoints, extraEndpoints };
                    }
                }
            }
        }
        
        console.log('❌ Impossible d\'extraire le mapping des endpoints');
        return null;
        
    } catch (error) {
        console.log(`❌ Erreur lors de la lecture du fichier: ${error.message}`);
        return null;
    }
}

// Exécution des tests
if (require.main === module) {
    (async () => {
        console.log('🚀 Tests n8n-nodes-dendreo v2.0.1\n');
        
        // 1. Validation de la structure
        const mapping = validateEndpointMapping();
        
        console.log('\n' + '='.repeat(50) + '\n');
        
        // 2. Tests des endpoints
        const results = await testAllEndpoints();
        
        console.log('\n🏁 Tests terminés');
        
        // 3. Recommandations
        console.log('\n💡 Recommandations:');
        console.log('   - Configurez vos credentials dans ce script pour tester les vrais appels API');
        console.log('   - Vérifiez les permissions "Lecture" dans votre compte Dendreo');
        console.log('   - Testez avec différents modes d\'authentification si nécessaire');
        
    })().catch(console.error);
}

module.exports = { testEndpoint, testAllEndpoints, validateEndpointMapping };
