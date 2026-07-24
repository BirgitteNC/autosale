import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function insertMissingData() {
    console.log("🛠️ Starter holistisk datarettelse (Fisk & Skaldyr + Bageri)...");

    // 1. Opret Råvarer (Fisk & Skaldyr)
    const fishIngs = [
        { id: 'ing_laks', navn: 'Laksefilet', kategori: 'Fisk & Skaldyr', allergener: ['fisk'], standard_vare: false },
        { id: 'ing_torsk', navn: 'Torskefilet', kategori: 'Fisk & Skaldyr', allergener: ['fisk'], standard_vare: false },
        { id: 'ing_citron', navn: 'Økologisk Citron', kategori: 'Frugt & Grønt', allergener: [], standard_vare: false },
        { id: 'ing_persille', navn: 'Frisk Persille', kategori: 'Frugt & Grønt', allergener: [], standard_vare: false }
    ];

    // 2. Opret Råvarer (Bageri)
    const bakeryIngs = [
        { id: 'ing_flutes', navn: 'Friskbagt Flutes', kategori: 'Bageri', allergener: ['gluten'], standard_vare: false },
        { id: 'ing_toastbrod', navn: 'Toastbrød', kategori: 'Bageri', allergener: ['gluten'], standard_vare: false },
        { id: 'ing_skinke', navn: 'Kogt Skinke', kategori: 'Kød', allergener: [], standard_vare: false },
        { id: 'ing_ost', navn: 'Skæreost', kategori: 'Mejeri', allergener: ['laktose'], standard_vare: false },
        { id: 'ing_tomat', navn: 'Friske Tomater', kategori: 'Frugt & Grønt', allergener: [], standard_vare: false }
    ];

    const allIngs = [...fishIngs, ...bakeryIngs];

    for (const ing of allIngs) {
        const { error } = await supabase.from('ingredients').upsert(ing);
        if (error) console.error("Fejl ved indsættelse af råvare:", ing.id, error.message);
        else console.log(`✅ Indsat Råvare: ${ing.navn}`);
    }

    // 3. Opret Opskrifter
    const recipes = [
        // Fisk Opskrifter
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
        },
        // Bageri Opskrifter
        {
            id: 'meny_bruschetta',
            titel: 'Klassisk Bruschetta med tomat og hvidløg',
            beskrivelse: 'En vidunderlig og nem forret, eller den perfekte måde at bruge en rest friskbagt flutes på, inden det bliver tørt.',
            billed_url: 'https://images.unsplash.com/photo-1572695157366-5e585ab2b69f?q=80&w=960&auto=format&fit=crop',
            portioner: 4,
            tidsforbrug_min: 15,
            instruktioner: [
                "Skær flutes i skiver og rist dem sprøde i ovnen eller på en brødrister.",
                "Skær tomaterne i fine tern og vend med lidt olivenolie, salt og peber.",
                "Gnid de ristede brød med et overskåret hvidløgsfed.",
                "Anret de hakkede tomater på toppen af brødene og server straks."
            ],
            ingredienser: [
                { raavare_id: 'ing_flutes', amount: 1, unit: 'stk', text: 'Friskbagt Flutes' },
                { raavare_id: 'ing_tomat', amount: 4, unit: 'stk', text: 'Friske Tomater' },
                { raavare_id: null, amount: 2, unit: 'fed', text: 'Hvidløg' },
                { raavare_id: null, amount: 2, unit: 'spsk', text: 'Olivenolie' }
            ],
            tags: ['Forret', 'Vegetar', 'Stop Madspild']
        },
        {
            id: 'meny_luksus_toast',
            titel: 'Sprød luksus toast med skinke og ost',
            beskrivelse: 'Ikke bare en almindelig toast. Med godt brød, ægte skinke og rigelig ost, bliver dette et fantastisk hurtigt måltid.',
            billed_url: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?q=80&w=960&auto=format&fit=crop',
            portioner: 2,
            tidsforbrug_min: 10,
            instruktioner: [
                "Smør brødskiverne med lidt smør på ydersiden.",
                "Læg skinke og to skiver ost imellem to stykker brød.",
                "Steg dem gyldne på en pande ved middel varme, til osten er smeltet, eller brug en toastmaskine.",
                "Server med en håndfuld friske grøntsager on the side."
            ],
            ingredienser: [
                { raavare_id: 'ing_toastbrod', amount: 4, unit: 'skiver', text: 'Toastbrød' },
                { raavare_id: 'ing_skinke', amount: 2, unit: 'skiver', text: 'Kogt Skinke' },
                { raavare_id: 'ing_ost', amount: 4, unit: 'skiver', text: 'Skæreost' }
            ],
            tags: ['Frokost', 'Hurtig', 'Børnevenlig']
        }
    ];

    for (const rec of recipes) {
        const { error } = await supabase.from('recipes').upsert(rec);
        if (error) console.error("Fejl ved indsættelse af opskrift:", rec.id, error.message);
        else console.log(`✅ Indsat Opskrift: ${rec.titel}`);
    }

    console.log("\n🎯 Data udbedring fuldført!");
}

insertMissingData();
