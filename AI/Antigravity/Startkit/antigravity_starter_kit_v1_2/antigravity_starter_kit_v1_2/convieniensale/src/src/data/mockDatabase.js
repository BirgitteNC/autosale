// mockDatabase.js
export const INGREDIENTS = [
  // KØD, FISK & PLANTEBASERET
  { id: 'ing_1', eksternt_varenummer: 'DAG-1001', navn: 'Hakket oksekød', kategori: 'Kød', standard_vare: false, allergener: [], alternativ_id: null },
  { id: 'ing_laks', eksternt_varenummer: 'DAG-1010', navn: 'Fersk Laks', kategori: 'Fisk/Deli', standard_vare: false, allergener: [], alternativ_id: null },
  { id: 'ing_kotelet', eksternt_varenummer: 'DAG-1011', navn: 'Svinekoteletter', kategori: 'Slagter', standard_vare: false, allergener: [], alternativ_id: null },
  { id: 'ing_kylling', eksternt_varenummer: 'DAG-1012', navn: 'Kyllingebryst', kategori: 'Slagter', standard_vare: false, allergener: [], alternativ_id: null },
  { id: 'ing_plantefars', eksternt_varenummer: 'DAG-1046', navn: 'Vegetar Plantefars', kategori: 'Plantebaseret', standard_vare: false, allergener: [], alternativ_id: null },

  // FRUGT & GRØNT
  { id: 'ing_2', eksternt_varenummer: 'DAG-1002', navn: 'Spidskål', kategori: 'Grønt', standard_vare: false, allergener: [], alternativ_id: null },
  { id: 'ing_5', eksternt_varenummer: 'DAG-1007', navn: 'Gulerødder', kategori: 'Grønt', standard_vare: false, allergener: [], alternativ_id: null },
  { id: 'ing_6', eksternt_varenummer: 'DAG-1008', navn: 'Løg', kategori: 'Grønt', standard_vare: false, allergener: [], alternativ_id: null },
  { id: 'ing_avo', eksternt_varenummer: 'DAG-1020', navn: 'Avocado', kategori: 'Frugt/Grønt', standard_vare: false, allergener: [], alternativ_id: null },
  { id: 'ing_spinat', eksternt_varenummer: 'DAG-1021', navn: 'Frisk Spinat', kategori: 'Grønt', standard_vare: false, allergener: [], alternativ_id: null },
  { id: 'ing_baer', eksternt_varenummer: 'DAG-1022', navn: 'Friske Bær', kategori: 'Frugt', standard_vare: false, allergener: [], alternativ_id: null },
  { id: 'ing_aubergine', eksternt_varenummer: 'DAG-1023', navn: 'Aubergine', kategori: 'Grønt', standard_vare: false, allergener: [], alternativ_id: null },
  { id: 'ing_blomkaal', eksternt_varenummer: 'DAG-1024', navn: 'Blomkål', kategori: 'Grønt', standard_vare: false, allergener: [], alternativ_id: null },
  { id: 'ing_tomat', eksternt_varenummer: 'DAG-1025', navn: 'Tomater', kategori: 'Grønt', standard_vare: false, allergener: [], alternativ_id: null },
  { id: 'ing_timian', eksternt_varenummer: 'DAG-1026', navn: 'Frisk Timian', kategori: 'Grønt', standard_vare: false, allergener: [], alternativ_id: null },
  { id: 'ing_svampe', eksternt_varenummer: 'DAG-1040', navn: 'Svampe (Eks. Portobello)', kategori: 'Grønt', standard_vare: false, allergener: [], alternativ_id: null },
  { id: 'ing_agurk', eksternt_varenummer: 'DAG-1041', navn: 'Agurk', kategori: 'Grønt', standard_vare: false, allergener: [], alternativ_id: null },
  { id: 'ing_salathoved', eksternt_varenummer: 'DAG-1042', navn: 'Salathoved', kategori: 'Grønt', standard_vare: false, allergener: [], alternativ_id: null },
  { id: 'ing_vindruer', eksternt_varenummer: 'DAG-1043', navn: 'Vindruer', kategori: 'Frugt', standard_vare: false, allergener: [], alternativ_id: null },
  { id: 'ing_banan', eksternt_varenummer: 'DAG-1045', navn: 'Bananer', kategori: 'Frugt', standard_vare: false, allergener: [], alternativ_id: null },
  { id: 'ing_peber', eksternt_varenummer: 'DAG-1047', navn: 'Peberfrugt', kategori: 'Grønt', standard_vare: false, allergener: [], alternativ_id: null },
  { id: 'ing_kartofler', eksternt_varenummer: 'DAG-1048', navn: 'Kartofler', kategori: 'Grønt', standard_vare: false, allergener: [], alternativ_id: null },
  { id: 'ing_spirer', eksternt_varenummer: 'DAG-1050', navn: 'Bønnespirer', kategori: 'Grønt', standard_vare: false, allergener: [], alternativ_id: null },
  
  // CONVENIENCE & DELI
  { id: 'ing_datosalat', eksternt_varenummer: 'DAG-1044', navn: 'Forblandet Salat (Dato)', kategori: 'Convenience', standard_vare: false, allergener: [], alternativ_id: null },
  { id: 'ing_blomster', eksternt_varenummer: 'DAG-1049', navn: 'Spiselige Blomster', kategori: 'Deli/Pynt', standard_vare: false, allergener: [], alternativ_id: null },

  // MEJERI & KØL
  { id: 'ing_4', eksternt_varenummer: 'DAG-1005', navn: 'Madlavningsfløde', kategori: 'Mejeri', standard_vare: false, allergener: ['laktose'], alternativ_id: 'ing_4_alt' },
  { id: 'ing_4_alt', eksternt_varenummer: 'DAG-1006', navn: 'Laktosefri Fløde', kategori: 'Mejeri', standard_vare: false, allergener: [], alternativ_id: null },
  { id: 'ing_mozza', eksternt_varenummer: 'DAG-1030', navn: 'Frisk Mozzarella', kategori: 'Mejeri', standard_vare: false, allergener: ['laktose'], alternativ_id: null },

  // STANDARDVARER
  { id: 'ing_3', eksternt_varenummer: 'DAG-1003', navn: 'Pasta (Hvede)', kategori: 'Tørvare', standard_vare: false, allergener: ['gluten'], alternativ_id: 'ing_3_alt' },
  { id: 'ing_3_alt', eksternt_varenummer: 'DAG-1004', navn: 'Glutenfri Pasta', kategori: 'Tørvare', standard_vare: false, allergener: [], alternativ_id: null },
  { id: 'ing_7', eksternt_varenummer: 'DAG-2001', navn: 'Olie', kategori: 'Standardvare', standard_vare: true, allergener: [], alternativ_id: null },
  { id: 'ing_8', eksternt_varenummer: 'DAG-2002', navn: 'Salt & Peber', kategori: 'Standardvare', standard_vare: true, allergener: [], alternativ_id: null },
  { id: 'ing_eddike', eksternt_varenummer: 'DAG-2003', navn: 'Balsamico Eddike', kategori: 'Standardvare', standard_vare: true, allergener: [], alternativ_id: null },
  { id: 'ing_bouillon', eksternt_varenummer: 'DAG-2004', navn: 'Grøntsagsbouillon', kategori: 'Standardvare', standard_vare: true, allergener: [], alternativ_id: null },
];

export const RECIPES = [
  {
    id: 'rec_1',
    titel: 'Spidskålsgryde med Oksekød',
    beskrivelse: 'Klassisk hverdagsret, der klares i én gryde.',
    tidsforbrug_min: 25,
    portioner: 4,
    protein_per_300g: 22,
    kalorier_per_300g: 280,
    billed_url: 'https://images.unsplash.com/photo-1594041680534-e8c8cdebd659?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    estimeret_avance: 35.50,
    instruktioner: [
      'Snit spidskål og løg.',
      'Svits løg i olie. Tilsæt oksekød og brun af.',
      'Vend spidskål i gryden. Tilsæt fløde.',
      'Lad det simre i 10 minutter og smag til med salt og peber.'
    ],
    ingredienser: [
      { raavare_id: 'ing_1', maengde: '500g', er_noegleraavare: true },
      { raavare_id: 'ing_2', maengde: '1 stk', er_noegleraavare: true },
      { raavare_id: 'ing_6', maengde: '1 stk', er_noegleraavare: false },
      { raavare_id: 'ing_4', maengde: '2.5 dl', er_noegleraavare: false },
      { raavare_id: 'ing_7', maengde: 'Til stegning', er_noegleraavare: false }
    ],
    tags: []
  },
  {
    id: 'rec_3',
    titel: 'Bagt Laks med Jordbær/Spinat Salat',
    beskrivelse: 'Luksus på rekordtid.',
    tidsforbrug_min: 20,
    portioner: 2,
    protein_per_300g: 26,
    kalorier_per_300g: 310,
    billed_url: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    estimeret_avance: 48.00,
    instruktioner: [
      'Bag laks i ovnen (200 gr, 15 min).',
      'Skyl spinat. Skær jordbær og avocado i skiver.',
      'Vend salaten med lidt balsamico eddike og server med den varme laks.'
    ],
    ingredienser: [
      { raavare_id: 'ing_laks', maengde: '2 stk', er_noegleraavare: true },
      { raavare_id: 'ing_spinat', maengde: '1 pose', er_noegleraavare: true },
      { raavare_id: 'ing_baer', maengde: '1 bakke', er_noegleraavare: true },
      { raavare_id: 'ing_avo', maengde: '1 stk', er_noegleraavare: true },
      { raavare_id: 'ing_eddike', maengde: '1 spsk', er_noegleraavare: false }
    ],
    tags: ['Halal']
  },
  {
    id: 'rec_6',
    titel: 'Sprød Plantefars-Bowl med Grønt & Spirer',
    beskrivelse: 'Moderne, farverig Bowl der lynhurtigt forvandler grøntafdelingens varer til et mesterværk.',
    tidsforbrug_min: 15,
    portioner: 2,
    protein_per_300g: 18,
    kalorier_per_300g: 260,
    billed_url: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    estimeret_avance: 45.00,
    instruktioner: [
      'Steg plantefarsen sprød på en pande med lidt olie og salt/peber.',
      'Fordel den forblandede salat i bunden af to skåle.',
      'Snit agurk, tomat og peberfrugt og anret flot ovenpå salaten.',
      'Top skålene med den sprøde plantefars, friske bønnespirer og spiselige blomster.'
    ],
    ingredienser: [
      { raavare_id: 'ing_plantefars', maengde: '1 pakke', er_noegleraavare: true },
      { raavare_id: 'ing_datosalat', maengde: '1 pose', er_noegleraavare: true },
      { raavare_id: 'ing_peber', maengde: '1 stk', er_noegleraavare: true },
      { raavare_id: 'ing_tomat', maengde: '2 stk', er_noegleraavare: true },
      { raavare_id: 'ing_agurk', maengde: '1/2 stk', er_noegleraavare: false },
      { raavare_id: 'ing_spirer', maengde: '1 håndfuld', er_noegleraavare: true },
      { raavare_id: 'ing_blomster', maengde: '1 bakke', er_noegleraavare: true }
    ],
    tags: ['Vegetar', 'Halal']
  },
  {
    id: 'rec_7',
    titel: 'Bagt Kål med Svampe og Kartofler',
    beskrivelse: 'Mættende vegetarret med dyb umami smag.',
    tidsforbrug_min: 30,
    portioner: 4,
    protein_per_300g: 12,
    kalorier_per_300g: 220,
    billed_url: 'https://images.unsplash.com/photo-1476224203421-9ac39bcb3327?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    estimeret_avance: 40.00,
    instruktioner: [
      'Skær kartofler og blomkål i buketter/tern og vend med olie og timian. Bag 20 min.',
      'Rist svampene på en meget varm pande.',
      'Bland det hele og server med lidt fløde for ekstra fylde.'
    ],
    ingredienser: [
      { raavare_id: 'ing_blomkaal', maengde: '1 stk', er_noegleraavare: true },
      { raavare_id: 'ing_svampe', maengde: '1 bakke', er_noegleraavare: true },
      { raavare_id: 'ing_kartofler', maengde: '500g', er_noegleraavare: true },
      { raavare_id: 'ing_timian', maengde: 'Lidt frisk', er_noegleraavare: false },
      { raavare_id: 'ing_4_alt', maengde: '1 dl', er_noegleraavare: false }
    ],
    tags: ['Vegetar', 'Halal']
  },
  {
    id: 'rec_8',
    titel: 'Sød Frugtsalat med Banan og Vindruer',
    beskrivelse: 'Perfekt dessert der forvandler modne bananer og bær til en luksus servering.',
    tidsforbrug_min: 10,
    portioner: 4,
    protein_per_300g: 4,
    kalorier_per_300g: 150,
    billed_url: '/fruit_salad.png',
    estimeret_avance: 55.00,
    instruktioner: [
      'Skær bananer i skiver og halver vindruerne.',
      'Bland med friske bær i en flot skål.',
      'Pynt af med spiselige blomster for en premium oplevelse.'
    ],
    ingredienser: [
      { raavare_id: 'ing_banan', maengde: '3 stk', er_noegleraavare: true },
      { raavare_id: 'ing_baer', maengde: '1 bakke', er_noegleraavare: true },
      { raavare_id: 'ing_vindruer', maengde: '1 bakke', er_noegleraavare: true },
      { raavare_id: 'ing_blomster', maengde: 'Pynt', er_noegleraavare: true }
    ],
    tags: ['Vegetar', 'Halal']
  }
];
