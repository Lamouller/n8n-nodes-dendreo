const fs = require('fs');

// Lire le fichier node
const nodeContent = fs.readFileSync('./nodes/DendreoEnhanced.node.ts', 'utf8');

console.log('🔍 ANALYZING RESOURCE LOCATORS USAGE...\n');

// 1. Extraire toutes les méthodes listSearch
const listSearchMatches = nodeContent.match(/async get[A-Z][a-zA-Z]*\(/g);
const listSearchMethods = [];
if (listSearchMatches) {
    listSearchMatches.forEach(match => {
        const methodName = match.replace('async ', '').replace('(', '');
        listSearchMethods.push(methodName);
    });
}

console.log(`📋 Found ${listSearchMethods.length} listSearch methods:`);
listSearchMethods.forEach((method, index) => {
    console.log(`   ${(index + 1).toString().padStart(2)}. ${method}`);
});

// 2. Extraire toutes les utilisations dans searchListMethod
const searchListMethodMatches = nodeContent.match(/searchListMethod:\s*'([^']+)'/g);
const usedMethods = [];
if (searchListMethodMatches) {
    searchListMethodMatches.forEach(match => {
        const methodName = match.match(/searchListMethod:\s*'([^']+)'/)[1];
        usedMethods.push(methodName);
    });
}

console.log(`\n🔗 Found ${usedMethods.length} methods used in searchListMethod:`);
usedMethods.forEach((method, index) => {
    console.log(`   ${(index + 1).toString().padStart(2)}. ${method}`);
});

// 3. Identifier les méthodes non utilisées
const unusedMethods = listSearchMethods.filter(method => !usedMethods.includes(method));

console.log(`\n❌ UNUSED listSearch methods (${unusedMethods.length}):`);
unusedMethods.forEach((method, index) => {
    console.log(`   ${(index + 1).toString().padStart(2)}. ${method}`);
});

// 4. Identifier les ressources correspondantes
console.log(`\n🎯 ANALYSIS OF UNUSED METHODS:`);
unusedMethods.forEach((method, index) => {
    let resourceGuess = 'unknown';
    
    // Deviner la ressource basée sur le nom de la méthode
    if (method.includes('Companies')) resourceGuess = 'entreprises';
    else if (method.includes('Contacts')) resourceGuess = 'contacts';
    else if (method.includes('Modules') && !method.includes('Categories')) resourceGuess = 'modules';
    else if (method.includes('CategoriesModule')) resourceGuess = 'categories_module';
    else if (method.includes('CategoriesProduit')) resourceGuess = 'categories_produit';
    else if (method.includes('TrainingActions')) resourceGuess = 'actions_de_formation';
    else if (method.includes('Participants')) resourceGuess = 'participants';
    else if (method.includes('Invoices')) resourceGuess = 'factures';
    else if (method.includes('TrainingRooms')) resourceGuess = 'salles_de_formation';
    else if (method.includes('TrainingCenters')) resourceGuess = 'centres_de_formation';
    else if (method.includes('TimeSlots')) resourceGuess = 'creneaux';
    else if (method.includes('Steps')) resourceGuess = 'etapes';
    else if (method.includes('Laps')) resourceGuess = 'laps';
    else if (method.includes('Lafs')) resourceGuess = 'lafs';
    else if (method.includes('Laes')) resourceGuess = 'laes';
    else if (method.includes('Lcfs')) resourceGuess = 'lcfs';
    else if (method.includes('Satisfaction')) resourceGuess = 'reponses_questionnaire_satisfaction';
    else if (method.includes('SessionsPermanentes')) resourceGuess = 'sessions_permanentes';
    else if (method.includes('CataloguePublic')) resourceGuess = 'catalogue_prochaines_sessions';
    
    console.log(`   ${(index + 1).toString().padStart(2)}. ${method} -> likely for resource: ${resourceGuess}`);
});

// 5. Vérifier si ces ressources ont des ResourceLocators pour "Get Many"
console.log(`\n🔍 CHECKING RESOURCE LOCATOR USAGE FOR "GET MANY":`);

// Extraire tous les ResourceLocators avec leur resource et operation
const resourceLocatorMatches = nodeContent.match(/\{[^}]*displayName:[^}]*resource:\s*\[[^\]]*\][^}]*operation:\s*\[[^\]]*'get'[^\]]*\][^}]*searchListMethod:[^}]*\}/g);

if (resourceLocatorMatches) {
    console.log(`\nFound ${resourceLocatorMatches.length} ResourceLocators for GET operations:`);
    resourceLocatorMatches.forEach((match, index) => {
        const resourceMatch = match.match(/resource:\s*\[([^\]]+)\]/);
        const methodMatch = match.match(/searchListMethod:\s*'([^']+)'/);
        const displayNameMatch = match.match(/displayName:\s*'([^']+)'/);
        
        if (resourceMatch && methodMatch && displayNameMatch) {
            const resources = resourceMatch[1].replace(/'/g, '').split(',').map(r => r.trim());
            const method = methodMatch[1];
            const displayName = displayNameMatch[1];
            
            console.log(`   ${(index + 1).toString().padStart(2)}. "${displayName}" -> resources: [${resources.join(', ')}] -> method: ${method}`);
        }
    });
} else {
    console.log('\n❌ No ResourceLocators found for GET operations');
}

// 6. Analyser les ressources sans ResourceLocator pour "Get Many"
const allResources = ['entreprises', 'contacts', 'modules', 'actions_de_formation', 'participants', 'factures', 'categories_module', 'categories_produit', 'centres_de_formation', 'salles_de_formation', 'creneaux', 'etapes', 'sessions_permanentes', 'catalogue_prochaines_sessions'];

console.log(`\n⚠️  RESOURCES POSSIBLY MISSING GET MANY RESOURCE LOCATORS:`);
allResources.forEach(resource => {
    const hasResourceLocator = nodeContent.includes(`resource: ['${resource}']`) && 
                               nodeContent.includes(`operation: ['get']`) ||
                               nodeContent.includes(`resource: [${resource}]`) ||
                               nodeContent.includes(`'${resource}'`) && nodeContent.includes("operation: ['get']");
    
    if (!hasResourceLocator) {
        console.log(`   ❌ ${resource} - may be missing ResourceLocator for Get Many`);
    }
});

console.log(`\n✅ SUMMARY:`);
console.log(`   - Total listSearch methods: ${listSearchMethods.length}`);
console.log(`   - Used in ResourceLocators: ${usedMethods.length}`);
console.log(`   - Unused methods: ${unusedMethods.length}`);
console.log(`\n🎯 RECOMMENDATION:`);
if (unusedMethods.length > 0) {
    console.log(`   Add ResourceLocators for GET operations using these unused methods:`);
    unusedMethods.forEach(method => {
        console.log(`   - ${method}`);
    });
}
