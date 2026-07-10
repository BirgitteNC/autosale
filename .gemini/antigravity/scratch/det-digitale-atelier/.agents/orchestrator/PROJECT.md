# Project: Det Digitale Atelier 360-Degree Review

## Architecture
This is a Next.js application designed to showcase styling lookbooks under the "Quiet Luxury" aesthetic.
- **Frontend Components**: Built using React and Tailwind CSS.
  - `Carousel.tsx` handles horizontal snapping scroll and Framer Motion scale transitions.
  - `ColorSlider.tsx` handles color theme switching (monochrome, analog, glow).
  - `QuietInput.tsx` is a minimal search/input field that triggers getStyleAdvice.
- **Business/Styling Logic**:
  - `stylingLogic.ts` handles the matching rules for footwear, abdominal camouflage, waist resolution, and color shaping.

## Milestones
| # | Name | Scope | Dependencies | Status | Conversation ID |
|---|------|-------|-------------|--------|-----------------|
| 1 | State Initialization | Initialize orchestrator files (plan.md, progress.md, context.md, PROJECT.md) | none | DONE | - |
| 2 | Specialist Reviews | Run reviews by team members (Drogon, Emma, Hanne, Magda, Niels, Søren, Zia) in parallel | M1 | DONE | Drogon: 115c97af-c9cf-430c-a082-2b78a4401a54, Emma Gen2: 16133b6d-abbc-44e8-a98c-ec8fd6288f09, Hanne: b6de4f44-e988-4f36-b2f3-df094f7d8e6e, Magda: d6e05140-491e-4b2f-912e-8a00123bffa2, Niels Gen2: 84684271-6c58-4ef5-b1a3-c723cb955e92, Søren Gen2: e25d0455-d423-4966-8f07-7f282517cb8e, Zia Gen2: 6e52eef8-1301-42eb-9df9-e406df75448e |
| 3 | Synthesis & Draft | Aggregate reports and draft agent_team_review.md | M2 | DONE | ba87fa74-a727-4dfb-ab29-a2af752e2870 |
| 4 | Verification & Audit | Verify the review via Reviewer and Forensic Auditor subagents | M3 | DONE | Reviewer: 3b5b14e0-8446-4757-a7b0-831e33cd6149, Auditor: 31cf1703-b55a-4215-adb7-f7f717560c3d |
| 5 | Delivery & Reporting | Write final agent_team_review.md to project root and report completion | M4 | DONE | - |

## Interface Contracts
### Specialist Review Output Contract
Each specialist agent must deliver a handoff report in their folder containing:
- Specific file references and lines examined.
- Evaluated rules / perspectives against requirements.
- Concrete findings and action items.
- A boolean check on Boardroom Manifestet rules.
