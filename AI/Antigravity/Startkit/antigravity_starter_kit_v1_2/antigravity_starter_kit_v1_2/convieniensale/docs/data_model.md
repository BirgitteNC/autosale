# Datamodel

## Entiteter

### Råvare (Ingredient)
- id
- eksternt_varenummer (string) (Gør det muligt at mappe varer 1:1 med butikkens eget API/kassesystem)
- navn (f.eks. "Hakket oksekød", "Spidskål")
- kategori (f.eks. "Kød", "Grønt", "Standardvare")
- standard_vare (boolean) (Angiver om det forventes at være på fast lager)
- allergener (array: f.eks. ["gluten", "laktose"])
- estimeret_avance (decimal/integer) (Til brug for sortering af opskrifter)
- alternativ_id (relation til en anden Råvare ved allergi eller udsolgt, f.eks. "Glutenfri Pasta")

### Opskrift (Recipe)
- id
- titel (f.eks. "Spidskålsgryde med oksekød")
- tidsforbrug_min (integer) (Maks 30 min)
- portioner (integer) (F.eks. 2 eller 4)
- instruktioner (text)
- protein_per_300g (integer)
- kalorier_per_300g (integer)

### Opskrift_Ingrediens (Relation)
- opskrift_id
- raavare_id
- maengde (string/integer) (F.eks. "400g")
- er_noegleraavare (boolean) (Sand for de primære varer, som assistenten forventes at indtaste)

## Regler og constraints
- Vi opretter en fast lukket pulje af Opskrifter til MVP'en.
- Appen sorterer og vælger Opskrifter baseret på summen af `estimeret_avance` på de Råvarer, der indgår.
- Brugeren/kunden skal kunne slå et "glutenfri" eller "laktosefri" filter til på sin telefon, hvilket swapper standard ingredienser med deres alternativer.
