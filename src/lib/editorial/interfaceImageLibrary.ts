import type { ParsedSignal, SignalDomain } from '../../types/edition';
import { selectApprovedSignalMedia } from './editorialAssetRegistry';

/**
 * Local Interface Image Library Registry (Phase 09)
 *
 * STRICT SEPARATION POLICY:
 * - This module registers ONLY curated local interface photographs stored under
 *   `/assets/interface-library/*` (`public/assets/interface-library/*`).
 * - It is completely separate from `editorialAssetRegistry.ts` and canonical
 *   signal `media_assets`.
 * - Every entry is generic, non-documentary visual context (`isDocumentaryEvidence: false`).
 *   It must NEVER be presented as proof of a current event, facility, or claim.
 * - Remote Unsplash hotlinking is strictly prohibited in production code.
 */

export type InterfacePhotoId =
  | 'world-city-aerial'
  | 'world-maritime-port'
  | 'ai-data-center'
  | 'ai-silicon-wafer'
  | 'economy-stock-exchange';

export type InterfacePhotoCategory =
  | 'urban_geopolitics'
  | 'maritime_logistics'
  | 'compute_infrastructure'
  | 'semiconductor_macro'
  | 'financial_institutions';

export type InterfacePhotoOrientation = 'landscape' | 'portrait';

export interface InterfacePhotoAsset {
  readonly id: InterfacePhotoId;
  /** Original uncropped master JPEG served from `public/assets/interface-library/`. Never a remote URL. */
  readonly localPath: `/assets/interface-library/${string}.jpg`;
  /** Responsive uncropped WebP derivative (800px long edge) for mobile & compact plates. */
  readonly webp800Path: `/assets/interface-library/optimized/${string}-800.webp`;
  /** Responsive uncropped WebP derivative (1600px long edge) for desktop plates. */
  readonly webp1600Path: `/assets/interface-library/optimized/${string}-1600.webp`;
  readonly classification: 'interface_editorial_photography';
  /** Hard invariant: interface library assets are never documentary news evidence. */
  readonly isDocumentaryEvidence: false;
  readonly domain: SignalDomain;
  readonly subjectCategory: InterfacePhotoCategory;
  readonly orientation: InterfacePhotoOrientation;
  readonly naturalWidth: number;
  readonly naturalHeight: number;
  readonly fileSizeBytes: number;
  /** Per-asset focal point tuned by visual inspection of the downloaded master. */
  readonly objectPosition: string;
  readonly title: string;
  readonly creator: string;
  readonly creatorProfileUrl: string | null;
  readonly sourcePageUrl: string;
  readonly licenseName: 'Unsplash License';
  readonly licenseUrl: 'https://unsplash.com/license';
  readonly verifiedDate: '2026-11-27';
  readonly intendedUsage: string;
  readonly altEn: string;
  readonly altZh: string;
  readonly captionEn: string;
  readonly captionZh: string;
  readonly editorialContextNoteEn: string;
  readonly editorialContextNoteZh: string;
}

const UNSPLASH_LICENSE_URL = 'https://unsplash.com/license' as const;

export const INTERFACE_IMAGE_LIBRARY: Readonly<
  Record<InterfacePhotoId, InterfacePhotoAsset>
> = {
  'world-city-aerial': {
    id: 'world-city-aerial',
    localPath: '/assets/interface-library/world-city-aerial.jpg',
    webp800Path: '/assets/interface-library/optimized/world-city-aerial-800.webp',
    webp1600Path: '/assets/interface-library/optimized/world-city-aerial-1600.webp',
    classification: 'interface_editorial_photography',
    isDocumentaryEvidence: false,
    domain: 'world',
    subjectCategory: 'urban_geopolitics',
    orientation: 'landscape',
    naturalWidth: 4752,
    naturalHeight: 3168,
    fileSizeBytes: 3571629,
    // Top-aligned skyline framing highlights dense twilight architecture while omitting lower commercial signage
    objectPosition: '50% 0%',
    title: 'Aerial view of a city skyline at dusk',
    creator: 'Klaus Birner',
    creatorProfileUrl: 'https://unsplash.com/@thebrowny',
    sourcePageUrl:
      'https://unsplash.com/photos/aerial-view-of-a-city-skyline-at-dusk-3mdHgIGJdrM',
    licenseName: 'Unsplash License',
    licenseUrl: UNSPLASH_LICENSE_URL,
    verifiedDate: '2026-11-27',
    intendedUsage:
      'World Events desk editorial feature photography and selective urban/governance dossier openings.',
    altEn:
      'Aerial view of illuminated high-rise city towers across a dense metropolitan skyline at dusk',
    altZh: '暮色下高楼林立、灯火点亮的现代都市天际线航拍视角',
    captionEn:
      'Global urban centers and metropolitan infrastructure at dusk.',
    captionZh: '暮色中的全球都市中心与现代城市肌理。',
    editorialContextNoteEn:
      'Editorial context photograph · Generic urban imagery, not documentation of a specific city or event.',
    editorialContextNoteZh:
      '编务语境摄影 · 通用城市视觉语境，非特定城市或新闻事件现场纪实。',
  },

  'world-maritime-port': {
    id: 'world-maritime-port',
    localPath: '/assets/interface-library/world-maritime-port.jpg',
    webp800Path: '/assets/interface-library/optimized/world-maritime-port-800.webp',
    webp1600Path: '/assets/interface-library/optimized/world-maritime-port-1600.webp',
    classification: 'interface_editorial_photography',
    isDocumentaryEvidence: false,
    domain: 'world',
    subjectCategory: 'maritime_logistics',
    orientation: 'landscape',
    naturalWidth: 8256,
    naturalHeight: 4644,
    fileSizeBytes: 6053407,
    // Horizon-centered framing preserves container vessels, gantry cranes, and water reflection
    objectPosition: '50% 52%',
    title: 'Container ships and cranes at a busy port',
    creator: 'Wolfgang Weiser',
    creatorProfileUrl: 'https://unsplash.com/@hamburgmeinefreundin',
    sourcePageUrl:
      'https://unsplash.com/photos/container-ships-and-cranes-at-a-busy-port-azTSkG93BG4',
    licenseName: 'Unsplash License',
    licenseUrl: UNSPLASH_LICENSE_URL,
    verifiedDate: '2026-11-27',
    intendedUsage:
      'World Events desk maritime/trade companion plate and selective shipping or supply-chain dossier headers.',
    altEn:
      'Container ships docked alongside rows of gantry cranes across a wide commercial harbor channel in Hamburg',
    altZh: '商业港口水道两侧停泊的大型集装箱货轮与成排桥吊起重机',
    captionEn:
      'Commercial container terminals and maritime freight corridors (photographed in Hamburg).',
    captionZh: '国际商业集装箱码头与海运贸易通道（摄于德国汉堡）。',
    editorialContextNoteEn:
      'Editorial context photograph · Generic maritime logistics imagery (Hamburg), not documentation of any cited incident.',
    editorialContextNoteZh:
      '编务语境摄影 · 通用航运物流语境（摄于汉堡），非具体航运冲突或港口事件纪实。',
  },

  'ai-data-center': {
    id: 'ai-data-center',
    localPath: '/assets/interface-library/ai-data-center.jpg',
    webp800Path: '/assets/interface-library/optimized/ai-data-center-800.webp',
    webp1600Path: '/assets/interface-library/optimized/ai-data-center-1600.webp',
    classification: 'interface_editorial_photography',
    isDocumentaryEvidence: false,
    domain: 'ai',
    subjectCategory: 'compute_infrastructure',
    orientation: 'portrait',
    naturalWidth: 5504,
    naturalHeight: 8256,
    fileSizeBytes: 8755531,
    // Focuses cleanly on the steel-blue instrumentation racks and circuit assemblies
    objectPosition: '62% 38%',
    title: 'Two server racks filled with electronic components and wires',
    creator: 'Eric Stoynov',
    creatorProfileUrl: null,
    sourcePageUrl:
      'https://unsplash.com/photos/two-server-racks-filled-with-electronic-components-and-wires-k27hkqXuveo',
    licenseName: 'Unsplash License',
    licenseUrl: UNSPLASH_LICENSE_URL,
    verifiedDate: '2026-11-27',
    intendedUsage:
      'AI Frontier desk vertical infrastructure feature plate and selective compute/data-center dossier openers.',
    altEn:
      'Two vertical blue research instrumentation racks densely populated with electronic circuit boards, signal cabling, and indicator lights',
    altZh: '两座密集排列着绿色电路模块、信号线缆与指示灯的深蓝色科研机柜',
    captionEn:
      'High-density electronic instrumentation racks and compute cabling (photographed at TRIUMF, Vancouver).',
    captionZh: '高密度电子科研机柜与硬件互联布线（摄于温哥华 TRIUMF 实验室）。',
    editorialContextNoteEn:
      'Editorial context photograph · Research hardware at TRIUMF, Vancouver — not any named AI company’s data center.',
    editorialContextNoteZh:
      '编务语境摄影 · 摄于温哥华 TRIUMF 科研机构，并非任何特定 AI 企业的数据中心现场。',
  },

  'ai-silicon-wafer': {
    id: 'ai-silicon-wafer',
    localPath: '/assets/interface-library/ai-silicon-wafer.jpg',
    webp800Path: '/assets/interface-library/optimized/ai-silicon-wafer-800.webp',
    webp1600Path: '/assets/interface-library/optimized/ai-silicon-wafer-1600.webp',
    classification: 'interface_editorial_photography',
    isDocumentaryEvidence: false,
    domain: 'ai',
    subjectCategory: 'semiconductor_macro',
    orientation: 'landscape',
    naturalWidth: 5929,
    naturalHeight: 3958,
    fileSizeBytes: 3090127,
    // Captures the curved iridescent wafer upper edge and central calibration reticle
    objectPosition: '50% 35%',
    title: 'A close up of a metal plate with squares on it',
    creator: 'Laura Ockel',
    creatorProfileUrl: null,
    sourcePageUrl:
      'https://unsplash.com/photos/a-close-up-of-a-metal-plate-with-squares-on-it-0Gw_p-RQq8k',
    licenseName: 'Unsplash License',
    licenseUrl: UNSPLASH_LICENSE_URL,
    verifiedDate: '2026-11-27',
    intendedUsage:
      'AI Frontier desk macro detail photography and selective semiconductor/chip-supply dossier openings.',
    altEn:
      'Macro close-up of a 4-inch semiconductor silicon wafer showing iridescent curved edge and repeating geometric micro-die grid',
    altZh: '4 英寸半导体硅晶圆微距特写，呈现弧形边缘干涉光泽与精密排列的芯片微格阵列',
    captionEn:
      '4-inch patterned silicon wafer micro-die architecture.',
    captionZh: '4 英寸光刻半导体硅晶圆微格阵列特写。',
    editorialContextNoteEn:
      'Editorial context photograph · General silicon wafer macro imagery, not a named chipmaker’s proprietary process.',
    editorialContextNoteZh:
      '编务语境摄影 · 通用硅晶圆微距语境，非特定芯片制造商的专有制程实拍。',
  },

  'economy-stock-exchange': {
    id: 'economy-stock-exchange',
    localPath: '/assets/interface-library/economy-stock-exchange.jpg',
    webp800Path: '/assets/interface-library/optimized/economy-stock-exchange-800.webp',
    webp1600Path: '/assets/interface-library/optimized/economy-stock-exchange-1600.webp',
    classification: 'interface_editorial_photography',
    isDocumentaryEvidence: false,
    domain: 'economy',
    subjectCategory: 'financial_institutions',
    orientation: 'portrait',
    naturalWidth: 4000,
    naturalHeight: 6000,
    fileSizeBytes: 4617745,
    // Frames the classical pediment sculpture, gold inscription, and fluted Corinthian capitals
    objectPosition: '50% 45%',
    title: 'New york stock exchange building facade with columns',
    creator: 'Maxim Klimashin',
    creatorProfileUrl: 'https://unsplash.com/@maxim_klimashin',
    sourcePageUrl:
      'https://unsplash.com/photos/new-york-stock-exchange-building-facade-with-columns-1QSXCd0LHVs',
    licenseName: 'Unsplash License',
    licenseUrl: UNSPLASH_LICENSE_URL,
    verifiedDate: '2026-11-27',
    intendedUsage:
      'Economic Outlook desk institutional architecture plate and selective macro/markets dossier openings.',
    altEn:
      'Upward architectural view of the New York Stock Exchange classical stone facade, sculpted pediment, engraved architrave, and fluted Corinthian columns',
    altZh: '仰拍纽约证券交易所古典石柱立面、山花浮雕、鎏金铭文与科林斯柱头建筑细节',
    captionEn:
      'Classical financial-institution facade (New York Stock Exchange exterior).',
    captionZh: '传统金融市场地标建筑立面（纽约证券交易所外景）。',
    editorialContextNoteEn:
      'Editorial context photograph · Architectural exterior only; does not imply any cited trade or market move occurred here.',
    editorialContextNoteZh:
      '编务语境摄影 · 金融建筑外景语境，非具体交易或行情现场纪实，不代表相关事件发生于此。',
  },
};

export const INTERFACE_PHOTO_LIST: readonly InterfacePhotoAsset[] =
  Object.values(INTERFACE_IMAGE_LIBRARY);

export function getInterfacePhoto(id: InterfacePhotoId): InterfacePhotoAsset {
  return INTERFACE_IMAGE_LIBRARY[id];
}

export function getInterfacePhotosByDomain(
  domain: SignalDomain
): InterfacePhotoAsset[] {
  return INTERFACE_PHOTO_LIST.filter((photo) => photo.domain === domain);
}

/**
 * Verifies that an asset path strictly points to the local interface library
 * and never hotlinks an external image host.
 */
export function isLocalInterfaceLibraryPath(path: string): boolean {
  return /^\/assets\/interface-library\/[a-z0-9-]+\.jpg$/.test(path);
}

const DOSSIER_SEMICONDUCTOR_PATTERN =
  /\b(semiconductor|chip|chips|wafer|foundry|lithography|tsmc|asml|nvidia|blackwell|gpu|tpu|silicon|fab)\b|(芯片|半导体|晶圆|光刻|台积电|英伟达|算力芯片)/i;

const DOSSIER_COMPUTE_PATTERN =
  /\b(data[- ]?center|compute|server|cloud|cluster|supercomputer|ai[- ]?infrastructure|hyperscaler)\b|(数据中心|算力|服务器|云计算|基础设施|超算)/i;

const DOSSIER_MARITIME_PATTERN =
  /\b(maritime|shipping|port|strait|hormuz|red[- ]?sea|vessel|tanker|container|freight|supply[- ]?chain|canal|cargo|trade[- ]?corridor)\b|(航运|港口|海峡|霍尔木兹|油轮|集装箱|海运|供应链|货运|贸易通道)/i;

const DOSSIER_FINANCE_PATTERN =
  /\b(stock|equit|dow|nasdaq|s&p|central[- ]?bank|federal[- ]?reserve|ecb|boj|inflation|bond|yield|treasury|sovereign[- ]?debt|exchange|rate[- ]?hike|rate[- ]?cut|tariff|markets|macro)\b|(股市|美股|亚太股市|道指|标普|恒生|日经|央行|美联储|通胀|利率|国债|汇率|证券|交易所|关税|资本市场)/i;

const DOSSIER_URBAN_WORLD_PATTERN =
  /\b(summit|diplomacy|election|parliament|treaty|sanction|eu|nato|city|capital|metropolitan|urban|governance|court|budget)\b|(峰会|外交|大选|选举|议会|欧盟|北约|首都|城市|法院|预算|制裁)/i;

/**
 * Selectively pairs an Expanded dossier with a non-documentary local interface
 * photograph ONLY when:
 * 1. The signal has NO approved documentary/verified `media_assets` (verified
 *    evidence always takes exclusive precedence in `StoryVisual`), AND
 * 2. The signal is high-priority (`importance >= 4`) and clearly aligns with
 *    one of the five curated editorial photographic themes.
 *
 * Returns `null` when a signal should stay on `StoryVisual` (original editorial
 * illustration or typographic cover plate), preserving visual variety.
 */
export function selectEditorialPhotoForDossier(
  signal: ParsedSignal
): InterfacePhotoAsset | null {
  // Strict evidence precedence: never compete with verified signal media_assets.
  const approvedMedia = selectApprovedSignalMedia(signal);
  if (approvedMedia.primary) {
    return null;
  }

  // Selective restraint: only apply to major dossiers (importance >= 4).
  if (signal.importance < 4) {
    return null;
  }

  const combinedText = [
    signal.topic,
    signal.headline,
    ...signal.tags,
  ]
    .filter(Boolean)
    .join(' ');

  if (signal.domain === 'ai') {
    if (DOSSIER_SEMICONDUCTOR_PATTERN.test(combinedText)) {
      return INTERFACE_IMAGE_LIBRARY['ai-silicon-wafer'];
    }
    if (DOSSIER_COMPUTE_PATTERN.test(combinedText)) {
      return INTERFACE_IMAGE_LIBRARY['ai-data-center'];
    }
    return null;
  }

  if (signal.domain === 'economy') {
    if (DOSSIER_SEMICONDUCTOR_PATTERN.test(combinedText)) {
      return INTERFACE_IMAGE_LIBRARY['ai-silicon-wafer'];
    }
    if (DOSSIER_MARITIME_PATTERN.test(combinedText)) {
      return INTERFACE_IMAGE_LIBRARY['world-maritime-port'];
    }
    if (DOSSIER_FINANCE_PATTERN.test(combinedText)) {
      return INTERFACE_IMAGE_LIBRARY['economy-stock-exchange'];
    }
    return null;
  }

  // World Events domain
  if (DOSSIER_MARITIME_PATTERN.test(combinedText)) {
    return INTERFACE_IMAGE_LIBRARY['world-maritime-port'];
  }
  if (DOSSIER_URBAN_WORLD_PATTERN.test(combinedText)) {
    return INTERFACE_IMAGE_LIBRARY['world-city-aerial'];
  }

  return null;
}
