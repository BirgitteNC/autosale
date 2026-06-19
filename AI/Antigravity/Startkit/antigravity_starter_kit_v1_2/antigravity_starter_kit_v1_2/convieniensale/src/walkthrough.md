# Præsentation: MenyMenu – Fremtidens Madinspiration

Velkommen til the Boardroom. Her er det samlede overblik over den MVP (Minimum Viable Product), vi har bygget, som I kan præsentere for bestyrelsen.

## 🎯 Visionen
Supermarkeder spilder tonsvis af gode datovarer hver dag. Kunderne vil gerne købe dem, men de mangler ofte inspiration til, hvordan ingredienserne kan omsættes til et reelt måltid.

**MenyMenu** løser dette problem ved at koble butikkens aktuelle datovarer sammen med et intelligent, digitalt opskrifts-katalog.

## 🛠️ Det færdige system
Vi har bygget en samlet 'Culinary Engine' fordelt på tre skærme, der taler sammen i realtid:

### 1. Personale-Appen (Medarbejder Tablet)
* **Formål:** Giver medarbejderen et lynhurtigt værktøj til at scanne og vælge de råvarer, der skal sælges i dag.
* **Funktion:** Så snart medarbejderen vælger f.eks. "Hakket Kylling" og "Spidskål", matcher systemet øjeblikkeligt ingredienserne op imod den store opskriftsdatabase.
* **Fordel:** Ingen manuel indtastning af opskrifter. Systemet finder automatisk de bedste matches.

### 2. Butiksskærmen (Digital Signage)
* **Formål:** At fange kundens opmærksomhed nede i butikken med lækre billeder og inspiration.
* **Funktion:** Skærmen lytter konstant på databasen. Når medarbejderen opdaterer varerne på tabletten, skifter butiksskærmen på under ét sekund (via Supabase Realtime). 
* **Design:** Viser professionelle billeder, tilberedningstid, kalorie/protein-makroer og en stor QR-kode.

### 3. Kunde-Appen (Mobil)
* **Formål:** At gøre det nemt for kunden at handle ind og lave maden derhjemme.
* **Funktion:** Kunden scanner QR-koden på butiksskærmen og får hele opskriften direkte ind på telefonen.
* **Features:**
  * Dynamisk skalering af portioner (2, 4 eller 6 personer).
  * Interaktiv indkøbsliste, hvor kunden kan krydse varer af.
  * Allergen-filter (Kunden kan med ét klik skifte til Glutenfri eller Laktosefri varer i opskriften).

## 🚀 Teknisk Arkitektur (ETL & Big Data)
Tidligt i forløbet dræbte vi "AI-Generatoren" og overgik til en **Intelligent Databasematch-arkitektur**.
Dette var en afgørende forretningsbeslutning, fordi:
- Vi undgår farlige 'hallucinationer' (hvor AI opfinder ingredienser, der ikke findes i butikken).
- Vi sikrer 100% konsistent kvalitet (ægte Dagrofa-testede opskrifter).
- **Skalerbarhed:** Systemet er nu bygget til at kunne integrere massive ETL-pipelines. Vi har bevist dette ved at hente en ekstern opskrift fra den åbne database `openrecip.es` direkte ind i systemet på få sekunder.

## 💡 Næste Skridt (V2)
Til bestyrelsen kan vi foreslå følgende udvidelser i Version 2:
1. **Automatiske Prisskilte:** Integration med butikkens POS-system, så prisen på de valgte varer automatisk vises og opdateres.
2. **Big Data Ingestion:** Opsætning af et script, der automatisk suger tusindvis af åbne opskrifter ind fra internettet og oversætter dem til Meny's varekatalog.
3. **Kundelogin:** Mulighed for at kunden kan gemme deres yndlings-tilbudsopskrifter til senere.

---

## 🛠️ Version 2.0 Opdateringer

### ETL Pipeline (Big Data Ingestion)
Vi har nu implementeret første udkast til **ETL Pipelinen** i `src/scripts/etl_pipeline.js`. Scriptet (som køres med `npm run etl`) demonstrerer hvordan vi automatisk kan:
1. **Extract:** Hente hundredevis af eksterne opskrifter via API (testet med dummyjson).
2. **Transform:** Normalisere ingredienser og bygge dem ind i MenyMenu datamodellen. 
3. **Load:** Lægge dem direkte i Supabase, klar til brug i appen.

> [!WARNING]
> RLS (Row Level Security) er pt. slået til for sikkerhedens skyld, hvilket betyder at backend-pipelinen kræver en `VITE_SUPABASE_SERVICE_KEY` i `.env`-filen for at køre de automatiske inserts succesfuldt, da den anonyme nøgle bliver blokeret.
### Backend Migration (The ESG Fix)
For at forhindre unødig data-trafik (og beskytte mod data lækager) har vi refaktoreret hele systemets hjerte fra at være et *Client-Side* filter til at være en *Server-Side* Stored Procedure (RPC) i Supabase databasen.
- **Miljøvenligt:** Butiksskærmene trækker ikke længere megabytes af opskrifter over netværket for at sortere dem. Alt klares i databasen og koster kun en brøkdel strøm og båndbredde.
- **SQL Fil:** Logikken er gemt i `docs/rpc_find_best_recipes.sql`, som skal køres i Supabase for at oprette funktionen.
- **Frontend Refaktorering:** `SignageView.jsx` og `CustomerMobileView.jsx` er opdateret, så de nu kun henter absolut minimalt med data. Mængden af tokens er skåret ind til benet.

---

## 🚀 Fase 2: Robusthed, Voice & B2B Strategi

### 1. Teknisk Sikkerhed (Debounce)
For at beskytte databasen mod overbelastning (fx hvis Preben "stresstester" systemet ved at trykke hurtigt), har vi implementeret en benhård `isSubmitting` Debounce-logik på `StaffView.jsx` "Opdater"-knappen. Den deaktiveres øjeblikkeligt, når et kald sendes, indtil Supabase svarer.

### 2. Voice Input (Torbens Drøm)
Vi har aktiveret indbygget **SpeechRecognition API** i browseren.
- **Funktion:** Nede i butikken kan Test-Torben nu blot trykke på en rød mikrofon-knap i `StaffView` og sige navnet på en råvare (f.eks. "Laks").
- **Design:** Voice-knappen er et frivilligt supplement, der placerer det talte ord direkte i det genindførte tekst-søgefelt. Den trygge standard er bevaret.

### 3. Kommerciel Værdi (The Margin & Early Warning Pitch)
Vi har re-defineret hele forretningsmodellen baseret på chefens knivskarpe analyse:
- **B2C (Slutforbruger):** Vi sælger løsningen udadtil som "Klima og Convenience".
- **B2B (Dagrofa/Købmanden):** Vi sælger systemet som et **Early Warning / Margin Shift** system. MenyMenu flytter proaktivt kundens salg fra lav-margin varer over til høj-margin måltider, alt imens det redder potentielt tab fra datovarer.

### 4. Hands-Off SAP Arkitektur
Vi har lagt strategien for IT-integration. Vi rører aldrig ved Dagrofas sensitive POS/Lager data. I stedet bygger vi en passiv **REST Webhook (Brevsprække)**, hvor deres SAP-system frivilligt og sikkert kan skubbe varer op på skærmen uden nogen data-risiko.
