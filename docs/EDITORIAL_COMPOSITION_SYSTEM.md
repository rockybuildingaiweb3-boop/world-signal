# WORLD SIGNAL — Editorial Composition System (Phase 10 Implementation Specification)

> **Status**: Active Implementation Specification (Phase 10)  
> **Scope**: Reusable React editorial layout compositions under `src/components/editorial/compositions/` and pure helpers under `src/lib/editorial/`.  
> **Non-Negotiable Invariant**: Every composition must strictly preserve canonical Markdown truth, verified `media_assets` precedence, deterministic source-independence metrics, and explicit non-documentary disclosures on interface photography.

---

## 1. Architectural Philosophy

WORLD SIGNAL rejects repetitive SaaS card grids. Pages are composed from an explicit vocabulary of **eight magazine-grade editorial layout primitives**, sequenced to alternate visual density, photographic scale, typographic voice, and quiet analytical breathing room.

Every composition primitive MUST:
1. Accept real `ParsedEdition` / `ParsedSignal` data — zero fabricated telemetry, zero synthetic headlines, zero placeholder charts.
2. Honor both `en` and `zh-CN` optical typography (`[data-lang="zh-CN"]` line-height, tracking, no Latin drop-caps on CJK).
3. Maintain WCAG AA contrast (`>= 4.5:1` body prose, `>= 3:1` display/UI) in both Warm Linen Light Mode and Nocturnal Press Dark Mode.
4. Respect `@media (prefers-reduced-motion: reduce)` and expose semantic HTML landmarks (`<section>`, `<nav>`, `<figure>`, `<figcaption>`, `<button>`, `<a href>`).

---

## 2. Composition Pattern Library (Binding Specification)

### Pattern 01 — `EditionVisualFolio` (`src/components/editorial/compositions/EditionVisualFolio.tsx`)
- **Role**: Visual Table of Contents & Desk Jump Strip on `BriefingView`, placed between the quiet numbered dispatch index (Ranks `#06–#10`) and the `DocumentaryImageBreak` / Domain Desks.
- **Purpose**: Gives readers an immediate visual preview of the three distinct editorial visual worlds (*Global Documentary*, *Scientific Modernism*, *Institutional & Economic Humanism*) with direct anchor navigation (`#desk-world-events`, `#desk-ai-frontier`, `#desk-economic-outlook`) and live edition signal counts.
- **Layout & Proportions**:
  - Header hairline band with section kicker (`EDITION DESKS · VISUAL FOLIO` / `三大独立视觉编辑部索引`) and total edition signal distribution summary.
  - 3-column horizontal editorial folio (`grid-cols-1 md:grid-cols-3`, separated by `border-[var(--ws-border)]` hairlines on desktop, stacked cleanly on mobile).
  - Each column renders:
    1. Oversized numeral (`01`, `02`, `03`) + domain accent top rule (`--ws-world`, `--ws-ai`, `--ws-economy`) + world aesthetic label (`Global Documentary`, `Scientific Modernism`, `Economic Humanism`).
    2. Compact `16/9` `InterfacePhotoPlate` (`compact`, domain-matched `frameStyle`) drawn from a **zero-repetition** photo allocation so none of the 3 folio thumbnails duplicate the 10 photos used in `DocumentaryImageBreak` or the 3 Domain Desks.
    3. Grounded stats line (`{total} signals · {sharePct}% · {imp5Count} critical`) + top signal headline preview + anchor jump link (`#desk-world-events`, `#desk-ai-frontier`, `#desk-economic-outlook`).
- **Accessibility**: Semantic `<nav aria-label="Domain desks visual folio">`, native `<a href="#desk-...">` links with visible focus rings, zero clickable `<div>` containers.

### Pattern 02 — `DocumentaryImageBreak` (`src/components/editorial/compositions/DocumentaryImageBreak.tsx`)
- **Role**: Full-width panoramic visual interlude (`aspect="21/7"`) separating dense typographic front-page dispatches from the Domain Desks (and optionally bridging sections in Synthesis).
- **Layout**: `scroll-mt-20 border-y border-[var(--ws-border-strong)]` containing a 7:5 typographic header row above a `21/7` `InterfacePhotoPlate` with explicit non-documentary colophon, photographer attribution, source URL, and license link.

### Pattern 03 — `WorldDocumentaryDesk` (`src/components/editorial/compositions/DomainDesks.tsx`)
- **Anchor & Test ID**: `id="desk-world-events"` and `data-testid="desk-world-events"`.
- **Visual World**: *Global Documentary* — open warm ivory broadsheet (`--ws-surface`), deep slate-blue (`--ws-world`) top rule, dashed cartographic dateline strip (`.ws-cartographic-strip`) listing actual geographies extracted from the edition's World signals, `21/7` panoramic geographic opener, asymmetric lead dispatch, and twin contextual documentary companion plates beside the foreign-desk wire.
- **Zero-Repetition Photo Allocation**: Consumes 3 distinct `world/*` assets from `selectDeskPhotoSet('world', ...)` excluding all photos already rendered in `EditionVisualFolio` and `DocumentaryImageBreak`.

### Pattern 04 — `AiModernistDesk` (`src/components/editorial/compositions/DomainDesks.tsx`)
- **Anchor & Test ID**: `id="desk-ai-frontier"` and `data-testid="desk-ai-frontier"`.
- **Visual World**: *Scientific Modernism* — nocturnal deep-obsidian monograph (`ws-desk-ai-plate`) overlaid with a restrained architectural drafting grid (`.ws-scientific-grid`), indigo-violet (`--ws-ai`) precision accents (zero neon glow clichés), tall vertical hardware/compute portrait spine (`SPEC.02-A`) paired with the featured AI lead, dual laboratory/photonics/quantum plates (`SPEC.02-B`, `SPEC.02-C`), and structured technical wire.

### Pattern 05 — `EconomicHumanismDesk` (`src/components/editorial/compositions/DomainDesks.tsx`)
- **Anchor & Test ID**: `id="desk-economic-outlook"` and `data-testid="desk-economic-outlook"`.
- **Visual World**: *Institutional & Economic Humanism* — FT-inspired warm parchment-salmon financial broadsheet (`ws-desk-economy`), emerald (`--ws-economy`) institutional rule, 4-column macro count bar strictly computed from parsed edition data, spanning lead macro headline, 2-column hairline financial ledger (`.ws-financial-ledger-row`), commanding institutional portrait spine, and twin real-economy companion frames (energy, commodities, housing, agriculture, trade, manufacturing).

### Pattern 06 — `PullQuoteBand` (`src/components/editorial/compositions/PullQuoteBand.tsx`)
- **Pure Extraction Helper**: `extractLeadThesis(markdown: string)` in `src/lib/editorial/editorialPullQuote.ts` (unit-tested via `node:test`).
  - Strips Markdown formatting (`**`, `*`, inline `[S1]`/`[C2]` citation markers, links) and extracts the first complete declarative sentence (up to ~180 Latin chars or ~75 CJK chars) as the display thesis, returning `{ thesis, remainderMarkdown }` strictly from the signal's real prose — **never fabricating, paraphrasing, or altering factual claims**.
  - Returns `null` if the input text is too short or unstructured, allowing graceful fallback to standard `SafeMarkdown`.
- **Role**: Elevates *Why It Matters* (`#sec-why-it-matters`) inside `ExpandedView` (and cross-domain synthesis lead statements in `SynthesisView`) from a plain boxed paragraph into a signature *New Yorker / Financial Times* display-serif analytical pull band.
- **Visual Rules**:
  - No thick left accent border (`border-l-4` prohibited). Uses top and bottom fine hairline rules (`border-y border-[var(--ws-border-strong)]`) plus a short horizontal domain-accented kicker rule (`w-6 h-[2px]`) above the Fraunces / Noto Serif SC display thesis (`text-[1.18rem] sm:text-[1.32rem] leading-[1.45]`).
  - Renders the full remainder (or full cited `SafeMarkdown`) cleanly underneath so zero interactive `[S1]`/`[C1]` citations are ever lost.

### Pattern 07 — `NarrativeArcRibbon` (`src/components/editorial/compositions/NarrativeArcRibbon.tsx` + `src/lib/editorial/narrativeArc.ts`)
- **Role**: Grounded 2-to-5 stage dossier progression rail (`Global Event → Context & Chronology → Consequence & Analysis → Personal Relevance → What to Watch`) rendered directly below `SignalDossierHeader` in `ExpandedView`.
- **Rule**: Only displays stages backed by real non-empty sections in `activeSignal`; highlights the active stage synchronized with scroll-spy `activeSectionId`.

### Pattern 08 — `ReadingProgressBar` (`src/components/editorial/compositions/ReadingProgressBar.tsx`)
- **Role**: Compositor-only (`transform: scaleX()`) hairline reading progress bar pinned flush below `TopBar` (`top-[55px] z-30 h-[2.5px]`) in `ExpandedView`, colored by active signal domain (`--ws-world` / `--ws-ai` / `--ws-economy`), respecting `motion-safe:`.

---

## 3. Page Pacing Blueprints

### Briefing (`BriefingView.tsx`)
1. Front-Page Publication Masthead + Coverage Strip
2. 9:3 Asymmetric Magazine Cover Spread (Lead Feature + In This Edition `#02–#04`)
3. Executive Summary Spread (Briefing prose + FT Domain Composition + Editorial Limitations)
4. Catch-Up Checkpoint Strip
5. Tiered Secondary Feature (`#05`) + Quiet Numbered Dispatch Index (`#06–#10`)
6. **`EditionVisualFolio`** (3-World Visual Desk Index & Direct Anchor Jump Strip — 3 unique photos)
7. **`DocumentaryImageBreak`** (Panoramic `21/7` NASA Earth Observation Interlude — 1 unique photo)
8. **Three Independent Editorial Visual Worlds**: `WorldDocumentaryDesk` (`#desk-world-events`, 3 unique photos) → `AiModernistDesk` (`#desk-ai-frontier`, 3 unique photos) → `EconomicHumanismDesk` (`#desk-economic-outlook`, 3 unique photos)
9. Daily Delta & Change Ledger
10. Closing Editorial Pathways

*Total unique local interface photographs across Briefing*: **13 distinct, zero-repetition photographs** out of the 36-asset local library, harmoniously mixed with original editorial illustrations and grounded data plates.

### Expanded (`ExpandedView.tsx`)
1. `ReadingProgressBar` (pinned at `top-[55px]`)
2. `SignalDossierHeader` (verified `media_assets` exclusive precedence → story-specific local interface photo from 36-asset library for Importance 4–5 → original illustration / typographic cover)
3. `NarrativeArcRibbon` (grounded progression stages)
4. Part I — Verified Record (`What Happened`, `Verified Facts`, `Timeline`)
5. Part II — Interpretive Significance (`PullQuoteBand` on `Why It Matters` + `Source Perspectives` + `Analysis`)
6. Part III — Forward-Looking (`Uncertainties`, `Scenarios`, `Personal Relevance`, `What to Watch`)
7. Part IV — Traceable Evidence Ledgers (`Claims`, `Sources`, `Relationships`) + Sticky Margin Outline Rail

### Synthesis (`SynthesisView.tsx`)
1. Strategic Intelligence Masthead + Edition Totals
2. Interactive Drafting-Grid Relationship Atlas + Nocturnal Evidence Mechanism Inspector
3. **Editorial Visual Bridge** (restrained `DocumentaryImageBreak` using `world-coastline-geography` separating the interactive graph from the long-form Cross-Domain Monographs)
4. Numbered Cross-Domain Monographs + Time Horizons + Conditional Scenarios + Watchlist
