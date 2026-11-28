# Media Asset Policy

This document is the authoritative visual media research, rights verification, attribution, and reuse policy for **WORLD SIGNAL**.

Visual journalism enriches reader comprehension, but **a visually attractive image must never create a false impression of factual verification, location, attribution, or source independence**.

---

## 1. Media purpose

Visual media is used strictly to improve understanding of consequential real-world developments:

- The **Briefing** lead story.
- Selected high-priority secondary stories.
- Important investigative dossiers in **Expanded & Timelines**.
- Supporting editorial context where the visual genuinely clarifies the event, place, artifact, or system.
- Grounded data visualizations or institutional charts where authentic structured data exists.

Do **not** attach imagery merely to fill empty layouts or decorate every signal. An absent `media_assets` array or `media_assets: []` is always preferable to an unverified, poorly matched, or legally ambiguous image.

### 1.1 Editorial selection priority

Use signal importance to allocate visual-research effort, not to relax the rights or verification standard:

- **Importance 5:** Actively search for a story-specific visual, starting with the Briefing lead story. If no suitable rights-cleared asset can be verified, publish no image and disclose the limitation where relevant.
- **Importance 4:** Strongly consider sourcing an image when it materially improves comprehension or provides relevant documentary context.
- **Importance 3:** Search selectively only when a visual adds meaningful explanatory value.
- **Importance 1–2:** Normally omit image research unless a rare, clearly justified visual adds substantial reader value.

Prefer one excellent image per selected signal. A second image is justified only when it adds a distinct, verified perspective or a different documented stage. There is no image quota and no requirement to attach an image to every signal. Prioritize the lead story and a small number of consequential secondary stories; never use an unrelated image to fill a layout.

---

## 2. Supported media categories and signal relationships

### 2.1 Media types (`media_type`)

Every media asset record must declare one of the following categories:

| Value | Meaning |
|---|---|
| `photograph` | Authentic photographic capture of a real-world scene, person, place, or object |
| `illustration` | Original or licensed conceptual/editorial artwork (never documentary photography) |
| `chart` | Quantitative chart or graph published by an attributable source |
| `map` | Geographic or schematic map (must clearly note if schematic or not to scale) |
| `diagram` | Technical, architectural, or process diagram |
| `document_scan` | Verifiable scan or official excerpt of a public filing, treaty, report, or document |
| `screenshot` | Authentic software, benchmark, or interface capture (never a screenshot of a third-party news article used as a substitute for a photograph) |

### 2.2 Relationship to signal (`relationship_to_signal`)

Every asset must explicitly classify how it relates to the story so the frontend can surface the distinction to readers:

| Value | Meaning | Display rule |
|---|---|---|
| `direct_event_documentation` | Verified image documenting the actual event, location, or release described in the signal | May be labeled as documentary / event media with verified date & location |
| `contextual` | Verified archival, file, facility, geographic, or institutional image providing background context | Must be labeled clearly as **contextual / file imagery**, never as footage of the current incident |
| `illustrative` | Conceptual artwork or editorial illustration representing the theme | Must be labeled explicitly as **illustrative / non-documentary** |
| `data_visualization` | Chart, diagram, or visual representation of structured data | Must cite the underlying data publisher and scope |

A `contextual` or `illustrative` asset must **never** be presented as a photograph documenting the actual breaking event.

---

## 3. Approved discovery locations vs. item-level rights

Preferred discovery locations for research include:

- Wikimedia Commons
- NASA Images (`images.nasa.gov`)
- Official government, central-bank, or intergovernmental institutional media libraries (e.g., UN, European Commission Audiovisual Service, NOAA, USGS, ESA)
- Creative Commons licensed collections
- Directly licensed editorial or institutional media providers

**Critical boundary — discovery is NOT approval:**

1. Every individual asset requires **item-level rights verification**.
2. The mere presence of a photograph on an official government or institutional website does **not** automatically grant permission to republish it (many government pages host third-party, contractor, or wire-service photographs).
3. A newsroom's inclusion in `config/source-registry.yml` approves it for **factual text reporting only** — it does **not** grant permission to republish its photographs, graphics, or videos. A Reuters, AP, FT, or Bloomberg article may be an approved factual source while its accompanying photograph remains separately licensed and restricted.

---

## 4. Rights classifications (`rights.basis`)

WORLD SIGNAL supports the following explicit rights bases for displayable media:

| `rights.basis` | Requirements |
|---|---|
| `public_domain` | Document jurisdiction and public-domain evidence/policy URL (e.g., confirmed US federal government work under 17 U.S.C. § 105, expired copyright, or official PD dedication). Do not assume every US government website image is a US government work. |
| `cc0` | Verified Creative Commons Zero (CC0 1.0) waiver with link to the waiver deed. |
| `cc_by` | Verified Creative Commons Attribution license (e.g., CC BY 4.0) with link to the license deed and exact required attribution. |
| `cc_by_sa` | Verified Creative Commons Attribution-ShareAlike license with link to the license deed and exact required attribution. |
| `explicit_permission` | Written or published explicit permission covering WORLD SIGNAL public web display, with a verifiable rights record URL. |
| `editorial_license` | Valid license explicitly covering WORLD SIGNAL's actual public web publication use, with documented license terms URL. |

### Restricted, unknown, and automatically disallowed rights

Assets with **unknown, unverified, or restricted rights must never be added to `media_assets` or displayed in the frontend**.

Do **not** automatically approve:

- `CC BY-NC` (NonCommercial) without explicit rights-holder confirmation that WORLD SIGNAL's actual deployment and use are compatible.
- `CC BY-ND` (NoDerivatives) for any cropped, resized-by-crop, or visually altered presentation (`crop_allowed` must be `false`, and only uncropped display under verified terms may be considered).
- Commercial stock imagery without a verified license covering WORLD SIGNAL's public web use.
- Wire-service or editorial news photography without an active license covering WORLD SIGNAL's public web display.
- Third-party photographs merely because they appear on an official government, corporate, or university webpage.
- Assets with unclear creators, missing provenance, or disputed ownership.

### Mandatory rights metadata

Every approved asset record must document:

- Verified direct HTTPS `asset_url` and original provenance page `source_page_url`.
- Verified `rights_holder` (or documented public-domain basis).
- Explicit `license_name` and `license_url` (license deed URL, or official rights-policy / public-domain basis URL for `public_domain`).
- Real ISO 8601 `verified_at` timestamp (never fabricated).
- `public_web_display_allowed: true`.
- Explicit boolean `crop_allowed` — when `false`, the frontend must render the image uncropped (`object-fit: contain`) without destructive cropping.

---

## 5. Image integrity & editorial safety

Before adding any asset to a canonical Markdown edition, Muse must perform and confirm all four verification checks (`verification.*`):

1. **`source_page_checked`**: Inspected the original image information page or licensed media record.
2. **`direct_asset_checked`**: Verified the direct HTTPS `asset_url` is stable, resolves to the original image file (not a thumbnail proxy or expiring signed URL), and does not require authentication.
3. **`visual_content_checked`**: Inspected the actual image whenever image inspection is available to confirm its visible contents match the metadata.
4. **`caption_context_checked`**: Verified original caption, date, location, and archival/file status so context is not misrepresented.

If any of the four checks cannot be confirmed as `true`, **do not place the asset in `media_assets`**.

### Prohibited imagery

Never use:

- Search-engine result thumbnails or proxy caches as original assets.
- Screenshots of news articles or social feeds used as substitutes for photographs.
- Unattributed social-media images or unverified reposts.
- AI-generated documentary-looking depictions of real events, explosions, military attacks, political leaders, or casualties.
- Images that imply a location, person, casualty count, or event not verified by the original media record.
- Graphic, sensational, or exploitative imagery used to attract attention. Exercise strict editorial restraint with victims, minors, civilians, identifiable private individuals, and conflict-related scenes.

Always distinguish a current-event photograph from a file/archival image via `relationship_to_signal` and `depicted_at`.

---

## 6. Caption, alt text, and visible attribution

Every displayable asset requires:

- **`title`**: Exact title from the original media record where available.
- **`caption`**: Concise, factual description grounded in the verified media record. Never invent a photographer's caption or copy lengthy copyrighted prose unnecessarily.
- **`alt_text`**: Objective accessibility description of what is visibly present in the frame. Do **not** infer unseen intent, unverified identities, or causality, and do **not** put copyright notices or long license text inside `alt_text`.
- **`creator`**: Creator or photographer name as required by the source record.
- **`credit_line`**: Display-ready visible attribution line (e.g., `Photo: Name / Institution, CC BY 4.0`).
- **Visible provenance & license links**: The frontend must render visible credit, caption, a link to `source_page_url`, and a link to `license_url` near the image.

---

## 7. No visual evidence inflation (separation from textual sources)

Visual media records (`media_assets`) are **strictly separate** from factual source ledgers (`sources`) and claim ledgers (`claims`).

An entry in `media_assets` must **never**:

- Automatically become a `sources` record.
- Increase `independentOriginCount` or add an independent newsroom origin.
- Increase corroboration counts or signal/claim confidence.
- Verify a factual claim or prove its own caption is independently corroborated.
- Establish attribution, casualty counts, or causality.

If a visual document (such as an official satellite report or public filing) is itself primary factual evidence, cite it through the standard `sources` and `claims` rules separately. Supplementary visual media enriches presentation without inflating epistemic weight.
