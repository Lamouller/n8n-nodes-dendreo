const https = require('https');

// Configuration
const config = {
    slug: 'efco_formation',
    apiKey: 'bppsyVg1LsEth21XGoBo'
};

// Liste de tous les endpoints du node
const endpoints = [
    { name: 'Actions de Formation', endpoint: 'actions_de_formation.php', idField: 'id_action_de_formation', nameField: 'intitule' },
    { name: 'Catégories de Module', endpoint: 'categories_module.php', idField: 'id_categorie_module', nameField: 'intitule' },
    { name: 'Catégories de Produit', endpoint: 'categories_produit.php', idField: 'id_categorie_produit', nameField: 'intitule' },
    { name: 'Catalogue Public (Sessions)', endpoint: 'catalogue_prochaines_sessions.php', idField: 'id_session', nameField: 'intitule' },
    { name: 'Centres de Formation', endpoint: 'centres_de_formation.php', idField: 'id_centre_de_formation', nameField: 'nom' },
    { name: 'Contacts', endpoint: 'contacts.php', idField: 'id_contact', nameField: ['nom', 'prenom'] },
    { name: 'Créneaux', endpoint: 'creneaux.php', idField: 'id_creneau', nameField: 'date' },
    { name: 'Entreprises', endpoint: 'entreprises.php', idField: 'id_entreprise', nameField: 'raison_sociale' },
    { name: 'Étapes', endpoint: 'etapes.php', idField: 'id_etape', nameField: 'nom' },
    { name: 'Factures', endpoint: 'factures.php', idField: 'id_facture', nameField: 'numero' },
    { name: 'Formateurs', endpoint: 'formateurs.php', idField: 'id_formateur', nameField: ['nom', 'prenom'] },
    { name: 'Inscriptions (LAP)', endpoint: 'laps.php', idField: 'id_lap', nameField: 'nom' },
    { name: 'Interventions Formateur (LAF)', endpoint: 'lafs.php', idField: 'id_laf', nameField: 'nom' },
    { name: 'Liens ADF-Entreprise (LAE)', endpoint: 'laes.php', idField: 'id_lae', nameField: 'nom' },
    { name: 'Liens Créneau-Formateur (LCF)', endpoint: 'lcfs.php', idField: 'id_lcf', nameField: 'nom' },
    { name: 'Modules/Produits', endpoint: 'modules.php', idField: 'id_module', nameField: 'intitule' },
    { name: 'Participants', endpoint: 'participants.php', idField: 'id_participant', nameField: ['nom', 'prenom'] },
    { name: 'Questionnaires Satisfaction', endpoint: 'reponses_questionnaire_satisfaction.php', idField: 'id_reponse', nameField: 'nom' },
    { name: 'Salles de Formation', endpoint: 'salles_de_formation.php', idField: 'id_salle_de_formation', nameField: 'intitule' },
    { name: 'Sessions Permanentes', endpoint: 'sessions_permanentes.php', idField: 'id_session_permanente', nameField: 'nom' },
    { name: 'Tâches', endpoint: 'taches.php', idField: 'id_tache', nameField: 'nom' }
];

async function testEndpoint(endpointInfo) {
    const url = `https://pro.dendreo.com/${config.slug}/api/${endpointInfo.endpoint}?key=${config.apiKey}&limit=2`;
    
    console.log(`\n🔍 Testing: ${endpointInfo.name}`);
    console.log(`📡 URL: ${endpointInfo.endpoint}`);
    
    try {
        const response = await fetch(url);
        console.log(`📊 Status: ${response.status} ${response.statusText}`);
        
        if (response.ok) {
            const text = await response.text();
            
            // Try to parse as JSON
            try {
                const data = JSON.parse(text);
                
                if (Array.isArray(data)) {
                    console.log(`✅ SUCCESS - Array with ${data.length} items`);
                    
                    if (data.length > 0) {
                        const firstItem = data[0];
                        
                        // Check ID field
                        const hasIdField = firstItem.hasOwnProperty(endpointInfo.idField);
                        console.log(`🆔 ID Field (${endpointInfo.idField}): ${hasIdField ? '✅' : '❌'}`);
                        
                        // Check name field(s)
                        if (Array.isArray(endpointInfo.nameField)) {
                            const nameFields = endpointInfo.nameField.map(field => 
                                `${field}: ${firstItem.hasOwnProperty(field) ? '✅' : '❌'}`
                            ).join(', ');
                            console.log(`📝 Name Fields: ${nameFields}`);
                        } else {
                            const hasNameField = firstItem.hasOwnProperty(endpointInfo.nameField);
                            console.log(`📝 Name Field (${endpointInfo.nameField}): ${hasNameField ? '✅' : '❌'}`);
                        }
                        
                        // Show available fields
                        console.log(`🔑 Available fields: ${Object.keys(firstItem).join(', ')}`);
                        
                        // Show sample data
                        console.log(`📋 Sample:`, JSON.stringify(firstItem, null, 2).substring(0, 200) + '...');
                    } else {
                        console.log(`⚠️ Empty array - no data to test fields`);
                    }
                } else {
                    console.log(`⚠️ Response is not an array:`, typeof data);
                    console.log(`📋 Response:`, JSON.stringify(data, null, 2));
                }
            } catch (jsonError) {
                console.log(`❌ JSON Parse Error: ${jsonError.message}`);
                console.log(`📋 Raw response (first 200 chars): ${text.substring(0, 200)}...`);
            }
        } else {
            const errorText = await response.text();
            console.log(`❌ HTTP Error: ${errorText.substring(0, 200)}...`);
        }
    } catch (error) {
        console.log(`💥 Request failed: ${error.message}`);
    }
}

async function testAllEndpoints() {
    console.log(`🚀 Testing all ${endpoints.length} Dendreo endpoints...\n`);
    
    for (const endpoint of endpoints) {
        await testEndpoint(endpoint);
        await new Promise(resolve => setTimeout(resolve, 500)); // Small delay between requests
    }
    
    console.log(`\n✅ Test completed for all ${endpoints.length} endpoints!`);
}

// Test avec Node.js 18+ fetch
if (typeof fetch !== 'undefined') {
    testAllEndpoints();
} else {
    console.log('❌ This script requires Node.js 18+ with fetch support');
}
