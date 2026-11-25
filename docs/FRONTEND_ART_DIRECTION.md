# WORLD SIGNAL — Frontend Art Direction & Signature Experience Architecture

> **Phase 03 Architectural Blueprint** — *Archival Broadsheet × Modern Intelligence Monograph*
> Applies to the active React/TypeScript frontend under `src/`. Preserves the deterministic Markdown content pipeline, Source Independence engine, Daily Delta diff engine, and explicit Relationship Graph without fabricating facts, coordinates, imagery, or causal links.

---

## 1. Signature Visual Concept & Publication Identity

**WORLD SIGNAL** is an independent, evidence-driven global intelligence publication covering **World Events**, **AI Frontier**, and **Economic Outlook**. Its visual identity deliberately rejects generic SaaS dashboards, uniform card grids, and decorative AI telemetry in favor of a **tactile archival broadsheet combined with museum-grade monograph discipline**:

- **Editorial Voice**: Calm authority, forensic transparency, intellectual density with generous breathing room. Every hairline rule, typographic weight shift, and graphic element serves meaning.
- **Unmistakable Identity**:
  - A crisp **publication nameplate** on the Briefing front page (*WORLD SIGNAL — Independent Global Intelligence*), framed by a classic double-rule masthead (`2.5px` primary ink rule + `1px` hairline) and an operational edition dateline.
  - A restrained, single-row **3-zone TopBar** (Brand wordmark — 4 single-line views with clean typographic active marker — Archive/Edition utility trigger) that never competes with the front-page nameplate or reading canvas.
  - **Ink-first hierarchy**: High-contrast charcoal ink (`#121417`) on warm archival alabaster (`#F8F6F1`) with pure crisp white (`#FFFFFF`) editorial sheets in Light mode; deep obsidian slate (`#0D1014`) with elevated graphite sheets (`#14181F`) and crisp silver-parchment ink (`#ECE9E2`) in Dark mode.
  - **Signature Editorial Punctuation**: An archival **Signal Vermilion** (`#B43A24` light / `#E56B52` dark) reserved strictly for editorial lead markers, active front-page masthead folio accents, and critical caution punctuation — never splashed decoratively across cards.

---

## 2. Core Design Principles

1. **Hierarchy Over Uniformity**: Never put stories of unequal importance into identical bordered boxes. Every view establishes at least three clear visual tiers (Lead → Secondary → Index).
2. **Evidence-Grounded Graphics Only**: Every visual diagram (`EditorialSignalArtwork`, edition domain balance, Daily Delta turnover rail, Relationship Atlas, Audit composition bars, Importance × Confidence matrix) encodes *only* verified structured edition metadata. Illustrative signal plates carry an explicit non-documentary colophon.
3. **Zero Decorative Clutter**:
   - Zero static pill enclosures (`rounded-full` badges) around metadata.
   - Zero thick left-border accent bars (`border-l-2`/`border-l-4`) on callouts or cards.
   - Zero decorative/pulsing status dots or `//` mechanical code prefixes.
   - Zero nested-scroll traps on long ledgers (use clean progressive pagination instead of `max-h-[620px] overflow-y-auto` boxes).
4. **Epistemic Clarity**: Always visually separate **Importance (1–5)** from **Confidence (High / Medium / Low / Unverified)**, **Explicit Typed Relationships** from **Coarse Legacy Contextual Links**, and **Omitted Signals** from **Resolved Events**.
5. **Bilingual Optical Parity (`zh-CN` & `en`)**: Chinese and English share the same editorial stature, with deliberate optical adjustments rather than naive shared CSS rules.

---

## 3. Typography System & Bilingual CJK Optical Rules

### Font Stack
- **Editorial Display (`--font-display`)**: `"Fraunces", "Noto Serif SC", "Songti SC", Georgia, serif`
  - Expressive high-contrast serif for publication nameplate, cover headlines, dossier titles, and section numerals.
- **Primary Reading Prose (`--font-sans`)**: `"Plus Jakarta Sans", "Noto Sans SC", "PingFang SC", "Hiragino Sans GB", -apple-system, sans-serif`
  - Clean humanist sans-serif for crisp body reading, executive briefs, and navigation.
- **Forensic Metadata & Tabular Figures (`--font-mono`)**: `"IBM Plex Mono", "Noto Sans SC", "PingFang SC", "Hiragino Sans GB", ui-monospace, monospace`
  - Always includes CJK fallbacks so Chinese numerals (e.g., `一`, `二`) render cleanly in Chromium alongside `tabular-nums` alignment.

### Bilingual Optical Adjustments (`[data-lang="zh-CN"]`)
Because Han ideographs occupy full square em-boxes with denser internal stroke geometry than Latin glyphs:
- **Line Height**: Increased on Chinese body prose (`1.8` vs `1.72` in English) and headlines (`1.28` vs `1.14` in English) to prevent vertical crowding.
- **Letter Spacing**: Wide uppercase tracking (`0.12em–0.16em`) is applied to Latin mono kickers, while `[data-lang="zh-CN"]` overrides tracking to `0.04em` maximum on kickers and `0` on headlines so Chinese characters never scatter awkwardly.
- **Optical Scale**: Display headlines scale ~8% more compactly in `zh-CN` (`clamp` adjustments) so 18–26 character Chinese headlines stay poised within 2–3 lines without jarring line breaks.
- **Reduced Micro-Label Noise**: Secondary metadata lines use subtle typographic weight and contrast rather than walls of `10px` uppercase mono tags.

---

## 4. Color System & 60-30-10 Budget

| Role | Light Theme (Archival Broadsheet) | Dark Theme (Obsidian Monograph) | Usage |
| :--- | :--- | :--- | :--- |
| **Canvas (60%)** | `#F8F6F1` (Archival Alabaster) | `#0D1014` (Obsidian Slate) | Page background & breathing space |
| **Editorial Sheet (25%)** | `#FFFFFF` / `#F2EFE8` | `#14181F` / `#1A2029` | Dossier sheets, subtle alternating bands |
| **Primary Ink (10%)** | `#121417` / `#343A42` / `#5A626D` | `#ECE9E2` / `#C4CAD2` / `#8C95A1` | Headlines, body prose, metadata (WCAG AA+) |
| **Signal Vermilion (Punctuation)** | `#B43A24` | `#E56B52` | Masthead lead rule, active lead punctuation |
| **World Events** | `#1E4B7A` (Diplomatic Cobalt) | `#6BA6E8` | Domain label, meridian geometry, links |
| **AI Frontier** | `#54398E` (Archival Indigo) | `#B197FC` | Domain label, architectural lattice, links |
| **Economic Outlook** | `#18634B` (Treasury Pine) | `#5AC79D` | Domain label, balance structure, horizons |
| **Confidence High / Med / Low / Unv** | `#18634B` / `#9A5D12` / `#B43A24` / `#5F6670` | `#5AC79D` / `#E4AC54` / `#E56B52` / `#9AA2AD` | Verification strength only (never conflated with importance) |

All foreground/background pairs meet or exceed WCAG AA (`>= 4.5:1` body text, `>= 3:1` display/UI controls) in both Light and Dark themes.

---

## 5. Distinct Personalities of the Four Views

### 5.1 Briefing — *Front-Page Broadsheet & Daily Cover*
- **First-Viewport Dominance**: Compact broadsheet nameplate + edition dateline immediately followed by the **Cover Story Spread** (asymmetric 7:5 layout pairing monumental display headline, editorial deck, key provenance metrics, and a **bespoke full-width / split domain-specific `EditorialSignalArtwork` plate** alongside the Executive Summary Folio).
- **Daily Delta Ledger**: Integrated cleanly directly beneath the Cover Story as an archival broadsheet change ledger with proportional turnover bar, 4-category editorial tabs, deterministic field transitions, expandable claim/source evidence diffs, and the non-negotiable *Omission Is Not Resolution* notice.
- **Varied Secondary Hierarchy**: Preserves exact `topSignalRefs` editorial order while varying visual weight: Signal 02 commands an asymmetric wide dispatch row; Signal 03 holds an analytical companion column; Signals 04+ form a refined multi-column dispatch index.
- **Redesigned Three-Domain Coverage Composition**: Replaces three identical top-accented boxes with a unified **Coverage Composition Band** — proportional bar + clean horizontal editorial desk strips showing exact signal volume, Imp 5 / Imp 4 / Imp 1–3 intensity profiles, claims, independent origins, and desk intros.
- **Additional Signals Index & Editorial Colophon Path**: Compact, multi-column broadsheet index with understated vertical importance ticks and calm transitions into Expanded, Synthesis, and Audit.

### 5.2 Expanded — *Long-Form Investigative Monograph & Forensic Dossier*
- **Scannable Discovery Index Rail**: Sticky desktop research sidebar with clean search, domain tabs, compact filter drawer, and crisp two-line index rows (no cluttered 4-row boxes).
- **Magazine Dossier Opening**: Monumental headline anchor, subtle domain hairline & provenance strip (`Event Date`, `Updated`, `Topic`, `Geography`), calibrated `Importance` scale separated cleanly from `Confidence Rationale`, Storyline Continuity strip (schema v2), and jump navigation.
- **10 Distinct Editorial Content Layers**:
  1. *What Happened*: Large editorial lead deck (`1.06rem–1.12rem` serif/sans lead treatment) opening the monograph.
  2. *Verified Facts*: Crisp archival dossier box (`ws-folio-box`) with subtle paper tint and structured fact typography.
  3. *Timeline*: Chronological gutter rail placing dates cleanly beside titles, summaries, and clickable Claim/Source verification links.
  4. *Why It Matters*: Elevated editorial significance band with top/bottom hairlines (no left-border bar).
  5. *Source Perspectives*: Multi-voice attribution folio distinguishing institutional viewpoints.
  6. *Analysis*: Uncluttered `66ch` long-form investigative essay measure.
  7. *Uncertainties*: Restrained warm-ochre archival caution folio.
  8. *Scenarios*: Full-width 3-column architectural pathways (`Base →`, `Downside ↘`, `Upside ↗`) with directional geometry and zero fabricated probabilities.
  9. *Personal Relevance* & 10. *What to Watch*: Intentional asymmetric 2-column practical brief closing the narrative before the forensic ledgers.
- **Traceable Ledgers**: Clean Claim ↔ Source ↔ Independent Origin cross-highlighting, plus strict visual separation between Declared Typed Relationships and Coarse Legacy Contextual References.

### 5.3 Synthesis — *Strategic Intelligence Desk & Interactive Relationship Atlas*
- **Reimagined Keyboard-Accessible Relationship Atlas**:
  - Replaces the rigid non-focusable `<g onClick>` SVG with a **100% keyboard-accessible Strategic Relationship Atlas**:
    - Clean **3-Domain Cross-Transmission Architecture** with crisp cubic Bézier directional arcs, distinct stroke styles (solid for explicit typed links, dashed for `potential_link` / coarse legacy), interactive **signal focus filter** (lets readers isolate a single hub signal when legacy links are dense), and **native semantic `<button>` / keyboard-activatable node & edge controls** (`Tab`, `Enter`, `Space`) synchronized with the live Evidence Inspector panel.
    - Powered strictly by `buildRelationshipGraph()` — zero inferred edges.
    - Clean mobile experience prioritizing the interactive inspector + scannable relationship ledger without cramping SVG diagrams.
- **Structured Cross-Domain Synthesis**: Asymmetric magazine monographs showing mechanism header + linked signal jumpers on the left, structured analytical prose on the right, and a dashed archival exclusion ledger for unestablished connections.
- **Time Horizons Continuum**: Coherent temporal axis (`Immediate → Near-Term → Medium-Term → Structural`) with visual progression steps.
- **Scenarios, Intentional Personal Implications & Filterable Watchlist**: Editorial advisory layout (distinct numbered columns, never generic dashboard cards) and a scannable institutional Watchlist table / mobile stacked ledger.

### 5.4 Audit — *Evidence & Provenance Inspection Room*
- **Editorial Verification Brief (No 6 Identical KPI Boxes)**: Asymmetric two-part overview pairing a monumental **Independent Reporting Origins** & **Qualifying Original Records** provenance hero with proportional Record Composition and Source Class breakdown charts, plus a quiet secondary metric ledger.
- **Reporting Origin Explorer**: Clean two-column provenance directory clearly separating Qualifying Independent Origins, Excluded Groups (with explicit policy basis), and individually listed Unassigned Records.
- **Paginated Claim Ledger (Zero Nested Scroll Traps)**: Eliminates the fatiguing `max-h-[620px]` inner scroll container in favor of clean progressive pagination (`20` rows per batch + `Load more` / `Show all`), instant search, inline status/confidence/signal/coverage filters, and clear typographic `Signal → Claim → Source → Origin` trace lines.
- **Clarity-First 5×4 Importance × Confidence Matrix**: Explicit two-axis header framing (`Rows = Editorial Importance 1–5` vs. `Columns = Verification Confidence`) with restrained tonal intensity encoding so readers immediately verify that high importance never implies high confidence.
- **Editorial Audit Trail**: Clean hairline-underlined tabs (`Source Audit`, `Open Questions`, `Corrections`, `Methodology Notes`, `Schema Diagnostics`) rendered at comfortable `70ch` reading measure.

---

## 6. Signature Visual Elements

1. **Multi-Composition `EditorialSignalArtwork`**: Three genuinely distinct architectural illustration plates selected deterministically by signal domain — **Diplomatic Meridian Plate** (`World Events`), **Architectural Inference Lattice** (`AI Frontier`), and **Macro Balance & Corridor Plate** (`Economic Outlook`) — encoding only real verified metadata (`geography`, `event` dates, `importance` 1–5, `independentOriginCount` with explicit overflow disclosure, `claims.length`, `sources.length`, `timelineEvents` milestones, and explicit `relationships`), accompanied by a clear non-documentary colophon.
2. **Publication Double-Rule Masthead**: `2.5px` ink bar over `1px` hairline with balanced dateline, edition title, and live archive telemetry.
3. **Interactive Cross-Domain Relationship Atlas**: Keyboard-navigable SVG + synchronized Evidence Inspector + hub-signal focus mode.
4. **Proportional Edition & Provenance Ribbons**: Crisp `2px–10px` hairline-separated proportional bars encoding domain mix, Daily Delta turnover, and source independence composition without chartjunk.

---

## 7. Responsive Architecture & Breakpoints

- **`1440×900` & `1280×800` (Desktop)**: `max-w-[1320px]` broadsheet container, 12-column asymmetric cover spread, sticky 340px Expanded index rail, full SVG Relationship Atlas + side Inspector.
- **`768×1024` (Tablet)**: Balanced 2-column grids, full-width cover artwork, accessible single-row top navigation, cleanly reflowing Audit & Watchlist tables.
- **`390×844` & `360×800` (Mobile)**: Compact top bar + slim bottom navigation bar (`<= 12%` viewport height with `env(safe-area-inset-bottom)`), zero horizontal overflow (`0px` tolerance), generous tap targets, stacked mobile ledgers for Watchlist, Daily Delta, and Relationship Atlas, and effortless list ↔ dossier switching in Expanded view.
- **Accessibility & Motion**: Full keyboard focus rings (`:focus-visible`), `aria-current`/`aria-selected`/`aria-expanded` semantics, and `@media (prefers-reduced-motion: reduce)` compliance.
