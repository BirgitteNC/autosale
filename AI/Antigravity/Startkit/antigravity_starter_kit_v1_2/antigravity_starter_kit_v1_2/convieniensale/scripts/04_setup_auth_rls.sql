-- 1. Slå RLS til for tabellen 'store_pins'
ALTER TABLE public.store_pins ENABLE ROW LEVEL SECURITY;

-- 2. Slet ALLE eksisterende policies på tabellen (så ingen gamle "tillad alt" policies overlever)
DO $$
DECLARE
    pol record;
BEGIN
    FOR pol IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'store_pins' 
          AND schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.store_pins', pol.policyname);
    END LOOP;
END
$$;

-- 3. Opret streng RLS-politik:
-- KUN authenticated brugere (som StoreAdmins/SuperAdmins der er logget ind med ægte auth) må læse/skrive direkte.
-- Den anonyme bruger (som tabletten i butikken starter som) får IKKE adgang her!
CREATE POLICY "Kun godkendte admins må læse PINs direkte"
ON public.store_pins
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- 4. Opret sikker RPC (Remote Procedure Call) til PIN-validering (StaffView)
CREATE OR REPLACE FUNCTION verify_staff_pin(p_store_id UUID, p_pin_code TEXT)
RETURNS TABLE (
  is_valid BOOLEAN,
  role_description TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER -- Eksekverer med fulde rettigheder, selvom kalderen er anonym
AS $$
DECLARE
  v_desc TEXT;
BEGIN
  SELECT description INTO v_desc
  FROM public.store_pins
  WHERE store_id = p_store_id AND pin_code = p_pin_code
  LIMIT 1;

  IF FOUND THEN
    RETURN QUERY SELECT TRUE, v_desc;
  ELSE
    RETURN QUERY SELECT FALSE, ''::TEXT;
  END IF;
END;
$$;

-- Tillad at kalde funktionen
GRANT EXECUTE ON FUNCTION verify_staff_pin(UUID, TEXT) TO anon;
GRANT EXECUTE ON FUNCTION verify_staff_pin(UUID, TEXT) TO authenticated;
