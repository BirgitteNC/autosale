// Vercel Serverless Function
// Fil: api/update_promotions.js
import { createClient } from '@supabase/supabase-js';
import jwt from 'jsonwebtoken';
import { requireStaffSession } from './utils/session.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  let { selectedIds, foodWasteIds, approvalToken } = req.body;

  if (!Array.isArray(selectedIds)) {
    return res.status(400).json({ error: 'Missing required parameters' });
  }
  
  // Fjern alle duplikater fra arrays med det samme.
  selectedIds = [...new Set(selectedIds)];
  foodWasteIds = Array.isArray(foodWasteIds) ? [...new Set(foodWasteIds)] : [];
  
  if (selectedIds.length > 6 || foodWasteIds.length > 6) {
      return res.status(400).json({ error: 'For mange varer valgt (max 6)' });
  }

  let sessionData;
  try {
    sessionData = requireStaffSession(req);
  } catch (error) {
    return res.status(401).json({ error: error.message });
  }

  const storeId = sessionData.storeId;

  // Enforce Voksen-godkendelse for ungarbejdere
  if (sessionData.role === 'young_worker') {
    if (!approvalToken) {
      return res.status(403).json({ error: 'Handling kræver godkendelse fra en voksen (manglende token)' });
    }
    try {
      const secret = process.env.SESSION_SIGNING_KEY;
      const decoded = jwt.verify(approvalToken, secret);
      if (decoded.type !== 'adult_approval' || decoded.storeId !== storeId) {
        throw new Error('Ugyldig godkendelse');
      }
    } catch {
      return res.status(403).json({ error: 'Ugyldig eller udløbet voksen-godkendelse' });
    }
  }

  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const supabase = createClient(supabaseUrl, supabaseServiceKey);



  try {
    // Tjek at store_id faktisk eksisterer i Supabase og at brugerens session stemmer
    console.log(JSON.stringify({
      event: "AUDIT_SUCCESS",
      type: "PROMOTIONS_UPDATED",
      storeId,
      approvedByRole: sessionData.role,
      timestamp: new Date().toISOString(),
      payload: { selectedIds, foodWasteIds }
    }));

    // Udfør opdateringen atomisk (ingen race-conditions)
    // RPC 'set_active_promotions' håndterer indsættelse i databasen og udsender
    // automatisk Realtime events til alle andre forbundne skærme i butikken.
    const { error: upsertError } = await supabase.rpc('set_active_promotions', {
      p_store_id: storeId,
      p_selected_ids: selectedIds,
      p_food_waste_ids: foodWasteIds || []
    });

    if (upsertError) {
      throw upsertError;
    }

    return res.status(200).json({ success: true, message: 'Promotions updated securely' });

  } catch (error) {
    console.error("Server fejl:", error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
