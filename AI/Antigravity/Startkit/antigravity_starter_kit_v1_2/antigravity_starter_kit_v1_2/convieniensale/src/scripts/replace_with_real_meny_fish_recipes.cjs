require('dotenv').config({path: '.env'});
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

const realMenyRecipes = [
    {
        id: 'rec_fisk_1',
        titel: 'Fiskefrikadeller med sej og hellefisk',
        billed_url: 'https://images.unsplash.com/photo-1576107232684-1279f390859f?w=800&auto=format&fit=crop&q=60',
        beskrivelse: 'Hjemmelavede fiskefrikadeller (fra Meny.dk) med lyssej, hellefisk og frisk dild.',
        instruktioner: [
            'Hak lyssej groft og skær hellefisk i små tern.',
            'Bland fiskekødet med groftrevet løg, hvedemel, æg, mælk, frisk dild og citronskal.',
            'Krydr med groft salt og hvid peber, og lad farsen trække i 15 minutter.',
            'Steg dellerne i en blanding af smør og olie ved middel varme i ca. 5 minutter på hver side.'
        ],
        ingredienser: [
            { raavare_id: 'ing_extra_23', navn: 'Fiskefars', mængde: 1, enhed: 'portion' },
            { raavare_id: 'ing_extra_10', navn: 'Løg', mængde: 1, enhed: 'stk' },
            { raavare_id: 'ing_extra_22', navn: 'Smør', mængde: 1, enhed: 'spsk' }
        ],
        tidsforbrug_min: 30
    },
    {
        id: 'rec_fisk_2',
        titel: 'Fiskefrikadeller med lime og krydderurter',
        billed_url: 'https://images.unsplash.com/photo-1559742811-822873691df8?w=800&auto=format&fit=crop&q=60',
        beskrivelse: 'Et twist på den klassiske færdigkøbte fiskefars med lime (fra Meny.dk).',
        instruktioner: [
            'Rør 800 g færdig fiskefars med revet limeskal, limesaft og hakkede krydderurter.',
            'Form dellerne med en ske dyppet i koldt vand for at få dem glatte.',
            'Steg dem ca. 4 minutter på hver side ved lav varme, indtil de har en god stegeskorpe.',
            'Server med frisk salat.'
        ],
        ingredienser: [
            { raavare_id: 'ing_extra_23', navn: 'Fiskefars', mængde: 800, enhed: 'g' },
            { raavare_id: 'ing_salat_mix', navn: 'Blandet salat', mængde: 1, enhed: 'pose' }
        ],
        tidsforbrug_min: 20
    },
    {
        id: 'rec_fisk_3',
        titel: 'Rejer i hvidløg',
        billed_url: 'https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?w=800&auto=format&fit=crop&q=60',
        beskrivelse: 'Hurtig snack eller forret med kæmperejer, hvidløg og chili (fra Meny.dk).',
        instruktioner: [
            'Varm olivenolie på en pande og tilsæt finthakket hvidløg og chili.',
            'Vend rejerne på panden i ca. 2-3 minutter indtil de skifter farve og er gennemstegte.',
            'Drys med frisk persille.',
            'Server straks med godt brød til at dyppe i olien.'
        ],
        ingredienser: [
            { raavare_id: 'ing_rejer', navn: 'Friske Rejer', mængde: 1, enhed: 'pakke' },
            { raavare_id: 'ing_extra_11', navn: 'Hvidløg', mængde: 3, enhed: 'fed' },
            { raavare_id: 'ing_frisk_chili', navn: 'Frisk Chili', mængde: 1, enhed: 'stk' }
        ],
        tidsforbrug_min: 15
    },
    {
        id: 'rec_fisk_4',
        titel: 'Avocadosalat med spicy rejer',
        billed_url: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&auto=format&fit=crop&q=60',
        beskrivelse: 'Frisk forret med grillet ciabattabrød, gedeost, avocado og stegte rejer (fra Meny.dk).',
        instruktioner: [
            'Halvér avocadoerne, fjern stenen og skær kødet i grove tern.',
            'Steg rejerne lynhurtigt på en pande med lidt frisk chili og olie.',
            'Rist brødet i ovnen eller på panden.',
            'Anret avocadoternene med blandet salat, top med spicy rejer og små stykker gedeost.'
        ],
        ingredienser: [
            { raavare_id: 'ing_avocado', navn: 'Avocado', mængde: 2, enhed: 'stk' },
            { raavare_id: 'ing_rejer', navn: 'Friske Rejer', mængde: 1, enhed: 'pakke' },
            { raavare_id: 'ing_frisk_chili', navn: 'Frisk Chili', mængde: 1, enhed: 'stk' },
            { raavare_id: 'ing_salat_mix', navn: 'Blandet salat', mængde: 1, enhed: 'pose' }
        ],
        tidsforbrug_min: 25
    },
    {
        id: 'rec_fisk_5',
        titel: 'Pad thai med rejer og æg',
        billed_url: 'https://images.unsplash.com/photo-1473093295043-cdd812d0e601?w=800&auto=format&fit=crop&q=60',
        beskrivelse: 'Klassisk thairet i wok med nudler, rejer, bønnespirer og peanuts (fra Meny.dk).',
        instruktioner: [
            'Kog nudlerne og dræn dem.',
            'Varm en wok op med olie og steg rejerne kort, tag dem derefter af panden.',
            'Slå æg ud i wokken, rør dem hurtigt sammen og tilsæt nudlerne.',
            'Vend det hele med en asiatisk sauce og bønnespirer, og top med de stegte rejer og knuste peanuts.'
        ],
        ingredienser: [
            { raavare_id: 'ing_rejer', navn: 'Friske Rejer', mængde: 1, enhed: 'pakke' },
            { raavare_id: 'ing_glutenfri_pasta', navn: 'Glutenfri Pasta (Nudler)', mængde: 1, enhed: 'pakke' },
            { raavare_id: 'ing_extra_25', navn: 'Æg', mængde: 2, enhed: 'stk' }
        ],
        tidsforbrug_min: 30
    }
];

async function run() {
    console.log("Erstatte hallucineret data med ægte opskrifter fra Meny.dk...");
    const { error } = await supabase.from('recipes').upsert(realMenyRecipes);
    if (error) {
        console.error("Fejl ved indsættelse:", error.message);
    } else {
        console.log("✅ De 5 rigtige Meny-opskrifter overskrev de falske!");
    }
}

run().catch(console.error);
