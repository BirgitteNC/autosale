-- Tilføj en UNIQUE constraint på 'navn' kolonnen i 'ingredients' tabellen.
-- Dette forhindrer ethvert fremtidigt scraper/import script i at oprette kloner (dubletter).
-- Databasen vil afvise ethvert forsøg på at indsætte et navn, der allerede eksisterer.

-- Sikr at der ikke er forkerte mellemrum der kan snyde constrainten fremadrettet (bruges hvis vi trimmer ved insert)
-- Men først og fremmest den hårde unikke constraint:

ALTER TABLE public.ingredients 
ADD CONSTRAINT unique_ingredient_navn UNIQUE (navn);
