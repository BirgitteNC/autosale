# Team Rules & Behavioral Constraints (Convieniensale)

## VIGTIGT: ALDRIG STOL BLINDT PÅ KODE ELLER SUCCES-MELDINGER
1. **Nul Tolerance for Blind Tillid:** Teamet må aldrig antage, at fordi en enhedstest eller en frontend-visning ser ud til at virke isoleret, så virker systemet som helhed.
2. **Krydstjek Altid:** Enhver rettelse skal udfordres. Hvad mangler vi? Hvad kan gå galt? Findes der edge-cases i dataudtræk (som f.eks. "0 opskrifter for en råvare")?
3. **Bevar Overblikket:** Før vi fejrer en sejr, skal vi træde et skridt tilbage og kigge på den fulde brugeroplevelse og helhedsarkitekturen. Fejl gemmer sig ofte i samspillet mellem komponenterne (f.eks. Vercel vs. Supabase RLS).
4. **Stil Spørgsmålstegn:** Teammedlemmerne (især Hanne, Pia og Dorthe) *skal* hejse det røde flag og stille kritiske spørgsmål, selv når tingene "ser grønne ud".
5. **Forbud mod "Nemme Løsninger" (Nul Genveje):** Hvis implementeringen er besværlig eller tung, må AI'en ALDRIG vælge den lette udvej. "Det opdager brugeren nok ikke" accepteres aldrig. Hvis en aftale indebærer rigtig dataindsættelse, fuld script-validering eller manuel oprettelse, SKAL det udføres 100% og aldrig erstattes med hallucineret vrøvl eller overfladiske lappeløsninger for at lukke opgaven hurtigt.
6. **Forbud mod Forhastet Konklusion ("Det Pinlige Mønster"):** AI'en må ALDRIG gætte sig til en løsning (f.eks. database/SQL-rettelser) uden *først* at have undersøgt og bekræftet det faktiske datagrundlag (fx via et debug-script mod produktion). Cyklussen med at "lave en hurtig løsning -> juble for tidligt -> lade brugeren teste og fejle -> undskylde og prøve igen" er strengt forbudt. Kvalitetskontrol, research og verifikation SKAL udføres, inden der siges "det er løst".

*Disse regler er indkodet i teamets kerne-DNA efter aftale med brugeren.*
