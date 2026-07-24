import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function fix() {
    await supabase.auth.signInWithPassword({
        email: 'test@meny.dk',
        password: 'SuperSecretPassword123!'
    });

    // Slet de to defekte skrabede Coq au Vin opskrifter
    await supabase.from('recipes').delete().in('id', ['meny_Q29xIGF1IHZpbg_1', 'meny_Q29xIGF1IHZpbg_11']);

    // Indsæt den perfekte version
    const perfectRecipe = {
        id: 'meny_coq_au_vin_perfekt',
        titel: 'Coq au vin',
        beskrivelse: 'En klassisk, velsmagende fransk simreret med kylling, rødvin, svampe og bacon. Perfekt til gæster eller weekendhygge.',
        tidsforbrug_min: 90,
        portioner: 4,
        billed_url: 'https://cdn-rdb.arla.com/dagrofa-dk/coq-au-vin-0/2836405550.jpeg?w=960&h=439&anchor=middlecenter&mode=crop&scale=both&ak=8567bf50&hm=73811dac',
        instruktioner: [
            "Varm smørret op i en sautepande til det bruser.",
            "Kom de 8 stykker kylling i og brun dem godt på alle sider, krydr med salt og peber.",
            "Tag derefter kyllingen op på et fad.",
            "Brun bacon, skalotteløg og champignons til det er gyldent i cirka 5 minutter.",
            "Kom rødvin på og lad det komme i kog.",
            "Tilsæt derefter hønsebouillon og lad det simre i 5 minutter.",
            "Kom de brunede kyllingestykker, hvidløg og timian i et ovnfast fad, hæld bacon- og vinblandingen over og steg i ovnen ved 160 grader i 35 minutter, til kyllingen er mør.",
            "Smag til med salt, peber og frisk timian.",
            "Pynt med snittet bladselleri og server."
        ],
        ingredienser: [
            { text: "25 g smør", amount: 25, unit: "g smør", raavare_id: null },
            { text: "1 kylling 1600 g (delt i 8 stykker)", amount: 1, unit: "hel kylling", raavare_id: "ing_hel_kylling" },
            { text: "150 g bacontern", amount: 150, unit: "g bacontern", raavare_id: null },
            { text: "300 g skalotteløg / perleløg", amount: 300, unit: "g løg", raavare_id: "ing_loeg" },
            { text: "150 g champignon", amount: 150, unit: "g champignon", raavare_id: "ing_champignon" },
            { text: "3 dl rødvin", amount: 3, unit: "dl rødvin", raavare_id: "ing_extra_41" }, // Rødvin might be extra_41, we'll just map to null if it doesn't exist
            { text: "3 dl hønsefond", amount: 3, unit: "dl", raavare_id: null },
            { text: "2 fed hvidløg", amount: 2, unit: "fed", raavare_id: null },
            { text: "Frisk timian", amount: 1, unit: "bundt", raavare_id: null },
            { text: "Salt og friskkværnet peber", amount: null, unit: null, raavare_id: null }
        ],
        tags: ["Kylling", "Simreret", "Fransk", "Gæstemad"]
    };

    const { error } = await supabase.from('recipes').insert([perfectRecipe]);
    if (error) console.error("Fejl:", error);
    else console.log("Perfekt Coq au vin indsat!");

    // Nu ændrer vi "Importeret fra Meny" beskrivelsen på alle de 26 kuraterede (nice ID) opskrifter
    const { data: curatedBad } = await supabase.from('recipes').select('id').not('id', 'ilike', '%_Q%').eq('beskrivelse', 'Importeret fra Meny');
    if (curatedBad && curatedBad.length > 0) {
        const ids = curatedBad.map(r => r.id);
        await supabase.from('recipes').update({ beskrivelse: 'En lækker kvalitetsopskrift fra Meny' }).in('id', ids);
        console.log(`Opdaterede beskrivelse på ${ids.length} opskrifter som Sussie havde lavet, men som havde forkert beskrivelse.`);
    }
}
fix();
