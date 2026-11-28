# WORLD SIGNAL — Interface Image Library (Phase 10 Specification — 36 Curated Local Assets)

> **Status**: Active Implementation Specification (Phase 10)  
> **Classification**: `interface_editorial_photography` (**Strictly Non-Documentary — `isDocumentaryEvidence: false`**)  
> **Machine-Readable Inventory**: `public/assets/interface-library/manifest.json`  
> **Human-Readable Attribution Index**: `public/assets/interface-library/README.md`  
> **TypeScript Registry**: `src/lib/editorial/interfaceImageLibrary.ts`

---

## 1. Purpose & Non-Negotiable Separation Policy

`docs/MEDIA_ASSET_POLICY.md` remains the sole authority for verified documentary media attached to individual news signals (`media_assets`).

This Interface Image Library serves a strictly separate architectural purpose: providing the active React frontend with **36 visually curated, open-licensed, locally hosted WebP photographs** (12 per editorial domain) that power WORLD SIGNAL's three distinct visual worlds, panoramic pacing breaks, visual desk folio, and selective story-specific atmosphere on Importance 4–5 dossiers.

**Hard Integrity Guardrails:**
1. **Strict Isolation**: Never register interface library photos in `src/lib/editorial/editorialAssetRegistry.ts` or canonical Markdown `media_assets`.
2. **Verified Media Exclusive Precedence**: `selectEditorialPhotoForDossier()` MUST return `null` whenever a signal carries any approved documentary/verified `media_assets`.
3. **Explicit Non-Documentary Labeling**: Every rendered `InterfacePhotoPlate` displays a clear bilingual non-documentary colophon (`Editorial Context · Non-Documentary` / `编务语境摄影 · 非纪实证据`), photographer attribution, source page link, and license link.
4. **Zero Hotlinking**: Every photograph MUST be downloaded, decoded, visually inspected, and saved locally as uncropped 1600w primary + 800w responsive WebP pairs under `public/assets/interface-library/{world,ai,economy}/`. Production code MUST NOT hotlink remote hosts.
5. **Repository Size Discipline**: Total footprint across all 36 assets (72 WebP files) MUST stay well under `25 MB` (target: `~12–15 MB`).

---

## 2. Asset Architecture (36 Curated Photographs · 12 Per Domain)

### Domain 1 — World Events (`public/assets/interface-library/world/` · 12 Assets)
*Visual World: Global Documentary — geographic scale, diplomacy, maritime corridors, institutions, borders, climate frontiers, and civic public life.*

| # | Asset ID | Subject Category | Status | Intended Design Roles |
| :--- | :--- | :--- | :--- | :--- |
| 01 | `world-city-aerial` | `urban_geopolitics` | Verified on disk (Phase 09) | `desk_panorama`, `dossier_opener`, `folio_thumb` |
| 02 | `world-maritime-port` | `maritime_logistics` | Verified on disk (Phase 09) | `desk_companion`, `dossier_opener` |
| 03 | `world-diplomatic-institution` | `diplomatic_architecture` | Verified on disk (Phase 09) | `desk_companion`, `dossier_opener`, `folio_thumb` |
| 04 | `world-international-assembly` | `international_assembly` | Verified on disk (Phase 09) | `desk_companion`, `dossier_opener` |
| 05 | `world-global-transport` | `global_transport` | Verified on disk (Phase 09) | `desk_companion`, `dossier_opener` |
| 06 | `world-earth-observation` | `earth_observation` | Verified on disk (Phase 09) | `documentary_break`, `dossier_opener` |
| 07 | `world-coastline-geography` | `coastline_geography` | Verified on disk (Phase 09) | `desk_panorama`, `dossier_opener` |
| 08 | `world-urban-infrastructure` | `urban_infrastructure` | Verified on disk (Phase 09) | `desk_companion`, `documentary_break`, `dossier_opener` |
| 09 | `world-human-environment` | `human_environment` | Verified on disk (Phase 09) | `desk_companion`, `folio_thumb`, `dossier_opener` |
| 10 | `world-public-space` | `public_institution` | Verified on disk (Phase 09) | `desk_panorama`, `dossier_opener` |
| 11 | `world-climate-environment` | `climate_environment` | **Phase 10 Stage 3 Acquisition** | `dossier_opener` (COP / climate / Arctic / extreme weather), `desk_companion` |
| 12 | `world-border-checkpoint` | `border_geography` | **Phase 10 Stage 3 Acquisition** | `dossier_opener` (borders / migration / sovereign crossings / customs), `folio_thumb` |

### Domain 2 — AI Frontier (`public/assets/interface-library/ai/` · 12 Assets)
*Visual World: Scientific Modernism — silicon lithography, compute racks, supercomputing halls, photonics, robotics, quantum cryogenics, and autonomous mobility.*

| # | Asset ID | Subject Category | Status | Intended Design Roles |
| :--- | :--- | :--- | :--- | :--- |
| 13 | `ai-silicon-wafer` | `semiconductor_macro` | Verified on disk (Phase 09) | `desk_companion`, `dossier_opener`, `folio_thumb` |
| 14 | `ai-data-center` | `compute_infrastructure` | Verified on disk (Phase 09) | `desk_spine`, `dossier_portrait` |
| 15 | `ai-chip-architecture` | `chip_architecture` | Verified on disk (Phase 09) | `desk_spine`, `dossier_portrait` |
| 16 | `ai-supercomputer-hall` | `supercomputer_hall` | Verified on disk (Phase 09) | `desk_companion`, `dossier_opener` |
| 17 | `ai-robotics-automation` | `robotics_automation` | Verified on disk (Phase 09) | `desk_companion`, `dossier_opener` |
| 18 | `ai-research-laboratory` | `research_laboratory` | Verified on disk (Phase 09) | `desk_companion`, `dossier_opener` |
| 19 | `ai-optics-photonics` | `optics_photonics` | Verified on disk (Phase 09) | `desk_companion`, `documentary_break`, `dossier_opener` |
| 20 | `ai-scientific-instrument` | `scientific_instrument` | Verified on disk (Phase 09) | `desk_companion`, `dossier_opener` |
| 21 | `ai-engineering-workspace` | `engineering_workspace` | Verified on disk (Phase 09) | `desk_companion`, `dossier_opener` |
| 22 | `ai-advanced-materials` | `advanced_materials` | Verified on disk (Phase 09) | `desk_companion`, `dossier_opener` |
| 23 | `ai-quantum-computing` | `quantum_computing` | **Phase 10 Stage 3 Acquisition** | `dossier_opener` (quantum / frontier physics / cryptography), `folio_thumb` |
| 24 | `ai-autonomous-mobility` | `autonomous_mobility` | **Phase 10 Stage 3 Acquisition** | `dossier_opener` (autonomous vehicles / LiDAR / robotaxi / edge AI), `desk_companion` |

### Domain 3 — Economic Outlook (`public/assets/interface-library/economy/` · 12 Assets)
*Visual World: Institutional & Economic Humanism — financial institutions, central banks, manufacturing, energy transition, commodities, urban housing, and agricultural supply.*

| # | Asset ID | Subject Category | Status | Intended Design Roles |
| :--- | :--- | :--- | :--- | :--- |
| 25 | `economy-stock-exchange` | `financial_institutions` | Verified on disk (Phase 09) | `desk_spine`, `dossier_portrait` |
| 26 | `economy-central-bank` | `central_bank` | Verified on disk (Phase 09) | `desk_spine`, `dossier_portrait` |
| 27 | `economy-financial-district` | `financial_district` | Verified on disk (Phase 09) | `desk_companion`, `folio_thumb`, `dossier_opener` |
| 28 | `economy-manufacturing-factory` | `manufacturing_factory` | Verified on disk (Phase 09) | `desk_companion`, `dossier_opener` |
| 29 | `economy-global-trade` | `global_trade` | Verified on disk (Phase 09) | `desk_spine`, `dossier_opener` |
| 30 | `economy-energy-infrastructure` | `energy_infrastructure` | Verified on disk (Phase 09) | `desk_companion`, `dossier_opener` |
| 31 | `economy-commodity-production` | `commodity_production` | Verified on disk (Phase 09) | `desk_companion`, `dossier_opener` |
| 32 | `economy-retail-consumption` | `retail_consumption` | Verified on disk (Phase 09) | `desk_companion`, `dossier_opener` |
| 33 | `economy-supply-chain` | `supply_chain` | Verified on disk (Phase 09) | `desk_companion`, `dossier_opener` |
| 34 | `economy-infrastructure-investment` | `infrastructure_investment` | Verified on disk (Phase 09) | `desk_companion`, `dossier_opener` |
| 35 | `economy-housing-urban` | `housing_real_estate` | **Phase 10 Stage 3 Acquisition** | `dossier_opener` (housing / mortgages / property / urban affordability), `folio_thumb` |
| 36 | `economy-agriculture-food` | `agriculture_food` | **Phase 10 Stage 3 Acquisition** | `dossier_opener` (food inflation / grain exports / agricultural supply), `desk_companion` |

---

## 3. Stage 3 Acquisition & Validation Protocol (Mandatory for All 6 New Assets)

For each of the 6 Phase 10 additions (`world-climate-environment`, `world-border-checkpoint`, `ai-quantum-computing`, `ai-autonomous-mobility`, `economy-housing-urban`, `economy-agriculture-food`):
1. Source exclusively from verifiable open licenses (**Public Domain / CC0 / CC BY / CC BY-SA** via Wikimedia Commons or NASA Images, or Unsplash License).
2. Download the real image binary directly to disk; verify HTTP 200 and genuine image magic bytes.
3. Convert uncropped to two responsive WebP files (`1600px` long edge primary `.webp` + `800px` long edge `-800.webp`) under `public/assets/interface-library/{domain}/`.
4. Render all 6 newly downloaded images on a visual contact sheet (`.playwright-cli/p10-new-assets-contact.jpg`) and inspect every single frame visually before accepting it into `interfaceImageLibrary.ts`. Reject and replace any blurry, watermarked, or off-subject candidate.
5. Record exact `naturalWidth`, `naturalHeight`, `fileSizeBytes`, `webp800Bytes`, per-asset visually tuned `objectPosition`, creator, source page URL, license name/URL, and bilingual EN+ZH alt text, captions, and non-documentary context notes in:
   - `src/lib/editorial/interfaceImageLibrary.ts`
   - `public/assets/interface-library/manifest.json`
   - `public/assets/interface-library/README.md`
6. Verify via automated unit tests (`src/test/interfaceImageLibrary.test.ts`) that all 36 primary + 36 responsive WebP files exist on disk, decode as valid `RIFF/WEBP`, match byte counts, stay under `25 MB` total, and maintain zero overlap with `EDITORIAL_ASSET_REGISTRY`.
