# WORLD SIGNAL — Frontend Art Direction & Visual Architecture

> **Phase 09 Complete Editorial Visual Redesign** — *Contemporary Global Affairs Journal: Editorial Energy × Evidence Clarity*
> Applies to the active React 19 / TypeScript / Tailwind CSS 4 frontend under `src/`. Preserves Markdown as the canonical editorial source, stable signal identifiers, schema v1/v2 compatibility, Source Independence calculations, Daily Delta comparisons, explicit Relationship Graphs, and documentary media rights validation.

---

## 1. Strategic Visual Direction

**WORLD SIGNAL** is an independent, evidence-led international news and intelligence publication covering **World Events**, **AI Frontier**, and **Economic Outlook**.

Phase 09 replaces earlier overly quiet broadsheet minimalism with **Purposeful Visual Energy** — elevating the publication into an unmistakably recognizable digital magazine and global affairs journal that balances expressive visual craft with forensic evidence integrity:

- **Storytelling Ambition** (*The Washington Post*): Fluid front-page hierarchy where the Lead Feature commands open editorial space alongside immediate front-page dispatches, rather than being trapped inside a solitary dark banner box.
- **Typographic Refinement** (*The New Yorker*): An iconic front-page publication nameplate, dramatic scale contrast between display headlines and body prose, refined pull quotes, and comfortable long-form reading rhythm.
- **Information Architecture & Financial Clarity** (*Financial Times* & *FT Visual Vocabulary / Chart Doctor*): Multi-column front-page composition, distinct warm parchment-salmon paper tone for Economic Outlook, and form-follows-data-relationship visuals for provenance and domain composition.
- **Institutional Coherence** (*The Economist Design System*): Disciplined Signal Vermilion editorial anchors, crisp section numerals, and "one graphic, one message" visual restraint.
- **Section Atmosphere** (*Monocle*): Three domain desks that belong to one publication while possessing unmistakable visual personalities and photography direction.
- **Interactive Intelligence Storytelling** (*Reuters Graphics* & *The Pudding*): A drafting-grid Relationship Atlas with illuminated active transmission paths and an elevated Evidence Mechanism Inspector grounded strictly in declared edition relationships.

---

## 2. Multi-Surface Color System & Art-Directed Dark Mode

Instead of repeating a single neutral card background across every section, WORLD SIGNAL uses intentional multi-surface contrast to distinguish publication layers and domain desks:

| Surface / Semantic Role | Light Mode (Warm Editorial Paper) | Dark Mode (Nocturnal Press) | Purpose |
| :--- | :--- | :--- | :--- |
| **Canvas** | `#f6f2ea` (Warm Linen Paper) | `#0a0d13` (Midnight Press) | Open publication breathing room |
| **Primary Sheet** | `#fffdf9` (Newsprint Ivory) | `#121722` (Elevated Slate) | Primary reading canvases, Expanded dossier |
| **Tonal Spread Band** | `#f3ede1` / `#ede6d9` | `#151c29` / `#18202f` | Executive Summary spread, metadata folios |
| **Nocturnal Ink Plate** | `#111622` / `#182030` | `#141b2a` / `#1c2639` | AI Frontier monograph, Audit provenance plate, reading pathways |
| **Signal Vermilion** | `#bd271a` | `#ed6b5b` | Masthead top anchor, lead kicker, active nav bar, active atlas beam |
| **World Events Desk** | `#16447a` on `#fffdf9` | `#7eb6f4` on `#111621` | Foreign affairs broadsheet |
| **AI Frontier Desk** | `#58359c` / `#cbb4ff` on `#121520` | `#bca3fa` / `#d3c0ff` on `#101424` | Nocturnal technical review monograph (zero neon clichés) |
| **Economic Outlook Desk** | `#0f5c47` on `#f3eae0` | `#5fcea8` on `#171714` | FT-inspired warm parchment-salmon financial folio |

All foreground/background pairs maintain WCAG AA contrast (`>= 4.5:1` for prose, `>= 3:1` for display typography and UI controls) in both themes.

---

## 3. Typography System & Bilingual Parity (`en` & `zh-CN`)

- **Display Serif (`--font-display`)**: `"Fraunces", "Noto Serif SC", "Songti SC", Georgia, serif` — used for the front-page publication nameplate (`.ws-masthead-wordmark`), lead cover headlines (`.ws-headline-cover`), secondary features (`.ws-headline-feature`), dossier openings (`.ws-headline-dossier`), and oversized editorial section numerals (`.ws-editorial-numeral`).
- **Editorial Reading & UI Sans (`--font-sans`)**: `"Plus Jakarta Sans", "Noto Sans SC", "PingFang SC", sans-serif` — used for comfortable prose (`.ws-prose`, 65–70ch measure), decks, navigation, and `.ws-meta` tabular metadata so Chinese text never falls back to monospace.
- **Forensic Monospace (`--font-mono`)**: `"IBM Plex Mono", "Noto Sans SC", monospace` — reserved strictly for identifiers (`signal_id`, `claim_id`, `source_id`), ISO dates, URLs, and aligned numeric figures.
- **Bilingual Optical Craft**:
  - `[data-lang="zh-CN"]` adjusts display sizing, relaxes headline leading (`1.24–1.38`), applies `line-break: strict`, tightens kicker tracking (`0.08em`), and disables Latin-only drop-cap styling (`.ws-dropcap` applies only to `[data-lang="en"]`).
  - Raw inline citation markers (e.g., `[S1]`, `[C2]`) are stripped from front-page excerpt decks so summaries read like polished journalism while full citations remain interactive inside the Expanded dossier.

---

## 4. Architectural Blueprint Across Views

### 4.1 Briefing — Front-Page Publication Cover & Visual Rhythm System (Phase 10)
To create an image-rich, non-monotonous reading pace, the Briefing front page alternates structured editorial spreads, a visual desk contents folio, panoramic photographic breathing room, quiet text indices, and three unmistakably distinct domain visual worlds:

1. **Front-Page Publication Masthead**: A dedicated editorial nameplate (`WORLD SIGNAL` in monumental Fraunces display type with vermilion top rule and publication descriptor) paired with an aligned Edition Folio (date, sync cycle, coverage window, signal/origin/claim totals, diagnostics alert, and refresh trigger). On desktop Briefing at scroll top, the sticky TopBar yields the wordmark to the monumental nameplate and smoothly reveals `WORLD SIGNAL` on scroll so the title is never duplicated in the opening frame.
2. **Asymmetric 9:3 Magazine Cover Spread (Open Paper, 100% Above the Fold)**:
   - **Left 9 columns (Lead Feature Spread)**: An internal **5:7 asymmetric split** pairing the commanding Fraunces/Noto Serif SC headline, clean narrative deck, and primary CTA directly beside the full, uncropped `4:3` `StoryVisual` showcase plate, anchored underneath by a poised **Verification & Chronology Band** so the entire cover experience fits cleanly inside the initial `1440×900` desktop viewport.
   - **Right 3 columns ("In This Edition" Front-Page Rail)**: Hairline-separated front-page dispatch column showcasing Ranks `#02`, `#03`, and `#04` directly beside the Lead Feature, immediately inviting exploration.
3. **Executive Summary Spread**: Full-width warm tonal paper spread pairing the editorial briefing (with refined drop-cap opening in English) against an FT-style Domain Composition Breakdown (stacked ribbon + per-domain shares + `5/5` priority counts) and collapsible Editorial Limitations.
4. **Tiered Secondary Hierarchy & Quiet Index**: Dedicated asymmetric visual feature spread for Rank `#05` (anti-repetition `StoryVisual`), followed by a quiet, text-led 3-column numbered dispatch index for Ranks `#06–#10`.
5. **Edition Visual Folio (`EditionVisualFolio`) — Phase 10**: A 3-column architectural contents strip previewing the three editorial visual worlds (`01 World Events · Global Documentary`, `02 AI Frontier · Scientific Modernism`, `03 Economic Outlook · Economic Humanism`) with three unique, non-repeating local thumbnail plates, real signal counts, and direct anchor jump links (`#desk-world-events`, `#desk-ai-frontier`, `#desk-economic-outlook`).
6. **Panoramic Documentary Image Break** (`DocumentaryImageBreak`): Full-width `21:7` atmospheric photographic interlude (`world-earth-observation.webp`) with `scroll-mt-20`, separating the front-page digest from the three independent domain worlds and carrying explicit non-documentary attribution.
7. **Three Unmistakably Distinct Editorial Visual Worlds** (`src/components/editorial/compositions/DomainDesks.tsx`, allocated via zero-repetition `selectDeskPhotoSet()` so none of the 13 Briefing photos repeat):
   - **World Events — *Global Documentary*** (`WorldDocumentaryDesk`, `#desk-world-events`): Open linen/ivory foreign affairs broadsheet with cartographic hairline geography strip (`.ws-cartographic-strip`), oversized `01` numeral, panoramic `21:7` lead scene + lead documentary dispatch, and two contrasting global context plates paired with a clean foreign-desk wire.
   - **AI Frontier — *Scientific Modernism*** (`AiModernistDesk`, `#desk-ai-frontier`): Nocturnal deep-obsidian technical monograph overlaid with a subtle architectural drafting grid (`.ws-scientific-grid`), `02` numeral, tall vertical hardware/compute portrait spine paired with the featured AI dispatch, dual laboratory/wafer/quantum precision plates, and a structured tabular wire (zero neon clichés).
   - **Economic Outlook — *Institutional & Economic Humanism*** (`EconomicHumanismDesk`, `#desk-economic-outlook`): Warm parchment-salmon financial broadsheet (`ws-desk-economy`) with `03` numeral, spanning macro lead headline above a 2-column institutional financial ledger (`.ws-financial-ledger-row`) flanked by a commanding institutional architecture portrait and twin real-economy companion frames (energy, commodities, manufacturing, housing, agriculture, trade).
8. **Daily Delta & Catch-Up Continuity**: Harmonized newsroom change ledger placed after the three domain desks, preserving exact deterministic diffs and the *Omission Is Not Resolution* safeguard.

### 4.2 StoryVisual, Curated 36-Asset Local Library & Documentary Galleries
- **Strict Three-Category Visual Separation**:
  1. **Verified Documentary News Media** (`media_assets` validated via `isApprovedMediaAsset`) — always takes exclusive precedence when present.
  2. **Original Editorial Illustrations & Typographic Cover Plates** (`editorialAssetRegistry.ts` & `StoryVisual.tsx`) — redesigned `typographic_cover` composes domain-specific engraved SVG art motifs, oversized Fraunces plate numerals, and asymmetric typographic framing; `grounded_visual` follows FT Visual Vocabulary standards.
  3. **Curated 36-Asset Local Interface Photography** (`interfaceImageLibrary.ts`, `docs/INTERFACE_IMAGE_LIBRARY.md`, & `public/assets/interface-library/{world,ai,economy}/`, 12 verified photographs per domain = 36 primary 1600w WebP + 36 responsive 800w WebP files, `< 25 MB` total, indexed in `manifest.json` and `README.md`) — strictly isolated (`isDocumentaryEvidence: false`), zero remote hotlinking, per-asset visually tuned `objectPosition`, domain-matched `frameStyle` (`documentary` / `scientific` / `institutional`), explicit bilingual non-documentary colophons, photographer credit, source page link, and license link.
- **Reusable Editorial Composition Pattern Library** (`docs/EDITORIAL_COMPOSITION_SYSTEM.md` & `src/components/editorial/compositions/`):
  - `EditionVisualFolio.tsx` — 3-world visual contents strip & direct desk anchor navigation.
  - `DocumentaryImageBreak.tsx` — panoramic `21:7` photographic chapter interlude.
  - `DomainDesks.tsx` — `WorldDocumentaryDesk`, `AiModernistDesk`, and `EconomicHumanismDesk`.
  - `PullQuoteBand.tsx` — Fraunces / Noto Serif SC analytical thesis pull-quote band strictly extracted from real signal prose (`src/lib/editorial/editorialPullQuote.ts`).
  - `NarrativeArcRibbon.tsx` — grounded 5-stage dossier progression rail (`src/lib/editorial/narrativeArc.ts`).
  - `ReadingProgressBar.tsx` — subtle compositor-only (`transform: scaleX`) long-form scroll progress hairline pinned at `top-[55px]`.
- **Asymmetric `SignalMediaGallery`**: Adapts composition to gallery size (expansive hero plate for 1 asset; asymmetric 7:5 pair for 2 assets; full-width lead plate over staggered companion frames for 3+ assets) with unboxed museum-style captions and full rights/attribution fidelity (`crop_allowed: false` renders uncropped via `object-contain`).

### 4.3 Expanded — Long-Form Investigative Monograph & Narrative Journey
- **High-Value Dossier Opening**: Story-specific art direction pairs Importance 4–5 dossiers (without verified `media_assets`) with the closest thematic photograph from the 36-asset library (including Phase 10 additions for climate/COP, borders, quantum computing, autonomous mobility, urban housing, and agricultural food supply) using domain-aligned framing (`documentary` / `scientific` / `institutional`), pairing portrait openers directly beside headline provenance and verification metrics (`Origins / Claims / Sources`).
- **Grounded Narrative Progression Arc & Reading Feedback**: Directly below the dossier header, `NarrativeArcRibbon` traces the active reading journey (`Global Event → Context & Chronology → Consequence & Analysis → Personal Relevance → What to Watch`) — strictly displaying only stages backed by actual content in the signal — paired with a restrained hairline `ReadingProgressBar` honoring `prefers-reduced-motion`.
- **Editorial Thesis Pull-Quote (`PullQuoteBand`)**: Elevates *Why It Matters* (`#sec-why-it-matters`) by surfacing the lead analytical thesis sentence in display serif framed by fine horizontal rules, followed by the full cited explanation without dropping any `[S1]`/`[C1]` citation links.
- **Unboxed Editorial Reading Rhythm**: Distinct typography and spacing across *What Happened* (magazine lead), *Verified Facts* (open hairline ledger), *Timeline* (continuous architectural rail), *Why It Matters* (`PullQuoteBand`), *Analysis* (68ch essay measure), *Personal Relevance*, *Uncertainties*, *Scenarios* (3 directional pathways), *What to Watch*, and traceable Claim/Source/Relationship ledgers, accompanied by a sticky reading-progress Margin Rail.

### 4.4 Synthesis — Intelligence Visualization Desk
- **Drafting-Grid Relationship Atlas**: Subtle architectural dot-grid canvas (`.ws-atlas-grid`), tinted domain lanes with live node counts, 5-pip node importance bars, illuminated active transmission paths with muted context arcs, and an elevated nocturnal **Evidence Mechanism Inspector** displaying a structured `FROM → [RELATIONSHIP] → TO` diagram strictly from `buildRelationshipGraph()`.
- **Editorial Visual Bridge (Phase 10)**: A restrained `DocumentaryImageBreak` (`ai-optics-photonics` / `world-urban-infrastructure`) bridges the interactive Relationship Atlas into the long-form Cross-Domain Monographs without competing visually with the graph canvas.
- **Cross-Domain Monographs & Time Horizons**: Oversized numbered monographs, connected temporal progression strips, conditional scenarios, and responsive watchlist.

### 4.5 Audit — Editorial Verification Desk
- **FT Chart Doctor Overview**: Pairs a high-contrast nocturnal **Provenance Summary Plate** (Independent Reporting Origins + Qualifying Original Share %) with a rich **Part-to-Whole Record Composition Ribbon** and a **Horizontal Source-Class Ranking Chart** with direct inline counts.
- **Importance × Confidence Matrix**: Clear two-axis heatmap proving editorial importance and verification confidence remain strictly independent.

---

## 5. Responsive Craftsmanship & Browser Visual QA Authority

- Companion QA protocol and real before/after inspection ledger live in `docs/FRONTEND_VISUAL_QA.md`.
- Verified across desktop (`1440×900`) and mobile (`390×844`) in both Light and Dark modes and both `en` and `zh-CN` with zero horizontal overflow, zero broken images, zero photo duplication across Briefing, and zero console errors.
- Restrained, purposeful micro-interactions: hairline headline underline sweeps, `motion-safe:` gentle editorial image motion, crisp `:focus-visible` vermilion keyboard rings, and full `@media (prefers-reduced-motion: reduce)` compliance — zero bounce, pulsing, neon glow, or glassmorphism clutter.
