const fs = require('fs');

// Lire le fichier du node
const nodeContent = fs.readFileSync('/Users/trystanlamouller/Github_Lamouller/Dendreo_Node/n8n-nodes-dendreo/nodes/DendreoEnhanced.node.ts', 'utf8');

console.log('🔍 ANALYSE DES ENDPOINTS ET MÉTHODES LISTSEARCH\n');

// 1. Extraire toutes les ressources disponibles
const resourceMatches = nodeContent.match(/{ name: '([^']+)', value: '([^']+)' }/g);
const resources = [];
if (resourceMatches) {
    resourceMatches.forEach(match => {
        const nameMatch = match.match(/name: '([^']+)'/);
        const valueMatch = match.match(/value: '([^']+)'/);
        if (nameMatch && valueMatch) {
            resources.push({
                name: nameMatch[1],
                value: valueMatch[1]
            });
        }
    });
}

console.log(`📋 RESSOURCES TROUVÉES (${resources.length}) :`);
resources.forEach((res, i) => {
    console.log(`${(i+1).toString().padStart(2)}. ${res.value.padEnd(35)} → ${res.name}`);
});

// 2. Extraire toutes les méthodes listSearch
const listSearchMatches = nodeContent.match(/async get[A-Z][a-zA-Z]*\(/g);
const listSearchMethods = [];
if (listSearchMatches) {
    listSearchMatches.forEach(match => {
        const methodName = match.replace('async ', '').replace('(', '');
        listSearchMethods.push(methodName);
    });
}

console.log(`\n🔧 MÉTHODES LISTSEARCH TROUVÉES (${listSearchMethods.length}) :`);
listSearchMethods.forEach((method, i) => {
    console.log(`${(i+1).toString().padStart(2)}. ${method}`);
});

// 3. Analyser les correspondances
console.log('\n⚠️ ANALYSE DES CORRESPONDANCES :\n');

const expectedMethods = {
    'actions_de_formation': 'getTrainingActions',
    'categories_module': 'getCategoriesModule', 
    'categories_produit': 'getCategoriesProduit',
    'catalogue_prochaines_sessions': 'getCataloguePublicSessions',
    'centres_de_formation': 'getTrainingCenters',
    'contacts': 'getContacts',
    'creneaux': 'getTimeSlots',
    'entreprises': 'getCompanies',
    'etapes': 'getSteps',
    'factures': 'getInvoices',
    'formateurs': 'getTrainers',
    'laps': 'getLaps',
    'lafs': 'getLafs', 
    'laes': 'getLaes',
    'lcfs': 'getLcfs',
    'modules': 'getModules',
    'participants': 'getParticipants',
    'reponses_questionnaire_satisfaction': 'getSatisfactionSurveys',
    'salles_de_formation': 'getTrainingRooms',
    'sessions_permanentes': 'getSessionsPermanentes'
};

const missingMethods = [];
const extraMethods = [];

// Vérifier les méthodes manquantes
resources.forEach(resource => {
    const expectedMethod = expectedMethods[resource.value];
    if (expectedMethod && !listSearchMethods.includes(expectedMethod)) {
        missingMethods.push({
            resource: resource.value,
            name: resource.name,
            expectedMethod: expectedMethod
        });
    }
});

// Vérifier les méthodes en trop
const expectedMethodValues = Object.values(expectedMethods);
listSearchMethods.forEach(method => {
    if (!expectedMethodValues.includes(method)) {
        extraMethods.push(method);
    }
});

console.log('❌ MÉTHODES LISTSEARCH MANQUANTES :');
if (missingMethods.length === 0) {
    console.log('   ✅ Aucune méthode manquante !');
} else {
    missingMethods.forEach((missing, i) => {
        console.log(`${(i+1).toString().padStart(2)}. ${missing.resource.padEnd(35)} → Manque: ${missing.expectedMethod}`);
    });
}

console.log('\n🔍 MÉTHODES EXTRA (non attendues) :');
if (extraMethods.length === 0) {
    console.log('   ✅ Aucune méthode extra !');
} else {
    extraMethods.forEach((extra, i) => {
        console.log(`${(i+1).toString().padStart(2)}. ${extra}`);
    });
}

// 4. Vérifier les ResourceLocators dans les propriétés
console.log('\n🎯 VÉRIFICATION DES RESOURCELOCATORS :\n');

const resourceLocatorMatches = nodeContent.match(/loadOptionsMethod:\s*'([^']+)'/g);
const usedResourceLocators = [];
if (resourceLocatorMatches) {
    resourceLocatorMatches.forEach(match => {
        const methodMatch = match.match(/loadOptionsMethod:\s*'([^']+)'/);
        if (methodMatch) {
            usedResourceLocators.push(methodMatch[1]);
        }
    });
}

console.log(`📋 RESOURCELOCATORS UTILISÉS (${usedResourceLocators.length}) :`);
usedResourceLocators.forEach((locator, i) => {
    console.log(`${(i+1).toString().padStart(2)}. ${locator}`);
});

// Vérifier si tous les ResourceLocators ont une méthode correspondante
console.log('\n❌ RESOURCELOCATORS SANS MÉTHODE :');
const orphanLocators = usedResourceLocators.filter(locator => !listSearchMethods.includes(locator));
if (orphanLocators.length === 0) {
    console.log('   ✅ Tous les ResourceLocators ont une méthode !');
} else {
    orphanLocators.forEach((orphan, i) => {
        console.log(`${(i+1).toString().padStart(2)}. ${orphan} - MÉTHODE MANQUANTE !`);
    });
}

console.log('\n🎯 RÉSUMÉ :');
console.log(`   📋 Ressources totales: ${resources.length}`);
console.log(`   🔧 Méthodes listSearch: ${listSearchMethods.length}`);
console.log(`   ❌ Méthodes manquantes: ${missingMethods.length}`);
console.log(`   🔍 Méthodes extra: ${extraMethods.length}`);
console.log(`   📍 ResourceLocators orphelins: ${orphanLocators.length}`);
