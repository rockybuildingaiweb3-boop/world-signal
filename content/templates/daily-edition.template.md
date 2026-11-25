---
schema_version: 1
edition_date: "YYYY-MM-DD"
edition_timezone: "America/Los_Angeles"
edition_title: "WORLD SIGNAL — Daily Intelligence Briefing"
edition_status: "draft"
content_language: "zh-CN"
generated_at: "YYYY-MM-DDTHH:mm:ss-08:00"
updated_at: "YYYY-MM-DDTHH:mm:ss-08:00"
sync_run: "morning"
coverage_window_start: "YYYY-MM-DDTHH:mm:ss-08:00"
coverage_window_end: "YYYY-MM-DDTHH:mm:ss-08:00"
summary: "用一句话概括本期最重要的全球变化。"
---

# Executive Briefing

> **Edition summary:** 在这里写一段简洁、事实优先的整体摘要。

### Top Signals

- **[WORLD-YYYYMMDD-short-slug]** — 核心事件及其重要性。
- **[AI-YYYYMMDD-short-slug]** — 关键技术成果及其证据状态。
- **[ECON-YYYYMMDD-short-slug]** — 最重要的经济信号及其现实含义。

# World Events

> 只记录具有实质国际或社会影响的大事。不为填满版面而添加普通新闻。

## WORLD-YYYYMMDD-short-slug — Headline

~~~yaml
signal_id: "WORLD-YYYYMMDD-short-slug"
domain: "world"
topic: "geopolitics"
importance: 4
status: "developing"
confidence:
  overall: "medium"
  rationale: "哪些方面已证实，哪些方面仍然存在争议。"
event:
  start_date: "YYYY-MM-DD"
  end_date: "YYYY-MM-DD"
  geography:
    - "Country or region"
published_at: "YYYY-MM-DDTHH:mm:ssZ"
first_verified_at: "YYYY-MM-DDTHH:mm:ssZ"
updated_at: "YYYY-MM-DDTHH:mm:ssZ"
tags:
  - "tag-one"
related_signal_ids: []
continuity:
  first_seen_edition: "YYYY-MM-DD"
  last_material_update: "YYYY-MM-DD"
  lifecycle: "developing"
update:
  change_type: "initial"
  summary: "Describe the verified change in this edition; do not repeat the headline."
  previous_edition: null
  evidence_changes:
    added_claim_ids: []
    revised_claim_ids: []
    withdrawn_claim_ids: []
    added_source_urls: []
    removed_source_urls: []
timeline_events: []
relationships: []
claims:
  - claim_id: "WORLD-YYYYMMDD-short-slug-C01"
    statement: "One testable factual claim."
    status: "confirmed"
    confidence: "high"
    source_ids:
      - "S1"
sources:
  - source_id: "S1"
    outlet: "Reuters"
    title: "Exact article or document title"
    url: "https://example.com/replace-with-real-source"
    published_at: "YYYY-MM-DDTHH:mm:ssZ"
    accessed_at: "YYYY-MM-DDTHH:mm:ssZ"
    source_class: "tier_1_newsroom"
    registry_id: "reuters"
    independence_group: "reuters"
    relationship: "original_reporting"
    count_as_independent: true
    supports_claim_ids:
      - "WORLD-YYYYMMDD-short-slug-C01"
~~~

### What Happened

中立、清晰地描述发生了什么。注明事件日期，不要把报道日期误写成事件日期。

### Verified Facts

- 只列出能够由来源记录支持的事实。
- 对尚未独立证实的信息使用 reported、official claim 或 disputed 等准确措辞。

### Timeline

- YYYY-MM-DD — 关键进展及其证据。
- YYYY-MM-DD — 后续发展。

### Why It Matters

解释事件的影响范围、相关参与方，以及为什么值得持续关注。

### Source Perspectives

说明不同独立新闻机构如何报道、侧重点有何不同。不要把转载当成独立观点。

### Analysis

明确区分事实与推论。分析必须说明依赖哪些证据。

### Uncertainties

列出尚未解决的归因、数字、意图、因果关系或证据缺口。没有重大缺口时写明这一点。

### Scenarios

- **Base case:** 有证据支持的基准情景。
- **Downside:** 可能导致局势恶化的条件。
- **Upside:** 可能改善局势的条件。

### What to Watch

列出后续可观测事件、指标、会议、数据或官方决定。

# AI Frontier

> 记录具有实际技术意义的突破、能力变化、研究成果和基础设施进展。

## AI-YYYYMMDD-short-slug — Headline

~~~yaml
signal_id: "AI-YYYYMMDD-short-slug"
domain: "ai"
topic: "model-capability"
importance: 4
status: "developing"
confidence:
  overall: "medium"
  rationale: "区分公司自报、论文证据、同行评审和独立复现。"
event:
  start_date: "YYYY-MM-DD"
  end_date: "YYYY-MM-DD"
  geography: []
published_at: "YYYY-MM-DDTHH:mm:ssZ"
first_verified_at: "YYYY-MM-DDTHH:mm:ssZ"
updated_at: "YYYY-MM-DDTHH:mm:ssZ"
tags:
  - "reasoning"
related_signal_ids: []
continuity:
  first_seen_edition: "YYYY-MM-DD"
  last_material_update: "YYYY-MM-DD"
  lifecycle: "developing"
update:
  change_type: "initial"
  summary: "Describe the verified change in this edition; do not repeat the headline."
  previous_edition: null
  evidence_changes:
    added_claim_ids: []
    revised_claim_ids: []
    withdrawn_claim_ids: []
    added_source_urls: []
    removed_source_urls: []
timeline_events: []
relationships: []
claims:
  - claim_id: "AI-YYYYMMDD-short-slug-C01"
    statement: "A specific technical claim with a defined scope."
    status: "reported"
    confidence: "medium"
    source_ids:
      - "S1"
sources:
  - source_id: "S1"
    outlet: "Nature"
    title: "Exact article, paper, or technical artifact title"
    url: "https://example.com/replace-with-real-source"
    published_at: "YYYY-MM-DDTHH:mm:ssZ"
    accessed_at: "YYYY-MM-DDTHH:mm:ssZ"
    source_class: "specialist_publication"
    registry_id: "nature"
    independence_group: "nature"
    relationship: "original_reporting"
    count_as_independent: true
    supports_claim_ids:
      - "AI-YYYYMMDD-short-slug-C01"
~~~

### What Happened

描述技术成果或产品变化，并准确标明发布者、系统名称、版本和日期。

### Verified Facts

- 记录模型、论文、代码、数据集、硬件、评测或发布工件。
- 标注结果来自自我报告、同行评审、独立测试还是独立复现。

### Timeline

- YYYY-MM-DD — 论文、代码、产品或评测发布。

### Why It Matters

解释这项进展解决了什么问题，以及与既有方法相比有什么具体变化。

### Source Perspectives

比较可信科技报道、研究材料和官方信息。明确哪些是报道，哪些是原始材料。

### Analysis

分析技术意义、能力边界、成本、可扩展性及可能的应用影响。

### Uncertainties

说明基准局限、数据污染风险、复现情况、样本规模、选择偏差和未公开细节。

### Scenarios

- **Base case:** 最有证据支持的应用或技术演进路径。
- **Downside:** 主要技术或商业约束。
- **Upside:** 在关键条件成立时可能出现的进展。

### What to Watch

后续独立评测、代码开源、同行评审、模型发布、复现、成本和实际部署数据。

# Economic Outlook

> 把宏观数据、政策、市场变化和结构性经济趋势联系起来。

## ECON-YYYYMMDD-short-slug — Headline

~~~yaml
signal_id: "ECON-YYYYMMDD-short-slug"
domain: "economy"
topic: "macroeconomics"
importance: 4
status: "developing"
confidence:
  overall: "medium"
  rationale: "区分已发布的数据、市场反应和对未来的推论。"
event:
  start_date: "YYYY-MM-DD"
  end_date: "YYYY-MM-DD"
  geography:
    - "Country or region"
published_at: "YYYY-MM-DDTHH:mm:ssZ"
first_verified_at: "YYYY-MM-DDTHH:mm:ssZ"
updated_at: "YYYY-MM-DDTHH:mm:ssZ"
tags:
  - "inflation"
related_signal_ids: []
continuity:
  first_seen_edition: "YYYY-MM-DD"
  last_material_update: "YYYY-MM-DD"
  lifecycle: "developing"
update:
  change_type: "initial"
  summary: "Describe the verified change in this edition; do not repeat the headline."
  previous_edition: null
  evidence_changes:
    added_claim_ids: []
    revised_claim_ids: []
    withdrawn_claim_ids: []
    added_source_urls: []
    removed_source_urls: []
timeline_events: []
relationships: []
claims:
  - claim_id: "ECON-YYYYMMDD-short-slug-C01"
    statement: "A specific economic fact including period and unit."
    status: "confirmed"
    confidence: "high"
    source_ids:
      - "S1"
sources:
  - source_id: "S1"
    outlet: "Bureau of Labor Statistics"
    title: "Exact release or data table title"
    url: "https://example.com/replace-with-real-source"
    published_at: "YYYY-MM-DDTHH:mm:ssZ"
    accessed_at: "YYYY-MM-DDTHH:mm:ssZ"
    source_class: "primary_source"
    registry_id: "bls"
    independence_group: "bls"
    relationship: "official_statement"
    count_as_independent: false
    supports_claim_ids:
      - "ECON-YYYYMMDD-short-slug-C01"
~~~

### What Happened

说明数据、政策、市场或行业事件本身。注明统计期间、发布日和单位。

### Verified Facts

- 区分官方经济数据、修订值、初值和市场价格。
- 不要将单日市场波动等同于实体经济趋势。

### Timeline

- YYYY-MM-DD — 数据发布或政策决定。
- YYYY-MM-DD — 后续修订或市场反应。

### Why It Matters

解释其对通胀、就业、增长、利率、贸易、信用或产业结构的影响路径。

### Source Perspectives

比较顶级经济媒体、官方数据和机构研究，注明观点与事实的区别。

### Analysis

按证据讨论近端、中期和结构性影响。可以使用条件情景，但不能把预测写成事实。

### Uncertainties

列出数据修订、抽样误差、政策不确定性、市场预期差异和潜在反向证据。

### Scenarios

- **Base case:** 当前证据支持的基准路径。
- **Downside:** 下行风险及触发条件。
- **Upside:** 改善路径及其必要条件。

### Personal Relevance

从一般读者角度讨论：
- Career and skills — 哪些行业、技能或工作方式值得关注。
- Household resilience — 现金流、应急储备和固定支出意识。
- Spending and borrowing — 对大额消费、利率和债务成本的关注点。
- Risk awareness — 哪些指标变化值得继续观察。

这不是个性化财务建议，不推荐具体证券、交易或资产配置。

### What to Watch

列出后续宏观数据、央行会议、政策节点、企业财报或劳动市场指标。

# Cross-Domain Synthesis

只写有证据支持的跨领域联系。说明连接的是哪些 signal ID、传导机制是什么、有哪些替代解释。

# Personal Implications

从就业与技能、日常生活成本、家庭韧性、重大消费和风险意识等方面提炼一般性行动框架。不要提供个性化投资建议。

# Watchlist

| Indicator or event | Why it matters | Next checkpoint | Signals linked |
|---|---|---|---|
| Watch item | Evidence-based reason | YYYY-MM-DD | SIGNAL-ID |

# Audit & Methodology

## Source audit

记录来源访问受限、转载识别、信源独立性和未完成核验。

## Open questions

记录本期仍待验证的关键问题。

## Corrections

记录更正、撤回、数字修订和受影响的 signal ID。

## Methodology notes

记录本期置信度、重要性、数据口径或分析方法方面的特殊说明。
