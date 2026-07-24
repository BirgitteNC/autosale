import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import fs from 'fs';

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
  console.log("=== RETTER KATASTROFALE KATEGORISERINGER ===");
  
  const logPath = 'C:\\Users\\birgi\\.gemini\\antigravity\\brain\\022f7582-d5ab-4f47-8508-71d318cfff35\\.system_generated\\tasks\\task-10174.log';
  if (!fs.existsSync(logPath)) {
      console.error("Fandt ikke logfilen!");
      return;
  }

  const logContent = fs.readFileSync(logPath, 'utf8');
  const lines = logContent.split('\n');
  const affectedNames = [];

  for (const line of lines) {
      const match = line.match(/Flyttede "(.*?)" ->/);
      if (match && match[1]) {
          affectedNames.push(match[1]);
      }
  }

  console.log(`Fandt ${affectedNames.length} navne i loggen, som blev flyttet.`);

  // Hent alle ingredienser i stedet for at bruge en massiv IN-query (undgår URL 16KB limit)
  const { data: ingredients, error } = await supabase.from('ingredients').select('id, navn, kategori');
  if (error) { console.error("Database fejl:", error); return; }

  let fixedCount = 0;
  let resetCount = 0;

  for (const item of ingredients) {
      if (!affectedNames.includes(item.navn)) {
          // Kun berør de varer, der blev flyttet i sidste runde!
          continue;
      }
      
      const name = item.navn.toLowerCase();
      let matchedCategory = null;

      // STRENG REGEX MATCHING MED WORD BOUNDARIES
      for (const rule of mapping) {
          for (const kw of rule.keywords) {
              // Vi matcher på hele ord og ignorerer bindestreger, punktummer etc.
              const regex = new RegExp(`(^|[^a-zæøå])(${kw})([^a-zæøå]|$)`, 'i');
              if (regex.test(name)) {
                  matchedCategory = rule.category;
                  break;
              }
          }
          if (matchedCategory) break;
      }

      const targetCategory = matchedCategory || 'diverse';
      
      if (item.kategori !== targetCategory) {
          const { error: updErr } = await supabase.from('ingredients').update({ kategori: targetCategory }).eq('id', item.id);
          if (updErr) {
              console.error(`Fejl ved opdatering af ${item.navn}:`, updErr);
          } else {
              if (targetCategory === 'diverse') {
                  console.log(`⏪ Tilbagerullede "${item.navn}" til 'diverse'`);
                  resetCount++;
              } else {
                  console.log(`✅ Opretholdt & Rettede "${item.navn}" til '${targetCategory}'`);
                  fixedCount++;
              }
          }
      }
  }

  console.log(`\nOprydning fuldført! Placerede ${fixedCount} varer strengt, og sendte ${resetCount} tilbage i 'diverse'.`);
}

run();
