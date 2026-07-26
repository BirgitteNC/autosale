# ConvienienSale App

Dette er kernesystemet for ConvienienSale - web-appen, der lynhurtigt og intelligent præsenterer inspirerende opskrifter baseret på medarbejderens input af tilbudsvarer, og derved inspirerer kunden til at købe hele måltidsløsninger (krydssalg).

## Arkitektur & Data
Systemet bruger Supabase som backend til at gemme råvarer, opskrifter og relationerne imellem dem. Frontend er bygget med React/Vite.

### Mappen: `src/scripts`
I mappen `src/scripts/` ligger vores produktionskritiske master-scripts. Alt andet er flyttet til `archive/`.
- **`scrape_meny_expansion_ssr.cjs`**: En ekstremt lynhurtig opskrifts-scraper, der trækker data ned fra Meny.dk via deres skjulte SSR-datalag (`__NEXT_DATA__`).
- **`clean_database_master.cjs`**: Vores datavasker til grov-rengøring af databasen.

---

## 🛑 Den Gyldne Regel: "Nul Tolerance for Spøgelsesingredienser" (Rule 9)

Efter lang tids kamp mod "hallucinerede" opskrifter (hvor f.eks. Broccoli på magisk vis optrådte i en Kødsovs pga. reklamelinks i bunden af opskriftssiden), har systemet fået indkodet en streng **"Rule 9"** for data-import.

**Regel 9 dikterer:**
> **Et råvare-match MÅ IKKE oprettes, medmindre selve råvarens navn står EKSPLICIT nævnt i opskriftens instruktioner.**

### Intelligent Synonym Matching
For at undgå at specifikke butiksvarer som *"Skåret Salatblanding"* eller *"Tomater (Danske)"* bliver "ghosted" med 0 opskrifter, benytter databasen et synonym-lag. Når opskriften skriver *"hak salaten og skær tomaterne"*, oversættes dette via regex-aliases direkte til de korrekte butiksvarer. Dette sikrer fyldte skærme og relevant mersalg i grøntafdelingen.

### Kødkonflikter (Meat Conflict Eliminator)
Match-algoritmen i `SignageView.jsx` er bygget til at forstå "kategorier". Hvis medarbejderen vælger en råvare fra `Kød` eller `Fiskeafdeling` (f.eks. Hakket Oksekød), vil systemet prompte gennemløbe og **frasortere** alle opskrifter, der baserer sig på en anden form for kød/fisk (f.eks. svinekød). Kød trumfer altid sidetilbehør (som burgerboller).

---

## Fremtid (Backlog)
Se `backlog.md` for de næste features - heriblandt synkroniseret kundeskærm, hvor kundens demo-visning spejler medarbejderens valg.
