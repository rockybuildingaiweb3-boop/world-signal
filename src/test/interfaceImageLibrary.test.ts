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
} from '../lib/editorial/interfaceImageLibrary';
import { EDITORIAL_ASSET_REGISTRY } from '../lib/editorial/editorialAssetRegistry';
import { buildSignalNarrativeArc } from '../lib/editorial/narrativeArc';
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

describe('Local Interface Image Library (Phase 09 — 30-Asset Curated Collection)', () => {
  it('registers all 30 curated local WebP photographs across three domains with verified disk files and zero hotlinks', () => {
    assert.equal(INTERFACE_PHOTO_LIST.length, 30);
    assert.equal(getInterfacePhotosByDomain('world').length, 10);
    assert.equal(getInterfacePhotosByDomain('ai').length, 10);
    assert.equal(getInterfacePhotosByDomain('economy').length, 10);

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

      // Confirm actual primary 1600w WebP exists on disk and is valid RIFF/WEBP
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

      // Confirm responsive 800w WebP exists on disk and is valid RIFF/WEBP
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

    // Manifest file exists and matches registry count
    const manifestPath = path.join(
      process.cwd(),
      'public/assets/interface-library/manifest.json'
    );
    assert.equal(fs.existsSync(manifestPath), true);
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    assert.equal(manifest.assetCount, 30);
    assert.equal(manifest.isDocumentaryEvidence, false);
    assert.equal(manifest.hotlinkingAllowed, false);
  });

  it('remains strictly separated from EDITORIAL_ASSET_REGISTRY', () => {
    const editorialIds = new Set(Object.keys(EDITORIAL_ASSET_REGISTRY));
    for (const id of Object.keys(INTERFACE_IMAGE_LIBRARY)) {
      assert.equal(editorialIds.has(id), false);
    }
  });

  it('returns accurate orientations and direct lookups across domains', () => {
    assert.equal(getInterfacePhoto('ai-data-center').orientation, 'portrait');
    assert.equal(
      getInterfacePhoto('economy-stock-exchange').orientation,
      'portrait'
    );
    assert.equal(
      getInterfacePhoto('world-maritime-port').orientation,
      'landscape'
    );
    assert.equal(
      getInterfacePhoto('world-earth-observation').orientation,
      'landscape'
    );
    assert.equal(
      getInterfacePhoto('economy-central-bank').orientation,
      'portrait'
    );
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

  it('selectively matches major dossiers across the expanded 30-asset themes while preserving restraint', () => {
    const cases: Array<{
      signal: Partial<ParsedSignal>;
      expectedId: string | null;
    }> = [
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
          topic: 'infrastructure',
          headline: 'Hyperscaler expands regional AI data center compute cluster',
          importance: 5,
        },
        expectedId: 'ai-supercomputer-hall',
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
          domain: 'ai',
          topic: 'robotics',
          headline: 'Autonomous humanoid robotics deployment accelerates on factory floors',
          importance: 4,
        },
        expectedId: 'ai-robotics-automation',
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
          domain: 'economy',
          topic: 'markets',
          headline: '美股本周大涨，道指周涨 5.5%',
          importance: 4,
        },
        expectedId: 'economy-stock-exchange',
      },
      {
        signal: {
          domain: 'economy',
          topic: 'energy',
          headline: 'European renewable grid and LNG power storage investments surge',
          importance: 4,
        },
        expectedId: 'economy-energy-infrastructure',
      },
      {
        signal: {
          domain: 'world',
          topic: 'maritime-security',
          headline: 'Container shipping lanes face renewed Strait of Hormuz risk',
          importance: 5,
        },
        expectedId: 'world-maritime-port',
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

  it('allocates distinct, non-repeating photo sets across all three domain desks', () => {
    const used = new Set<string>(['world-earth-observation']);
    const worldSet = selectDeskPhotoSet(
      'world',
      [makeSignal({ domain: 'world', headline: 'UN diplomatic summit on maritime trade' })],
      used
    );
    const worldIds = [worldSet.primary.id, worldSet.secondary.id, worldSet.tertiary.id];
    assert.equal(new Set(worldIds).size, 3);
    worldIds.forEach((id) => {
      assert.equal(used.has(id), false);
      used.add(id);
    });

    const aiSet = selectDeskPhotoSet(
      'ai',
      [makeSignal({ domain: 'ai', headline: 'Supercomputer cluster and photonic interconnect breakthrough' })],
      used
    );
    const aiIds = [aiSet.primary.id, aiSet.secondary.id, aiSet.tertiary.id];
    assert.equal(new Set(aiIds).size, 3);
    aiIds.forEach((id) => {
      assert.equal(used.has(id), false);
      used.add(id);
    });

    const econSet = selectDeskPhotoSet(
      'economy',
      [makeSignal({ domain: 'economy', headline: 'Central bank rate path and renewable power investment' })],
      used
    );
    const econIds = [econSet.primary.id, econSet.secondary.id, econSet.tertiary.id];
    assert.equal(new Set(econIds).size, 3);
    econIds.forEach((id) => {
      assert.equal(used.has(id), false);
      used.add(id);
    });

    // 1 panoramic break + 9 desk photos = 10 unique photos on the Briefing front page
    assert.equal(used.size, 10);
  });
});

describe('Grounded Narrative Progression Arc (Phase 09 Addendum)', () => {
  it('builds only stages supported by actual signal sections and omits absent stages', () => {
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
    assert.deepEqual(
      fullArc.map((s) => s.stepNumber),
      ['01', '02', '03', '04', '05']
    );

    const minimalSignal = makeSignal({
      sections: {
        whatHappened: 'Short update.',
        verifiedFacts: '',
        timeline: '',
        timelineEntries: [],
        whyItMatters: 'Why it matters.',
        sourcePerspectives: '',
        analysis: '',
        uncertainties: '',
        scenarios: '',
        scenarioItems: [],
        personalRelevance: '',
        whatToWatch: '',
      },
    });
    const minimalArc = buildSignalNarrativeArc(minimalSignal);
    assert.equal(minimalArc.length, 2);
    assert.deepEqual(
      minimalArc.map((s) => s.id),
      ['event', 'consequence']
    );
  });
});
