/**
 * Script pour comparer les endpoints dans notre node vs ceux disponibles dans l'API
 */

// Endpoints actuellement dans notre node
const CURRENT_ENDPOINTS = [
    'actions_de_formation.php',
    'administrateurs.php',
    'categories_module.php',
    'centres_de_formation.php',
    'checklists.php',
    'contacts.php',
    'creneaux.php',
    'entreprises.php',
    'etapes.php',
    'evaluations.php',
    'exports.php',
    'factures.php',
    'fichiers.php',
    'financements.php',
    'financeurs.php',
    'formateurs.php',
    'inscriptions.php',
    'modules.php',
    'opportunites.php',
    'participants.php',
    'particuliers.php',
    'reglements.php',
    'salles_de_formation.php',
    'sessions_permanentes.php',
    'sources.php'
];

// Endpoints trouvés dans la spec OpenAPI
const OPENAPI_ENDPOINTS = [
    'categories_module.php',
    'categories_produit.php',
    'modules.php',
    'sessions_permanentes.php',
    'formateurs.php',
    'entreprises.php',
    'contacts.php',
    'participants.php',
    'taches.php',
    'etapes.php',
    'centres_de_formation.php',
    'salles_de_formation.php',
    'actions_de_formation.php',
    'catalogue_prochaines_sessions.php',
    'creneaux.php',
    'laps.php', // Inscriptions
    'reponses_questionnaire_satisfaction.php',
    'laes.php', // Liens Action de Formation ↔ Entreprise
    'lafs.php', // Liens Action de Formation ↔ Formateur
    'lcfs.php'  // Liens Créneau ↔ Formateur
];

console.log('🔍 Comparaison des endpoints\n');

// Endpoints manquants dans notre node
const missing = OPENAPI_ENDPOINTS.filter(ep => !CURRENT_ENDPOINTS.includes(ep));
console.log('❌ Endpoints manquants dans notre node:');
missing.forEach(ep => console.log(`   - ${ep}`));

// Endpoints dans notre node mais pas dans OpenAPI
const extra = CURRENT_ENDPOINTS.filter(ep => !OPENAPI_ENDPOINTS.includes(ep));
console.log('\n⚠️  Endpoints dans notre node mais pas dans OpenAPI:');
extra.forEach(ep => console.log(`   - ${ep}`));

// Endpoints communs
const common = CURRENT_ENDPOINTS.filter(ep => OPENAPI_ENDPOINTS.includes(ep));
console.log('\n✅ Endpoints communs:');
common.forEach(ep => console.log(`   - ${ep}`));

console.log('\n📊 Statistiques:');
console.log(`   - Total OpenAPI: ${OPENAPI_ENDPOINTS.length}`);
console.log(`   - Total Node: ${CURRENT_ENDPOINTS.length}`);
console.log(`   - Communs: ${common.length}`);
console.log(`   - Manquants: ${missing.length}`);
console.log(`   - Extra: ${extra.length}`);

// Suggestions d'ajout
console.log('\n💡 Endpoints recommandés à ajouter:');
const recommended = [
    'categories_produit.php',
    'taches.php', 
    'catalogue_prochaines_sessions.php',
    'laps.php',
    'reponses_questionnaire_satisfaction.php',
    'laes.php',
    'lafs.php',
    'lcfs.php'
];

recommended.forEach(ep => {
    if (missing.includes(ep)) {
        console.log(`   ✅ ${ep} - Pertinent pour N8N`);
    }
});

console.log('\n📝 Endpoints potentiellement obsolètes à retirer:');
const potentially_obsolete = [
    'administrateurs.php',
    'checklists.php',
    'exports.php',
    'fichiers.php',
    'financements.php',
    'financeurs.php',
    'inscriptions.php', // Remplacé par laps.php
    'opportunites.php',
    'particuliers.php',
    'reglements.php',
    'sources.php'
];

potentially_obsolete.forEach(ep => {
    if (extra.includes(ep)) {
        console.log(`   ⚠️  ${ep} - Pas dans OpenAPI officielle`);
    }
});
