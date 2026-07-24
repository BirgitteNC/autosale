import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
// For inserting, we might need service role, but if RLS allows anon insert or we can bypass it...
// Wait, RLS is enabled. If anon can't insert, this will fail. Let's try it first.
// If it fails, we will output SQL for the user to run, or use an RPC if available.
const supabase = createClient(supabaseUrl, supabaseKey);

async function addFish() {
    console.log("Adding Fish ingredients...");
    const ingredients = [
        { id: 'ing_laks', navn: 'Laksefilet', kategori: 'Fisk & Skaldyr', allergener: ['fisk'], standard_vare: false },
        { id: 'ing_torsk', navn: 'Torskefilet', kategori: 'Fisk & Skaldyr', allergener: ['fisk'], standard_vare: false },
        { id: 'ing_citron', navn: 'Økologisk Citron', kategori: 'Frugt & Grønt', allergener: [], standard_vare: false },
        { id: 'ing_persille', navn: 'Frisk Persille', kategori: 'Frugt & Grønt', allergener: [], standard_vare: false }
    ];

    for (const ing of ingredients) {
        const { error } = await supabase.from('ingredients').upsert(ing);
        if (error) console.error("Error inserting ingredient:", ing.id, error.message);
        else console.log(`Inserted ingredient: ${ing.navn}`);
    }

    console.log("Adding Fish recipes...");
    const recipes = [
        {
            id: 'meny_ovnbagt_laks',
            titel: 'Ovnbagt laks med citron og sprøde grøntsager',
            beskrivelse: 'En lynhurtig og velsmagende fiskeret, der stort set passer sig selv i ovnen. Perfekt til en sund hverdag!',
            billed_url: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?q=80&w=960&auto=format&fit=crop',
            portioner: 4,
            tidsforbrug_min: 25,
            instruktioner: [
                "Tænd ovnen på 200 grader.",
                "Læg laksefileterne i et smurt ildfast fad. Krydr med salt og peber.",
                "Skær citronen i skiver og læg et par stykker oven på hver laks.",
                "Bag laksen i ovnen i ca. 12-15 minutter (afhængig af tykkelse).",
                "Server med kogte kartofler eller en frisk salat."
            ],
            ingredienser: [
                { raavare_id: 'ing_laks', amount: 4, unit: 'stk', text: 'Laksefilet (ca. 125g pr. stk)' },
                { raavare_id: 'ing_citron', amount: 1, unit: 'stk', text: 'Økologisk Citron' },
                { raavare_id: 'ing_extra_3', amount: 800, unit: 'g', text: 'Kartofler' }
            ],
            tags: ['Fisk', 'Hovedret', 'Sundt', 'Hurtig']
        },
        {
            id: 'meny_smorstegt_torsk',
            titel: 'Smørstegt torsk med persillesovs og kartofler',
            beskrivelse: 'Klassisk dansk hverdagsmad når det er bedst. Den milde torsk og den cremede sovs er et kæmpe hit.',
            billed_url: 'https://images.unsplash.com/photo-1599084993091-1cb5c0721cc6?q=80&w=960&auto=format&fit=crop',
            portioner: 4,
            tidsforbrug_min: 30,
            instruktioner: [
                "Kog kartoflerne møre i letsaltet vand.",
                "Lav en opbagning af smør og mel i en gryde, spæd op med mælk til en cremet sovs. Vend hakket persille i og smag til med salt og peber.",
                "Krydr torskefileterne med salt og peber.",
                "Steg torsken på en varm pande i halvt smør/halvt olie i ca. 3-4 minutter på hver side, indtil den flager let.",
                "Anret torsken med kartofler og rigelig persillesovs."
            ],
            ingredienser: [
                { raavare_id: 'ing_torsk', amount: 600, unit: 'g', text: 'Torskefilet' },
                { raavare_id: 'ing_persille', amount: 1, unit: 'bdt', text: 'Frisk Persille' },
                { raavare_id: 'ing_extra_3', amount: 800, unit: 'g', text: 'Kartofler' },
                { raavare_id: null, amount: 0.5, unit: 'L', text: 'Mælk (til sovs)' }
            ],
            tags: ['Fisk', 'Hovedret', 'Dansk Klassiker']
        }
    ];

    for (const rec of recipes) {
        const { error } = await supabase.from('recipes').upsert(rec);
        if (error) console.error("Error inserting recipe:", rec.id, error.message);
        else console.log(`Inserted recipe: ${rec.titel}`);
    }

    console.log("Done.");
}

addFish();
