require('dotenv').config({path: '.env'});
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

const newRecipes = [
    {
        id: 'rec_fisk_1',
        titel: 'Hjemmelavede fiskefrikadeller med rodfrugtfritter',
        billed_url: 'https://images.unsplash.com/photo-1599339023604-5853ee2cbb3e?w=800&auto=format&fit=crop&q=60',
        beskrivelse: 'Klassiske danske fiskefrikadeller serveret med sprøde ovnbagte rodfrugtfritter.',
        instruktioner: [
            'Rør fiskefarsen godt igennem.',
            'Form farsen til frikadeller og steg dem gyldne på en pande i smør og olie.',
            'Skær kartofler og gulerødder i tykke stave.',
            'Vend rodfrugterne i olie, salt og peber, og bag dem i ovnen ved 200 grader indtil de er sprøde.'
        ],
        ingredienser: [
            { raavare_id: 'ing_extra_23', navn: 'Fiskefars', mængde: 1, enhed: 'pakke' },
            { raavare_id: 'ing_extra_3', navn: 'Kartofler', mængde: 1, enhed: 'pose' },
            { raavare_id: 'ing_extra_4', navn: 'Gulerødder', mængde: 1, enhed: 'pose' }
        ],
        tidsforbrug_min: 40
    },
    {
        id: 'rec_fisk_2',
        titel: 'Fiskeburger med rejer og salat',
        billed_url: 'https://images.unsplash.com/photo-1596622527585-1d48c82eb5c7?w=800&auto=format&fit=crop&q=60',
        beskrivelse: 'En luksuriøs burger med en sprødstegt fiskebøf, friske rejer og sprød salat.',
        instruktioner: [
            'Form en bøf af fiskefarsen og steg den lækker og gylden på panden.',
            'Lun burgerbollerne i ovnen.',
            'Pil og klargør de friske rejer.',
            'Anret burgeren med blandet salat, fiskebøffen og top med de friske rejer og evt. lidt dressing.'
        ],
        ingredienser: [
            { raavare_id: 'ing_extra_23', navn: 'Fiskefars', mængde: 1, enhed: 'pakke' },
            { raavare_id: 'ing_rejer', navn: 'Friske Rejer', mængde: 1, enhed: 'pakke' },
            { raavare_id: 'ing_burgerboller', navn: 'Burgerboller', mængde: 1, enhed: 'pakke' },
            { raavare_id: 'ing_salat_mix', navn: 'Blandet salat', mængde: 1, enhed: 'pose' }
        ],
        tidsforbrug_min: 25
    },
    {
        id: 'rec_fisk_3',
        titel: 'Klassisk Rejecocktail med avocado',
        billed_url: 'https://images.unsplash.com/photo-1563514972559-99447e1712a2?w=800&auto=format&fit=crop&q=60',
        beskrivelse: 'En lækker og elegant forret med rejer, cremet avocado og sprød salat.',
        instruktioner: [
            'Hæld væden fra rejerne i lage og lad dem dryppe af.',
            'Halvér avocadoen, fjern stenen og skær kødet i små tern.',
            'Skyl og slyng den blandede salat.',
            'Anret salaten i fine glas, fordel avocado og top med rejerne.'
        ],
        ingredienser: [
            { raavare_id: 'ing_extra_24', navn: 'Rejer i lage', mængde: 1, enhed: 'bøtte' },
            { raavare_id: 'ing_avocado', navn: 'Avocado', mængde: 2, enhed: 'stk' },
            { raavare_id: 'ing_salat_mix', navn: 'Blandet salat', mængde: 1, enhed: 'pose' }
        ],
        tidsforbrug_min: 15
    },
    {
        id: 'rec_fisk_4',
        titel: 'Asiatiske fiskedeller med chili og koriander',
        billed_url: 'https://images.unsplash.com/photo-1541529086526-db283c563270?w=800&auto=format&fit=crop&q=60',
        beskrivelse: 'Pift de klassiske fiskefrikadeller op med friske asiatiske smagsgivere som chili og hvidløg.',
        instruktioner: [
            'Hak chili, hvidløg og koriander fint.',
            'Rør det hele sammen med fiskefarsen.',
            'Form små frikadeller og steg dem i lidt olie på panden indtil de er faste og gyldne.',
            'Server straks, evt. med lidt asiatisk chilisovs.'
        ],
        ingredienser: [
            { raavare_id: 'ing_extra_23', navn: 'Fiskefars', mængde: 1, enhed: 'pakke' },
            { raavare_id: 'ing_frisk_chili', navn: 'Frisk Chili', mængde: 1, enhed: 'stk' },
            { raavare_id: 'ing_extra_11', navn: 'Hvidløg', mængde: 1, enhed: 'fed' },
            { raavare_id: 'ing_koriander', navn: 'Frisk Koriander', mængde: 1, enhed: 'bundt' }
        ],
        tidsforbrug_min: 25
    },
    {
        id: 'rec_fisk_5',
        titel: 'Pasta med friske rejer og hvidløg',
        billed_url: 'https://images.unsplash.com/photo-1563379926898-05f4575a45d8?w=800&auto=format&fit=crop&q=60',
        beskrivelse: 'En simpel men uimodståelig pastaret med friske rejer og intens hvidløgssmag.',
        instruktioner: [
            'Kog pastaen efter anvisningen på pakken.',
            'Hak hvidløget fint og sauter det let i lidt olivenolie på en pande.',
            'Tilsæt de friske rejer og vend dem hurtigt indtil de skifter farve.',
            'Vend den nykogte pasta i panden med rejerne og server med det samme.'
        ],
        ingredienser: [
            { raavare_id: 'ing_rejer', navn: 'Friske Rejer', mængde: 1, enhed: 'pakke' },
            { raavare_id: 'ing_glutenfri_pasta', navn: 'Glutenfri Pasta', mængde: 1, enhed: 'pakke' },
            { raavare_id: 'ing_extra_11', navn: 'Hvidløg', mængde: 1, enhed: 'fed' }
        ],
        tidsforbrug_min: 20
    }
];

async function run() {
    console.log("Tilføjer 5 nye opskrifter med Fiskefars og Rejer...");
    
    const { error } = await supabase.from('recipes').upsert(newRecipes);
    if (error) {
        console.error("Fejl ved indsættelse:", error.message);
    } else {
        console.log("✅ 5 fiske- og rejeopskrifter er succesfuldt tilføjet til databasen!");
    }
}

run().catch(console.error);
