import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: resolve(__dirname, '../.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const mapping = [
    { category: 'Kød', keywords: ['kalv', 'bov', 'bacon', 'skinke', 'kylling', 'and', 'grise', 'kotelet', 'medister', 'okse', 'steak', 'revelsben', 'lam', 'fasan'] },
    { category: 'Fiskeafdeling', keywords: ['laks', 'fisk', 'ørred', 'rogn', 'sild', 'kæmperejer', 'rejer', 'krabbe', 'kulmuler'] },
    { category: 'Mejeri', keywords: ['ost', 'mozzarella', 'parmigiano', 'pecorino', 'cheddar', 'feta', 'smør', 'mælk', 'fløde', 'yoghurt', 'ægge', 'æg', 'ymer'] },
    { category: 'Vin/Spiritus', keywords: ['rødvin', 'hvidvin', 'vin', 'øl', 'gin', 'bourbon', 'whisky', 'madeira'] },
    { category: 'Bager', keywords: ['brød', 'flutes', 'baguette', 'cookie', 'fladbrød', 'rugbrød', 'sandwichbrød'] },
    { category: 'Bagning', keywords: ['nødder', 'mandel', 'mandler', 'peanuts', 'kerner', 'frø', 'rosin', 'abrikos', 'tranebær', 'chokolade', 'kakaonibs', 'sirup', 'vanilje', 'flormelis', 'sukker'] },
    { category: 'Krydderier', keywords: ['salt', 'peber', 'laurbær', 'sennepsfrø', 'allehånde', 'nellike', 'korianderfrø', 'karry', 'spidskommen'] },
    { category: 'Frugt & Grønt', keywords: ['frisk', 'blad', 'løg', 'timian', 'persille', 'dild', 'kørvel', 'purløg', 'mynte', 'basilikum', 'salvie', 'estragon', 'æble', 'pære', 'citron', 'lime', 'appelsin', 'tomat', 'kartoffel', 'selleri', 'kål', 'salat', 'asparges', 'gulerod', 'radise', 'peberfrugt', 'champignon', 'aubergine', 'zucchini', 'squash', 'chili', 'ingefær', 'bær', 'fennikel', 'granatæble'] },
    { category: 'Kolonial', keywords: ['puré', 'fond', 'bouillon', 'dåse', 'ketchup', 'sennep', 'sauce', 'olie', 'eddike', 'pasta', 'ris', 'nudler', 'bulgur', 'quinoa', 'spelt', 'kikært', 'oliven', 'pesto', 'tapenade', 'tahin', 'peanutbutter', 'kaffe'] },
    { category: 'Basis', keywords: ['vand', 'isterning'] }
];

async function run() {
  console.log("Henter ingredienser fra 'diverse'...");
  const { data, error } = await supabase.from('ingredients').select('id, navn').eq('kategori', 'diverse');
  if (error) { console.error(error); return; }

  let updateCount = 0;

  for (const item of data) {
      const name = item.navn.toLowerCase();
      let matchedCategory = null;

      // Søg igennem vores mapping (rækkefølge har betydning)
      for (const rule of mapping) {
          if (rule.keywords.some(kw => name.includes(kw))) {
              matchedCategory = rule.category;
              break;
          }
      }

      if (matchedCategory) {
          const { error: updErr } = await supabase.from('ingredients').update({ kategori: matchedCategory }).eq('id', item.id);
          if (updErr) {
              console.error(`Fejl ved opdatering af ${item.navn}:`, updErr);
          } else {
              console.log(`✅ Flyttede "${item.navn}" -> ${matchedCategory}`);
              updateCount++;
          }
      }
  }

  console.log(`\nFærdig! Omkategoriserede ${updateCount} ud af ${data.length} ingredienser.`);
}

run();
