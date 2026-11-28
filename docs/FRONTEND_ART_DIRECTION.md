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

### 4.1 Briefing — Front-Page Publication Cover
1. **Front-Page Publication Masthead**: A dedicated editorial nameplate (`WORLD SIGNAL` in monumental Fraunces display type with globe-meridian monogram, vermilion top rule, and publication descriptor) paired with an aligned Edition Folio (date, sync cycle, coverage window, signal/origin/claim totals, diagnostics alert, and refresh trigger). Distinct from the compact sticky TopBar.
2. **Asymmetric 8:4 Front-Page Cover Spread (Open Paper)**:
   - **Left 8 columns (Lead Story)**: Oversized editorial headline, clean narrative deck, prominent 16:10 `StoryVisual` showcase plate, and a poised **Verification & Chronology Strip** below the visual (eliminating the empty dark void of the legacy 6:6 black box).
   - **Right 4 columns ("In This Edition" Front-Page Rail)**: Hairline-separated front-page dispatch column showcasing Ranks `#02`, `#03`, and `#04` directly inside the initial desktop viewport, immediately inviting exploration.
3. **Executive Summary Spread**: Full-width warm tonal paper spread pairing the editorial briefing (with refined drop-cap opening in English) against an FT-style Domain Composition Breakdown (stacked ribbon + per-domain shares + `5/5` priority counts) and collapsible Editorial Limitations.
4. **Tiered Secondary Hierarchy**: Dedicated asymmetric visual feature spread for Rank `#02` (anti-repetition `StoryVisual`), followed by a crisp 3-column numbered dispatch index for Ranks `#05–#10`.
5. **Daily Delta & Catch-Up Continuity**: Harmonized newsroom change ledger preserving exact deterministic diffs and the *Omission Is Not Resolution* safeguard.
6. **Three Unmistakably Distinct Domain Desks**:
   - **World Events** (`ws-desk-world`): Crisp warm-ivory foreign affairs broadsheet with oversized `01` numeral, panoramic dusk skyline photography (`world-city-aerial.jpg`), featured geopolitical dispatch, and maritime freight corridor strip (`world-maritime-port.jpg`).
   - **AI Frontier** (`ws-desk-ai-plate`): Nocturnal deep-obsidian technical monograph with `02` numeral, vertical server-rack instrumentation portrait (`ai-data-center.jpg`), featured AI lead + macro silicon wafer detail (`ai-silicon-wafer.jpg`), and structured technical wire.
   - **Economic Outlook** (`ws-desk-economy`): Warm parchment-salmon financial broadsheet with `03` numeral, spanning macro lead headline above a 2-column markets/policy ledger anchored by the classical NYSE architectural facade (`economy-stock-exchange.jpg`).

### 4.2 StoryVisual, Illustrations & Documentary Galleries
- **Strict Three-Category Visual Separation**:
  1. **Verified Documentary News Media** (`media_assets` validated via `isApprovedMediaAsset`) — always takes exclusive precedence when present.
  2. **Original Editorial Illustrations & Typographic Cover Plates** (`editorialAssetRegistry.ts` & `StoryVisual.tsx`) — redesigned `typographic_cover` now composes domain-specific engraved SVG art motifs, oversized Fraunces plate numerals, and asymmetric typographic framing; `grounded_visual` follows FT Visual Vocabulary standards.
  3. **Curated Local Interface Photography** (`interfaceImageLibrary.ts` under `public/assets/interface-library/`, uncropped JPEGs + responsive `-800.webp`/`-1600.webp` derivatives) — strictly isolated (`isDocumentaryEvidence: false`), zero remote hotlinking, explicit bilingual non-documentary colophons, photographer credit, source page link, and Unsplash License link.
- **Asymmetric `SignalMediaGallery`**: Adapts composition to gallery size (expansive hero plate for 1 asset; asymmetric 7:5 pair for 2 assets; full-width lead plate over staggered companion frames for 3+ assets) with unboxed museum-style captions and full rights/attribution fidelity (`crop_allowed: false` renders uncropped via `object-contain`).

### 4.3 Expanded — Long-Form Investigative Monograph
- **High-Value Dossier Opening**: Portrait contextual openers pair the `4:5` photograph directly alongside the signal's headline provenance, verification metrics (`Origins / Claims / Sources`), importance scale, and confidence rationale rather than blank disclaimer filler.
- **Unboxed Editorial Reading Rhythm**: Distinct typography and spacing across *What Happened* (magazine lead), *Verified Facts* (open hairline ledger), *Timeline* (continuous architectural rail), *Why It Matters* (elevated vermilion-ruled significance band), *Analysis* (68ch essay measure), *Uncertainties*, *Scenarios* (3 directional pathways), and traceable Claim/Source/Relationship ledgers, accompanied by a sticky reading-progress Margin Rail.

### 4.4 Synthesis — Intelligence Visualization Desk
- **Drafting-Grid Relationship Atlas**: Subtle architectural dot-grid canvas (`.ws-atlas-grid`), tinted domain lanes with live node counts, 5-pip node importance bars, illuminated active transmission paths with muted context arcs, and an elevated nocturnal **Evidence Mechanism Inspector** displaying a structured `FROM → [RELATIONSHIP] → TO` diagram strictly from `buildRelationshipGraph()`.
- **Cross-Domain Monographs & Time Horizons**: Oversized numbered monographs, connected temporal progression strips, conditional scenarios, and responsive watchlist.

### 4.5 Audit — Editorial Verification Desk
- **FT Chart Doctor Overview**: Pairs a high-contrast nocturnal **Provenance Summary Plate** (Independent Reporting Origins + Qualifying Original Share %) with a rich **Part-to-Whole Record Composition Ribbon** and a **Horizontal Source-Class Ranking Chart** with direct inline counts.
- **Importance × Confidence Matrix**: Clear two-axis heatmap proving editorial importance and verification confidence remain strictly independent.

---

## 5. Responsive & Interaction Craftsmanship

- Verified across `1920×1080`, `1440×900`, `1280×800`, `768×1024`, `390×844`, and `360×800` in both Light and Dark modes and both `en` and `zh-CN` with zero horizontal overflow.
- Restrained, purposeful micro-interactions: hairline headline underline sweeps, `motion-safe:` gentle editorial image motion, crisp `:focus-visible` vermilion keyboard rings, and full `@media (prefers-reduced-motion: reduce)` compliance — zero bounce, pulsing, neon glow, or glassmorphism clutter.
