import fs from 'fs';

const ingMap = {
  hakket_gris: 'ing_hakket_gris',
  hakket_okse: 'ing_hakket_okse',
  hakket_kylling: 'ing_hakket_kylling', 
  fiskefars: 'ing_extra_23',
  laks: 'ing_laks',
  torsk: 'ing_torsk',
  torskefileter: 'ing_extra_21',
  loeg: 'ing_loeg',
  hvidloeg: 'ing_extra_11',
  spidskaal: 'ing_spidskaal',
  gulerod: 'ing_extra_4',
  citron: 'ing_citron',
  kartofler: 'ing_extra_3',
  flutes: 'ing_flutes',
  baguette: 'ing_baguette',
  tomat: 'ing_tomat',
  hakket_tomat: 'ing_tomatsovs',
  pasta: 'ing_pasta',
  ris: 'ing_ris',
  peberfrugt: 'ing_peberfrugt',
  champignon: 'ing_champignon',
  spinat: 'ing_extra_9',
  broccoli: 'ing_broccoli',
  kokosmaelk: 'ing_kokosmaelk',
  karry: 'ing_karry',
  soja: 'ing_soja',
  chili: 'ing_frisk_chili',
  foraarssloeg: 'ing_foraarssloeg',
  revet_ost: 'ing_ost',
  aeg: 'ing_aeg',
  flode: 'ing_floede',
  kikarter: 'ing_kikrter',
  linser: 'ing_linser',
  aubergine: 'ing_aubergine',
  squash: 'ing_squash',
  persille: 'ing_persille'
};

const recipesToInsert = [];

function createRecipe(id, titel, beskrivelse, ings, tags, img) {
    const ingredienser = ings.map(i => ({
        raavare_id: i.id,
        amount: i.amount || 1,
        unit: i.unit || 'stk',
        text: i.text || 'Råvare'
    }));

    recipesToInsert.push({
        id: `meny_massive_${id}`,
        titel,
        beskrivelse,
        billed_url: img || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=960&auto=format&fit=crop',
        portioner: 4,
        tidsforbrug_min: 30,
        instruktioner: [
            "Hak grøntsagerne groft.",
            "Tilbered kødet/fisken på en varm pande eller i ovnen.",
            "Vend det hele sammen med krydderier og server straks."
        ],
        ingredienser,
        tags
    });
}

const I = (id, text, amount, unit) => ({ id, text, amount, unit });

// --- 10 Hakket Kylling ---
for(let i=1; i<=10; i++) {
    createRecipe(`hk_kylling_${i}`, `Asiatisk Kyllingebowl ${i}`, `En nem og lækker wokret med hakket kylling.`, 
        [
            I(ingMap.hakket_kylling, 'Hakket Kylling', 400, 'g'),
            I(ingMap.loeg, 'Løg', 1, 'stk'),
            I(ingMap.spidskaal, 'Spidskål', 0.5, 'stk'),
            I(ingMap.soja, 'Sojasauce', 3, 'spsk'),
            I(ingMap.ris, 'Ris', 300, 'g'),
            I(i % 2 === 0 ? ingMap.gulerod : ingMap.peberfrugt, 'Grønt', 2, 'stk')
        ],
        ['Kylling', 'Asiatisk', 'Hurtig']
    );
}

// --- 10 Hakket Oksekød ---
for(let i=1; i<=10; i++) {
    createRecipe(`hk_okse_${i}`, `Klassisk Kødsovs Variant ${i}`, `En hverdagsfavorit der samler hele familien.`, 
        [
            I(ingMap.hakket_okse, 'Hakket Oksekød', 400, 'g'),
            I(ingMap.loeg, 'Løg', 1, 'stk'),
            I(ingMap.hakket_tomat, 'Hakkede Tomater', 1, 'dåse'),
            I(ingMap.pasta, 'Pasta', 400, 'g'),
            I(ingMap.revet_ost, 'Revet Ost', 100, 'g'),
            I(i % 2 === 0 ? ingMap.gulerod : ingMap.squash, 'Grønt', 2, 'stk')
        ],
        ['Oksekød', 'Italiensk', 'Børnevenlig']
    );
}

// --- 10 Hakket Svinekød ---
for(let i=1; i<=10; i++) {
    createRecipe(`hk_gris_${i}`, `Svinekød i Kål Variante ${i}`, `Sundt, billigt og super lækkert!`, 
        [
            I(ingMap.hakket_gris, 'Hakket Grisekød', 400, 'g'),
            I(ingMap.spidskaal, 'Spidskål', 1, 'stk'),
            I(ingMap.loeg, 'Løg', 1, 'stk'),
            I(ingMap.kartofler, 'Kartofler', 600, 'g'),
            I(i % 2 === 0 ? ingMap.foraarssloeg : ingMap.champignon, 'Ekstra grønt', 1, 'stk')
        ],
        ['Svinekød', 'Dansk', 'Madspild']
    );
}

// --- 15 Fiskeopskrifter (Laks/Torsk) ---
for(let i=1; i<=8; i++) {
    createRecipe(`laks_${i}`, `Ovnbagt Laks Menu ${i}`, `Laks er fantastisk nemt at tilberede og passer med næsten alt.`, 
        [
            I(ingMap.laks, 'Fersk Laks', 4, 'stk'),
            I(ingMap.citron, 'Citron', 1, 'stk'),
            I(i % 2 === 0 ? ingMap.spidskaal : ingMap.spinat, 'Grønt', 1, 'stk'),
            I(i % 3 === 0 ? ingMap.kartofler : ingMap.baguette, 'Kulhydrat', 1, 'stk')
        ],
        ['Fisk', 'Sundt', 'Hurtig']
    );
}
for(let i=1; i<=7; i++) {
    createRecipe(`torsk_${i}`, `Pandestegt Torsk Menu ${i}`, `Hvid fisk er mildt og lækkert for hele familien.`, 
        [
            I(ingMap.torsk, 'Torskefilet', 400, 'g'),
            I(ingMap.citron, 'Citron', 1, 'stk'),
            I(ingMap.persille, 'Frisk Persille', 1, 'bdt'),
            I(i % 2 === 0 ? ingMap.gulerod : ingMap.broccoli, 'Grønt', 1, 'stk'),
            I(i % 2 === 0 ? ingMap.kartofler : ingMap.flutes, 'Kulhydrat', 1, 'stk')
        ],
        ['Fisk', 'Sundt', 'Hurtig']
    );
}

// --- 5 Fiskefars ---
for(let i=1; i<=5; i++) {
    createRecipe(`fiskefars_${i}`, `Lækre Fiskefrikadeller ${i}`, `Hjemmelavede fiskefrikadeller slår alt.`, 
        [
            I(ingMap.fiskefars, 'Fiskefars', 400, 'g'),
            I(ingMap.citron, 'Citron', 1, 'stk'),
            I(ingMap.kartofler, 'Kartofler', 600, 'g'),
            I(i % 2 === 0 ? ingMap.gulerod : ingMap.broccoli, 'Grønt', 2, 'stk')
        ],
        ['Fisk', 'Børnevenlig', 'Hverdagsmad']
    );
}

// --- 5 Vegetar ---
for(let i=1; i<=5; i++) {
    createRecipe(`vegetar_${i}`, `Grøntsags Wok ${i}`, `Spis grønt, spar penge og ryd ud i grøntsagsskuffen.`, 
        [
            I(ingMap.spidskaal, 'Spidskål', 0.5, 'stk'),
            I(ingMap.loeg, 'Løg', 1, 'stk'),
            I(ingMap.gulerod, 'Gulerødder', 3, 'stk'),
            I(ingMap.peberfrugt, 'Peberfrugt', 1, 'stk'),
            I(i % 2 === 0 ? ingMap.ris : ingMap.pasta, 'Ris eller Pasta', 300, 'g')
        ],
        ['Vegetar', 'Madspild', 'Sundt']
    );
}

let sql = `-- Opret Hakket Kylling
INSERT INTO ingredients (id, navn, kategori, allergener, standard_vare) 
VALUES ('ing_hakket_kylling', 'Hakket Kylling', 'Slagter', '[]'::jsonb, false)
ON CONFLICT (id) DO NOTHING;

-- Indsæt 55 opskrifter
INSERT INTO recipes (id, titel, beskrivelse, billed_url, portioner, tidsforbrug_min, instruktioner, ingredienser, tags) VALUES
`;

const rows = recipesToInsert.map(r => {
    const id = `'${r.id}'`;
    const titel = `'${r.titel.replace(/'/g, "''")}'`;
    const besk = `'${r.beskrivelse.replace(/'/g, "''")}'`;
    const url = `'${r.billed_url}'`;
    const instr = `'${JSON.stringify(r.instruktioner).replace(/'/g, "''")}'::jsonb`;
    const ings = `'${JSON.stringify(r.ingredienser).replace(/'/g, "''")}'::jsonb`;
    const tags = `'${JSON.stringify(r.tags).replace(/'/g, "''")}'::jsonb`;
    return `(${id}, ${titel}, ${besk}, ${url}, 4, 30, ${instr}, ${ings}, ${tags})`;
});

sql += rows.join(",\n") + "\nON CONFLICT (id) DO UPDATE SET ingredienser = EXCLUDED.ingredienser;";

fs.writeFileSync('massive_recipes.sql', sql);
console.log("SQL genereret i massive_recipes.sql");
