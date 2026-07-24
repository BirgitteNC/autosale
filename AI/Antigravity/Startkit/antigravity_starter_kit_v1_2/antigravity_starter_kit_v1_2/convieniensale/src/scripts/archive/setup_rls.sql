-- Sprint 7: Sikkerhedsopdatering (RLS)
-- Kør dette script i Supabase SQL Editor for at aktivere Row Level Security og sikre databasen mod uautoriserede ændringer.

-- 1. Aktivér RLS på alle tabeller
ALTER TABLE ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE active_promotions ENABLE ROW LEVEL SECURITY;
ALTER TABLE store_pins ENABLE ROW LEVEL SECURITY;
ALTER TABLE stores ENABLE ROW LEVEL SECURITY;

-- 2. Fjern eksisterende politikker (for at scriptet kan køres flere gange sikkert)
DROP POLICY IF EXISTS "Offentlig læseadgang til ingredients" ON ingredients;
DROP POLICY IF EXISTS "Admins kan skrive ingredients" ON ingredients;
DROP POLICY IF EXISTS "Offentlig læseadgang til recipes" ON recipes;
DROP POLICY IF EXISTS "Admins kan skrive recipes" ON recipes;
DROP POLICY IF EXISTS "Offentlig læseadgang til active_promotions" ON active_promotions;
DROP POLICY IF EXISTS "Admins kan skrive active_promotions" ON active_promotions;
DROP POLICY IF EXISTS "Offentlig læseadgang til stores" ON stores;
DROP POLICY IF EXISTS "Admins kan skrive stores" ON stores;
DROP POLICY IF EXISTS "Offentlig læseadgang til store_pins" ON store_pins;
DROP POLICY IF EXISTS "Admins kan skrive store_pins" ON store_pins;

-- 3. Opret Politikker for Ingredients
CREATE POLICY "Offentlig læseadgang til ingredients" ON ingredients FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admins kan skrive ingredients" ON ingredients FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 4. Opret Politikker for Recipes
CREATE POLICY "Offentlig læseadgang til recipes" ON recipes FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admins kan skrive recipes" ON recipes FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 5. Opret Politikker for Active Promotions
CREATE POLICY "Offentlig læseadgang til active_promotions" ON active_promotions FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admins kan skrive active_promotions" ON active_promotions FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 6. Opret Politikker for Stores
CREATE POLICY "Offentlig læseadgang til stores" ON stores FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admins kan skrive stores" ON stores FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 7. Opret Politikker for Store Pins
-- Tillader anon at læse (for at StaffView kan validere PIN), men kun authenticated brugere kan oprette/slette PINs.
CREATE POLICY "Offentlig læseadgang til store_pins" ON store_pins FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admins kan skrive store_pins" ON store_pins FOR ALL TO authenticated USING (true) WITH CHECK (true);
