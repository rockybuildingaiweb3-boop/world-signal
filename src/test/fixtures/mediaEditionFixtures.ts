/**
 * SYNTHETIC TEST FIXTURES ONLY — NEVER PUBLISHED TO content/editions/ OR public/editions/.
 * Used exclusively by automated tests to verify schema v1/v2 media parsing,
 * rights/verification enforcement, selection precedence, source-independence isolation,
 * bilingual captions/alt text, and publishing script validation.
 */

export interface MediaFixtureOptions {
  schemaVersion?: 1 | 2;
  editionDate?: string;
  contentLanguage?: 'en' | 'zh-CN';
  signalId?: string;
  headline?: string;
  topic?: string;
  importance?: 1 | 2 | 3 | 4 | 5;
  /** Raw YAML block for `media_assets:` (indented at root of signal YAML, e.g. `media_assets: []`). Omit to test absence. */
  mediaAssetsYaml?: string;
}

export function buildSyntheticMediaEdition(options: MediaFixtureOptions = {}): string {
  const {
    schemaVersion = 2,
    editionDate = '2026-10-15',
    contentLanguage = 'en',
    signalId = 'WORLD-20261015-maritime-accord',
    headline = 'Maritime Accord Reached Across Strait Corridor',
    topic = 'diplomacy',
    importance = 5,
    mediaAssetsYaml,
  } = options;

  const v2FieldsBlock =
    schemaVersion >= 2
      ? `
continuity:
  first_seen_edition: "${editionDate}"
  last_material_update: "${editionDate}"
  history_complete: true
  lifecycle: "developing"
update:
  change_type: "initial"
  summary: "Initial verified record of the synthetic maritime accord."
  evidence_changes:
    added_claim_ids: ["${signalId}-C01"]
    revised_claim_ids: []
    withdrawn_claim_ids: []
    added_source_urls:
      - "https://www.reuters.com/world/synthetic-maritime-accord"
      - "https://apnews.com/article/synthetic-maritime-accord"
    removed_source_urls: []
timeline_events:
  - event_id: "E1"
    occurred_at: "2026-10-14"
    title: "Maritime accord signed"
    summary: "Participating delegations signed the transit framework."
    claim_ids: ["${signalId}-C01"]
    source_ids: ["S1", "S2"]
relationships: []`
      : '';

  const mediaBlock = mediaAssetsYaml !== undefined ? `\n${mediaAssetsYaml.trimEnd()}` : '';

  return `---
schema_version: ${schemaVersion}
edition_date: "${editionDate}"
edition_timezone: "America/Los_Angeles"
edition_title: "WORLD SIGNAL — Synthetic Media Test Edition"
edition_status: "published"
content_language: "${contentLanguage}"
generated_at: "${editionDate}T08:00:00-07:00"
updated_at: "${editionDate}T08:30:00-07:00"
sync_run: "morning"
coverage_window_start: "2026-10-14T08:00:00-07:00"
coverage_window_end: "${editionDate}T08:00:00-07:00"
summary: "Synthetic test edition for editorial media governance verification."
---

# Executive Briefing

> **Edition summary:** Synthetic executive summary for automated verification of optional visual media metadata.

### Top Signals
- **[${signalId}]** — Synthetic lead signal used to test media handling without altering evidence ledgers.

# World Events

> Synthetic World domain section.

## ${signalId} — ${headline}

\`\`\`yaml
signal_id: "${signalId}"
domain: "world"
topic: "${topic}"
importance: ${importance}
status: "confirmed"
confidence:
  overall: "high"
  rationale: "Corroborated by two independent Tier-1 newsrooms."
event:
  start_date: "2026-10-14"
  geography: ["Mediterranean", "Red Sea"]
published_at: "${editionDate}T08:00:00-07:00"
first_verified_at: "${editionDate}T07:30:00-07:00"
updated_at: "${editionDate}T08:30:00-07:00"
tags: ["diplomacy", "maritime", "shipping"]
related_signal_ids: []${v2FieldsBlock}${mediaBlock}
claims:
  - claim_id: "${signalId}-C01"
    statement: "Delegations signed the maritime transit framework on October 14."
    status: "confirmed"
    confidence: "high"
    source_ids: ["S1", "S2"]
sources:
  - source_id: "S1"
    outlet: "Reuters"
    title: "Envoys finalize maritime transit framework"
    url: "https://www.reuters.com/world/synthetic-maritime-accord"
    published_at: "2026-10-14T18:00:00Z"
    accessed_at: "${editionDate}T07:00:00-07:00"
    source_class: "tier_1_newsroom"
    registry_id: "reuters"
    independence_group: "reuters"
    relationship: "original_reporting"
    count_as_independent: true
    supports_claim_ids: ["${signalId}-C01"]
  - source_id: "S2"
    outlet: "Associated Press"
    title: "Regional maritime accord takes effect"
    url: "https://apnews.com/article/synthetic-maritime-accord"
    published_at: "2026-10-14T19:00:00Z"
    accessed_at: "${editionDate}T07:10:00-07:00"
    source_class: "tier_1_newsroom"
    registry_id: "ap"
    independence_group: "ap"
    relationship: "original_reporting"
    count_as_independent: true
    supports_claim_ids: ["${signalId}-C01"]
\`\`\`

### What Happened
Regional envoys finalized a maritime transit framework after three days of negotiations [S1][S2].

### Verified Facts
- Framework signed on October 14 by participating port authorities [S1][S2].

### Timeline
- 2026-10-14 — Final text endorsed by participating delegations.

### Why It Matters
Clarifies commercial navigation protocols across a critical sea lane.

### Source Perspectives
Reuters and Associated Press independently confirmed the signed protocol.

### Analysis
Operational compliance depends on joint inspection coordination over the next quarter.

### Uncertainties
- Enforcement mechanisms outside coastal jurisdiction remain under review.

### Scenarios
- **Base case:** Gradual normalization of commercial transit schedules.
- **Downside:** Implementation stalls if inspection rules face local disputes.
- **Upside:** Insurance premiums decline faster than expected.

### What to Watch
- Joint maritime commission compliance review next month.

# AI Frontier

> No additional synthetic AI signals required for this fixture.

# Economic Outlook

> No additional synthetic economy signals required for this fixture.

# Cross-Domain Synthesis

No cross-domain synthetic threads.

# Personal Implications

General decision-support test fixture only.

# Watchlist

| Indicator or Event | Why It Matters | Next Checkpoint | Signals Linked |
| --- | --- | --- | --- |
| Port transit review | Tracks protocol compliance | 2026-11-15 | ${signalId} |

# Audit & Methodology

### Source Audit
Two independent Tier-1 newsrooms corroborated the synthetic signal.

### Open Questions
None in synthetic fixture.

### Corrections
None.

### Methodology Notes
Synthetic fixture for media intelligence verification.
`;
}

export const VALID_PHOTO_MEDIA_YAML = `media_assets:
  - media_id: "M1"
    media_type: "photograph"
    placement: "hero"
    relationship_to_signal: "direct_event_documentation"
    asset_url: "https://upload.wikimedia.org/wikipedia/commons/example-summit-hall.jpg"
    source_page_url: "https://commons.wikimedia.org/wiki/File:Example_Summit_Hall.jpg"
    title: "Delegations convene in Geneva"
    caption: "Participating delegations gathered in the main conference hall during the maritime accord signing."
    alt_text: "Wide photograph of diplomatic delegations seated around a semicircular table in an assembly hall."
    creator: "Jane Doe / Diplomatic Press Office"
    credit_line: "Jane Doe / Wikimedia Commons (CC BY 4.0)"
    depicted_at: "2026-10-14"
    depicted_location: "Geneva, Switzerland"
    rights:
      basis: "cc_by"
      license_name: "CC BY 4.0"
      license_url: "https://creativecommons.org/licenses/by/4.0/"
      rights_holder: "Jane Doe"
      verified_at: "2026-10-15T07:45:00-07:00"
      public_web_display_allowed: true
      crop_allowed: true
    verification:
      source_page_checked: true
      direct_asset_checked: true
      visual_content_checked: true
      caption_context_checked: true`;

export const VALID_ILLUSTRATION_MEDIA_YAML = `media_assets:
  - media_id: "M2"
    media_type: "illustration"
    placement: "supporting"
    relationship_to_signal: "illustrative"
    asset_url: "https://images-assets.nasa.gov/image/synthetic-orbit-diagram/synthetic-orbit-diagram~orig.jpg"
    source_page_url: "https://images.nasa.gov/details/synthetic-orbit-diagram"
    title: "Conceptual orbital relay schematic"
    caption: "Conceptual illustration depicting maritime satellite relay coverage across international corridors."
    alt_text: "Editorial schematic illustration of satellite coverage arcs over an ocean corridor."
    creator: "NASA Visualization Studio"
    credit_line: "NASA Visualization Studio / Public Domain"
    rights:
      basis: "public_domain"
      license_name: "Public Domain (NASA)"
      license_url: "https://www.nasa.gov/nasa-brand-center/images-and-media/"
      rights_holder: "NASA"
      verified_at: "2026-10-15T07:50:00-07:00"
      public_web_display_allowed: true
      crop_allowed: true
    verification:
      source_page_checked: true
      direct_asset_checked: true
      visual_content_checked: true
      caption_context_checked: true`;

export const VALID_CONTEXTUAL_UNCROPPED_MEDIA_YAML = `media_assets:
  - media_id: "M3"
    media_type: "photograph"
    placement: "hero"
    relationship_to_signal: "contextual"
    asset_url: "https://upload.wikimedia.org/wikipedia/commons/example-container-port.jpg"
    source_page_url: "https://commons.wikimedia.org/wiki/File:Example_Container_Port.jpg"
    title: "Commercial shipping corridor reference"
    caption: "Contextual archive photograph of container vessels transiting a Mediterranean port; does not depict the October 14 signing."
    alt_text: "Contextual photograph of commercial container ships moored along gantry cranes in a deep-water port."
    creator: "European Commission Audiovisual Service"
    credit_line: "European Commission Audiovisual Service (CC BY 4.0)"
    depicted_at: "2025-06-12"
    depicted_location: "Rotterdam, Netherlands"
    rights:
      basis: "cc_by"
      license_name: "CC BY 4.0"
      license_url: "https://creativecommons.org/licenses/by/4.0/"
      rights_holder: "European Union"
      verified_at: "2026-10-15T07:55:00-07:00"
      public_web_display_allowed: true
      crop_allowed: false
    verification:
      source_page_checked: true
      direct_asset_checked: true
      visual_content_checked: true
      caption_context_checked: true`;

export const VALID_HERO_AND_SUPPORTING_MEDIA_YAML = `media_assets:
  - media_id: "M1"
    media_type: "photograph"
    placement: "hero"
    relationship_to_signal: "direct_event_documentation"
    asset_url: "https://upload.wikimedia.org/wikipedia/commons/example-summit-hall.jpg"
    source_page_url: "https://commons.wikimedia.org/wiki/File:Example_Summit_Hall.jpg"
    title: "Delegations convene in Geneva"
    caption: "Participating delegations gathered in the main conference hall during the maritime accord signing."
    alt_text: "Wide photograph of diplomatic delegations seated around a semicircular table in an assembly hall."
    creator: "Jane Doe"
    credit_line: "Jane Doe / Wikimedia Commons (CC BY 4.0)"
    rights:
      basis: "cc_by"
      license_name: "CC BY 4.0"
      license_url: "https://creativecommons.org/licenses/by/4.0/"
      rights_holder: "Jane Doe"
      verified_at: "2026-10-15T07:45:00-07:00"
      public_web_display_allowed: true
      crop_allowed: true
    verification:
      source_page_checked: true
      direct_asset_checked: true
      visual_content_checked: true
      caption_context_checked: true
  - media_id: "M2"
    media_type: "map"
    placement: "supporting"
    relationship_to_signal: "data_visualization"
    asset_url: "https://upload.wikimedia.org/wikipedia/commons/example-corridor-map.png"
    source_page_url: "https://commons.wikimedia.org/wiki/File:Example_Corridor_Map.png"
    title: "Transit corridor map"
    caption: "Reference map showing commercial maritime transit lanes covered by the agreement."
    alt_text: "Labeled regional map highlighting maritime transit corridors between Mediterranean and Red Sea ports."
    creator: "Open Cartography Contributors"
    credit_line: "Open Cartography Contributors / Wikimedia Commons (CC BY-SA 4.0)"
    rights:
      basis: "cc_by_sa"
      license_name: "CC BY-SA 4.0"
      license_url: "https://creativecommons.org/licenses/by-sa/4.0/"
      rights_holder: "Open Cartography Contributors"
      verified_at: "2026-10-15T07:48:00-07:00"
      public_web_display_allowed: true
      crop_allowed: false
    verification:
      source_page_checked: true
      direct_asset_checked: true
      visual_content_checked: true
      caption_context_checked: true`;

export const BILINGUAL_ZH_MEDIA_YAML = `media_assets:
  - media_id: "M_ZH_1"
    media_type: "photograph"
    placement: "hero"
    relationship_to_signal: "contextual"
    asset_url: "https://upload.wikimedia.org/wikipedia/commons/example-zh-port.jpg"
    source_page_url: "https://commons.wikimedia.org/wiki/File:Example_ZH_Port.jpg"
    title: "地中海航运港口背景资料图"
    caption: "背景参考照片：地中海深水港集装箱泊位实景，用于说明区域航运枢纽规模，非本次协议签署现场。"
    alt_text: "地中海集装箱码头岸桥与货轮泊位的广角背景照片。"
    creator: "欧盟视听服务部"
    credit_line: "欧盟视听服务部 / Wikimedia Commons (CC BY 4.0)"
    depicted_at: "2025-09-01"
    depicted_location: "鹿特丹港"
    rights:
      basis: "cc_by"
      license_name: "CC BY 4.0"
      license_url: "https://creativecommons.org/licenses/by/4.0/"
      rights_holder: "European Union"
      verified_at: "2026-10-15T07:45:00-07:00"
      public_web_display_allowed: true
      crop_allowed: false
    verification:
      source_page_checked: true
      direct_asset_checked: true
      visual_content_checked: true
      caption_context_checked: true`;
