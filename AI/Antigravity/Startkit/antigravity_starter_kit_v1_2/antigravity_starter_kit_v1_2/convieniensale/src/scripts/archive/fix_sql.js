import fs from 'fs';
const path = 'C:/Users/birgi/.gemini/antigravity/brain/022f7582-d5ab-4f47-8508-71d318cfff35/dagrofa_recipes_update.sql';

let data = fs.readFileSync(path, 'utf8');
let counter = 1;

// Find all matches for VALUES ('meny_...
data = data.replace(/VALUES \('meny_([a-zA-Z0-9_]+)'/g, (match, p1) => {
    return `VALUES ('meny_${p1}_${counter++}'`;
});

fs.writeFileSync(path, data, 'utf8');
console.log('Fixed IDs!');
