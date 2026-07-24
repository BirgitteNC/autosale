require('dotenv').config({path: '.env'});
const { createClient } = require('@supabase/supabase-js');
const https = require('https');

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

function checkImage(url) {
    return new Promise((resolve) => {
        if (!url || !url.startsWith('http')) return resolve(false);
        https.request(url, { method: 'HEAD' }, (res) => {
            resolve(res.statusCode >= 200 && res.statusCode < 400);
        }).on('error', () => resolve(false)).end();
    });
}

async function run() {
    const { data: recipes } = await supabase.from('recipes').select('id, titel, billed_url');
    let badImages = [];
    
    for (const r of recipes) {
        if (!r.billed_url) {
            badImages.push({ id: r.id, titel: r.titel, url: 'MISSING' });
            continue;
        }
        const isValid = await checkImage(r.billed_url);
        if (!isValid) {
            badImages.push({ id: r.id, titel: r.titel, url: r.billed_url });
        }
    }
    
    console.log("Dårlige eller manglende billeder:");
    console.log(badImages);
}

run();
