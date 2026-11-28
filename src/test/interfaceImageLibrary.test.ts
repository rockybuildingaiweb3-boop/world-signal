import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {
  getInterfacePhoto,
  getInterfacePhotosByDomain,
  INTERFACE_IMAGE_LIBRARY,
  INTERFACE_PHOTO_LIST,
  isLocalInterfaceLibraryPath,
  selectDeskPhotoSet,
  selectEditorialPhotoForDossier,
  selectFolioPhotoSet,
} from '../lib/editorial/interfaceImageLibrary';
import { EDITORIAL_ASSET_REGISTRY } from '../lib/editorial/editorialAssetRegistry';
import { buildSignalNarrativeArc } from '../lib/editorial/narrativeArc';
import { extractLeadThesis } from '../lib/editorial/editorialPullQuote';
import type { ParsedSignal, SignalMediaAsset } from '../types/edition';

function makeSignal(overrides: Partial<ParsedSignal> = {}): ParsedSignal {
  return {
    signal_id: 'WORLD-20261127-test',
    headline: 'Test Signal Headline',
    domain: 'world',
    topic: 'geopolitics',
    importance: 5,
    status: 'developing',
    confidence: { overall: 'high', rationale: 'Multiple independent origins' },
    event: { start_date: '2026-11-25', geography: ['Global'] },
    published_at: '2026-11-27T00:00:00Z',
    first_verified_at: '2026-11-27T00:00:00Z',
    updated_at: '2026-11-27T00:00:00Z',
    tags: [],
    related_signal_ids: [],
    timelineEvents: [],
    relationships: [],
    mediaAssets: [],
    claims: [],
    sources: [],
    independentOriginCount: 2,
    independentOriginIds: ['o1', 'o2'],
    unassignedSourceIds: [],
    orderIndex: 0,
    rawNarrative: '',
    sections: {
      whatHappened: '',
      verifiedFacts: '',
      timeline: '',
      timelineEntries: [],
      whyItMatters: '',
      sourcePerspectives: '',
      analysis: '',
      uncertainties: '',
      scenarios: '',
      scenarioItems: [],
      personalRelevance: '',
      whatToWatch: '',
    },
    ...overrides,
  };
}

function makeApprovedMediaAsset(): SignalMediaAsset {
  return {
    media_id: 'M1',
    placement: 'hero',
    media_type: 'documentary_photograph',
    relationship_to_signal: 'direct_event_documentation',
    asset_url: 'https://upload.wikimedia.org/wikipedia/commons/example.jpg',
    source_page_url: 'https://commons.wikimedia.org/wiki/File:Example.jpg',
    caption: 'Verified documentary photo of the reported meeting.',
    alt_text: 'Official photograph from verified source',
    creator: 'Official Agency',
    credit_line: 'Official Agency / Public Domain',
    isApprovedForDisplay: true,
    rights: {
      basis: 'public_domain',
      license_name: 'Public Domain',
      license_url: 'https://creativecommons.org/publicdomain/mark/1.0/',
      rights_holder: 'Public Domain',
      public_web_display_allowed: true,
      crop_allowed: true,
      verified_at: '2026-11-27T12:00:00Z',
    },
    verification: {
      source_page_checked: true,
      direct_asset_checked: true,
      visual_content_checked: true,
      caption_context_checked: true,
    },
  };
}

describe('Local Interface Image Library (Phase 10 — 36-Asset Curated Collection)', () => {
  it('registers all 36 curated local WebP photographs across three domains with verified disk files and zero hotlinks', () => {
    assert.equal(INTERFACE_PHOTO_LIST.length, 36);
    assert.equal(getInterfacePhotosByDomain('world').length, 12);
    assert.equal(getInterfacePhotosByDomain('ai').length, 12);
    assert.equal(getInterfacePhotosByDomain('economy').length, 12);

    let totalLibraryBytes = 0;

    for (const photo of INTERFACE_PHOTO_LIST) {
      assert.equal(photo.classification, 'interface_editorial_photography');
      assert.equal(photo.isDocumentaryEvidence, false);
      assert.equal(
        isLocalInterfaceLibraryPath(photo.localPath),
        true,
        `${photo.id} must use a local /assets/interface-library/{domain}/*.webp path`
      );
      assert.equal(
        isLocalInterfaceLibraryPath(photo.webp800Path),
        true,
        `${photo.id} 800w derivative must use a local /assets/interface-library/{domain}/*-800.webp path`
      );
      assert.equal(
        /^https?:\/\//i.test(photo.localPath),
        false,
        `${photo.id} must never hotlink remote URLs`
      );
      assert.ok(photo.creator.trim().length > 0, `${photo.id} missing creator`);
      assert.ok(
        photo.sourcePageUrl.startsWith('https://'),
        `${photo.id} must have a verifiable https source page URL`
      );
      assert.ok(photo.licenseName.trim().length > 2, `${photo.id} missing licenseName`);
      assert.ok(
        photo.licenseUrl.startsWith('https://'),
        `${photo.id} missing https licenseUrl`
      );
      assert.ok(
        Math.max(photo.naturalWidth, photo.naturalHeight) >= 800,
        `${photo.id} resolution too small`
      );
      assert.ok(photo.altEn.trim().length > 15);
      assert.ok(photo.altZh.trim().length > 8);
      assert.ok(photo.captionEn.trim().length > 10);
      assert.ok(photo.captionZh.trim().length > 6);
      assert.ok(photo.editorialContextNoteEn.toLowerCase().includes('not'));
      assert.ok(
        /(非|不代表|不作为)/.test(photo.editorialContextNoteZh),
        `${photo.id} missing Chinese non-documentary disclosure`
      );
      assert.ok(photo.intendedRoles.length >= 1);

      const primaryDisk = path.join(process.cwd(), 'public', photo.localPath);
      assert.equal(
        fs.existsSync(primaryDisk),
        true,
        `Missing primary WebP on disk at ${primaryDisk}`
      );
      const primaryBuf = fs.readFileSync(primaryDisk);
      assert.equal(primaryBuf.length, photo.fileSizeBytes);
      assert.equal(primaryBuf.subarray(0, 4).toString('ascii'), 'RIFF');
      assert.equal(primaryBuf.subarray(8, 12).toString('ascii'), 'WEBP');
      assert.ok(primaryBuf.length > 5000);

      const smallDisk = path.join(process.cwd(), 'public', photo.webp800Path);
      assert.equal(
        fs.existsSync(smallDisk),
        true,
        `Missing 800w WebP on disk at ${smallDisk}`
      );
      const smallBuf = fs.readFileSync(smallDisk);
      assert.equal(smallBuf.length, photo.webp800Bytes);
      assert.equal(smallBuf.subarray(0, 4).toString('ascii'), 'RIFF');
      assert.equal(smallBuf.subarray(8, 12).toString('ascii'), 'WEBP');
      assert.ok(smallBuf.length > 3000);

      totalLibraryBytes += primaryBuf.length + smallBuf.length;
    }

    // Total optimized library stays well below the 25 MB repository size budget
    assert.ok(
      totalLibraryBytes < 25 * 1024 * 1024,
      `Expected total library size < 25 MB, got ${(totalLibraryBytes / (1024 * 1024)).toFixed(2)} MB`
    );

    const manifestPath = path.join(
      process.cwd(),
      'public/assets/interface-library/manifest.json'
    );
    assert.equal(fs.existsSync(manifestPath), true);
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    assert.equal(manifest.assetCount, 36);
    assert.equal(manifest.isDocumentaryEvidence, false);
    assert.equal(manifest.hotlinkingAllowed, false);
  });

  it('remains strictly separated from EDITORIAL_ASSET_REGISTRY', () => {
    const editorialIds = new Set(Object.keys(EDITORIAL_ASSET_REGISTRY));
    for (const id of Object.keys(INTERFACE_IMAGE_LIBRARY)) {
      assert.equal(editorialIds.has(id), false);
    }
  });

  it('returns accurate orientations and direct lookups across domains including Phase 10 assets', () => {
    assert.equal(getInterfacePhoto('ai-data-center').orientation, 'portrait');
    assert.equal(getInterfacePhoto('ai-quantum-computing').orientation, 'portrait');
    assert.equal(getInterfacePhoto('economy-stock-exchange').orientation, 'portrait');
    assert.equal(getInterfacePhoto('economy-central-bank').orientation, 'portrait');
    assert.equal(getInterfacePhoto('world-climate-environment').orientation, 'landscape');
    assert.equal(getInterfacePhoto('world-border-checkpoint').orientation, 'landscape');
    assert.equal(getInterfacePhoto('economy-housing-urban').orientation, 'landscape');
    assert.equal(getInterfacePhoto('economy-agriculture-food').orientation, 'landscape');
  });

  it('never overrides signals that carry approved verified media_assets', () => {
    const signalWithVerifiedMedia = makeSignal({
      domain: 'economy',
      topic: 'markets',
      headline: 'Global equity markets rally on central bank outlook',
      importance: 5,
      mediaAssets: [makeApprovedMediaAsset()],
    });

    assert.equal(selectEditorialPhotoForDossier(signalWithVerifiedMedia), null);
  });

  it('selectively matches major dossiers across the expanded 36-asset themes while preserving restraint', () => {
    const cases: Array<{
      signal: Partial<ParsedSignal>;
      expectedId: string | null;
    }> = [
      {
        signal: {
          domain: 'world',
          topic: 'climate',
          headline: 'COP31 在安塔利亚崩溃，未能达成最终协议',
          importance: 5,
        },
        expectedId: 'world-climate-environment',
      },
      {
        signal: {
          domain: 'world',
          topic: 'borders',
          headline: 'European Union revises Schengen cross-border customs protocols',
          importance: 4,
        },
        expectedId: 'world-border-checkpoint',
      },
      {
        signal: {
          domain: 'ai',
          topic: 'quantum',
          headline: 'Error-corrected superconducting qubit milestone advances quantum computing',
          importance: 5,
        },
        expectedId: 'ai-quantum-computing',
      },
      {
        signal: {
          domain: 'ai',
          topic: 'mobility',
          headline: 'Waymo expands autonomous vehicle robotaxi fleet to three new metros',
          importance: 4,
        },
        expectedId: 'ai-autonomous-mobility',
      },
      {
        signal: {
          domain: 'economy',
          topic: 'housing',
          headline: 'Elevated mortgage rates cool urban housing starts and home prices',
          importance: 4,
        },
        expectedId: 'economy-housing-urban',
      },
      {
        signal: {
          domain: 'economy',
          topic: 'commodities',
          headline: 'Black Sea grain export bottleneck pushes global wheat harvest prices higher',
          importance: 4,
        },
        expectedId: 'economy-agriculture-food',
      },
      {
        signal: {
          domain: 'ai',
          topic: 'semiconductors',
          headline: '受限 Blackwell 芯片现身数据中心，晶圆供应链受关注',
          importance: 4,
        },
        expectedId: 'ai-silicon-wafer',
      },
      {
        signal: {
          domain: 'ai',
          topic: 'cloud',
          headline: 'Cloud provider expands regional data center server capacity',
          importance: 5,
        },
        expectedId: 'ai-data-center',
      },
      {
        signal: {
          domain: 'economy',
          topic: 'monetary-policy',
          headline: 'Federal Reserve signals patience on interest rate cuts amid sticky CPI',
          importance: 5,
        },
        expectedId: 'economy-central-bank',
      },
      {
        signal: {
          domain: 'world',
          topic: 'diplomacy',
          headline: 'UN Security Council convenes emergency multilateral summit in Geneva',
          importance: 5,
        },
        expectedId: 'world-international-assembly',
      },
      {
        signal: {
          domain: 'world',
          topic: 'foreign-affairs',
          headline: 'Foreign ministers sign bilateral diplomatic embassy accord',
          importance: 5,
        },
        expectedId: 'world-diplomatic-institution',
      },
      {
        signal: {
          domain: 'economy',
          topic: 'markets',
          headline: 'Minor regional equity update',
          importance: 3,
        },
        expectedId: null,
      },
      {
        signal: {
          domain: 'ai',
          topic: 'policy',
          headline: 'OpenAI files legal countersuit over app distribution rules',
          importance: 4,
        },
        expectedId: null,
      },
    ];

    for (const tc of cases) {
      const result = selectEditorialPhotoForDossier(makeSignal(tc.signal));
      assert.equal(
        result?.id ?? null,
        tc.expectedId,
        `Unexpected photo match for "${tc.signal.headline}"`
      );
    }
  });

  it('allocates 13 distinct, zero-repetition photos across Documentary Break, three Domain Desks, and Edition Visual Folio', () => {
    const used = new Set<string>(['world-earth-observation']);
    const worldSet = selectDeskPhotoSet(
      'world',
      [makeSignal({ domain: 'world', headline: 'UN diplomatic summit on maritime trade' })],
      used
    );
    [worldSet.primary.id, worldSet.secondary.id, worldSet.tertiary.id].forEach((id) => {
      assert.equal(used.has(id), false);
      used.add(id);
    });

    const aiSet = selectDeskPhotoSet(
      'ai',
      [makeSignal({ domain: 'ai', headline: 'Supercomputer cluster and photonic interconnect breakthrough' })],
      used
    );
    [aiSet.primary.id, aiSet.secondary.id, aiSet.tertiary.id].forEach((id) => {
      assert.equal(used.has(id), false);
      used.add(id);
    });

    const econSet = selectDeskPhotoSet(
      'economy',
      [makeSignal({ domain: 'economy', headline: 'Central bank rate path and renewable power investment' })],
      used
    );
    [econSet.primary.id, econSet.secondary.id, econSet.tertiary.id].forEach((id) => {
      assert.equal(used.has(id), false);
      used.add(id);
    });

    const folioSet = selectFolioPhotoSet(used);
    [folioSet.world.id, folioSet.ai.id, folioSet.economy.id].forEach((id) => {
      assert.equal(used.has(id), false, `Folio photo ${id} duplicated a desk photo`);
      used.add(id);
    });

    // 1 panoramic break + 9 desk photos + 3 folio thumbs = 13 unique photos on Briefing
    assert.equal(used.size, 13);
  });
});

describe('Grounded Editorial Composition Helpers (Narrative Arc & PullQuoteBand)', () => {
  it('builds only narrative stages supported by actual signal sections', () => {
    const fullSignal = makeSignal({
      sections: {
        whatHappened: 'Verified event summary.',
        verifiedFacts: '- Fact 1',
        timeline: '- 2026-11-25: Event began',
        timelineEntries: [],
        whyItMatters: 'Structural significance.',
        sourcePerspectives: '',
        analysis: 'Deep analysis.',
        uncertainties: 'Key unknown.',
        scenarios: 'Scenario A and B.',
        scenarioItems: [],
        personalRelevance: 'Direct household impact.',
        whatToWatch: 'Next meeting date.',
      },
    });
    const fullArc = buildSignalNarrativeArc(fullSignal);
    assert.equal(fullArc.length, 5);
    assert.deepEqual(
      fullArc.map((s) => s.id),
      ['event', 'context', 'consequence', 'relevance', 'watch']
    );
  });

  it('extractLeadThesis cleanly isolates Chinese and English opening thesis sentences without losing citations', () => {
    const zhText =
      '这是多边气候进程自 2009 年以来最严重的制度性挫折，而且发生在联合国确认全球气温将超过 1.5°C 目标后的首次 COP 会议上。失败的核心不是技术细节，而是化石燃料生产国与最脆弱国家之间的根本分歧。';
    const zhRes = extractLeadThesis(zhText);
    assert.ok(zhRes);
    assert.equal(
      zhRes.thesis,
      '这是多边气候进程自 2009 年以来最严重的制度性挫折，而且发生在联合国确认全球气温将超过 1.5°C 目标后的首次 COP 会议上。'
    );
    assert.equal(zhRes.hadInlineCitations, false);
    assert.ok(zhRes.remainderMarkdown.startsWith('失败的核心不是技术细节'));

    const citedEnText =
      'Central bank divergence widens funding costs across emerging markets [S1]. Investors are repricing sovereign yields across Asia and Europe [S2].';
    const enRes = extractLeadThesis(citedEnText);
    assert.ok(enRes);
    assert.equal(
      enRes.thesis,
      'Central bank divergence widens funding costs across emerging markets.'
    );
    assert.equal(enRes.hadInlineCitations, true);
    // Preserves full markdown so interactive [S1] remains clickable
    assert.ok(enRes.remainderMarkdown.includes('[S1]'));
    assert.ok(enRes.remainderMarkdown.includes('[S2]'));

    // Rejects short fragments or bullet lists
    assert.equal(extractLeadThesis('- bullet one\n- bullet two'), null);
    assert.equal(extractLeadThesis('Too short.'), null);
  });
});
