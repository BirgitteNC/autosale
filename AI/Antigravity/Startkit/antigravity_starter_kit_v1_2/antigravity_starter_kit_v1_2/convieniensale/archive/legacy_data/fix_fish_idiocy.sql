
-- 1. Flyt alle ingredienser fra 'Fisk & Skaldyr' til 'Fiskeafdeling'
UPDATE ingredients SET kategori = 'Fiskeafdeling' WHERE kategori = 'Fisk & Skaldyr';

-- 2. Flyt opskrifter der bruger den nye (duplikerede) torsk til den eksisterende
UPDATE recipes
SET ingredienser = (
    SELECT jsonb_agg(
        CASE 
            WHEN elem->>'raavare_id' = 'ing_torsk' THEN jsonb_set(elem, '{raavare_id}', '"ing_extra_21"')
            ELSE elem
        END
    )
    FROM jsonb_array_elements(ingredienser) elem
)
WHERE ingredienser @> '[{"raavare_id": "ing_torsk"}]';

-- 3. Slet den duplikerede torsk
DELETE FROM ingredients WHERE id = 'ing_torsk';
