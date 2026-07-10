# Style This — 360-Degree Codebase & UX/UI Review Report

This report presents a comprehensive review of the styling engine, user interface, data compliance, and architectural structures of the application. It evaluates the codebase against the brand identity of Anastasiia Preston ("Quiet Luxury", "Clean Editing", "Outfit Formulas", and structured layering) and the core principles of the **Boardroom Manifestet** (Rules 3 through 8).

---

## 1. Executive Summary

### 1.1 Correcting Project Branding and Identity
The application currently contains fragmented branding. It is mandatory that the project name is unified under the official designation **"Style This"** and all references to the legacy name **"Det Digitale Atelier"** (found in configuration files like `package.json` and error boundary components) are corrected. 

### 1.2 Core Concept Evaluation
The application's core product mission is to provide personalized styling recommendations based on a user's individual characteristics. Specifically, it is designed to allow the user to start their styling journey from **their own body shape/type** and/or **their own favorite piece of clothing**. 

Currently, the application **FAILS** to support this core concept:
1. **No Structured Profile Onboarding**: The landing page immediately loads a static "Styling Lookbook" carousel with pre-determined cards. There is no onboarding questionnaire, slider, or interface selector allowing users to input their body shape, proportions, height, or skin undertone.
2. **Abstract and Low-Guidance Search**: The only interactive styling entry point is a single free-text input field prompting the user to "describe their silhouette preference" in Danish. 
3. **No Garment-First Input**: The application has no mechanism for a user to select, upload, or describe a favorite piece of clothing from their wardrobe. Searching for clothes (e.g., "strik" or "bukser") is not modeled, resulting in a default fallback advice card.
4. **Fragile and Hardcoded Matching Engine**: The backend styling logic relies on client-side keyword substring checking (e.g., checking if the input string contains Danish words like `mave` or `ben`). If the input query does not match these specific words, the system falls back to a generic static card, rendering the application functionally static.

---

## 2. Specific Code References

Below are the exact file paths, line numbers, code snippets, and structural descriptions of the technical deficiencies identified in the codebase:

### 2.1 Snapping Offset Bug in Carousel
*   **File Path**: `src/app/components/Carousel.tsx` (Lines 59 & 66)
*   **Code Snippets**:
    *   *Line 59*:
        ```tsx
        className="carousel-item snap-center shrink-0 w-[280px] sm:w-[360px] h-[80%] flex flex-col justify-center"
        ```
    *   *Line 66*:
        ```tsx
        style={{ marginLeft: index === 0 ? "calc(-140px)" : "0", marginRight: index === looks.length - 1 ? "calc(-140px)" : "0" }}
        ```
*   **Description**: The carousel uses CSS scroll-snapping with manual offset margins on the first and last elements to center the items against a container padding of `px-[50vw]`. However, while the item width changes from `280px` on mobile to `360px` on desktop (`sm:w-[360px]`), the margin calculations remain hardcoded to `-140px` (exactly half of the mobile `280px` width). On desktop viewports (width $\ge$ 640px), this causes the first and last items to snap off-center by exactly **`40px`** (`180px - 140px`), breaking visual alignment.

### 2.2 Blanket Global CSS Transition Override
*   **File Path**: `src/app/globals.css` (Lines 38-41)
*   **Code Snippet**:
    ```css
    /* Base transition for all interactive elements */
    a, button, input, select, textarea {
      transition: all var(--duration-quiet) var(--ease-quiet);
    }
    ```
*   **Description**: This selector applies a global `transition: all` override to every standard interactive HTML tag. It conflicts with fine-grained local styling transitions, dynamic state-driven background shifts, and Framer Motion animations (like scale or opacity adjustments on carousel scroll), causing visible browser layout stutters and GPU rendering delays.

### 2.3 Hardcoded Static Mock Data
*   **File Path**: `src/app/page.tsx` (Lines 11-30)
*   **Code Snippet**:
    ```typescript
    const MOCK_LOOKS: Look[] = [
      {
        id: "1",
        image: "/images/empire.png",
        title: "The Empire Edit",
        description: "Empire-talje i sandnuancer. Forlænger silhuetten og giver ro."
      },
      {
        id: "2",
        image: "/images/knit.png",
        title: "Structured Layers",
        description: "Abdominal camouflage gennem struktureret strik over en let tunika."
      },
      {
        id: "3",
        image: "/images/trousers.png",
        title: "Volume Balance",
        description: "Brede bukser med chunky støvler for perfekt proportionel balance."
      }
    ];
    ```
*   **Description**: The lookbook items are defined as a static array directly within the routing file. They are not stored in a structured JSON database, seed file, or external content provider, which violates modularity standards and limits dynamic styling integration.

### 2.4 Brittle String Matching for Styling Queries
*   **File Path**: `src/app/lib/stylingLogic.ts` (Lines 55-84)
*   **Code Snippet**:
    ```typescript
    export function getStyleAdvice(input: string) {
      const query = input.toLowerCase();
      if (query.includes("mave") || query.includes("skjul")) {
        return {
          title: "Abdominal Camouflage",
          advice: "Vi anbefaler en struktureret strik over en let tunika for at skabe ubrudte vertikale linjer.",
          rule: silhouetteEngine.abdominal_camouflage.apply.vertical_lines
        };
      }
      if (query.includes("ben") || query.includes("længde") || query.includes("højere")) {
        return {
          title: "Ben-for-dage Effekt",
          advice: "Brug high-waist bukser med et half-tuck og sko i samme farve som bukserne for at forlænge benene.",
          rule: silhouetteEngine.waist_resolution_logic.conditions[0].then.result
        };
      }
      if (query.includes("bred") || query.includes("wide")) {
        return {
          title: "Volumen Balance",
          advice: "Til brede bukser anbefaler vi chunky støvler for at skabe visuel balance til det brede snit.",
          rule: footwearLogic.definitions.wide_fit.instruction
        };
      }
      
      return {
        title: "Quiet Luxury Standard",
        advice: "Et minimalistisk, monokromt look bygget på teksturkontraster frem for mønstre.",
        rule: "monochrome_chic"
      };
    }
    ```
*   **Description**: The styling engine utilizes simple Danish keyword substring matches. It lacks structural types, synonyms, multi-language support, or robust NLP/LLM routing. Typing "oversized blazer" or "strikketrøje" fails to match any condition, resulting in the default "Quiet Luxury Standard" response.

### 2.5 Dead and Unexecuted Styling Configs
*   **File Path**: `src/app/lib/stylingLogic.ts` (Lines 19-23 & Lines 35-47)
*   **Code Snippets**:
    *   *Lines 19-23*:
        ```typescript
        magic_lengthening_rules: {
          pointed_toe_priority: true,
          match_skin_tone_priority: true,
          logic: "Hvis sko matcher hudtone eller buksefarve, forlænges benets visuelle linje (Trick 6, W! DK).",
        }
        ```
    *   *Lines 35-47*:
        ```typescript
        waist_resolution_logic: {
          rule: "Betinget tucking-logik for at løse kildekonflikt (Curvii vs. W! DK)",
          conditions: [
            {
              if: { waist_type: "high_waist" },
              then: { action: "half_tuck", result: "ben-for-dage-effekt" },
            },
            {
              if: { waist_type: "mid_low_waist" },
              then: { action: "no_tuck", result: "undgå_mave_fokus" },
            },
          ],
        }
        ```
*   **Description**: These styling rules represent critical domain knowledge (resolving the tucking style conflicts between style guides Curvii and W! DK, and pointed-toe elongation logic). However, they are defined as static configuration objects and are **never dynamically evaluated** or executed in relation to actual user selections.

### 2.6 Outdated Header Branding
*   **File Path**: `src/app/page.tsx` (Line 49)
*   **Code Snippet**:
    ```tsx
    <h1 className="text-xl tracking-widest font-light uppercase text-foreground">Style This</h1>
    ```
*   **Description**: Although the visual header has been hardcoded in the frontend to "Style This", it remains inconsistent with system level metadata, and package parameters. The name should be centralized and loaded from a single site configuration file rather than hardcoded in line.

### 2.7 Debug Code Leak: Exposing Internal Rule Name
*   **File Path**: `src/app/page.tsx` (Lines 75-77)
*   **Code Snippet**:
    ```tsx
    <div className="text-xs text-foreground/40 font-mono bg-background/50 p-2 rounded-sm border border-foreground/5">
      Rule applied: {advice.rule}
    </div>
    ```
*   **Description**: Exposing internal algorithmic parameters (such as `open_cardigans_or_blazers` or `ben-for-dage-effekt`) in a developer-focused monospace style directly inside the production viewport violates the "No Cringe Policy." It leaks code structures to users who expect a premium, high-end editorial experience.

### 2.8 Technical/Boilerplate Font Family Selection
*   **File Path**: `src/app/globals.css` (Lines 24-25)
*   **Code Snippet**:
    ```css
    --font-sans: var(--font-geist-sans);
    --font-mono: var(--font-geist-mono);
    ```
*   **Description**: The application maps standard UI fonts to Vercel's developer-focused Geist Sans/Geist Mono. These fonts have a technical, programming-centric appearance that detracts from the warm, editorial, and curated styling aesthetic of Anastasiia Preston.

### 2.9 Dead Code: Unused Scroll Event Listener
*   **File Path**: `src/app/components/Carousel.tsx` (Lines 17-25)
*   **Code Snippet**:
    ```typescript
    useEffect(() => {
      const handleScroll = () => {
        if (!containerRef.current) return;
        const scrollPosition = containerRef.current.scrollLeft;
        // calculate which item is closest to the center
        const containerWidth = containerRef.current.offsetWidth;
        // The items are ~300px on desktop or 80vw on mobile.
        // We can just rely on IntersectionObserver, but simple scroll math works too if items are fixed width.
      };
      
      // Better: use IntersectionObserver to detect which item is in the center.
      ...
    ```
*   **Description**: The `handleScroll` event handler is defined within the scroll hook but is never attached to the container element via an listener (`addEventListener`). It represents dead code that pollutes compilation bundles.

### 2.10 Standard Unoptimized HTML Image Tag
*   **File Path**: `src/app/components/Carousel.tsx` (Line 69)
*   **Code Snippet**:
    ```tsx
    <img src={look.image} alt={look.title} className="w-full h-full object-cover" />
    ```
*   **Description**: Using raw `<img>` tags instead of Next.js's native `<Image>` component from `next/image` bypasses critical framework optimizations, including automatic responsive resizing, layout shift prevention (CLS), and modern file format conversions (e.g., WebP/AVIF).

---

## 3. UX/UI & Styling Assessment

### 3.1 Preston's Aesthetic Framework
Anastasiia Preston's branding guidelines are rooted in the concepts of:
*   **"Quiet Luxury"**: Minimalist, understated palettes, high-end editorial whitespace, and low-contrast transitions.
*   **"Clean Editing"**: Elimination of visual clutter, code leaks, and developer artifacts.
*   **"Outfit Formulas"**: Structured, rule-based styling combining a wardrobe anchor (e.g., an oversized piece) with contrasting layers, appropriate tucking styles, and proportion-balancing footwear.
*   **"Structured Layering"**: Creating vertical columns of color using open layers (cardigans, trenches) to balance proportions.

### 3.2 Visual & Structural Deficiencies
*   **Visual Snapping Defects**: The 40px off-center snapping of carousel items on desktop viewports breaks the geometric symmetry required by high-end design layouts. It feels unpolished and ruins the visual alignment of the lookbook.
*   **Disconnected Color Transitions**: The color slider modifies the page background color (e.g., to a soft orange/cream for `glow` or light gray for `analog`). However, the fixed bottom navigation bar remains stuck in the static `bg-background` variable. During background transitions, this creates a harsh, unaligned seam at the bottom of the viewport, violating color harmony. In addition, the slider has no effect on the outfits displayed, making it a disconnected visual gimmick.
*   **Clinical and Negative Terminology**: Displaying names like "Abdominal Camouflage" to the user is clinical and focus-negative. It highlights insecurities rather than presenting empowering, luxury solutions. Preston's guidelines dictate using positive, elevated terms such as "Proportional Balance" or "Silhouette Harmony".
*   **Typographic Disconnect**: The choice of Geist Sans/Mono creates an engineering-tool feel rather than a fashion styling environment. A luxury aesthetic requires editorial typography, combining serif headings (e.g., Playfair Display, Garamond) with soft, high-legibility body typefaces (e.g., Lora, Inter).

---

## 4. Boardroom Manifestet Compliance Scorecard

| Rule | Title | Status | Findings and Rationale |
| :--- | :--- | :--- | :--- |
| **Rule 3** | The Ultimate Vibe Check | ⚠️ **PARTIAL** | The minimalist spacing is strong, but the desktop carousel snapping alignment error (40px off-center), the bottom navigation transition color seam, and the Geist developer fonts violate the "No Cringe" policy. |
| **Rule 4** | 5-Sekunders Reglen | ❌ **FAIL** | A first-time user cannot understand that this is a tool for styling their own body or favorite clothing item. It presents a static Lookbook, and the text input provides no instructions, placeholder context, or suggestion chips. |
| **Rule 5** | The M&A Standard | ❌ **FAIL** | The application relies on client-side hardcoded static mock arrays, dead code fragments (unused scroll listener), and lacks any automated testing suite (0% coverage), rendering it unready for external due diligence. |
| **Rule 6** | Zero-Trust Frontend | ⚠️ **PARTIAL** | The input handles empty queries without crashing, but because there are no API integrations, data loading states, or error boundaries, the frontend is untested against real network failures. |
| **Rule 7** | Nul Friktion på Gulvet | ❌ **FAIL** | Submitting the styling input instantly wipes the query text, preventing the user from refining their search. Furthermore, there is no submit button, forcing mobile users to rely on the virtual keyboard's "Enter" key, and the primary action tabs (Wardrobe, Profile) are dead links. |
| **Rule 8** | Absolut Dataproveniens | ❌ **FAIL** | There is no backend database, no Row-Level Security (RLS) policies, and no auditing mechanism (Data Source Audit Trail) to trace algorithmic outputs back to their origins (such as the Curvii or W! DK style manuals). |

---

## 5. Recommendations & Technical Recipes

To resolve the compliance and design gaps identified above, the following technical solutions must be implemented.

### 5.1 Dynamic Outfit Formula Generator Refactoring
Replace the brittle substring checks in `src/app/lib/stylingLogic.ts` with a structured, type-safe rules engine that evaluates the user's body parameters and wardrobe anchors:

```typescript
// src/app/types/styling.ts

export interface BodyProfile {
  waistType: "high_waist" | "mid_low_waist";
  bodyFocus: "abdomen" | "legs" | "balance";
  height?: "petite" | "tall" | "average";
}

export interface FavoriteGarment {
  name: string; 
  category: "top" | "bottom" | "footwear" | "outerwear";
  fit: "oversized" | "wide-leg" | "slim-fit" | "fitted" | "structured";
  color: string;
  details?: string[];
}

export type ColorTheme = "glow" | "analog" | "monochrome";

export interface OutfitFormulaResult {
  title: string;
  advice: string;
  formula: {
    anchor: string;
    pairingPieces: string[];
    tuckStyle: "half_tuck" | "no_tuck" | "full_tuck";
    footwearChoice: string;
    layeringStrategy: string;
    colorCombination: string;
  };
  appliedRuleIds: string[];
  provenanceSources: string[];
}
```

```typescript
// src/app/lib/stylingEngine.ts
import { BodyProfile, FavoriteGarment, ColorTheme, OutfitFormulaResult } from "../types/styling";

export function generateOutfitFormula(
  body: BodyProfile,
  garment: FavoriteGarment,
  theme: ColorTheme
): OutfitFormulaResult {
  const ruleIds: string[] = [];
  const sources: string[] = [];
  const pairings: string[] = [];
  let tuck: "half_tuck" | "no_tuck" | "full_tuck" = "no_tuck";
  let footwear = "Klassiske lædersko";
  let layering = "Bær alene eller som inderste lag";
  let colorMix = "Monokrom palette";
  let adviceParts: string[] = [];

  // 1. Proportional Balance (Volume Contrast)
  if (garment.fit === "oversized" || garment.fit === "wide-leg") {
    ruleIds.push("PRESTON_VOLUME_CONTRAST");
    sources.push("Anastasiia Preston Volume Guide");
    if (garment.category === "top" || garment.category === "outerwear") {
      pairings.push("Slanke eller kropsnære underdele (f.eks. cigaretbukser eller et silkeskørt)");
      adviceParts.push(`For at balancere volumen i din ${garment.name}, parrer vi den med en slankere underdel.`);
    } else if (garment.category === "bottom") {
      pairings.push("Fitted top (f.eks. en fintstrikket rullekrave eller kropsnær bodystocking)");
      adviceParts.push(`Din ${garment.name} har markant volumen. Hold overdelen slank for at definere silhuetten.`);
      footwear = "Chunky støvler med kraftig sål";
      ruleIds.push("FOOTWEAR_VOLUME_BALANCE");
      sources.push("W! DK Footwear Manual");
    }
  } else if (garment.fit === "slim-fit" || garment.fit === "fitted") {
    ruleIds.push("PRESTON_VOLUME_CONTRAST");
    sources.push("Anastasiia Preston Volume Guide");
    if (garment.category === "bottom") {
      pairings.push("Voluminøs overdel (f.eks. oversized blazer eller tyk strik)");
      adviceParts.push("Giv modspil til de slanke bukser ved at tilføje volumen og struktur på overkroppen.");
    }
  }

  // 2. Waist Resolution (Curvii vs W! DK Conflict Resolution)
  if (body.bodyFocus === "abdomen") {
    tuck = "no_tuck";
    layering = "Tilføj en åben, struktureret blazer eller lang åben cardigan for at danne vertikale linjer";
    pairings.push("Åben, figursyet jakke");
    adviceParts.push("Vi anvender et draperet snit uden indsnævring om maven, understøttet af åbne lodrette lag.");
    ruleIds.push("SILHOUETTE_ABDOMINAL_CAMOUFLAGE");
    sources.push("Curvii Camouflage Ruleset");
  } else {
    // Apply waist resolution dynamically based on waistType
    if (body.waistType === "high_waist") {
      tuck = "half_tuck";
      adviceParts.push("Fremhæv din høje talje med et afslappet half-tuck foran for at maksimere benlængden.");
      ruleIds.push("WAIST_RESOLUTION_HIGH_WAIST");
      sources.push("W! DK Waist Definition Guide");
    } else {
      tuck = "no_tuck";
      adviceParts.push("Lad overdelen falde frit for at skabe en flydende og uafbrudt kropslinje.");
      ruleIds.push("WAIST_RESOLUTION_LOW_WAIST");
      sources.push("W! DK Waist Definition Guide");
    }
  }

  // 3. Footwear Elongation & Skin Tone Matching
  if (body.bodyFocus === "legs") {
    footwear = "Spidse støvler (pointed-toe)";
    if (theme === "glow") {
      footwear += " i hudtonematchende (nude) farver";
      ruleIds.push("FOOTWEAR_ELONGATION_SKIN_MATCH");
      sources.push("W! DK Footwear Manual (Trick 6)");
    } else {
      footwear += ` matchet til farven ${garment.color}`;
      ruleIds.push("FOOTWEAR_ELONGATION_MONOCHROME");
      sources.push("W! DK Footwear Manual");
    }
    adviceParts.push("Forlæng den visuelle benlinje ved at eliminere farvekontraster mellem underdel og sko.");
  }

  // 4. Color Theme Processing
  if (theme === "glow") {
    colorMix = "Varme, hudtonematchende nuancer (f.eks. sand, kamel, rosegold)";
  } else if (theme === "analog") {
    colorMix = "Nærstående farver med lav kontrast (f.eks. beige og elfenben)";
  } else if (theme === "monochrome") {
    colorMix = `Udelukkende nuancer af ${garment.color} med kontrast i tekstur (f.eks. strik vs. silke)`;
  }

  return {
    title: body.bodyFocus === "legs" ? "Ben-for-dage Silhuet" : "Proportional Balance",
    advice: adviceParts.join(" "),
    formula: {
      anchor: garment.name,
      pairingPieces: pairings,
      tuckStyle: tuck,
      footwearChoice: footwear,
      layeringStrategy: layering,
      colorCombination: colorMix
    },
    appliedRuleIds: ruleIds,
    provenanceSources: sources
  };
}
```

### 5.2 Landing Page Re-Architecture (Frictionless Onboarding)
Redesign the core page flow in `src/app/page.tsx` to provide clear direction to the user. Instead of a generic input, present a dual-entry toggle schema:

```tsx
// src/app/components/OnboardingFlow.tsx
"use client";

import { useState } from "react";
import { BodyProfile, FavoriteGarment } from "../types/styling";

interface OnboardingProps {
  onCalculate: (body: BodyProfile, garment: FavoriteGarment) => void;
}

export function OnboardingFlow({ onCalculate }: OnboardingProps) {
  const [startPoint, setStartPoint] = useState<"body" | "clothes">("body");
  
  // State for body options
  const [waist, setWaist] = useState<"high_waist" | "mid_low_waist">("high_waist");
  const [focus, setFocus] = useState<"abdomen" | "legs" | "balance">("balance");
  
  // State for garment options
  const [garmentName, setGarmentName] = useState("Klassisk Trenchcoat");
  const [category, setCategory] = useState<"top" | "bottom" | "footwear" | "outerwear">("outerwear");
  const [fit, setFit] = useState<"oversized" | "wide-leg" | "slim-fit" | "fitted" | "structured">("oversized");
  const [color, setColor] = useState("sand");

  const handleSubmit = () => {
    onCalculate(
      { waistType: waist, bodyFocus: focus },
      { name: garmentName, category, fit, color }
    );
  };

  return (
    <div className="w-full max-w-xl mx-auto p-6 bg-surface/50 border border-foreground/5 rounded-sm">
      {/* Dual Entry Selector */}
      <div className="flex border-b border-foreground/10 mb-6">
        <button
          className={`flex-1 pb-3 text-xs tracking-widest uppercase transition-colors ${startPoint === "body" ? "border-b border-accent text-foreground font-medium" : "text-foreground/40"}`}
          onClick={() => setStartPoint("body")}
        >
          1. Tag udgangspunkt i krop
        </button>
        <button
          className={`flex-1 pb-3 text-xs tracking-widest uppercase transition-colors ${startPoint === "clothes" ? "border-b border-accent text-foreground font-medium" : "text-foreground/40"}`}
          onClick={() => setStartPoint("clothes")}
        >
          2. Tag udgangspunkt i tøjstykke
        </button>
      </div>

      {startPoint === "body" ? (
        <div className="space-y-4">
          <div>
            <label className="block text-[10px] uppercase tracking-widest text-foreground/60 mb-2">Taljehøjde</label>
            <div className="flex gap-2">
              <button 
                onClick={() => setWaist("high_waist")}
                className={`flex-1 py-2 text-xs border rounded-sm ${waist === "high_waist" ? "border-accent bg-accent/5 text-foreground" : "border-foreground/10 text-foreground/60"}`}
              >
                Høj Talje (High-Waist)
              </button>
              <button 
                onClick={() => setWaist("mid_low_waist")}
                className={`flex-1 py-2 text-xs border rounded-sm ${waist === "mid_low_waist" ? "border-accent bg-accent/5 text-foreground" : "border-foreground/10 text-foreground/60"}`}
              >
                Middel/Lav Talje
              </button>
            </div>
          </div>
          <div>
            <label className="block text-[10px] uppercase tracking-widest text-foreground/60 mb-2">Hovedfokus for styling</label>
            <div className="grid grid-cols-3 gap-2">
              <button 
                onClick={() => setFocus("legs")}
                className={`py-2 text-xs border rounded-sm ${focus === "legs" ? "border-accent bg-accent/5 text-foreground" : "border-foreground/10 text-foreground/60"}`}
              >
                Forlæng benene
              </button>
              <button 
                onClick={() => setFocus("abdomen")}
                className={`py-2 text-xs border rounded-sm ${focus === "abdomen" ? "border-accent bg-accent/5 text-foreground" : "border-foreground/10 text-foreground/60"}`}
              >
                Proportional harmoni
              </button>
              <button 
                onClick={() => setFocus("balance")}
                className={`py-2 text-xs border rounded-sm ${focus === "balance" ? "border-accent bg-accent/5 text-foreground" : "border-foreground/10 text-foreground/60"}`}
              >
                Generel balance
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div>
            <label className="block text-[10px] uppercase tracking-widest text-foreground/60 mb-1">Hvad er dit yndlingsstykke tøj?</label>
            <input 
              type="text" 
              value={garmentName}
              onChange={(e) => setGarmentName(e.target.value)}
              className="w-full bg-transparent border-b border-foreground/20 text-sm py-2 focus:outline-none focus:border-accent text-foreground"
            />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-[10px] uppercase tracking-widest text-foreground/60 mb-1">Kategori</label>
              <select 
                value={category} 
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full bg-transparent border border-foreground/10 text-xs p-2 rounded-sm text-foreground"
              >
                <option value="top">Overdel</option>
                <option value="bottom">Underdel</option>
                <option value="outerwear">Ydertøj</option>
                <option value="footwear">Fodtøj</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] uppercase tracking-widest text-foreground/60 mb-1">Pasform</label>
              <select 
                value={fit} 
                onChange={(e) => setFit(e.target.value as any)}
                className="w-full bg-transparent border border-foreground/10 text-xs p-2 rounded-sm text-foreground"
              >
                <option value="oversized">Oversized / Løs</option>
                <option value="wide-leg">Brede ben</option>
                <option value="slim-fit">Tætsiddende</option>
                <option value="fitted">Figursyet</option>
                <option value="structured">Struktureret</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] uppercase tracking-widest text-foreground/60 mb-1">Hovedfarve</label>
              <input 
                type="text" 
                value={color} 
                onChange={(e) => setColor(e.target.value)}
                className="w-full bg-transparent border border-foreground/10 text-xs p-2 rounded-sm text-foreground"
              />
            </div>
          </div>
        </div>
      )}

      {/* Suggestion Chips */}
      <div className="mt-6">
        <span className="text-[10px] uppercase tracking-widest text-foreground/40 block mb-2">Hurtige eksempler:</span>
        <div className="flex flex-wrap gap-2">
          <button 
            onClick={() => {
              setStartPoint("body");
              setWaist("high_waist");
              setFocus("legs");
            }}
            className="text-[10px] bg-foreground/5 hover:bg-foreground/10 px-2 py-1 rounded-full text-foreground/75"
          >
            🔍 High-waist + Forlæng ben
          </button>
          <button 
            onClick={() => {
              setStartPoint("clothes");
              setGarmentName("Brede Silkebukser");
              setCategory("bottom");
              setFit("wide-leg");
              setColor("sort");
            }}
            className="text-[10px] bg-foreground/5 hover:bg-foreground/10 px-2 py-1 rounded-full text-foreground/75"
          >
            🔍 Brede Silkebukser
          </button>
        </div>
      </div>

      {/* Submit Action */}
      <button
        onClick={handleSubmit}
        className="w-full mt-6 bg-foreground text-background py-3 text-xs tracking-widest uppercase hover:bg-foreground/90 transition-colors flex justify-center items-center gap-2 font-medium"
      >
        Generér stylingformel
        <span className="text-sm">→</span>
      </button>
    </div>
  );
}
```

### 5.3 Next.js Optimized Image Migration
Replace the unoptimized raw `<img>` tag in `Carousel.tsx` (line 69) with Next.js's `<Image>` component to guarantee Layout Shift Protection (CLS) and dynamic format conversion:

```tsx
// src/app/components/Carousel.tsx (Replacement for line 69)
import Image from "next/image";

// Within Carousel items mapping:
<div className="w-full h-full relative overflow-hidden bg-surface rounded-sm shadow-inner">
  <Image 
    src={look.image} 
    alt={look.title} 
    fill 
    sizes="(max-width: 640px) 280px, 360px"
    className="object-cover transition-transform duration-700 hover:scale-105" 
    priority={index === 0} 
    loading={index === 0 ? "eager" : "lazy"}
  />
</div>
```

### 5.4 Supabase/PostgreSQL Database Architecture (Rule 8 Compliance)
To enable secure styling profile saves and wardrobe tracking while strictly adhering to Rule 8 (Row-Level Security), establish the following database tables in Supabase / PostgreSQL:

```sql
-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. User Profiles Table
CREATE TABLE public.user_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    waist_type VARCHAR(20) NOT NULL CHECK (waist_type IN ('high_waist', 'mid_low_waist')),
    body_focus VARCHAR(20) NOT NULL CHECK (body_focus IN ('abdomen', 'legs', 'balance')),
    skin_tone VARCHAR(20) CHECK (skin_tone IN ('warm', 'cool', 'neutral')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 3. Wardrobe Items Table (Starting Clothing Items)
CREATE TABLE public.wardrobe_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    category VARCHAR(20) NOT NULL CHECK (category IN ('top', 'bottom', 'footwear', 'outerwear')),
    fit VARCHAR(20) NOT NULL CHECK (fit IN ('oversized', 'wide-leg', 'slim-fit', 'fitted', 'structured')),
    color VARCHAR(30) NOT NULL,
    is_favorite BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 4. Enable Row Level Security (RLS)
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wardrobe_items ENABLE ROW LEVEL SECURITY;

-- 5. Establish Owner Access Policies
CREATE POLICY "Users can view and edit their own profile" 
ON public.user_profiles
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage their own wardrobe items" 
ON public.wardrobe_items
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);
```

### 5.5 EU AI Act Data Source Audit Trail Schema
Implement an immutable, cryptographically verifiable append-only ledger schema to log the styling suggestions. This links generated recommendations back to the style manual rules and origin databases (complying with Rule 8 data provenance and the EU AI Act):

```sql
-- 1. Create Styling Recommendation Audit Table
CREATE TABLE public.styling_recommendation_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    
    -- Inputs Snapshots
    body_profile_snapshot JSONB NOT NULL,
    favorite_garment_snapshot JSONB,
    selected_theme VARCHAR(20) NOT NULL,
    
    -- Applied Logic Metadata
    rule_ids_applied VARCHAR(50)[] NOT NULL, -- e.g. {'PRESTON_VOLUME_CONTRAST'}
    provenance_sources VARCHAR(100)[] NOT NULL, -- e.g. {'Anastasiia Preston Volume Guide', 'W! DK Waist Definition Guide'}
    
    -- Output Snapshot
    generated_advice_text TEXT NOT NULL,
    
    -- Cryptographic Provenance Hash
    -- SHA-256 Hash of: user_id + body_profile_snapshot::text + favorite_garment_snapshot::text + rule_ids_applied::text + salt
    integrity_hash CHAR(64) NOT NULL,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 2. Enable RLS
ALTER TABLE public.styling_recommendation_logs ENABLE ROW LEVEL SECURITY;

-- 3. Set RLS Permissions
-- Users can only insert records (when requesting suggestions) and read their own history.
-- UPDATES AND DELETES ARE PROHIBITED (No UPDATE or DELETE policy exists).
CREATE POLICY "Users can insert styling logs"
ON public.styling_recommendation_logs
FOR INSERT
WITH CHECK (auth.uid() = user_id OR auth.uid() IS NULL);

CREATE POLICY "Users can view their own styling history"
ON public.styling_recommendation_logs
FOR SELECT
USING (auth.uid() = user_id);
```

### 5.6 Automated Testing Suite (Vitest Setup)
Establish testing infrastructure in the project to cover styling calculations and rule validation:

1.  **Configure scripts in `package.json`**:
    ```json
    "scripts": {
      "test": "vitest run",
      "test:watch": "vitest"
    }
    ```
2.  **Add tests for the dynamic engine**:
    ```typescript
    // src/app/lib/stylingEngine.test.ts
    import { describe, it, expect } from "vitest";
    import { generateOutfitFormula } from "./stylingEngine";
    import { BodyProfile, FavoriteGarment } from "../types/styling";

    describe("Style This Recommendation Engine", () => {
      it("should apply volume contrast matching for oversized tops", () => {
        const body: BodyProfile = { waistType: "high_waist", bodyFocus: "balance" };
        const garment: FavoriteGarment = {
          name: "Oversized Strik",
          category: "top",
          fit: "oversized",
          color: "sand"
        };
        
        const result = generateOutfitFormula(body, garment, "monochrome");
        
        expect(result.appliedRuleIds).toContain("PRESTON_VOLUME_CONTRAST");
        expect(result.formula.pairingPieces[0]).toContain("Slanke eller kropsnære underdele");
      });

      it("should resolve tucking conflicts using Curvii when abdomen camouflage is active", () => {
        const body: BodyProfile = { waistType: "high_waist", bodyFocus: "abdomen" };
        const garment: FavoriteGarment = {
          name: "Silkeskjorte",
          category: "top",
          fit: "fitted",
          color: "hvid"
        };
        
        const result = generateOutfitFormula(body, garment, "monochrome");
        
        expect(result.formula.tuckStyle).toBe("no_tuck");
        expect(result.appliedRuleIds).toContain("SILHOUETTE_ABDOMINAL_CAMOUFLAGE");
        expect(result.provenanceSources).toContain("Curvii Camouflage Ruleset");
      });

      it("should apply pointed-toe footwear elongation when leg lengthening is targeted", () => {
        const body: BodyProfile = { waistType: "high_waist", bodyFocus: "legs" };
        const garment: FavoriteGarment = {
          name: "Bukser",
          category: "bottom",
          fit: "slim-fit",
          color: "navy"
        };
        
        const result = generateOutfitFormula(body, garment, "glow");
        
        expect(result.formula.footwearChoice).toContain("Spidse støvler (pointed-toe)");
        expect(result.formula.footwearChoice).toContain("hudtonematchende");
        expect(result.appliedRuleIds).toContain("FOOTWEAR_ELONGATION_SKIN_MATCH");
      });
    });
    ```
