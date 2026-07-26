-- SPRINT 8: THE GREAT REFACTOR (Compliance & DBA Fixes)

-- 1. OPRET AUDIT TRAIL FOR HITL (Human In The Loop) - (Governancen)
CREATE TABLE IF NOT EXISTS hitl_audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id UUID REFERENCES stores(id) ON DELETE CASCADE,
    action TEXT NOT NULL,
    voksen_pin_hash TEXT, -- Gemmes kun hashet
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE hitl_audit_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins kan læse audit logs" ON hitl_audit_logs FOR SELECT TO authenticated USING (true);
CREATE POLICY "Anon kan skrive audit logs" ON hitl_audit_logs FOR INSERT TO anon, authenticated WITH CHECK (true);

-- 2. OPRET MANY-TO-MANY RELATIONSTABEL TIL OPSKRIFTER (Data Dorthe)
CREATE TABLE IF NOT EXISTS recipe_ingredients (
    recipe_id TEXT REFERENCES recipes(id) ON DELETE CASCADE,
    ingredient_id TEXT REFERENCES ingredients(id) ON DELETE CASCADE,
    amount NUMERIC,
    unit TEXT,
    original_text TEXT, -- Bevarer f.eks. "Lille bundt frisk persille"
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (recipe_id, ingredient_id)
);

ALTER TABLE recipe_ingredients ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Offentlig læseadgang til recipe_ingredients" ON recipe_ingredients FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admins kan skrive recipe_ingredients" ON recipe_ingredients FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 3. TILFØJ GIN-INDEX PÅ JSONB (Midlertidigt performance boost) (Data Dorthe)
-- Dette kræver at 'ingredienser' er konverteret til JSONB hvis den tidligere var JSON eller TEXT.
-- Vi sørger for det er JSONB først.
ALTER TABLE recipes ALTER COLUMN ingredienser TYPE JSONB USING ingredienser::JSONB;
CREATE INDEX IF NOT EXISTS idx_recipes_ingredienser ON recipes USING GIN (ingredienser);

-- 4. SIKKERHEDS-STRAMNING PÅ RLS FOR RECIPES (Data Dorthe)
-- Den nuværende "Offentlig læseadgang" tillader scrape af HELE databasen. 
-- For ægte produktion vil vi kræve en Store-API nøgle (authenticated) for fuld adgang,
-- men i denne PoC/MVP kan vi begrænse via Edge Functions i fremtiden.
-- I første omgang strammer vi det ved at fjerne direkte SQL-adgang for the public anon role over tid, men bevarer det indtil frontend refaktoreres til Server-Side (Next.js).
-- Vi dokumenterer intentionen her:
COMMENT ON POLICY "Offentlig læseadgang til recipes" ON recipes IS 'Skal migreres til Edge Function med Rate Limiting (M&A Due Diligence).';

-- 5. ROBUST DATA GOVERNANCE TRIGGER (Governancen & Data Dorthe)
-- Vi opretter en dedikeret regel-tabel i stedet for hardcoded 'ILIKE' i PostGres koden.
CREATE TABLE IF NOT EXISTS category_rules (
    kategori TEXT PRIMARY KEY,
    forbidden_words TEXT[]
);

-- Indsæt standardregler:
INSERT INTO category_rules (kategori, forbidden_words) 
VALUES ('Slagter', ARRAY['koriander', 'mandler', 'aubergine'])
ON CONFLICT (kategori) DO UPDATE SET forbidden_words = EXCLUDED.forbidden_words;

INSERT INTO category_rules (kategori, forbidden_words) 
VALUES ('Fiskeafdeling', ARRAY['koriander', 'mandler', 'aubergine'])
ON CONFLICT (kategori) DO UPDATE SET forbidden_words = EXCLUDED.forbidden_words;

-- Omskriv funktionen til at læse fra tabellen dynamisk:
CREATE OR REPLACE FUNCTION enforce_ingredient_categories()
RETURNS TRIGGER AS $$
DECLARE
    rule_words TEXT[];
    word TEXT;
BEGIN
    -- Slå reglerne op for den valgte kategori
    SELECT forbidden_words INTO rule_words FROM category_rules WHERE kategori = NEW.kategori;
    
    IF FOUND AND rule_words IS NOT NULL THEN
        FOREACH word IN ARRAY rule_words
        LOOP
            IF NEW.navn ILIKE '%' || word || '%' AND NEW.navn NOT ILIKE '%frø%' THEN
                RAISE EXCEPTION 'Data Governance Fejl: Forsøgte at placere "%" i "%" ifølge dynamiske regler.', NEW.navn, NEW.kategori;
            END IF;
        END LOOP;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggeren findes allerede (trg_enforce_ingredient_categories), men peger nu på den nye robuste funktion.
