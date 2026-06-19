# Arkitektur

## Formål
Beskriv den simplest mulige løsning til "convieniensale" MVP, som opfylder kravene.

## Frontend
1. **Medarbejder Interface (Tablet/Web):** Enkel skærm hvor salgsassistenten hurtigt kan indtaste aktuelle råvarer (f.eks. grøntsager, kød) der skal sælges nu.
2. **Kunde Skærm (Digital Signage i butik):** En tablet eller stor skærm ved f.eks. grøntafdelingen, der præsenterer 2-3 opskriftsforslag baseret på assistentens indtastning. 
   - Opskriften med bedst avance for butikken præsenteres øverst.
   - Viser makrotal (kalorier og protein pr. 300g portion).
   - Viser en QR-kode, kunden kan scanne.
3. **Kunde Mobil (Web-view):** Når kunden scanner QR-koden, lander de på en anonym, mobilvenlig webside med hele opskriften og en interaktiv indkøbsliste (hvor varer kan afkrydses/udstreges, efterhånden som de lægges i kurven). Inkluderer også et alternativt spor for gluten-/laktoseallergi.

## Backend / Logik
- **Opskrifts-database:** En lukket og kvalitetssikret database af opskrifter.
- **Match & Ranking Algoritme:** Finder og sorterer opskrifter baseret på indtastede råvarer og butikkens avance.
- **QR Generator:** Skaber en URL til den valgte opskrift.
- **Varesortiment Integration (API):** En read-only (envejs) API-integration mod butikkens/kædens system (f.eks. Dagrofa). Appen trækker live sortimentsdata for at kunne præsentere reelle, tilgængelige erstatningsvarer (f.eks. ved udsolgte varer eller allergier). I første version (MVP) kan dette modul simuleres med statiske data, indtil API-adgangen er formelt på plads med kæden.

## Flow
1. **[Start]** Salgsassistent indtaster varer med kort holdbarhed på sin enhed.
2. **[Handling]** Systemet matcher med den faste database, rangerer efter avance og skubber 2-3 lækre forslag op på kundeskærmen i butikken.
3. **[Resultat]** Kunde bliver inspireret, scanner QR-koden, og går direkte til hylderne for at plukke resten af ingredienserne via sin telefon.

## Bevidste simplificeringer
- Første version bruger en lukket opskriftsdatabase for at garantere 100% pålidelighed og kundetillid.
- **Ingen kasseintegration:** For at undgå kompleksitet omkring GDPR og betalingssikkerhed laves der ingen kasseintegration. Appen er 100% anonym for brugeren.
- **Fremtidig Kundeklub:** Appen forberedes konceptuelt til senere at kunne understøtte remote adgang (f.eks. "dagens opskrift i min Meny") og loyalitetsprogrammer.
- Vi antager at standardvarer (krydderier, olie, pasta osv.) er på lager.
