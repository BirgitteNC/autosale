-- Sikkerhedslås: Sørg for at RLS er aktiveret
ALTER TABLE recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE active_promotions ENABLE ROW LEVEL SECURITY;

-- Slet alle eventuelle usikre politikker, der tillader skrivning fra 'anon'
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON recipes;
DROP POLICY IF EXISTS "Enable read access for all users" ON recipes;
DROP POLICY IF EXISTS "Allow public read access" ON recipes;
DROP POLICY IF EXISTS "Allow public insert" ON recipes;
DROP POLICY IF EXISTS "Allow public delete" ON recipes;

-- Opret benhårde LÆSE-KUN (SELECT) politikker for offentlig adgang
CREATE POLICY "Læs-kun adgang til opskrifter" ON recipes FOR SELECT USING (true);
CREATE POLICY "Læs-kun adgang til ingredienser" ON ingredients FOR SELECT USING (true);
CREATE POLICY "Læs-kun adgang til butikstilbud" ON active_promotions FOR SELECT USING (true);

-- BEMÆRK: For at lade personalet oprette egne varer direkte fra skærmen (uden RPC), tillader vi kun insert på ingredienser.
CREATE POLICY "Tillad oprettelse af nye varer" ON ingredients FOR INSERT WITH CHECK (true);

