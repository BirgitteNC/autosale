// Vercel Serverless Function
// Fil: api/update_promotions.js
import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  // Tillad kun POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { pin, storeId, selectedIds, foodWasteIds } = req.body;

  if (!pin || !storeId || !Array.isArray(selectedIds)) {
    return res.status(400).json({ error: 'Missing required parameters' });
  }

  // Brug SERVICE ROLE KEY til at bypass RLS på serveren (Sikker, da den ikke er synlig i browseren)
  // BEMÆRK: Disse SKAL hentes via environment variables i produktion
  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    // 1. Verificer at PIN-koden faktisk matcher butikken!
    const { data: pinData, error: pinError } = await supabase
      .from('store_pins')
      .select('*')
      .eq('pin_code', pin)
      .eq('store_id', storeId)
      .single();

    if (pinError || !pinData) {
      console.error(JSON.stringify({ event: "AUDIT_FAILURE", type: "INVALID_PIN", storeId, pin, timestamp: new Date().toISOString() }));
      return res.status(401).json({ error: 'Unauthorized: PIN matcher ikke butikken' });
    }

    // AUDIT LOGGING: Legal-Lars requirement
    console.log(JSON.stringify({
      event: "AUDIT_SUCCESS",
      type: "PROMOTIONS_UPDATED",
      storeId,
      approvedByPin: pin, // Voksen PIN
      timestamp: new Date().toISOString(),
      payload: { selectedIds, foodWasteIds }
    }));

    // 2. Hvis PIN er gyldig, udfør opdateringen som admin
      // FIX: Upsert kræver UNIQUE constraint, som mangler. Vi gør det manuelt.
      const { data: existingPromo } = await supabase
        .from('active_promotions')
        .select('id')
        .eq('store_id', storeId)
        .limit(1)
        .maybeSingle();

      let upsertError = null;

      if (existingPromo) {
         const { error } = await supabase
           .from('active_promotions')
           .update({ 
              selected_ingredients: selectedIds,
              food_waste_ingredients: foodWasteIds || [],
              updated_at: new Date().toISOString()
           })
           .eq('id', existingPromo.id);
         upsertError = error;
      } else {
         const { error } = await supabase
           .from('active_promotions')
           .insert({ 
              store_id: storeId, 
              selected_ingredients: selectedIds,
              food_waste_ingredients: foodWasteIds || [],
              updated_at: new Date().toISOString()
           });
         upsertError = error;
      }

    if (upsertError) {
      throw upsertError;
    }

    return res.status(200).json({ success: true, message: 'Promotions updated securely' });

  } catch (error) {
    console.error("Server fejl:", error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
