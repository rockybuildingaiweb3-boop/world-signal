import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { parseEditionMarkdown } from '../lib/markdown/parseEdition';
import { calculateSourceIndependence } from '../lib/source-independence/calculateIndependence';
import {
  isApprovedMediaAsset,
  resolveBrokenMediaFallback,
  selectApprovedSignalMedia,
  selectVisualStrategyForSignal,
} from '../lib/editorial/editorialAssetRegistry';
import {
  buildEditionSearchDocs,
  DEFAULT_GLOBAL_SEARCH_FILTERS,
  executeGlobalSearch,
} from '../lib/intelligence/search/searchIndex';
import { getUiStrings } from '../lib/i18n/uiStrings';
import type { SignalMediaAsset } from '../types/edition';
import {
  BILINGUAL_ZH_MEDIA_YAML,
  buildSyntheticMediaEdition,
  VALID_CONTEXTUAL_UNCROPPED_MEDIA_YAML,
  VALID_HERO_AND_SUPPORTING_MEDIA_YAML,
  VALID_ILLUSTRATION_MEDIA_YAML,
  VALID_PHOTO_MEDIA_YAML,
} from './fixtures/mediaEditionFixtures';

interface PublisherValidatorModule {
  validateEdition: (
    filePath: string,
    relativePath: string,
    markdown: string
  ) => {
    date: string;
    title: string;
    path: string;
    updated_at: string;
    status: string;
    language: string;
    summary: string;
  };
  validateMediaAssets: (mediaAssets: unknown, signalId: string) => void;
}

async function loadPublisherValidator(): Promise<PublisherValidatorModule> {
  const scriptUrl = pathToFileURL(
    path.resolve(process.cwd(), 'scripts/build-public-content.mjs')
  ).href;
  const mod = (await import(scriptUrl)) as PublisherValidatorModule;
  return mod;
}

describe('Phase 07 — Editorial Media Parsing, Rights Governance & Schema Compatibility', () => {
  it('1. parses schema v1 editions without media_assets cleanly with empty mediaAssets array', () => {
    const md = buildSyntheticMediaEdition({ schemaVersion: 1 });
    const parsed = parseEditionMarkdown(md, '/editions/2026/10/2026-10-15.md', {
      expectedDate: '2026-10-15',
    });

    assert.equal(parsed.validation.isValid, true);
    assert.equal(parsed.validation.errors.length, 0);
    assert.equal(parsed.frontmatter.schema_version, 1);
    assert.deepEqual(parsed.signals[0].mediaAssets, []);
  });

  it('2. parses schema v2 editions without media_assets cleanly with empty mediaAssets array', () => {
    const md = buildSyntheticMediaEdition({ schemaVersion: 2 });
    const parsed = parseEditionMarkdown(md, '/editions/2026/10/2026-10-15.md', {
      expectedDate: '2026-10-15',
    });

    assert.equal(parsed.validation.isValid, true);
    assert.equal(parsed.validation.errors.length, 0);
    assert.equal(parsed.frontmatter.schema_version, 2);
    assert.deepEqual(parsed.signals[0].mediaAssets, []);
  });

  it('3. parses schema v2 editions with empty media_assets: [] cleanly', () => {
    const md = buildSyntheticMediaEdition({
      schemaVersion: 2,
      mediaAssetsYaml: 'media_assets: []',
    });
    const parsed = parseEditionMarkdown(md, '/editions/2026/10/2026-10-15.md', {
      expectedDate: '2026-10-15',
    });

    assert.equal(parsed.validation.isValid, true);
    assert.equal(parsed.validation.errors.length, 0);
    assert.deepEqual(parsed.signals[0].mediaAssets, []);
  });

  it('4. parses a valid direct_event_documentation photograph asset with full rights & verification', () => {
    const md = buildSyntheticMediaEdition({
      mediaAssetsYaml: VALID_PHOTO_MEDIA_YAML,
    });
    const parsed = parseEditionMarkdown(md, '/editions/2026/10/2026-10-15.md', {
      expectedDate: '2026-10-15',
    });

    assert.equal(parsed.validation.isValid, true);
    assert.equal(parsed.validation.errors.length, 0);
    assert.equal(parsed.signals[0].mediaAssets.length, 1);

    const media = parsed.signals[0].mediaAssets[0];
    assert.equal(media.media_id, 'M1');
    assert.equal(media.media_type, 'photograph');
    assert.equal(media.placement, 'hero');
    assert.equal(media.relationship_to_signal, 'direct_event_documentation');
    assert.equal(media.rights.basis, 'cc_by');
    assert.equal(media.rights.public_web_display_allowed, true);
    assert.equal(media.rights.crop_allowed, true);
    assert.equal(media.isApprovedForDisplay, true);
    assert.equal(isApprovedMediaAsset(media), true);
  });

  it('5. parses a valid illustrative editorial asset without misclassifying it as documentary photography', () => {
    const md = buildSyntheticMediaEdition({
      mediaAssetsYaml: VALID_ILLUSTRATION_MEDIA_YAML,
    });
    const parsed = parseEditionMarkdown(md, '/editions/2026/10/2026-10-15.md', {
      expectedDate: '2026-10-15',
    });

    assert.equal(parsed.validation.isValid, true);
    assert.equal(parsed.signals[0].mediaAssets.length, 1);
    const media = parsed.signals[0].mediaAssets[0];
    assert.equal(media.media_type, 'illustration');
    assert.equal(media.placement, 'supporting');
    assert.equal(media.relationship_to_signal, 'illustrative');
    assert.equal(media.rights.basis, 'public_domain');
    assert.equal(media.isApprovedForDisplay, true);
  });

  it('6. parses a valid contextual photograph and preserves its contextual distinction', () => {
    const md = buildSyntheticMediaEdition({
      mediaAssetsYaml: VALID_CONTEXTUAL_UNCROPPED_MEDIA_YAML,
    });
    const parsed = parseEditionMarkdown(md, '/editions/2026/10/2026-10-15.md', {
      expectedDate: '2026-10-15',
    });

    assert.equal(parsed.validation.isValid, true);
    assert.equal(parsed.signals[0].mediaAssets.length, 1);
    const media = parsed.signals[0].mediaAssets[0];
    assert.equal(media.media_type, 'photograph');
    assert.equal(media.relationship_to_signal, 'contextual');
    assert.equal(media.depicted_location, 'Rotterdam, Netherlands');
    assert.equal(media.depicted_at, '2025-06-12');
    assert.equal(media.isApprovedForDisplay, true);
  });

  it('7. rejects invalid or non-HTTPS asset_url and excludes it from approved mediaAssets', () => {
    const httpAsset = VALID_PHOTO_MEDIA_YAML.replace(
      'https://upload.wikimedia.org/wikipedia/commons/example-summit-hall.jpg',
      'http://upload.wikimedia.org/wikipedia/commons/example-summit-hall.jpg'
    );
    const parsedHttp = parseEditionMarkdown(
      buildSyntheticMediaEdition({ mediaAssetsYaml: httpAsset }),
      '/editions/2026/10/2026-10-15.md'
    );
    assert.equal(parsedHttp.signals[0].mediaAssets.length, 0);
    assert.ok(
      parsedHttp.validation.errors.some((e) => e.code === 'INVALID_MEDIA_ASSET_URL')
    );

    const jsAsset = VALID_PHOTO_MEDIA_YAML.replace(
      'https://upload.wikimedia.org/wikipedia/commons/example-summit-hall.jpg',
      'javascript:alert(1)'
    );
    const parsedJs = parseEditionMarkdown(
      buildSyntheticMediaEdition({ mediaAssetsYaml: jsAsset }),
      '/editions/2026/10/2026-10-15.md'
    );
    assert.equal(parsedJs.signals[0].mediaAssets.length, 0);
    assert.ok(
      parsedJs.validation.errors.some((e) => e.code === 'INVALID_MEDIA_ASSET_URL')
    );
  });

  it('8. rejects invalid or non-HTTPS source_page_url and excludes the asset', () => {
    const badSourcePage = VALID_PHOTO_MEDIA_YAML.replace(
      'https://commons.wikimedia.org/wiki/File:Example_Summit_Hall.jpg',
      'http://commons.wikimedia.org/wiki/File:Example_Summit_Hall.jpg'
    );
    const parsed = parseEditionMarkdown(
      buildSyntheticMediaEdition({ mediaAssetsYaml: badSourcePage }),
      '/editions/2026/10/2026-10-15.md'
    );
    assert.equal(parsed.signals[0].mediaAssets.length, 0);
    assert.ok(
      parsed.validation.errors.some(
        (e) => e.code === 'INVALID_MEDIA_SOURCE_PAGE_URL'
      )
    );
  });

  it('9. rejects media assets with missing creator or credit_line attribution', () => {
    const missingCreator = VALID_PHOTO_MEDIA_YAML.replace(
      'creator: "Jane Doe / Diplomatic Press Office"',
      'creator: ""'
    );
    const parsedCreator = parseEditionMarkdown(
      buildSyntheticMediaEdition({ mediaAssetsYaml: missingCreator }),
      '/editions/2026/10/2026-10-15.md'
    );
    assert.equal(parsedCreator.signals[0].mediaAssets.length, 0);
    assert.ok(
      parsedCreator.validation.errors.some(
        (e) => e.code === 'MISSING_MEDIA_ATTRIBUTION'
      )
    );

    const missingCredit = VALID_PHOTO_MEDIA_YAML.replace(
      'credit_line: "Jane Doe / Wikimedia Commons (CC BY 4.0)"',
      'credit_line: "   "'
    );
    const parsedCredit = parseEditionMarkdown(
      buildSyntheticMediaEdition({ mediaAssetsYaml: missingCredit }),
      '/editions/2026/10/2026-10-15.md'
    );
    assert.equal(parsedCredit.signals[0].mediaAssets.length, 0);
    assert.ok(
      parsedCredit.validation.errors.some(
        (e) => e.code === 'MISSING_MEDIA_ATTRIBUTION'
      )
    );
  });

  it('10. rejects missing license_url where required (CC BY) and warns only for public_domain without license_url', () => {
    const missingCcUrl = VALID_PHOTO_MEDIA_YAML.replace(
      'license_url: "https://creativecommons.org/licenses/by/4.0/"',
      'license_url: ""'
    );
    const parsedCc = parseEditionMarkdown(
      buildSyntheticMediaEdition({ mediaAssetsYaml: missingCcUrl }),
      '/editions/2026/10/2026-10-15.md'
    );
    assert.equal(parsedCc.signals[0].mediaAssets.length, 0);
    assert.ok(
      parsedCc.validation.errors.some((e) => e.code === 'MISSING_MEDIA_LICENSE_URL')
    );

    const pdWithoutUrl = VALID_ILLUSTRATION_MEDIA_YAML.replace(
      'license_url: "https://www.nasa.gov/nasa-brand-center/images-and-media/"',
      'license_url: ""'
    );
    const parsedPd = parseEditionMarkdown(
      buildSyntheticMediaEdition({ mediaAssetsYaml: pdWithoutUrl }),
      '/editions/2026/10/2026-10-15.md'
    );
    assert.equal(parsedPd.signals[0].mediaAssets.length, 1);
    assert.ok(
      parsedPd.validation.warnings.some(
        (w) => w.code === 'MISSING_PUBLIC_DOMAIN_POLICY_URL'
      )
    );
  });

  it('11. rejects unknown or unapproved rights basis', () => {
    const unknownRights = VALID_PHOTO_MEDIA_YAML.replace(
      'basis: "cc_by"',
      'basis: "fair_use_assumed"'
    );
    const parsed = parseEditionMarkdown(
      buildSyntheticMediaEdition({ mediaAssetsYaml: unknownRights }),
      '/editions/2026/10/2026-10-15.md'
    );
    assert.equal(parsed.signals[0].mediaAssets.length, 0);
    assert.ok(
      parsed.validation.errors.some((e) => e.code === 'INVALID_MEDIA_RIGHTS_BASIS')
    );
  });

  it('12. rejects media with public_web_display_allowed: false and never exposes it for display', () => {
    const disallowed = VALID_PHOTO_MEDIA_YAML.replace(
      'public_web_display_allowed: true',
      'public_web_display_allowed: false'
    );
    const parsed = parseEditionMarkdown(
      buildSyntheticMediaEdition({ mediaAssetsYaml: disallowed }),
      '/editions/2026/10/2026-10-15.md'
    );
    assert.equal(parsed.signals[0].mediaAssets.length, 0);
    assert.ok(
      parsed.validation.errors.some(
        (e) => e.code === 'MEDIA_DISPLAY_NOT_ALLOWED'
      )
    );
  });

  it('13. rejects unverified image content when any of the 4 verification checks is false', () => {
    const flags = [
      'source_page_checked',
      'direct_asset_checked',
      'visual_content_checked',
      'caption_context_checked',
    ] as const;

    for (const flag of flags) {
      const unverified = VALID_PHOTO_MEDIA_YAML.replace(
        `${flag}: true`,
        `${flag}: false`
      );
      const parsed = parseEditionMarkdown(
        buildSyntheticMediaEdition({ mediaAssetsYaml: unverified }),
        '/editions/2026/10/2026-10-15.md'
      );
      assert.equal(
        parsed.signals[0].mediaAssets.length,
        0,
        `expected rejection when ${flag} is false`
      );
      assert.ok(
        parsed.validation.errors.some(
          (e) => e.code === 'UNVERIFIED_MEDIA_ASSET'
        ),
        `expected UNVERIFIED_MEDIA_ASSET error when ${flag} is false`
      );
    }
  });

  it('14. rejects duplicate media_id within the same signal', () => {
    const duplicateIds = VALID_HERO_AND_SUPPORTING_MEDIA_YAML.replace(
      'media_id: "M2"',
      'media_id: "M1"'
    );
    const parsed = parseEditionMarkdown(
      buildSyntheticMediaEdition({ mediaAssetsYaml: duplicateIds }),
      '/editions/2026/10/2026-10-15.md'
    );
    assert.equal(parsed.signals[0].mediaAssets.length, 1);
    assert.ok(
      parsed.validation.errors.some((e) => e.code === 'DUPLICATE_MEDIA_ID')
    );
  });

  it('15. rejects invalid ISO 8601 timestamp in rights.verified_at', () => {
    const badTimestamp = VALID_PHOTO_MEDIA_YAML.replace(
      'verified_at: "2026-10-15T07:45:00-07:00"',
      'verified_at: "October 15, 2026"'
    );
    const parsed = parseEditionMarkdown(
      buildSyntheticMediaEdition({ mediaAssetsYaml: badTimestamp }),
      '/editions/2026/10/2026-10-15.md'
    );
    assert.equal(parsed.signals[0].mediaAssets.length, 0);
    assert.ok(
      parsed.validation.errors.some(
        (e) => e.code === 'INVALID_MEDIA_VERIFIED_AT'
      )
    );
  });

  it('16. preserves crop_allowed: false cleanly across parser, media selection, and search heroMedia metadata', () => {
    const md = buildSyntheticMediaEdition({
      mediaAssetsYaml: VALID_CONTEXTUAL_UNCROPPED_MEDIA_YAML,
    });
    const parsed = parseEditionMarkdown(md, '/editions/2026/10/2026-10-15.md', {
      expectedDate: '2026-10-15',
    });
    const signal = parsed.signals[0];
    assert.equal(signal.mediaAssets.length, 1);
    assert.equal(signal.mediaAssets[0].rights.crop_allowed, false);

    const strategy = selectVisualStrategyForSignal(signal, { context: 'hero' });
    assert.equal(strategy.mode, 'verified_media');
    assert.equal(strategy.selectedMedia?.rights.crop_allowed, false);

    const docs = buildEditionSearchDocs(
      parsed,
      '/editions/2026/10/2026-10-15.md',
      parsed.frontmatter.updated_at
    );
    const searchResults = executeGlobalSearch({
      documents: docs,
      query: 'Maritime Accord',
      filters: DEFAULT_GLOBAL_SEARCH_FILTERS,
      sortBy: 'relevance',
    });
    assert.equal(searchResults.length, 1);
    assert.equal(searchResults[0].heroMedia?.cropAllowed, false);
    assert.equal(
      searchResults[0].heroMedia?.assetUrl,
      signal.mediaAssets[0].asset_url
    );
  });

  it('17. resolves graceful fallback when a verified remote media image fails to load', () => {
    const parsed = parseEditionMarkdown(
      buildSyntheticMediaEdition({ mediaAssetsYaml: VALID_PHOTO_MEDIA_YAML }),
      '/editions/2026/10/2026-10-15.md'
    );
    const signal = parsed.signals[0];

    const heroSelection = selectVisualStrategyForSignal(signal, {
      context: 'hero',
    });
    assert.equal(heroSelection.mode, 'verified_media');
    assert.ok(heroSelection.fallbackAsset);

    const fallbackWithLocal = resolveBrokenMediaFallback(heroSelection);
    assert.equal(fallbackWithLocal.mode, 'editorial_illustration');
    assert.equal(fallbackWithLocal.asset?.id, 'diplomacy_summit_plate');

    const fallbackWithoutLocal = resolveBrokenMediaFallback({
      fallbackAsset: null,
    });
    assert.equal(fallbackWithoutLocal.mode, 'typographic_cover');
    assert.equal(fallbackWithoutLocal.asset, null);
  });

  it('18. enforces selection precedence (approved hero > approved supporting > local illustration > grounded/typographic) and prevents URL repetition', () => {
    const bothParsed = parseEditionMarkdown(
      buildSyntheticMediaEdition({
        mediaAssetsYaml: VALID_HERO_AND_SUPPORTING_MEDIA_YAML,
      }),
      '/editions/2026/10/2026-10-15.md'
    );
    const sigBoth = bothParsed.signals[0];

    // Precedence 1: Hero placement selected over supporting; remaining goes to supporting gallery
    const split = selectApprovedSignalMedia(sigBoth);
    assert.equal(split.primary?.media_id, 'M1');
    assert.equal(split.supporting.length, 1);
    assert.equal(split.supporting[0].media_id, 'M2');

    const heroPick = selectVisualStrategyForSignal(sigBoth, { context: 'hero' });
    assert.equal(heroPick.mode, 'verified_media');
    assert.equal(heroPick.selectedMedia?.media_id, 'M1');

    // Anti-repetition: excluding M1's URL promotes M2 instead of repeating M1
    const secondPick = selectVisualStrategyForSignal(sigBoth, {
      context: 'secondary',
      excludeMediaUrls: [split.primary!.asset_url],
    });
    assert.equal(secondPick.mode, 'verified_media');
    assert.equal(secondPick.selectedMedia?.media_id, 'M2');

    // Precedence 2: Signal with only supporting media uses supporting media before local illustration
    const supportingOnly = parseEditionMarkdown(
      buildSyntheticMediaEdition({
        mediaAssetsYaml: VALID_ILLUSTRATION_MEDIA_YAML,
      }),
      '/editions/2026/10/2026-10-15.md'
    ).signals[0];
    const supportingPick = selectVisualStrategyForSignal(supportingOnly, {
      context: 'hero',
    });
    assert.equal(supportingPick.mode, 'verified_media');
    assert.equal(supportingPick.selectedMedia?.media_id, 'M2');

    // Precedence 3: Signal without approved media falls back to local original editorial illustration
    const noMediaSignal = parseEditionMarkdown(
      buildSyntheticMediaEdition({ mediaAssetsYaml: 'media_assets: []' }),
      '/editions/2026/10/2026-10-15.md'
    ).signals[0];
    const localPick = selectVisualStrategyForSignal(noMediaSignal, {
      context: 'hero',
    });
    assert.equal(localPick.mode, 'editorial_illustration');
    assert.equal(localPick.asset?.id, 'diplomacy_summit_plate');
    assert.equal(localPick.selectedMedia, null);

    // Precedence 4: When local asset is excluded in secondary context, falls back to grounded visual
    const groundedPick = selectVisualStrategyForSignal(noMediaSignal, {
      context: 'secondary',
      excludeAssetIds: ['diplomacy_summit_plate'],
    });
    assert.equal(groundedPick.mode, 'grounded_visual');
    assert.equal(groundedPick.asset, null);

    // Defensive runtime gate: tampered unapproved SignalMediaAsset is ignored even if injected directly
    const tampered: SignalMediaAsset = {
      ...sigBoth.mediaAssets[0],
      rights: {
        ...sigBoth.mediaAssets[0].rights,
        public_web_display_allowed: false,
      },
    };
    const tamperedSignal = { ...noMediaSignal, mediaAssets: [tampered] };
    assert.equal(isApprovedMediaAsset(tampered), false);
    const tamperedPick = selectVisualStrategyForSignal(tamperedSignal, {
      context: 'hero',
    });
    assert.equal(tamperedPick.mode, 'editorial_illustration');
  });

  it('19. strictly isolates media_assets from sources, claims, and independent reporting-origin counts', () => {
    const withoutMedia = parseEditionMarkdown(
      buildSyntheticMediaEdition({ mediaAssetsYaml: 'media_assets: []' }),
      '/editions/2026/10/2026-10-15.md'
    );
    const withMedia = parseEditionMarkdown(
      buildSyntheticMediaEdition({
        mediaAssetsYaml: VALID_HERO_AND_SUPPORTING_MEDIA_YAML,
      }),
      '/editions/2026/10/2026-10-15.md'
    );

    const sigWithout = withoutMedia.signals[0];
    const sigWith = withMedia.signals[0];

    assert.equal(sigWith.mediaAssets.length, 2);
    assert.equal(sigWith.sources.length, sigWithout.sources.length);
    assert.equal(sigWith.claims.length, sigWithout.claims.length);
    assert.equal(
      sigWith.independentOriginCount,
      sigWithout.independentOriginCount
    );
    assert.deepEqual(sigWith.independentGroups, sigWithout.independentGroups);
    assert.deepEqual(
      calculateSourceIndependence(sigWith.sources),
      calculateSourceIndependence(sigWithout.sources)
    );
    assert.equal(
      withMedia.independenceSummary.independentOriginCount,
      withoutMedia.independenceSummary.independentOriginCount
    );
    assert.equal(
      withMedia.independenceSummary.totalRecords,
      withoutMedia.independenceSummary.totalRecords
    );
    assert.equal(
      withMedia.independenceSummary.qualifyingRecords,
      withoutMedia.independenceSummary.qualifyingRecords
    );
  });

  it('20. preserves bilingual Chinese & English alt text, captions, and localized media UI labels', () => {
    const parsedZh = parseEditionMarkdown(
      buildSyntheticMediaEdition({
        contentLanguage: 'zh-CN',
        headline: '区域海运通行协议在日内瓦正式签署',
        mediaAssetsYaml: BILINGUAL_ZH_MEDIA_YAML,
      }),
      '/editions/2026/10/2026-10-15.md',
      { expectedDate: '2026-10-15' }
    );

    assert.equal(parsedZh.validation.isValid, true);
    assert.equal(parsedZh.signals[0].mediaAssets.length, 1);
    const zhMedia = parsedZh.signals[0].mediaAssets[0];
    assert.ok(zhMedia.caption.includes('背景参考照片'));
    assert.ok(zhMedia.alt_text.includes('地中海集装箱码头'));
    assert.equal(zhMedia.depicted_location, '鹿特丹港');

    const enUi = getUiStrings('en').media;
    const zhUi = getUiStrings('zh-CN').media;
    assert.notEqual(
      enUi.relationships.direct_event_documentation,
      enUi.relationships.contextual
    );
    assert.notEqual(
      enUi.relationships.direct_event_documentation,
      enUi.relationships.illustrative
    );
    assert.notEqual(
      zhUi.relationships.direct_event_documentation,
      zhUi.relationships.contextual
    );
    assert.notEqual(
      zhUi.relationships.direct_event_documentation,
      zhUi.relationships.illustrative
    );
    assert.ok(zhUi.relationshipDisclosures.illustrative.includes('非现场纪实'));
    assert.ok(
      enUi.relationshipDisclosures.illustrative
        .toLowerCase()
        .includes('not documentary photography')
    );
  });
});

describe('Phase 07 — Publishing Validator (scripts/build-public-content.mjs)', () => {
  it('accepts schema v1/v2 without media, canonical archive editions without media, and valid schema v2 with media_assets', async () => {
    const { validateEdition, validateMediaAssets } = await loadPublisherValidator();

    // Schema v1 without media_assets
    const v1Md = buildSyntheticMediaEdition({ schemaVersion: 1 });
    const v1Entry = validateEdition(
      'content/editions/2026/10/2026-10-15.md',
      '2026/10/2026-10-15.md',
      v1Md
    );
    assert.equal(v1Entry.date, '2026-10-15');

    // Schema v2 without media_assets
    const v2NoMediaMd = buildSyntheticMediaEdition({ schemaVersion: 2 });
    const v2NoMediaEntry = validateEdition(
      'content/editions/2026/10/2026-10-15.md',
      '2026/10/2026-10-15.md',
      v2NoMediaMd
    );
    assert.equal(v2NoMediaEntry.date, '2026-10-15');

    // Valid schema v2 with multiple approved media_assets
    const v2MediaMd = buildSyntheticMediaEdition({
      schemaVersion: 2,
      mediaAssetsYaml: VALID_HERO_AND_SUPPORTING_MEDIA_YAML,
    });
    const v2Entry = validateEdition(
      'content/editions/2026/10/2026-10-15.md',
      '2026/10/2026-10-15.md',
      v2MediaMd
    );
    assert.equal(v2Entry.date, '2026-10-15');

    // Real canonical published editions without media_assets (2026-11-23..25)
    // Note: 2026-11-26.md has a pre-existing non-media YAML typo (added_source_urls: null)
    // in WORLD-20261126-iran-kuwait-drone-strike, so we verify its media-free compatibility
    // via parseEditionMarkdown + validateMediaAssets without modifying canonical editions.
    const editionsDir = path.resolve(process.cwd(), 'content/editions/2026/11');
    for (const file of ['2026-11-23.md', '2026-11-24.md', '2026-11-25.md']) {
      const fullPath = path.join(editionsDir, file);
      const raw = fs.readFileSync(fullPath, 'utf8');
      const entry = validateEdition(fullPath, `2026/11/${file}`, raw);
      assert.equal(entry.date, file.replace(/\.md$/, ''));
    }

    const latestRaw = fs.readFileSync(
      path.join(editionsDir, '2026-11-26.md'),
      'utf8'
    );
    const parsedLatest = parseEditionMarkdown(
      latestRaw,
      '/editions/2026/11/2026-11-26.md',
      { expectedDate: '2026-11-26' }
    );
    assert.ok(parsedLatest.signals.length > 0);
    for (const sig of parsedLatest.signals) {
      assert.deepEqual(sig.mediaAssets, []);
      assert.doesNotThrow(() => validateMediaAssets(undefined, sig.signalId));
    }
    assert.equal(
      parsedLatest.validation.errors.filter((e) => e.code.includes('MEDIA'))
        .length,
      0
    );
  });

  it('rejects invalid media_assets payloads in the publisher validator with clear signal & media ID errors', async () => {
    const { validateEdition } = await loadPublisherValidator();

    const invalidCases: Array<{ label: string; yaml: string; pattern: RegExp }> = [
      {
        label: 'non-HTTPS asset_url',
        yaml: VALID_PHOTO_MEDIA_YAML.replace(
          'https://upload.wikimedia.org/wikipedia/commons/example-summit-hall.jpg',
          'http://upload.wikimedia.org/wikipedia/commons/example-summit-hall.jpg'
        ),
        pattern: /asset_url must be a valid HTTPS URL/,
      },
      {
        label: 'non-HTTPS source_page_url',
        yaml: VALID_PHOTO_MEDIA_YAML.replace(
          'https://commons.wikimedia.org/wiki/File:Example_Summit_Hall.jpg',
          'http://commons.wikimedia.org/wiki/File:Example_Summit_Hall.jpg'
        ),
        pattern: /source_page_url must be a valid HTTPS URL/,
      },
      {
        label: 'missing attribution credit_line',
        yaml: VALID_PHOTO_MEDIA_YAML.replace(
          'credit_line: "Jane Doe / Wikimedia Commons (CC BY 4.0)"',
          'credit_line: ""'
        ),
        pattern: /credit_line must be a non-empty string/,
      },
      {
        label: 'missing license_url on CC BY',
        yaml: VALID_PHOTO_MEDIA_YAML.replace(
          'license_url: "https://creativecommons.org/licenses/by/4.0/"',
          'license_url: ""'
        ),
        pattern: /rights\.license_url must be a valid HTTPS URL/,
      },
      {
        label: 'unknown rights basis',
        yaml: VALID_PHOTO_MEDIA_YAML.replace('basis: "cc_by"', 'basis: "unknown"'),
        pattern: /unsupported rights\.basis/,
      },
      {
        label: 'public_web_display_allowed: false',
        yaml: VALID_PHOTO_MEDIA_YAML.replace(
          'public_web_display_allowed: true',
          'public_web_display_allowed: false'
        ),
        pattern: /public_web_display_allowed must be true/,
      },
      {
        label: 'unverified visual_content_checked: false',
        yaml: VALID_PHOTO_MEDIA_YAML.replace(
          'visual_content_checked: true',
          'visual_content_checked: false'
        ),
        pattern: /verification\.visual_content_checked must be true/,
      },
      {
        label: 'duplicate media_id',
        yaml: VALID_HERO_AND_SUPPORTING_MEDIA_YAML.replace(
          'media_id: "M2"',
          'media_id: "M1"'
        ),
        pattern: /duplicate media_id "M1"/,
      },
      {
        label: 'invalid rights.verified_at timestamp',
        yaml: VALID_PHOTO_MEDIA_YAML.replace(
          'verified_at: "2026-10-15T07:45:00-07:00"',
          'verified_at: "not-a-timestamp"'
        ),
        pattern: /rights\.verified_at must be a valid ISO 8601 timestamp/,
      },
      {
        label: 'non-boolean crop_allowed',
        yaml: VALID_PHOTO_MEDIA_YAML.replace(
          'crop_allowed: true',
          'crop_allowed: "yes"'
        ),
        pattern: /rights\.crop_allowed must be a boolean/,
      },
    ];

    for (const tc of invalidCases) {
      const md = buildSyntheticMediaEdition({ mediaAssetsYaml: tc.yaml });
      assert.throws(
        () =>
          validateEdition(
            'content/editions/2026/10/2026-10-15.md',
            '2026/10/2026-10-15.md',
            md
          ),
        tc.pattern,
        `expected publisher validator to reject: ${tc.label}`
      );
    }
  });
});
