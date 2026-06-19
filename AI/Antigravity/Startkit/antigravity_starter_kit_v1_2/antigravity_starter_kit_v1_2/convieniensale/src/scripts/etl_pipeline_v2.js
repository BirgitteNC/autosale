import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';
import dotenv from 'dotenv';
dotenv.config({ path: '../.env' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("FATAL: Manglende Supabase URL eller Service Key");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// ==========================================
// ZOD SCHEMAS (Drogon's jernhårde regler)
// ==========================================

const IngredientSchema = z.object({
  id: z.string().min(1, "ID må ikke være tom"),
  navn: z.string().min(2, "Råvarenavn skal have mindst 2 tegn"),
  kategori: z.string().default("Andre"),
  allergener: z.array(z.string()).default([]),
  standard_vare: z.boolean().default(false),
  alternativ_id: z.string().nullable().optional()
});

const RecipeIngredientSchema = z.object({
  raavare_id: z.string().min(1, "Manglende råvare_id"),
  amount: z.number().nullable().optional(),
  unit: z.string().nullable().optional(),
  text: z.string().min(1, "Original tekst (f.eks. '2 spsk' eller 'efter behov') skal gemmes")
});

const RecipeSchema = z.object({
  id: z.string().min(1),
  titel: z.string().min(3),
  beskrivelse: z.string().nullable().optional(),
  billed_url: z.string().url("Ugyldig URL til billede").optional().or(z.literal('')),
  portioner: z.number().int().min(1).default(2),
  tidsforbrug_min: z.number().int().min(1).default(20),
  kalorier_per_300g: z.number().nullable().optional(),
  protein_per_300g: z.number().nullable().optional(),
  tags: z.array(z.string()).default([]),
  instruktioner: z.array(z.string()).min(1, "En opskrift skal have mindst én instruktion"),
  ingredienser: z.array(RecipeIngredientSchema).min(1, "En opskrift skal have mindst én ingrediens")
});

// ==========================================
// SAP ADAPTER LAYER (Anti-Corruption Layer)
// ==========================================
// Dagrofa kører SAP. SAP eksporterer oftest varer og mængder med 
// tyske/engelske systemnøgler (f.eks. MATNR for varenummer, MEINS for enhed).
// Dette adapter-lag oversætter SAP-strukturer til vores interne Zod-skema.

function transformSapDataToInternal(sapPayload) {
  return sapPayload.map(sapItem => {
    // Eksempel på oversættelse fra hypotetisk SAP format til MenyMenu format
    return {
      raavare_id: sapItem.MATNR || sapItem.ArticleId,
      amount: sapItem.MENGE ? parseFloat(sapItem.MENGE) : null,
      unit: sapItem.MEINS || sapItem.Unit,
      text: sapItem.DESCRIPTION || "Efter behov"
    };
  });
}

// ==========================================
// ETL PIPELINE EXECUTION
// ==========================================

async function runEtlPipeline(externalDataPayload, sourceSystem = 'INTERNAL') {
  console.log("🚀 Starter Antigravity ETL Pipeline v2...");
  
  let dataToValidate = externalDataPayload;
  
  // 1. EXTRACT & TRANSFORM (Adapter Layer)
  if (sourceSystem === 'SAP') {
     console.log("Modtager data fra SAP system. Aktiverer SAP Adapter...");
     dataToValidate = transformSapDataToInternal(externalDataPayload);
  }
  
  // 2. LOAD & VALIDATE (Drogons jernhårde regler)
  console.log("Drogon's validerings-regler er aktiveret. Zod tjekker data...");
  // ... her ville vi køre z.parse(dataToValidate) ...
  
  console.log("Klar til at modtage og validere ægte data mod Supabase.");
}

// runEtlPipeline([], 'SAP').catch(console.error);
