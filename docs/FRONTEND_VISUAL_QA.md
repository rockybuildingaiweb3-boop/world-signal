# WORLD SIGNAL — Frontend Visual QA Protocol & Inspection Ledger (Phase 10)

> **Status**: Active Visual QA Authority (Stage 1 Baseline & Stage 5 Post-Implementation Audit Verified)  
> **Runtime Tool**: Real Headless Chromium via Playwright CLI (`http://localhost:3000`)

---

## 1. Mandatory Verification Matrix

Every Phase 10 visual change MUST pass all automated and visual checks **after the final code edit**:

| Check Category | Requirement | Pass Threshold |
| :--- | :--- | :--- |
| **Desktop First Paint** | `1440×900` Light & Dark, `zh-CN` & `en` | Cover headline, deck, CTA, `StoryVisual`, Verification Band, and `#02–#04` rail visible above the fold; zero duplicate publication title |
| **Visual Worlds Distinction** | World (`#desk-world-events`), AI (`#desk-ai-frontier`), Economy (`#desk-economic-outlook`) | Three unmistakably distinct visual worlds recognizable even if headings are hidden; all anchor IDs resolve cleanly |
| **Image Integrity & Anti-Repetition** | All `<img>` tags across Briefing, Expanded, Synthesis | `brokenCount === 0`, `naturalWidth > 0`, `duplicateSrcCount === 0` across Briefing (13 unique local interface photos), zero remote hotlinks |
| **Editorial Typography & Pull-Quote** | `PullQuoteBand` in `ExpandedView` (`#sec-why-it-matters`) | Display serif lead thesis strictly extracted from real `whyItMatters` prose; full interactive `[S1]`/`[C1]` citations preserved; no `border-l-4` slop |
| **Narrative Arc & Reading Bar** | `NarrativeArcRibbon` + `ReadingProgressBar` | Only stages backed by real signal sections rendered; reading progress hairline pinned cleanly at `top-[55px]` and `scaleX` advances on scroll |
| **Responsive Mobile Reflow** | `390×844` across Briefing & Expanded | `scrollWidth <= innerWidth` (`overflowX === false`), zero clipped controls, accessible tap targets |
| **Runtime Hygiene** | Browser Console & Network | `0` console errors, `0` uncaught exceptions, `0` broken local asset requests |
| **Automated Build & Tests** | `bun test src/test/` + `compile_applet` + `lint_applet` | 100% test pass (including all 36 local WebP disk & byte checks + `extractLeadThesis` unit tests), clean TypeScript/Vite build, 0 ESLint errors/warnings |

---

## 2. Stage 1 — Pre-Phase 10 Browser Audit ("BEFORE" Baseline)

Captured on `2026-11-28` at `1440×900` (`http://localhost:3000/?edition=2026-11-27`) prior to Stage 3/4 work:

- **Baseline Captures**: `.playwright-cli/p10-before-briefing-mid.png`, `p10-before-world-desk.png`, `p10-before-expanded-why.png`, `p10-before-synthesis.png`.
- **Audited Strengths Preserved from Phase 09**:
  - Above-the-fold cover spread fits cleanly at `1440×900` with zero duplicate wordmark.
  - Three distinct visual worlds (`WorldDocumentaryDesk`, `AiModernistDesk`, `EconomicHumanismDesk`) render cleanly in Light & Dark modes and Mobile `390×844`.
  - `NarrativeArcRibbon` and `ReadingProgressBar` (`top-[55px]`) function cleanly with zero console errors.
- **Concrete Gaps Identified for Phase 10 Resolution**:
  1. **Missing Mid-Page Desk Navigation & Visual Contents Folio (`p10-before-briefing-mid.png`)**: Between Executive Summary / Ranks `#06–#10` and the Domain Desks, readers had no visual overview or direct anchor links to jump into World, AI, or Economy desks. **Planned Fix**: Implement `EditionVisualFolio` + semantic `#desk-world-events`, `#desk-ai-frontier`, `#desk-economic-outlook` anchor IDs.
  2. **Boxed Plain-Prose *Why It Matters* (`p10-before-expanded-why.png`)**: The dossier's highest-value analytical thesis was rendered inside a flat tinted box at standard body scale without typographic hierarchy. **Planned Fix**: Implement `PullQuoteBand` backed by pure, unit-tested `extractLeadThesis()` preserving all source citations.
  3. **Thematic Photography Gaps in Live Edition (`p10-before-expanded-why.png`)**: Climate/COP signals (e.g. `WORLD-20261123-cop31-collapse`), border crossings, quantum computing, autonomous mobility, urban housing/property, and agricultural food inflation lacked dedicated subject photographs in the 30-asset library. **Planned Fix**: Acquire and visually validate 6 new local WebP assets (expanding library from `30 → 36`).
  4. **Abrupt Transition in Synthesis (`p10-before-synthesis.png`)**: Transition from the interactive Relationship Atlas into long-form Cross-Domain Monographs lacked an editorial visual chapter break connecting Synthesis to the publication's photography language. **Planned Fix**: Add a restrained `DocumentaryImageBreak` bridge between the Relationship Atlas and Cross-Domain Monographs.

---

## 3. Stage 5 — Post-Phase 10 Browser Inspection ("AFTER" Comparison & Revision Log)

Verified on `2026-11-28` in real headless Chromium (`playwright-cli`, `http://localhost:3000/?edition=2026-11-27`) across Desktop `1440×900` (Light & Dark, `zh-CN` & `en`) and Mobile `390×844`:

- **After Captures**:
  - `.playwright-cli/p10-after-folio.png` (`EditionVisualFolio` Light / `zh-CN`)
  - `.playwright-cli/p10-after-dark-folio.png` (`EditionVisualFolio` Dark / `en`)
  - `.playwright-cli/p10-after-mobile-folio.png` (`EditionVisualFolio` Mobile `390×844`)
  - `.playwright-cli/p10-after-expanded-climate.png` (`WORLD-20261123-cop31-collapse` opener with `world-climate-environment.webp`)
  - `.playwright-cli/p10-after-expanded-pullquote-v2.png` (`PullQuoteBand` at `#sec-why-it-matters`)
  - `.playwright-cli/p10-after-synthesis-bridge-v3.png` (revised `DocumentaryImageBreak` using `world-coastline-geography.webp`)

### Verified Runtime Telemetry

| Check | Result |
| :--- | :--- |
| **Briefing Images & Anti-Repetition** | `imgCount: 14`, `uniqueCount: 14`, `brokenCount: 0`, `duplicateSrcCount: 0`, `overflowX: false` |
| **Desk Anchor Navigation (`EditionVisualFolio`)** | `#desk-world-events`, `#desk-ai-frontier`, `#desk-economic-outlook` all present; clicking `#desk-ai-frontier` moved section top from `3604px → 95px` cleanly below the sticky `TopBar` |
| **Expanded Climate Dossier & `PullQuoteBand`** | `world-climate-environment.webp` decoded (`1360×1019`, `brokenCount: 0`); `PullQuoteBand` rendered real canonical thesis sentence in display serif framed by top/bottom hairline rules; `headerTopY: 0`, `overflowX: false` |
| **Synthesis Visual Chapter Bridge (Revised)** | `world-coastline-geography.webp` decoded (`1360×805`, `brokenCount: 0`), `overflowX: false` |
| **Mobile `390×844` Reflow** | `scrollWidth: 390`, `innerWidth: 390`, `overflowX: false` |
| **Console & Runtime Errors** | `0` console errors, `0` console warnings across all audited routes and theme/language switches |

### Stage 5 Visual Critique & Revision Executed

1. **Defect Observed (`p10-after-synthesis-bridge-v2.png`)**: Initial Synthesis visual bridge used `ai-optics-photonics.webp` (laboratory optical table with dense red/blue coolant hoses). At full-bleed `DocumentaryImageBreak` width, the wiring felt visually busy and overly domain-specific rather than calm and cross-domain.
2. **Revision Implemented**: Replaced the Synthesis bridge plate in `src/features/synthesis/SynthesisView.tsx` (and synced `docs/FRONTEND_ART_DIRECTION.md` and `docs/EDITORIAL_COMPOSITION_SYSTEM.md`) with `world-coastline-geography.webp` (high-altitude aerial panorama of the Bosphorus Strait bridging two continents).
3. **Post-Revision Verification (`p10-after-synthesis-bridge-v3.png`)**: Confirmed serene atmospheric framing, crisp non-documentary disclosure + CC BY-SA 3.0 attribution, `0` broken images, and balanced pacing into Cross-Domain Monographs.

