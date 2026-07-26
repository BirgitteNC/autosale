# AI Architecture & Engineering Roadmap
Dette dokument fungerer som det primære arkitektoniske kompas for alle agenter, der arbejder på projektet. Når vi bygger eller opdaterer systemer, **SKAL** vi designe ud fra disse branchestandarder.

## 1. The AI Agent Engineering Roadmap (De 8 Lag)
God AI-udvikling handler ikke om "prompt hacks" eller blot at kalde en model. Det handler om *System Building*. Enhver agent, der designer systemer, skal forholde sig til disse 8 lag:

1. **LLM Fundamentals & Reasoning:** Forstå hvordan modellen ræsonnerer alene, før den orkestreres i et større system.
2. **Context Engineering:** Design det fulde miljø og den statiske kontekst, som AI'en opererer i – tænk ét niveau højere end selve prompten.
3. **Memory Architecture:** Hukommelse er et førsteklasses fundament. Vælg bevidst mellem *Session memory* (korttid), *Vector retrieval* (RAG) og *Episodic memory* (på tværs af agenter).
4. **Agentic Workflows & Multi-Agent Orchestration:** Single-agenter har et loft. Produktionssystemer (som vores Boardroom) drives af netværk af specialiserede agenter, der afleverer opgaver til hinanden.
5. **MCP (Model Context Protocol) & Tool Connectivity:** Standardisér hvordan agenter forbinder til eksterne data og værktøjer. 
6. **AI Gateways & Routing:** Håndter og diriger forespørgsler optimalt i forhold til cost, latency og evner.
7. **Guardrails & Safety:** Sikkerhed skal indbygges direkte i arkitekturen, ikke tilføjes som et plaster til sidst. Autonome agenter kræver stærke grænser.
8. **Observability & Evaluation:** Når en agent fejler, får vi ikke et "stack trace", men et "reasoning loop". Vi skal kunne inspicere agentens beslutningsgrundlag via logs og artefakter.

## 2. Data Governance & AI-Readiness ("The Rings")
Governance er ikke en mappe med regler (Policy) – det er en levende *Operating Model*, der beviser ansvarlighed. For at bygge "AI Ready" systemer, skal lagene bygges indefra og ud:

*   **Inderste ring (Start her!): Data Foundation:** Bygger på Data Catalog og Data Quality. Hvis data i bunden (f.eks. PIM-systemets råvarelister) er dårlig, fejler alt andet.
*   **Anden ring: Governance:** Clean Reporting, Access Control, Lineage. Beviser, at vi styrer data korrekt (f.eks. medarbejder-login på tablet).
*   **Tredje ring: Trusted Analytics:** Semantic Layer, Source of Truth, Audit Readiness.
*   **Yderste ring: AI Ready:** Guardrails, Certified Metrics, EU AI Act compliance. 
*   **Regel:** *You cannot buy the outer ring without building every ring inside it first.*

## 3. Generative Engine Optimization (GEO) & AI-Ready Content
Hvis vores systemer skal eksponere data, som LLM'er og AI-søgemaskiner let kan læse og citere, skal indholdet struktureres efter AEO/GEO-principper:
*   **Skriv for mennesker, optimer for maskiner.**
*   Direkte svar helt i toppen af strukturen.
*   Tydelige, hierarkiske overskrifter (H1, H2, H3).
*   Brug sammenligningstabeller og lister.
*   Inkludér "FAQ-blokke" struktureret som Q&A.

## 4. De 6 Kernel-Terminologier (Opsummering)
Alle agenter forventes at arbejde ud fra disse koncepter:
1. **MCP:** Faste værktøjsprotokoller.
2. **Single-Agent Architecture:** Fokuseret opgaveløsning af én aktør.
3. **Skills:** Genanvendelige værktøjer gemt som dokumenter/scripts.
4. **Multi-Agent Architecture:** Samarbejde (Manager/Worker).
5. **Agentic RAG:** Dynamisk, selvkritisk dataudtræk.
6. **Memory:** Bevidst brug af Session og Persistent Storage.

## 5. Den Skjulte Kompleksitet i RAG (Retrieval-Augmented Generation)
At udtrække data er mere end blot "en prompt og en vector database". Vi skal forholde os til roden af systemet:
*   **Forberedelse:** Preprocessing & Cleaning, Chunking & Embeddings.
*   **Søgning:** Reranking (Cross-Encoders), Query Reformulation, Custom Retrievers (Hybrid/Dense/Sparse).
*   **Sikkerhed & Kvalitet:** PII Masking, Hallucination Detection, Ethical Bias Checks, Secure Retrieval.
*   **Læring:** Evaluation Metrics, Error Analysis, Feedback Loops.

## 6. Formlen for en Ægte AI Agent
Byggestenene for enhver agent-arkitektur følger denne formel:
*Your Data + Your Knowledge + Tools + Rules + Workflows + AI Reasoning = Personal AI Agent*
Agenten skal altid besidde disse 6 komponenter:
1. **Brain (Model):** Selve AI'en (GPT, Claude, etc.).
2. **Memory:** Både korttids- (session) og langtidshukommelse (preferences, vector stores).
3. **Tools:** APIs og scripts, der giver handlekraft (fx MCP).
4. **Planning:** Evnen til at bryde store mål ned i mindre skridt.
5. **Workflows:** Faste procedurer for hvordan opgaver udføres.
6. **Guardrails:** Regler for sikkerhed (f.eks. *Rule 9*, Human approvals, tilladelser).

## 7. AI Readiness: Et Platformsproblem
"AI vil ikke fiksere et svagt fundament. Det vil udstille det - smertefuldt og hurtigt."
Før vi skalerer, skal disse 6 platformselementer være på plads:
1. **Architecture:** Kan systemerne tale sammen uden at knække?
2. **Data:** Er konteksten pålidelig nok til AI?
3. **Integrations:** Er workflows forbundet end-to-end?
4. **Deployment:** Kan vi teste og release ofte?
5. **Controls:** Er permissions og audit trails tænkt ind fra start?
6. **Ownership:** Hvem "ejer" hele arbejdsgangen?

## 8. Realiteten i en AI-Native Virksomhed
En AI-løsning er aldrig bare en "chatbot + automation". Den reelle tech-stack består af 12 tætpakkede lag:
1. AI UX / Copilot Layer
2. Workflow Orchestration
3. Business Logic
4. Knowledge & Context
5. Data Infrastructure
6. Tool Integrations
7. Human-in-the-Loop
8. Model Routing
9. Evaluation & QA
10. Security & Permissions
11. Observability & Analytics
12. Feedback Loops & Learning

## 9. Evolutionen af Agentic AI (De 7 Trin)
Mange virksomheder forsøger at bygge "A2A agenter" før de har styr på fundamentet. AI-stakken er udviklet i lag, hvor hvert lag løser en begrænsning ved det foregående:
1. **Script Bots:** Hardcoded, no memory.
2. **LLMs:** Ræsonnering uden værktøjer.
3. **LLMs + Tools:** Forbundet til APIs/databaser.
4. **RAG:** Løser problemet med manglende domæneviden.
5. **Agentic Memory:** Bevarer kort- og langtidskontekst.
6. **MCP:** Standardiserer adgang til værktøjer.
7. **A2A Agents:** Delegetion mellem agenter.
*Husk:* Byg ikke en skyskraber før du har støbt fundamentet. Nogle gange er et simpelt workflow + RAG den bedste løsning.

## 10. RAG vs. Agentic RAG
*   **Standard RAG:** *Single-step retrieval.* (Query -> Generate Query -> Retrieve -> Augment -> Generate). Perfekt til hurtige faktaupslag.
*   **Agentic RAG:** *Multi-step reasoning.* (Understand -> Decide -> Retrieve -> Reason -> Refine -> Respond). Perfekt til dyb research, dynamiske data og komplekse spørgsmål, hvor agenten selv vurderer, om den har nok information, før den svarer.

## 11. De 4 System-Lag for Skalering ("Systems that compound")
Byg disse lag én gang for at undgå at gentage jer selv.
1. **System of Context (The Foundation):** Grundlaget (`AGENTS.md`, brand guidelines, ICP). Sørger for, at vi aldrig gætter.
2. **System of Skills (The Producers):** Målrettede scripts og workflows gemt i `.agents/skills/`.
3. **System of Orchestration (The Coordinators):** Agenter og Hooks (Guardrails, *Rule 9*), der beslutter hvilke skills der skal køres, og som håndhæver reglerne.
4. **System of Integrations (The Connectors):** APIs og MCP-forbindelser der trækker eller skubber data.
*Mantra:* **Context grounds. Skills produce. Agents coordinate. Integrations connect.**
