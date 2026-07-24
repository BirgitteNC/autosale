-- 1. RYD OP I EKSISTERENDE DATA
-- Flytter fejlagtige 'Slagter'-varer
UPDATE ingredients 
SET kategori = 'Grønt' 
WHERE (navn ILIKE '%koriander%' AND navn NOT ILIKE '%frø%')
   OR navn ILIKE '%mandler%'
   OR navn ILIKE '%aubergine%';

UPDATE ingredients
SET kategori = 'Krydderier'
WHERE navn ILIKE '%korianderfrø%';

UPDATE ingredients
SET kategori = 'Basis'
WHERE navn ILIKE '%vand fra kødbollerne%';

-- 2. INDFØR DATA GOVERNANCE (SIKKERHEDSNET)
-- Opret en funktion der forhindrer fremtidig forurening af Slagter og Fiskeafdelingen
CREATE OR REPLACE FUNCTION enforce_ingredient_categories()
RETURNS TRIGGER AS $$
BEGIN
    -- Forbyd plantebaserede ord og væsker i Slagter/Fisk
    IF NEW.kategori IN ('Slagter', 'Fiskeafdeling', 'Kød', 'Fisk') THEN
        IF NEW.navn ILIKE ANY (ARRAY['%koriander%', '%mandler%', '%vand%', '%æble%', '%citron%', '%kartofler%', '%salat%', '%aubergine%']) THEN
            RAISE EXCEPTION 'Data Governance Fejl: Forsøgte at placere % i %.', NEW.navn, NEW.kategori;
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Tilknyt funktionen til Ingredients tabellen
DROP TRIGGER IF EXISTS trg_enforce_ingredient_categories ON ingredients;
CREATE TRIGGER trg_enforce_ingredient_categories
BEFORE INSERT OR UPDATE ON ingredients
FOR EACH ROW
EXECUTE FUNCTION enforce_ingredient_categories();
