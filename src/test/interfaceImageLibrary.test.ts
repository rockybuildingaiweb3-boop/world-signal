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
  selectEditorialPhotoForDossier,
} from '../lib/editorial/interfaceImageLibrary';
import { EDITORIAL_ASSET_REGISTRY } from '../lib/editorial/editorialAssetRegistry';
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

describe('Local Interface Image Library (Phase 09)', () => {
  it('registers all five curated local photographs with verified metadata and zero hotlinks', () => {
    assert.equal(INTERFACE_PHOTO_LIST.length, 5);

    const seenObjectPositions = new Set<string>();
    for (const photo of INTERFACE_PHOTO_LIST) {
      assert.equal(photo.classification, 'interface_editorial_photography');
      assert.equal(photo.isDocumentaryEvidence, false);
      assert.equal(
        isLocalInterfaceLibraryPath(photo.localPath),
        true,
        `${photo.id} must use a local /assets/interface-library/*.jpg path`
      );
      assert.equal(
        photo.localPath.includes('unsplash.com'),
        false,
        `${photo.id} must never hotlink Unsplash in localPath`
      );
      assert.ok(photo.creator.trim().length > 0);
      assert.ok(photo.sourcePageUrl.startsWith('https://unsplash.com/photos/'));
      assert.equal(photo.licenseName, 'Unsplash License');
      assert.equal(photo.licenseUrl, 'https://unsplash.com/license');
      assert.ok(photo.naturalWidth >= 1000 && photo.naturalHeight >= 1000);
      assert.ok(photo.altEn.trim().length > 15);
      assert.ok(photo.altZh.trim().length > 8);
      assert.ok(photo.captionEn.trim().length > 10);
      assert.ok(photo.captionZh.trim().length > 6);
      assert.ok(photo.editorialContextNoteEn.toLowerCase().includes('not'));
      assert.ok(photo.editorialContextNoteZh.includes('非'));
      seenObjectPositions.add(photo.objectPosition);

      // Confirm actual verified JPEG master exists on disk under public/
      const diskPath = path.join(process.cwd(), 'public', photo.localPath);
      assert.equal(
        fs.existsSync(diskPath),
        true,
        `Expected verified JPEG on disk at ${diskPath}`
      );
      const buf = fs.readFileSync(diskPath);
      assert.equal(buf.length, photo.fileSizeBytes);
      assert.equal(buf[0], 0xff);
      assert.equal(buf[1], 0xd8);

      // Confirm responsive uncropped WebP derivatives exist and are valid RIFF/WEBP files
      for (const webpPath of [photo.webp800Path, photo.webp1600Path]) {
        assert.ok(webpPath.startsWith('/assets/interface-library/optimized/'));
        const webpDisk = path.join(process.cwd(), 'public', webpPath);
        assert.equal(fs.existsSync(webpDisk), true, `Missing WebP at ${webpDisk}`);
        const wbuf = fs.readFileSync(webpDisk);
        assert.equal(wbuf.subarray(0, 4).toString('ascii'), 'RIFF');
        assert.equal(wbuf.subarray(8, 12).toString('ascii'), 'WEBP');
        assert.ok(wbuf.length > 5000 && wbuf.length < buf.length);
      }
    }

    // Per-asset focal positioning (never one blind global crop)
    assert.equal(seenObjectPositions.size, 5);
  });

  it('remains strictly separated from EDITORIAL_ASSET_REGISTRY', () => {
    const editorialIds = new Set(Object.keys(EDITORIAL_ASSET_REGISTRY));
    for (const id of Object.keys(INTERFACE_IMAGE_LIBRARY)) {
      assert.equal(editorialIds.has(id), false);
    }
  });

  it('returns accurate domain groupings and direct lookup', () => {
    assert.equal(getInterfacePhotosByDomain('world').length, 2);
    assert.equal(getInterfacePhotosByDomain('ai').length, 2);
    assert.equal(getInterfacePhotosByDomain('economy').length, 1);
    assert.equal(
      getInterfacePhoto('ai-data-center').orientation,
      'portrait'
    );
    assert.equal(
      getInterfacePhoto('economy-stock-exchange').orientation,
      'portrait'
    );
    assert.equal(
      getInterfacePhoto('world-maritime-port').orientation,
      'landscape'
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

  it('selectively matches major dossiers by domain and subject while returning null for lower-priority or unmatched signals', () => {
    const waferSignal = makeSignal({
      domain: 'ai',
      topic: 'semiconductors',
      headline: '受限 Blackwell 芯片现身数据中心，晶圆供应链受关注',
      importance: 4,
    });
    assert.equal(
      selectEditorialPhotoForDossier(waferSignal)?.id,
      'ai-silicon-wafer'
    );

    const computeSignal = makeSignal({
      domain: 'ai',
      topic: 'infrastructure',
      headline: 'Hyperscaler expands regional AI data center compute cluster',
      importance: 5,
    });
    assert.equal(
      selectEditorialPhotoForDossier(computeSignal)?.id,
      'ai-data-center'
    );

    const marketsSignal = makeSignal({
      domain: 'economy',
      topic: 'markets',
      headline: '美股本周大涨，道指周涨 5.5%',
      importance: 4,
    });
    assert.equal(
      selectEditorialPhotoForDossier(marketsSignal)?.id,
      'economy-stock-exchange'
    );

    const maritimeSignal = makeSignal({
      domain: 'world',
      topic: 'maritime-security',
      headline: 'Container shipping lanes face renewed Strait of Hormuz risk',
      importance: 5,
    });
    assert.equal(
      selectEditorialPhotoForDossier(maritimeSignal)?.id,
      'world-maritime-port'
    );

    const minorSignal = makeSignal({
      domain: 'economy',
      topic: 'markets',
      headline: 'Minor regional equity update',
      importance: 3,
    });
    assert.equal(selectEditorialPhotoForDossier(minorSignal), null);

    const unmatchedAiSignal = makeSignal({
      domain: 'ai',
      topic: 'policy',
      headline: 'OpenAI files legal countersuit over app distribution rules',
      importance: 4,
    });
    assert.equal(selectEditorialPhotoForDossier(unmatchedAiSignal), null);
  });
});
