-- HACKER HANNES PERFORMANCE BOMB FIX
-- Kør dette script i Supabase SQL Editor for at oprette Stored Procedure
-- Denne funktion flytter den tunge matematik fra kundens browser ned i databasen.

CREATE OR REPLACE FUNCTION find_best_recipes(p_store_id uuid)
RETURNS TABLE (
    id text,
    titel text,
    beskrivelse text,
    tidsforbrug_min integer,
    portioner integer,
    billed_url text,
    kalorier_per_300g integer,
    protein_per_300g integer,
    tags text[],
    ingredienser jsonb,
    instruktioner text[],
    match_count integer,
    food_waste_count integer,
    is_food_waste_saver boolean
) AS $$
DECLARE
    v_selected text[];
    v_food_waste text[];
    v_is_vegetarian boolean := true;
BEGIN
    -- Hent butikkens aktive promotions
    SELECT selected_ingredients, food_waste_ingredients 
    INTO v_selected, v_food_waste
    FROM active_promotions 
    WHERE store_id = p_store_id;

    -- Hvis ingen varer er valgt, returner bare 3 vilkårlige/standard opskrifter
    IF v_selected IS NULL OR array_length(v_selected, 1) IS NULL THEN
        RETURN QUERY 
        SELECT r.id, r.titel, r.beskrivelse, r.tidsforbrug_min, r.portioner, 
               r.billed_url, r.kalorier_per_300g, r.protein_per_300g, r.tags, 
               r.ingredienser, r.instruktioner, 
               0, 0, false 
        FROM recipes r LIMIT 3;
        RETURN;
    END IF;

    -- Tjek om kød/fisk er valgt. Hvis kun grøntsager er valgt, er v_is_vegetarian = true.
    SELECT NOT EXISTS (
        SELECT 1 FROM ingredients 
        WHERE id = ANY(v_selected) 
        AND kategori IN ('Kød', 'Fisk', 'Fjerkræ')
    ) INTO v_is_vegetarian;

    -- Udfør matching logic: Hent opskrifter, tæl matches, og sortér
    RETURN QUERY
    WITH recipe_matches AS (
        SELECT 
            r.*,
            (
                SELECT count(*)
                FROM jsonb_array_elements(r.ingredienser) as ing
                WHERE (ing->>'raavare_id') = ANY(v_selected)
            )::int as m_count,
            (
                SELECT count(*)
                FROM jsonb_array_elements(r.ingredienser) as ing
                WHERE (ing->>'raavare_id') = ANY(v_food_waste)
            )::int as fw_count,
            EXISTS (
                SELECT 1
                FROM jsonb_array_elements(r.ingredienser) as ing
                JOIN ingredients i ON i.id = (ing->>'raavare_id')
                WHERE (ing->>'raavare_id') = ANY(v_selected)
                AND i.standard_vare = false
            ) as has_primary_match
        FROM recipes r
    )
    SELECT 
        rm.id, rm.titel, rm.beskrivelse, rm.tidsforbrug_min, rm.portioner, 
        rm.billed_url, rm.kalorier_per_300g, rm.protein_per_300g, rm.tags, 
        rm.ingredienser, rm.instruktioner, 
        rm.m_count, 
        rm.fw_count,
        (rm.fw_count > 0) as is_food_waste_saver
    FROM recipe_matches rm
    WHERE rm.has_primary_match = true
    AND (
        NOT v_is_vegetarian OR 
        (rm.tags IS NOT NULL AND 'Vegetar' = ANY(rm.tags))
    )
    -- Skjul gamle AI hallucinationer fra V1, men tillad de 3 "gyldne"
    AND (NOT rm.id LIKE 'ai-%' OR rm.id IN ('ai-chicken-burger', 'ai-chicken-curry', 'ai-openrecipes-pasta'))
    ORDER BY rm.m_count DESC
    LIMIT 3;
END;
$$ LANGUAGE plpgsql;
