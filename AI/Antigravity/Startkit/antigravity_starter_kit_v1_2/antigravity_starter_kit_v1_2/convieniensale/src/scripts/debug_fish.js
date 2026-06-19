import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env' });

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function debugFish() {
    console.log("🔍 UNDERØSGER FISKE-KAOSET (I overensstemmelse med Regel 6)\n");

    // 1. Tjek Ingredienser
    const { data: ings } = await supabase.from('ingredients').select('*').ilike('kategori', '%fisk%');
    console.log("🐟 Fiske-ingredienser i DB:");
    ings.forEach(i => console.log(` - ID: ${i.id} | Navn: '${i.navn}' | Kategori: '${i.kategori}' | Standard: ${i.standard_vare}`));

    const { data: laks } = await supabase.from('ingredients').select('*').ilike('navn', '%laks%');
    console.log("\n🍣 Specifik søgning på 'laks':");
    laks.forEach(i => console.log(` - ID: ${i.id} | Navn: '${i.navn}' | Kategori: '${i.kategori}'`));

    // 2. Tjek Kategorier generelt
    const { data: allIngs } = await supabase.from('ingredients').select('kategori');
    const categories = [...new Set(allIngs.map(i => i.kategori))];
    console.log("\n📋 Alle fiske-relaterede kategorier:", categories.filter(c => c && c.toLowerCase().includes('fisk')));

    // 3. Tjek Laks opskriften
    const { data: recipes } = await supabase.from('recipes').select('id, titel, ingredienser').eq('id', 'meny_ovnbagt_laks');
    console.log("\n📜 Opskrift: meny_ovnbagt_laks:");
    if (recipes && recipes.length > 0) {
        console.log(JSON.stringify(recipes[0].ingredienser, null, 2));
    } else {
        console.log("❌ OPSKRIFTEN FINDES IKKE I DB!");
    }

    // 4. Hvorfor er boksen tom? Er der en ingrediens med tomt navn?
    const { data: emptyName } = await supabase.from('ingredients').select('*').eq('navn', '');
    console.log("\n👻 Ingredienser med tomt navn:", emptyName);
}

debugFish();
