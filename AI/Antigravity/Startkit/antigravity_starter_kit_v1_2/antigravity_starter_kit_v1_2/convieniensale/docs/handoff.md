# MenyMenu - Handoff & Projekt Opsummering

Dette dokument tjener som overlevering til enhver ny AI-agent eller session, der skal fortsætte arbejdet på MenyMenu (også kendt under konceptnavnet The Culinary Engine).

## 👥 Team Roster ("The Boardroom")
Dette projekt drives af et fast, defineret hold af eksperter og test-personas. Når du interagerer i dette projekt, skal du være opmærksom på disse personaers ekspertise og synsvinkler:

- **Sælger-Søren:** Eksekvering & Pitching. Fokuserer på at sælge idéen til Dagrofa og sikre, at forretningsmodellen er overbevisende.
- **Exit/Entreprenør Emma:** Startup Strategy. Tænker på skalerbarhed, MVP-scope, målgruppepsykologi og hvordan man bygger noget, der reelt løser et problem.
- **SoMe Zia:** Branding, Design & UX. Sørger for, at produktet føles premium (Dagrofa/Meny standard), ser visuelt "wauw" ud, og at sprogbrugen er spot-on.
- **Nørde-Niels:** Lead Developer (React, Vite, Supabase). Hands-on kodning, UI-logik og debugging.
- **Magda (Rent & Pænt):** Code Hygiene. Sørger for at koden er ryddelig, at der ikke er "spaghetti-kode", og at filer er struktureret logisk.
- **Hacker Hanne:** Security & Database Ops. Supabase konfiguration, Row Level Security (RLS) og data-integritet.
- **Drogon:** Master Architect & Strategisk Rådgiver. Det store overblik, systemarkitektur og fremtidssikring (ETL pipelines, data modning).
- **Test-Torben:** Fysisk Testbruger & "Analog" Ambassadør. En ikke-digital persona, der tvinger os til at bygge ekstremt simple, idiotsikre brugergrænseflader.
- **Prøve-Preben:** "Dumsmart" Superbruger & Stresstester. Trykker på alt, prøver at snyde systemet og afslører logiske brist (fx inkonsistens i state).

## 🏗️ Nuværende Status (MVP)
Vi har succesfuldt bygget og deployet en MVP (Minimum Viable Product). Appen kører på Vercel (menymenu.vercel.app) og bruger Supabase som backend.

Appen består af tre hovedvisninger:

1. **SignageView (`/signage`)**: Den store skærm i butikken, der lokker kunder til med opskrifter baseret på butikkens aktuelle tilbud/datovarer. Viser QR-kode ("📸 Åbn kameraet på din telefon og peg herpå").
2. **CustomerMobileView (`/recipe/:id`)**: Kundens mobilvisning, når de scanner QR-koden. Viser opskriften og en indkøbsliste, så de let kan finde varerne i butikken.
3. **StaffView (`/staff`)**: Tablet-visning til medarbejderne på gulvet. Bruges til at "pushe" varer til skærmen (se "Forretningslogik" nedenfor).

## 🧠 Kerne-overvejelser & Forretningslogik
1. **Ingen AI-hallucinationer (Troværdighed)**: Vi er gået væk fra dynamisk AI-generering af opskrifter i realtid, da det skabte hallucinationer og utroværdige resultater (fx "Brug 1 dåse flåede tomater og 2 kilo agurk"). Systemet bygger nu på en lukket, deterministisk opskriftsdatabase. Opskrifter vises KUN, hvis de matcher de præcise ingredienser, medarbejderen har valgt.
2. **Dobbelt-logik: Fremstød vs. Madspild**: En kæmpe arkitektonisk og forretningsmæssig beslutning var at adskille to koncepter i StaffView:
   - **Fremstød (Valgte ingredienser):** Medarbejderen kan klikke på en vare for at pushe opskrifter med denne vare til skærmen (fx dyre fredagsbøffer med høj avance).
   - **Madspild / Datovarer ("Datovinder"):** Medarbejderen kan specifikt krydse en vare af som en "datovare". Dette sikrer, at vi kan pushe varer uden at kunderne tror, det hele er datovarer. Hvis en opskrift indeholder en markeret datovare, får den et prominent badge: 💚 Datovinder.
3. **"Datovinder" Branding (Zia's hjertebarn)**: Vi droppede betegnelsen "Red Madspild" (som klinger af affald/velgørenhed) og skiftede til "Datovinder". Det spiller ind i målgruppens psykologi i Meny, hvor kunderne gerne vil gøre et luksus-kup og have god samvittighed, uden at det føles billigt.
4. **Personalet (Test-Torben & Flexjobber-hensyn)**: Mange medarbejdere i detailhandlen er flexjobbere, unge ungarbejdere eller ikke-tekniske folk (Torbens). StaffView er derfor designet radikalt simpelt:
   - Intet komplekst søgefelt (blev fjernet).
   - Store, tydelige knapper med visuel feedback.
   - Rolige, ikke-stressende succes-beskeder (fx skærmen blinker grønt med "✅ Sendt til Butiksskærm!" og bliver på siden i stedet for at redirecte brugeren).
   - "Preben-sikret": Logikken i UI'et gør det umuligt at markere en vare som datovare uden at vælge den.

## 🛠️ Teknisk Stack
- **Frontend**: React, Vite, Tailwind CSS (Vanilla CSS tilpasset for premium look, ingen ren Tailwind uden styling).
- **Backend / Database**: Supabase (PostgreSQL).
- **Vigtige tabeller**: `recipes`, `ingredients`, `active_promotions`.
- **Deployment**: Vercel (Auto-deploy ved build).

## 🚀 Fremtidsplaner (V2)
1. **Personlige Logins**: I stedet for en generel butiks-pinkode, skal medarbejderne have personlige logins (for accountability, så vi kan se, hvem der gjorde hvad – igen, "Preben-sikring").
2. **ETL Pipeline (Drogon)**: Indhentning af 10.000+ opskrifter fra open datasets (fx openrecip.es) og Meny.dk.
3. **Kassesystem-integration**: Undersøge om man kan fjerne manuel indtastning ved at koble datovare-markeringen direkte på butikkens reelle lagerdata.
