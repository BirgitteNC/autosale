-- Opret Råvarer (Fisk & Skaldyr)
INSERT INTO ingredients (id, navn, kategori, allergener, standard_vare) VALUES 
('ing_laks', 'Laksefilet', 'Fisk & Skaldyr', '["fisk"]'::jsonb, false),
('ing_torsk', 'Torskefilet', 'Fisk & Skaldyr', '["fisk"]'::jsonb, false),
('ing_citron', 'Økologisk Citron', 'Frugt & Grønt', '[]'::jsonb, false)
ON CONFLICT (id) DO UPDATE SET kategori = EXCLUDED.kategori, allergener = EXCLUDED.allergener;

-- Opret Råvarer (Bageri)
INSERT INTO ingredients (id, navn, kategori, allergener, standard_vare) VALUES 
('ing_ost', 'Skæreost', 'Mejeri', '["laktose"]'::jsonb, false)
ON CONFLICT (id) DO UPDATE SET kategori = EXCLUDED.kategori, allergener = EXCLUDED.allergener;

-- Opret Opskrifter (Fisk)
INSERT INTO recipes (id, titel, beskrivelse, billed_url, portioner, tidsforbrug_min, instruktioner, ingredienser, tags) 
VALUES (
  'meny_ovnbagt_laks', 
  'Ovnbagt laks med citron og sprøde grøntsager', 
  'En lynhurtig og velsmagende fiskeret, der stort set passer sig selv i ovnen. Perfekt til en sund hverdag!', 
  'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?q=80&w=960&auto=format&fit=crop', 
  4, 
  25, 
  '["Tænd ovnen på 200 grader.", "Læg laksefileterne i et smurt ildfast fad. Krydr med salt og peber.", "Skær citronen i skiver og læg et par stykker oven på hver laks.", "Bag laksen i ovnen i ca. 12-15 minutter (afhængig af tykkelse).", "Server med kogte kartofler eller en frisk salat."]'::jsonb, 
  '[{"raavare_id":"ing_laks","amount":4,"unit":"stk","text":"Laksefilet (ca. 125g pr. stk)"},{"raavare_id":"ing_citron","amount":1,"unit":"stk","text":"Økologisk Citron"},{"raavare_id":"ing_extra_3","amount":800,"unit":"g","text":"Kartofler"}]'::jsonb, 
  '["Fisk", "Hovedret", "Sundt", "Hurtig"]'::jsonb
) ON CONFLICT (id) DO NOTHING;

INSERT INTO recipes (id, titel, beskrivelse, billed_url, portioner, tidsforbrug_min, instruktioner, ingredienser, tags) 
VALUES (
  'meny_smorstegt_torsk', 
  'Smørstegt torsk med persillesovs og kartofler', 
  'Klassisk dansk hverdagsmad når det er bedst. Den milde torsk og den cremede sovs er et kæmpe hit.', 
  'https://images.unsplash.com/photo-1599084993091-1cb5c0721cc6?q=80&w=960&auto=format&fit=crop', 
  4, 
  30, 
  '["Kog kartoflerne møre i letsaltet vand.", "Lav en opbagning af smør og mel i en gryde, spæd op med mælk til en cremet sovs. Vend hakket persille i og smag til med salt og peber.", "Krydr torskefileterne med salt og peber.", "Steg torsken på en varm pande i halvt smør/halvt olie i ca. 3-4 minutter på hver side, indtil den flager let.", "Anret torsken med kartofler og rigelig persillesovs."]'::jsonb, 
  '[{"raavare_id":"ing_torsk","amount":600,"unit":"g","text":"Torskefilet"},{"raavare_id":"ing_persille","amount":1,"unit":"bdt","text":"Frisk Persille"},{"raavare_id":"ing_extra_3","amount":800,"unit":"g","text":"Kartofler"},{"raavare_id":null,"amount":0.5,"unit":"L","text":"Mælk (til sovs)"}]'::jsonb, 
  '["Fisk", "Hovedret", "Dansk Klassiker"]'::jsonb
) ON CONFLICT (id) DO NOTHING;

-- Opret Opskrifter (Bageri)
INSERT INTO recipes (id, titel, beskrivelse, billed_url, portioner, tidsforbrug_min, instruktioner, ingredienser, tags) 
VALUES (
  'meny_bruschetta', 
  'Klassisk Bruschetta med tomat og hvidløg', 
  'En vidunderlig og nem forret, eller den perfekte måde at bruge en rest friskbagt flutes på, inden det bliver tørt.', 
  'https://images.unsplash.com/photo-1572695157366-5e585ab2b69f?q=80&w=960&auto=format&fit=crop', 
  4, 
  15, 
  '["Skær flutes i skiver og rist dem sprøde i ovnen eller på en brødrister.", "Skær tomaterne i fine tern og vend med lidt olivenolie, salt og peber.", "Gnid de ristede brød med et overskåret hvidløgsfed.", "Anret de hakkede tomater på toppen af brødene og server straks."]'::jsonb, 
  '[{"raavare_id":"ing_flutes","amount":1,"unit":"stk","text":"Friskbagt Flutes"},{"raavare_id":"ing_tomat","amount":4,"unit":"stk","text":"Friske Tomater"},{"raavare_id":null,"amount":2,"unit":"fed","text":"Hvidløg"},{"raavare_id":null,"amount":2,"unit":"spsk","text":"Olivenolie"}]'::jsonb, 
  '["Forret", "Vegetar", "Stop Madspild"]'::jsonb
) ON CONFLICT (id) DO NOTHING;

INSERT INTO recipes (id, titel, beskrivelse, billed_url, portioner, tidsforbrug_min, instruktioner, ingredienser, tags) 
VALUES (
  'meny_luksus_toast', 
  'Sprød luksus toast med skinke og ost', 
  'Ikke bare en almindelig toast. Med godt brød, ægte skinke og rigelig ost, bliver dette et fantastisk hurtigt måltid.', 
  'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?q=80&w=960&auto=format&fit=crop', 
  2, 
  10, 
  '["Smør brødskiverne med lidt smør på ydersiden.", "Læg skinke og to skiver ost imellem to stykker brød.", "Steg dem gyldne på en pande ved middel varme, til osten er smeltet, eller brug en toastmaskine.", "Server med en håndfuld friske grøntsager on the side."]'::jsonb, 
  '[{"raavare_id":"ing_toastbrod","amount":4,"unit":"skiver","text":"Toastbrød"},{"raavare_id":"ing_skinke","amount":2,"unit":"skiver","text":"Kogt Skinke"},{"raavare_id":"ing_ost","amount":4,"unit":"skiver","text":"Skæreost"}]'::jsonb, 
  '["Frokost", "Hurtig", "Børnevenlig"]'::jsonb
) ON CONFLICT (id) DO NOTHING;
