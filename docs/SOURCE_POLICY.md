# Source Policy

## Curated whitelist

Core journalism must come from an approved newsroom in `config/source-registry.yml`. Tier 1 is an internal eligibility class, not a claim that an outlet is always correct, unbiased, or sufficient by itself. Every material claim still requires assessment and corroboration.

## Source classes

| Source class | Use | Independent newsroom count? |
|---|---|---|
| Tier 1 newsroom | Core journalism | Yes, when it is original reporting |
| Specialist publication | Technical/domain reporting | Only within approved beats |
| Primary source | Official data, filings, statements, court records, research documents | No |
| Research paper/artifact | Paper, benchmark, dataset, code, model card, technical report | No |
| Syndicated copy | Republished work from another newsroom | No additional count |
| Aggregator/anonymous source | Discovery lead only | No |

## Independence counting

Count reporting origins, not websites. Each source record needs an `independence_group`.

- A Reuters dispatch republished by several sites remains one Reuters origin.
- An AP story mirrored by another publisher remains one AP origin.
- Two newsrooms with genuinely separate reporting may count separately.
- An official statement and a newsroom report are different evidence classes; the statement is not a second newsroom.
- A press release republished by multiple outlets is not independent corroboration.

The frontend derives the independent-source count from unique groups where `count_as_independent: true`.

## Corroboration

For high-impact stories, seek at least two independent approved reporting origins where possible, alongside relevant primary records.

When only one suitable newsroom is available, say so, do not imply multi-source confirmation, lower confidence where appropriate, and identify what evidence would resolve the gap.

A high-quality newsroom can still make an error. Two outlets repeating the same original report are not two independent confirmations.

## Primary sources

Prefer original documents for economic releases, central-bank decisions, regulatory filings, court documents, research methods, datasets, model cards, release notes, official policy, treaties, and institutional statements.

A primary source establishes what an institution published or stated. It does not automatically verify allegations about other parties or prove the real-world effect of a policy or product.

## Access and citation

Capture publisher, exact title, canonical URL, publication date/time where available, access time, source class, registry ID, reporting relationship, independence group, and supported claims.

Never invent URLs, titles, publication dates, quotations, or access confirmations. Do not represent a search snippet as a fully accessed article. Disclose paywall and access limitations.

## Registry changes

Only the repository owner may approve changes to `config/source-registry.yml`. A research agent may flag a candidate in the edition's audit notes, but must not treat an unapproved outlet as Tier 1.

## News-reporting source approval vs. image reuse rights

Approval of a newsroom or institution in `config/source-registry.yml` applies strictly to **factual text reporting and citation**. It does **not** grant permission to copy, host, or display photographs, charts, videos, or graphics published by that outlet.

- A Reuters, Associated Press, Financial Times, or BBC article may qualify as an approved Tier 1 textual source while its accompanying photograph remains separately licensed and restricted from public web display.
- Official government or intergovernmental websites may host third-party or contractor photographs that are not in the public domain.
- Every visual asset requires independent item-level rights and provenance verification under `docs/MEDIA_ASSET_POLICY.md`.
- Visual media assets (`media_assets`) are tracked separately from `sources` and never contribute to `independentOriginCount`, corroboration counts, or confidence ratings.
