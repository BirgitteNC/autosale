const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env' });

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function insertRecipe() {
    const recipe = {
        id: "meny_" + Date.now(),
        titel: "Tærte med rødløg, spinat, skinke og timian",
        beskrivelse: "",
        billed_url: "https://meny.dk/sites/meny.dk/files/styles/recipe_image/public/recipe/tarte-rodlog-spinat-skinke-og-timian.jpg",
        ingredienser: [
            { navn: "Tærtedej", mængde: 1, enhed: "rulle", raavare_id: "ing_taertedej" },
            { navn: "Skinke", mængde: 150, enhed: "g", raavare_id: "ing_skinke" },
            { navn: "Spinat", mængde: 100, enhed: "g", raavare_id: "ing_spinat" },
            { navn: "Rødløg", mængde: 2, enhed: "stk", raavare_id: "ing_loeg" },
            { navn: "Timian", mængde: 1, enhed: "bdt", raavare_id: null },
            { navn: "Æg", mængde: 4, enhed: "stk", raavare_id: "ing_extra_28" },
            { navn: "Mælk", mængde: 2, enhed: "dl", raavare_id: "ing_extra_29" }
        ],
        instruktioner: [
            "Rul tærtedejen ud i en tærteform.",
            "Fordel skinke, spinat og rødløg over dejen.",
            "Pisk æg og mælk sammen med lidt salt, peber og timian, og hæld det over fyldet.",
            "Bag tærten midt i ovnen ved 200 grader i ca. 30-35 minutter til den er gylden."
        ],
        tags: ["Hovedret", "Aftensmad", "Nem"]
    };

    const { error } = await supabase.from('recipes').insert([recipe]);
    console.log("Inserted:", error ? error : "Success");
}

insertRecipe();
