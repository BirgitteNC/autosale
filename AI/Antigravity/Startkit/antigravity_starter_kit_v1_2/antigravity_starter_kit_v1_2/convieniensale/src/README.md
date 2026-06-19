# MenyMenu (Dagrofa POC)

Velkommen til maskinrummet bag MenyMenu – et intelligent, interaktivt skiltesystem til reducering af madspild og generering af mersalg i lokale supermarkeder.

## Konceptet & Arkitekturen (The Bible)
1. **Medarbejderen (Staff PWA):** Alle afdelinger (f.eks. slagter, grønt) har adgang til systemet via en tablet eller telefon (`/staff`). De logger ind med lokal pinkode.
   * **Merge-logik:** Afdelingerne kan løbende tilføje datovarer til systemet henover dagen uden at overskrive hinandens valg. 
   * **Ryd alt:** Den lukkeansvarlige tømmer databasen ved hjælp af "Ryd alt"-knappen.
2. **Kunden (Butiksskærmen):** Skærmen (`/signage`) viser automatisk opskrifter, der baserer sig på personalets indtastede madspildsvarer.
   * **Safe Fallback:** Bliver systemet tømt, looper skærmen mellem neutrale, sikre vegetar-retter (testet af "Sanity Sussie").
3. **Kunden (Mobilen):** Når kunden scanner QR-koden, får de indkøbslisten. Dette genererer automatisk analytisk data.

## Teknologisk Stack
- **Frontend:** React + Vite (Progressive Web App - PWA)
- **Database:** Supabase (PostgreSQL) med realtidsopdateringer.
- **Tracking:** Vercel Web Analytics indbygget til sporing af QR-scans og POC-effekt.
- **Hosting:** Vercel (Edge Network)
- **AI QA & Data Validation:** Rollerne Data-Dorthe og Sanity-Sussie har auditeret databasen for logik-brist og allergirisici.

## Sikkerhed & Jura
- Systemet kører som en offline-resilient PWA, der kan overleve midlertidige netværksudfald.
- Alle kunde-views indeholder ansvarsfraskrivelser vedr. allergener.
- Systemet understøtter GDPR-kompatibel 'exit strategy' for testbutikkerne.

---
*Vedligeholdt af The Drogon Project (Antigravity v1.2)*
