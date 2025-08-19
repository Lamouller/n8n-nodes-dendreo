const https = require('https');

// Configuration - utilise les credentials fournis
const config = {
    slug: 'efco_formation',
    apiKey: 'bppsyVg1LsEth21XGoBo'
};

async function testCategoriesEndpoint() {
    const url = `https://pro.dendreo.com/${config.slug}/api/categories_produit.php?key=${config.apiKey}&limit=5`;
    
    console.log(`🔍 Testing categories_produit endpoint:`);
    console.log(`📡 URL: ${url}`);
    
    try {
        const response = await fetch(url);
        console.log(`📊 Status: ${response.status} ${response.statusText}`);
        
        if (response.ok) {
            const data = await response.json();
            console.log(`✅ Success! Found ${Array.isArray(data) ? data.length : 'unknown'} items`);
            
            if (Array.isArray(data) && data.length > 0) {
                console.log(`🎯 Sample data:`, JSON.stringify(data[0], null, 2));
            } else {
                console.log(`📋 Raw response:`, JSON.stringify(data, null, 2));
            }
        } else {
            const errorText = await response.text();
            console.log(`❌ Error response:`, errorText);
        }
    } catch (error) {
        console.log(`💥 Request failed:`, error.message);
    }
}

// Test avec Node.js 18+ fetch
if (typeof fetch !== 'undefined') {
    testCategoriesEndpoint();
} else {
    // Fallback pour Node.js plus ancien
    console.log('❌ This script requires Node.js 18+ with fetch support');
    console.log('Or run: curl "' + `https://pro.dendreo.com/${config.slug}/api/categories_produit.php?key=${config.apiKey}&limit=5` + '"');
}
