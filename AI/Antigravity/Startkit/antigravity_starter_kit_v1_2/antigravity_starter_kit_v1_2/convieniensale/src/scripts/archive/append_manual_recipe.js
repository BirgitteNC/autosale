import fs from 'fs';

const path = 'C:/Users/birgi/.gemini/antigravity/brain/022f7582-d5ab-4f47-8508-71d318cfff35/dagrofa_recipes_update.sql';

// Læs eksisterende
let data = fs.readFileSync('insert_recipes.sql', 'utf8');

// Sørg for unikke IDs for alle eksisterende
let counter = 1;
data = data.replace(/VALUES \('meny_([a-zA-Z0-9_]+)'/g, (match, p1) => {
    return `VALUES ('meny_${p1}_${counter++}'`;
});

// Tilføj den manuelle opskrift (med helt rent JSON!)
const manualRecipe = `
INSERT INTO recipes (id, titel, beskrivelse, billed_url, portioner, tidsforbrug_min, instruktioner, ingredienser, tags) VALUES ('meny_hakkeboef_kartofler_manual', 'Hakkebøf med bløde løg og kartofler', 'Klassisk dansk hverdagsret - fra Meny', '', 4, 30, '["1. Form kødet til 4 bøffer.","2. Kog kartoflerne.","3. Steg løg bløde.","4. Steg bøfferne og server."]'::jsonb, '[{"raavare_id":"ing_hakket_okse","amount":500,"unit":"g","text":"500g hakket oksekød"},{"raavare_id":"ing_extra_3","amount":1,"unit":"kg","text":"1 kg kartofler"},{"raavare_id":"ing_loeg","amount":3,"unit":"stk","text":"3 stk løg"}]'::jsonb, '["Aftensmad", "Dansk", "Hverdag"]'::jsonb);
`;

data += manualRecipe;

// Skriv den endelige fil
fs.writeFileSync(path, data, 'utf8');
console.log('✅ Genereret dagrofa_recipes_update.sql med unikke IDs og gyldig JSON');
