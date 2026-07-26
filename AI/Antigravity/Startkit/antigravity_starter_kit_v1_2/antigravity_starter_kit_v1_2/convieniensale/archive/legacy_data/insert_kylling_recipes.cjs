require('dotenv').config({path: '.env'});
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

const newRecipes = [
    {
        id: 'rec_kylling_1',
        titel: 'Kyllingefrikadeller med kold kartoffelsalat',
        billed_url: 'https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?w=800&auto=format&fit=crop&q=60',
        beskrivelse: 'Lækre, lette kyllingefrikadeller serveret med en klassisk kold kartoffelsalat.',
        instruktioner: [
            'Rør hakket kylling sejt med salt og peber.',
            'Form farsen til frikadeller og steg dem gyldne på panden.',
            'Kog kartoflerne møre og lad dem køle af.',
            'Vend kartoflerne i en dressing og server med de lune kyllingefrikadeller.'
        ],
        ingredienser: [
            { raavare_id: 'ing_hakket_kylling', navn: 'Hakket Kylling', mængde: 1, enhed: 'pakke' },
            { raavare_id: 'ing_extra_3', navn: 'Kartofler', mængde: 1, enhed: 'pose' }
        ],
        tidsforbrug_min: 35
    },
    {
        id: 'rec_kylling_2',
        titel: 'Asiatiske kyllingekødboller med frisk koriander',
        billed_url: 'https://images.unsplash.com/photo-1564834724105-918b73d1b9e0?w=800&auto=format&fit=crop&q=60',
        beskrivelse: 'Smagfulde asiatiske kødboller lavet af hakket kylling, rullet med frisk koriander og sprøde gulerødder.',
        instruktioner: [
            'Rør hakket kylling sammen med finthakket koriander og revne gulerødder.',
            'Form små kødboller og steg dem i en wok eller på panden.',
            'Tilsæt en let sojasauce og lad det simre kort.',
            'Server med frisk koriander på toppen.'
        ],
        ingredienser: [
            { raavare_id: 'ing_hakket_kylling', navn: 'Hakket Kylling', mængde: 1, enhed: 'pakke' },
            { raavare_id: 'ing_koriander', navn: 'Frisk Koriander', mængde: 1, enhed: 'bundt' },
            { raavare_id: 'ing_extra_4', navn: 'Gulerødder', mængde: 1, enhed: 'pose' }
        ],
        tidsforbrug_min: 25
    },
    {
        id: 'rec_kylling_3',
        titel: 'Kyllingeburger med guacamole og blandet salat',
        billed_url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&auto=format&fit=crop&q=60',
        beskrivelse: 'En saftig kyllingeburger med hjemmelavet guacamole og sprød salat.',
        instruktioner: [
            'Mos avocado og smag til med salt og lidt citron for at lave guacamole.',
            'Form hakket kylling til bøffer og steg dem gennemstegte på panden.',
            'Varm dine burgerboller let i ovnen.',
            'Anret burgerbollerne med blandet salat, kyllingebøf og top med guacamole.'
        ],
        ingredienser: [
            { raavare_id: 'ing_hakket_kylling', navn: 'Hakket Kylling', mængde: 1, enhed: 'pakke' },
            { raavare_id: 'ing_burgerboller', navn: 'Burgerboller', mængde: 1, enhed: 'pakke' },
            { raavare_id: 'ing_avocado', navn: 'Avocado', mængde: 2, enhed: 'stk' },
            { raavare_id: 'ing_salat_mix', navn: 'Blandet salat', mængde: 1, enhed: 'pose' }
        ],
        tidsforbrug_min: 20
    },
    {
        id: 'rec_kylling_4',
        titel: 'Kyllingefarsbrød med gulerødder og kartofler',
        billed_url: 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=800&auto=format&fit=crop&q=60',
        beskrivelse: 'Et sundt og lækkert kyllingefarsbrød skjult med rodfrugter, serveret med ovnbagte kartofler.',
        instruktioner: [
            'Riv gulerødderne groft.',
            'Bland hakket kylling med de revne gulerødder, salt og peber, og form et farsbrød i et fad.',
            'Skær kartoflerne i både og læg dem ved siden af farsbrødet i fadet.',
            'Bag det hele i ovnen ved 200 grader i ca. 45 minutter, indtil kyllingefarsbrødet er gennemstegt.'
        ],
        ingredienser: [
            { raavare_id: 'ing_hakket_kylling', navn: 'Hakket Kylling', mængde: 1, enhed: 'pakke' },
            { raavare_id: 'ing_extra_4', navn: 'Gulerødder', mængde: 1, enhed: 'pose' },
            { raavare_id: 'ing_extra_3', navn: 'Kartofler', mængde: 1, enhed: 'pose' }
        ],
        tidsforbrug_min: 55
    },
    {
        id: 'rec_kylling_5',
        titel: 'Kyllinge-tacos med salat og avocado',
        billed_url: 'https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?w=800&auto=format&fit=crop&q=60',
        beskrivelse: 'Hurtig og nem mexicansk-inspireret hverdagsmad med hakket kylling, salat og frisk avocado.',
        instruktioner: [
            'Brun hakket kylling på panden med dine yndlings tacokrydderier.',
            'Skær avocado i skiver og skyl den blandede salat.',
            'Hak frisk koriander groft.',
            'Anret tacofyldet med salat, den krydrede kylling, avocado og frisk koriander på toppen.'
        ],
        ingredienser: [
            { raavare_id: 'ing_hakket_kylling', navn: 'Hakket Kylling', mængde: 1, enhed: 'pakke' },
            { raavare_id: 'ing_avocado', navn: 'Avocado', mængde: 2, enhed: 'stk' },
            { raavare_id: 'ing_koriander', navn: 'Frisk Koriander', mængde: 1, enhed: 'bundt' },
            { raavare_id: 'ing_salat_mix', navn: 'Blandet salat', mængde: 1, enhed: 'pose' }
        ],
        tidsforbrug_min: 15
    }
];

async function run() {
    console.log("Tilføjer 5 nye opskrifter med Hakket Kylling...");
    
    const { error } = await supabase.from('recipes').upsert(newRecipes);
    if (error) {
        console.error("Fejl ved indsættelse:", error.message);
    } else {
        console.log("✅ 5 opskrifter er succesfuldt tilføjet til databasen!");
    }
}

run().catch(console.error);
