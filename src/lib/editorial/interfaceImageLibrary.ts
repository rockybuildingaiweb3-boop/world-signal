import type { ParsedSignal, SignalDomain } from '../../types/edition';
import { selectApprovedSignalMedia } from './editorialAssetRegistry';

/**
 * Local Interface Image Library Registry (Phase 09 — Expanded 30-Asset Collection)
 *
 * STRICT SEPARATION POLICY:
 * - This module registers ONLY curated local interface photographs stored under
 *   `/assets/interface-library/{world,ai,economy}/*`.
 * - It is completely separate from `editorialAssetRegistry.ts` and canonical
 *   signal `media_assets`.
 * - Every entry is generic, non-documentary visual context (`isDocumentaryEvidence: false`).
 *   It must NEVER be presented as proof of a current event, facility, or claim.
 * - Remote image hotlinking is strictly prohibited in production code.
 */

export type InterfacePhotoId =
  // World Events (10)
  | 'world-city-aerial'
  | 'world-maritime-port'
  | 'world-diplomatic-institution'
  | 'world-international-assembly'
  | 'world-global-transport'
  | 'world-earth-observation'
  | 'world-coastline-geography'
  | 'world-urban-infrastructure'
  | 'world-human-environment'
  | 'world-public-space'
  // AI Frontier (10)
  | 'ai-silicon-wafer'
  | 'ai-data-center'
  | 'ai-chip-architecture'
  | 'ai-supercomputer-hall'
  | 'ai-robotics-automation'
  | 'ai-research-laboratory'
  | 'ai-optics-photonics'
  | 'ai-scientific-instrument'
  | 'ai-engineering-workspace'
  | 'ai-advanced-materials'
  // Economic Outlook (10)
  | 'economy-stock-exchange'
  | 'economy-central-bank'
  | 'economy-financial-district'
  | 'economy-manufacturing-factory'
  | 'economy-global-trade'
  | 'economy-energy-infrastructure'
  | 'economy-commodity-production'
  | 'economy-retail-consumption'
  | 'economy-supply-chain'
  | 'economy-infrastructure-investment';

export type InterfacePhotoCategory =
  // World
  | 'urban_geopolitics'
  | 'maritime_logistics'
  | 'diplomatic_architecture'
  | 'international_assembly'
  | 'global_transport'
  | 'earth_observation'
  | 'coastline_geography'
  | 'urban_infrastructure'
  | 'human_environment'
  | 'public_institution'
  // AI
  | 'semiconductor_macro'
  | 'compute_infrastructure'
  | 'chip_architecture'
  | 'supercomputer_hall'
  | 'robotics_automation'
  | 'research_laboratory'
  | 'optics_photonics'
  | 'scientific_instrument'
  | 'engineering_workspace'
  | 'advanced_materials'
  // Economy
  | 'financial_institutions'
  | 'central_bank'
  | 'financial_district'
  | 'manufacturing_factory'
  | 'global_trade'
  | 'energy_infrastructure'
  | 'commodity_production'
  | 'retail_consumption'
  | 'supply_chain'
  | 'infrastructure_investment';

export type InterfacePhotoOrientation = 'landscape' | 'portrait';

export type InterfaceDesignRole =
  | 'desk_panorama'
  | 'desk_companion'
  | 'desk_spine'
  | 'documentary_break'
  | 'dossier_opener'
  | 'dossier_portrait';

export interface InterfacePhotoAsset {
  readonly id: InterfacePhotoId;
  /** Primary optimized uncropped WebP (up to 1600px long edge). Never a remote URL. */
  readonly localPath: `/assets/interface-library/${SignalDomain}/${string}.webp`;
  /** Responsive uncropped WebP derivative (800px long edge) for mobile & compact plates. */
  readonly webp800Path: `/assets/interface-library/${SignalDomain}/${string}-800.webp`;
  readonly classification: 'interface_editorial_photography';
  /** Hard invariant: interface library assets are never documentary news evidence. */
  readonly isDocumentaryEvidence: false;
  readonly domain: SignalDomain;
  readonly subjectCategory: InterfacePhotoCategory;
  readonly orientation: InterfacePhotoOrientation;
  readonly naturalWidth: number;
  readonly naturalHeight: number;
  readonly fileSizeBytes: number;
  readonly webp800Bytes: number;
  /** Per-asset focal point tuned by visual inspection of the downloaded master. */
  readonly objectPosition: string;
  readonly intendedRoles: readonly InterfaceDesignRole[];
  readonly title: string;
  readonly creator: string;
  readonly creatorProfileUrl: string | null;
  readonly sourcePageUrl: string;
  readonly licenseName: string;
  readonly licenseUrl: string;
  readonly verifiedDate: string;
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
  // ===========================================================================
  // WORLD EVENTS — 10 CURATED GLOBAL DOCUMENTARY ASSETS
  // ===========================================================================
  'world-city-aerial': {
    id: 'world-city-aerial',
    localPath: '/assets/interface-library/world/world-city-aerial.webp',
    webp800Path: '/assets/interface-library/world/world-city-aerial-800.webp',
    classification: 'interface_editorial_photography',
    isDocumentaryEvidence: false,
    domain: 'world',
    subjectCategory: 'urban_geopolitics',
    orientation: 'landscape',
    naturalWidth: 1600,
    naturalHeight: 1067,
    fileSizeBytes: 404640,
    webp800Bytes: 108942,
    objectPosition: '50% 10%',
    intendedRoles: ['desk_panorama', 'dossier_opener'],
    title: 'Aerial view of a city skyline at dusk',
    creator: 'Klaus Birner',
    creatorProfileUrl: 'https://unsplash.com/@thebrowny',
    sourcePageUrl:
      'https://unsplash.com/photos/aerial-view-of-a-city-skyline-at-dusk-3mdHgIGJdrM',
    licenseName: 'Unsplash License',
    licenseUrl: UNSPLASH_LICENSE_URL,
    verifiedDate: '2026-11-27',
    intendedUsage:
      'World Events desk panoramic metropolitan opener and urban/governance dossier headers.',
    altEn:
      'Aerial view of illuminated high-rise city towers across a dense metropolitan skyline at dusk',
    altZh: '暮色下高楼林立、灯火点亮的现代都市天际线航拍视角',
    captionEn:
      'Global metropolitan centers and urban infrastructure at dusk.',
    captionZh: '暮色中的全球都市中心与现代城市肌理。',
    editorialContextNoteEn:
      'Editorial context photograph · Generic urban imagery, not documentation of a specific city or event.',
    editorialContextNoteZh:
      '编务语境摄影 · 通用城市视觉语境，非特定城市或新闻事件现场纪实。',
  },

  'world-maritime-port': {
    id: 'world-maritime-port',
    localPath: '/assets/interface-library/world/world-maritime-port.webp',
    webp800Path: '/assets/interface-library/world/world-maritime-port-800.webp',
    classification: 'interface_editorial_photography',
    isDocumentaryEvidence: false,
    domain: 'world',
    subjectCategory: 'maritime_logistics',
    orientation: 'landscape',
    naturalWidth: 1600,
    naturalHeight: 900,
    fileSizeBytes: 202618,
    webp800Bytes: 53618,
    objectPosition: '50% 52%',
    intendedRoles: ['desk_companion', 'dossier_opener'],
    title: 'Container ships and cranes at a busy port',
    creator: 'Wolfgang Weiser',
    creatorProfileUrl: 'https://unsplash.com/@hamburgmeinefreundin',
    sourcePageUrl:
      'https://unsplash.com/photos/container-ships-and-cranes-at-a-busy-port-azTSkG93BG4',
    licenseName: 'Unsplash License',
    licenseUrl: UNSPLASH_LICENSE_URL,
    verifiedDate: '2026-11-27',
    intendedUsage:
      'World Events maritime corridor plate and shipping/supply-chain dossier headers.',
    altEn:
      'Container ships docked alongside rows of gantry cranes across a wide commercial harbor channel in Hamburg',
    altZh: '商业港口水道两侧停泊的大型集装箱货轮与成排桥吊起重机',
    captionEn:
      'Commercial container terminals and maritime freight corridors (Hamburg).',
    captionZh: '国际商业集装箱码头与海运贸易通道（摄于德国汉堡）。',
    editorialContextNoteEn:
      'Editorial context photograph · Generic maritime logistics imagery (Hamburg), not documentation of any cited incident.',
    editorialContextNoteZh:
      '编务语境摄影 · 通用航运物流语境（摄于汉堡），非具体航运冲突或港口事件纪实。',
  },

  'world-diplomatic-institution': {
    id: 'world-diplomatic-institution',
    localPath: '/assets/interface-library/world/world-diplomatic-institution.webp',
    webp800Path:
      '/assets/interface-library/world/world-diplomatic-institution-800.webp',
    classification: 'interface_editorial_photography',
    isDocumentaryEvidence: false,
    domain: 'world',
    subjectCategory: 'diplomatic_architecture',
    orientation: 'landscape',
    naturalWidth: 1600,
    naturalHeight: 873,
    fileSizeBytes: 144322,
    webp800Bytes: 28192,
    objectPosition: '38% 45%',
    intendedRoles: ['desk_panorama', 'dossier_opener'],
    title: 'Sunset over UN building (Unsplash)',
    creator: 'Daryan Shamkhali',
    creatorProfileUrl: null,
    sourcePageUrl:
      'https://commons.wikimedia.org/wiki/File:Sunset_over_UN_building_(Unsplash).jpg',
    licenseName: 'CC0',
    licenseUrl: 'https://creativecommons.org/publicdomain/zero/1.0/deed.en',
    verifiedDate: '2026-11-28',
    intendedUsage:
      'Diplomatic institution architecture with open sky negative space for multilateral affairs.',
    altEn:
      'Glass curtain wall of the United Nations Secretariat tower catching warm late-afternoon light against an open sky',
    altZh: '暮色斜阳映照下的联合国秘书处玻璃幕墙大楼与开阔天空留白',
    captionEn:
      'United Nations Secretariat facade in late-afternoon light.',
    captionZh: '暮色光影中的国际外交机构建筑立面（联合国秘书处）。',
    editorialContextNoteEn:
      'Editorial context photograph · Architectural exterior only, not documentation of a specific UN vote or summit.',
    editorialContextNoteZh:
      '编务语境摄影 · 国际机构建筑外景语境，非特定决议或峰会现场纪实。',
  },

  'world-international-assembly': {
    id: 'world-international-assembly',
    localPath: '/assets/interface-library/world/world-international-assembly.webp',
    webp800Path:
      '/assets/interface-library/world/world-international-assembly-800.webp',
    classification: 'interface_editorial_photography',
    isDocumentaryEvidence: false,
    domain: 'world',
    subjectCategory: 'international_assembly',
    orientation: 'landscape',
    naturalWidth: 1600,
    naturalHeight: 1067,
    fileSizeBytes: 369216,
    webp800Bytes: 100910,
    objectPosition: '50% 44%',
    intendedRoles: ['desk_companion', 'dossier_opener'],
    title: 'United Nations General Assembly Hall (2)',
    creator: 'Basil D Soufi',
    creatorProfileUrl: null,
    sourcePageUrl:
      'https://commons.wikimedia.org/wiki/File:United_Nations_General_Assembly_Hall_(2).jpg',
    licenseName: 'CC BY-SA 3.0',
    licenseUrl: 'https://creativecommons.org/licenses/by-sa/3.0',
    verifiedDate: '2026-11-28',
    intendedUsage:
      'Multilateral negotiations, treaty debates, and international summit dossiers.',
    altEn:
      'Wide interior view of the United Nations General Assembly Hall showing the wood-slatted walls, circular ceiling dome, and delegate seating',
    altZh: '联合国大会厅内部广角视角，展现木质弧形墙面、圆形穹顶与各国代表席',
    captionEn:
      'Multilateral assembly architecture inside the UN General Assembly Hall.',
    captionZh: '联合国大会厅的多边议事空间与建筑结构。',
    editorialContextNoteEn:
      'Editorial context photograph · Archival assembly interior, not documentation of the current session or cited debate.',
    editorialContextNoteZh:
      '编务语境摄影 · 档案性质的议事厅内景，非本期特定外交会议或表决现场。',
  },

  'world-global-transport': {
    id: 'world-global-transport',
    localPath: '/assets/interface-library/world/world-global-transport.webp',
    webp800Path:
      '/assets/interface-library/world/world-global-transport-800.webp',
    classification: 'interface_editorial_photography',
    isDocumentaryEvidence: false,
    domain: 'world',
    subjectCategory: 'global_transport',
    orientation: 'landscape',
    naturalWidth: 1600,
    naturalHeight: 1200,
    fileSizeBytes: 163986,
    webp800Bytes: 24890,
    objectPosition: '50% 42%',
    intendedRoles: ['desk_companion', 'dossier_opener'],
    title: 'Container Ship Enters Miraflores Locks - Panama Canal',
    creator: 'Adam Jones',
    creatorProfileUrl: null,
    sourcePageUrl:
      'https://commons.wikimedia.org/wiki/File:Container_Ship_Enters_Miraflores_Locks_-_Panama_Canal.jpg',
    licenseName: 'CC BY-SA 2.0',
    licenseUrl: 'https://creativecommons.org/licenses/by-sa/2.0',
    verifiedDate: '2026-11-28',
    intendedUsage:
      'Global maritime chokepoints, interoceanic transit, and freight logistics stories.',
    altEn:
      'Head-on view of a large container vessel entering the Miraflores Locks of the Panama Canal beside misty hills',
    altZh: '大型集装箱货轮正驶入巴拿马运河米拉弗洛雷斯船闸的正面视角',
    captionEn:
      'Container vessel transiting the Miraflores Locks on the Panama Canal.',
    captionZh: '正通过巴拿马运河米拉弗洛雷斯船闸的远洋集装箱船。',
    editorialContextNoteEn:
      'Editorial context photograph · Generic canal transit imagery, not documentation of a specific blockage or vessel.',
    editorialContextNoteZh:
      '编务语境摄影 · 通用国际运河航运语境，非特定海峡封锁或航运事故纪实。',
  },

  'world-earth-observation': {
    id: 'world-earth-observation',
    localPath: '/assets/interface-library/world/world-earth-observation.webp',
    webp800Path:
      '/assets/interface-library/world/world-earth-observation-800.webp',
    classification: 'interface_editorial_photography',
    isDocumentaryEvidence: false,
    domain: 'world',
    subjectCategory: 'earth_observation',
    orientation: 'landscape',
    naturalWidth: 1600,
    naturalHeight: 1064,
    fileSizeBytes: 134502,
    webp800Bytes: 34614,
    objectPosition: '50% 68%',
    intendedRoles: ['documentary_break', 'desk_panorama', 'dossier_opener'],
    title: 'Earth Observation from the International Space Station (ISS045-E-176195)',
    creator: 'Kjell Lindgren / NASA',
    creatorProfileUrl: null,
    sourcePageUrl: 'https://images.nasa.gov/details/iss045e176195',
    licenseName: 'Public Domain (NASA)',
    licenseUrl: 'https://www.nasa.gov/nasa-brand-center/images-and-media/',
    verifiedDate: '2026-11-28',
    intendedUsage:
      'Global-scale orbital documentary break, space/climate geopolitics, and cross-regional perspective.',
    altEn:
      'Nighttime orbital photograph from the International Space Station showing illuminated city networks across Earth beneath a glowing atmospheric airglow horizon',
    altZh: '国际空间站夜间拍摄的地球弧线与绵延城市灯火网络，地平线上方泛起大气气辉',
    captionEn:
      'Orbital night-side Earth observation from the International Space Station (NASA).',
    captionZh: '国际空间站轨道拍摄的夜间地球城市灯火与大气气辉（NASA）。',
    editorialContextNoteEn:
      'Editorial context photograph · Archival NASA orbital observation, not real-time satellite surveillance of any reported event.',
    editorialContextNoteZh:
      '编务语境摄影 · NASA 档案轨道观测影像，非特定新闻事件的实时卫星侦察证据。',
  },

  'world-coastline-geography': {
    id: 'world-coastline-geography',
    localPath: '/assets/interface-library/world/world-coastline-geography.webp',
    webp800Path:
      '/assets/interface-library/world/world-coastline-geography-800.webp',
    classification: 'interface_editorial_photography',
    isDocumentaryEvidence: false,
    domain: 'world',
    subjectCategory: 'coastline_geography',
    orientation: 'landscape',
    naturalWidth: 1600,
    naturalHeight: 948,
    fileSizeBytes: 187924,
    webp800Bytes: 33320,
    objectPosition: '50% 58%',
    intendedRoles: ['desk_panorama', 'documentary_break', 'dossier_opener'],
    title: 'Bosphorus, aerial view - Turkey - panoramio',
    creator: 'Sergey Ashmarin',
    creatorProfileUrl: null,
    sourcePageUrl:
      'https://commons.wikimedia.org/wiki/File:Bosphorus,_aerial_view_-_Turkey_-_panoramio.jpg',
    licenseName: 'CC BY-SA 3.0',
    licenseUrl: 'https://creativecommons.org/licenses/by-sa/3.0',
    verifiedDate: '2026-11-28',
    intendedUsage:
      'Geographic straits, borders, maritime corridors, and territorial geopolitics.',
    altEn:
      'High-altitude aerial view of the Bosphorus strait winding between densely settled continental coastlines',
    altZh: '高空俯瞰博斯普鲁斯海峡蜿蜒穿过欧亚两岸海岸线与都市聚落',
    captionEn:
      'Strategic maritime geography along the Bosphorus strait connecting two continents.',
    captionZh: '高空视角下的博斯普鲁斯海峡海岸地理与跨洲水道。',
    editorialContextNoteEn:
      'Editorial context photograph · Archival aerial geography of the Bosphorus, not documentation of a specific naval incident.',
    editorialContextNoteZh:
      '编务语境摄影 · 博斯普鲁斯海峡档案航拍地理影像，非特定海域冲突或军事行动纪实。',
  },

  'world-urban-infrastructure': {
    id: 'world-urban-infrastructure',
    localPath: '/assets/interface-library/world/world-urban-infrastructure.webp',
    webp800Path:
      '/assets/interface-library/world/world-urban-infrastructure-800.webp',
    classification: 'interface_editorial_photography',
    isDocumentaryEvidence: false,
    domain: 'world',
    subjectCategory: 'urban_infrastructure',
    orientation: 'landscape',
    naturalWidth: 1600,
    naturalHeight: 900,
    fileSizeBytes: 259674,
    webp800Bytes: 57696,
    objectPosition: '50% 52%',
    intendedRoles: ['desk_companion', 'dossier_opener'],
    title: 'Golden Gate Bridge as seen from Marshall’s Beach, March 2018',
    creator: 'Frank Schulenburg',
    creatorProfileUrl: null,
    sourcePageUrl:
      'https://commons.wikimedia.org/wiki/File:Golden_Gate_Bridge_as_seen_from_Marshall%E2%80%99s_Beach,_March_2018.jpg',
    licenseName: 'CC BY-SA 4.0',
    licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0',
    verifiedDate: '2026-11-28',
    intendedUsage:
      'Urban civil infrastructure, coastal resilience, and regional connectivity dossiers.',
    altEn:
      'Suspension towers and span of the Golden Gate Bridge rising above coastal rocks and ocean mist',
    altZh: '旧金山金门大桥悬索塔与桥身矗立在海岸礁石与薄雾海面之上',
    captionEn:
      'Coastal suspension-bridge infrastructure above the Pacific shoreline.',
    captionZh: '太平洋海岸线上空的跨海悬索桥城市基础设施景观。',
    editorialContextNoteEn:
      'Editorial context photograph · Generic civil infrastructure imagery, not documentation of a cited transport event.',
    editorialContextNoteZh:
      '编务语境摄影 · 通用城市与沿海基础设施语境，非特定交通事件纪实。',
  },

  'world-human-environment': {
    id: 'world-human-environment',
    localPath: '/assets/interface-library/world/world-human-environment.webp',
    webp800Path:
      '/assets/interface-library/world/world-human-environment-800.webp',
    classification: 'interface_editorial_photography',
    isDocumentaryEvidence: false,
    domain: 'world',
    subjectCategory: 'human_environment',
    orientation: 'landscape',
    naturalWidth: 1600,
    naturalHeight: 1067,
    fileSizeBytes: 397936,
    webp800Bytes: 100996,
    objectPosition: '50% 58%',
    intendedRoles: ['desk_companion', 'dossier_opener'],
    title: 'Grand Central Terminal Main Concourse (At New York City 2023 008)',
    creator: 'Mike Peel',
    creatorProfileUrl: null,
    sourcePageUrl:
      'https://commons.wikimedia.org/wiki/File:At_New_York_City_2023_008.jpg',
    licenseName: 'CC BY-SA 4.0',
    licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0',
    verifiedDate: '2026-11-28',
    intendedUsage:
      'Documentary human scale, civic transit, migration, and domestic society stories.',
    altEn:
      'Elevated view of commuters crossing the sunlit limestone main concourse of Grand Central Terminal',
    altZh: '俯拍人群穿行于阳光倾泻的纽约中央车站石灰岩主大厅',
    captionEn:
      'Everyday civic movement across Grand Central Terminal main concourse.',
    captionZh: '日常通勤人群穿行于公共交通枢纽大厅的人文纪实语境。',
    editorialContextNoteEn:
      'Editorial context photograph · Generic public transit human environment, not documentation of a specific incident.',
    editorialContextNoteZh:
      '编务语境摄影 · 通用都市人文与公共出行场景，非特定社会事件现场。',
  },

  'world-public-space': {
    id: 'world-public-space',
    localPath: '/assets/interface-library/world/world-public-space.webp',
    webp800Path:
      '/assets/interface-library/world/world-public-space-800.webp',
    classification: 'interface_editorial_photography',
    isDocumentaryEvidence: false,
    domain: 'world',
    subjectCategory: 'public_institution',
    orientation: 'landscape',
    naturalWidth: 1600,
    naturalHeight: 903,
    fileSizeBytes: 355924,
    webp800Bytes: 92804,
    objectPosition: '50% 55%',
    intendedRoles: ['documentary_break', 'desk_panorama', 'dossier_opener'],
    title: 'European Parliament Strasbourg Hemicycle - Diliff',
    creator: 'Diliff',
    creatorProfileUrl: null,
    sourcePageUrl:
      'https://commons.wikimedia.org/wiki/File:European_Parliament_Strasbourg_Hemicycle_-_Diliff.jpg',
    licenseName: 'CC BY-SA 3.0',
    licenseUrl: 'https://creativecommons.org/licenses/by-sa/3.0',
    verifiedDate: '2026-11-28',
    intendedUsage:
      'Parliamentary governance, elections, legislation, and institutional accountability.',
    altEn:
      'Symmetrical wide-angle panorama of the European Parliament debating hemicycle in Strasbourg filled with concentric rows of desks',
    altZh: '斯特拉斯堡欧洲议会半圆形议事厅对称广角全景，层层同心座席环绕主席台',
    captionEn:
      'Parliamentary hemicycle architecture in Strasbourg (European Parliament).',
    captionZh: '斯特拉斯堡欧洲议会半圆形议事厅与民主制度空间。',
    editorialContextNoteEn:
      'Editorial context photograph · Archival parliamentary chamber, not documentation of a specific vote or law.',
    editorialContextNoteZh:
      '编务语境摄影 · 欧洲议会档案影像，非本期具体立法表决或会议现场。',
  },

  // ===========================================================================
  // AI FRONTIER — 10 CURATED SCIENTIFIC MODERNISM ASSETS
  // ===========================================================================
  'ai-silicon-wafer': {
    id: 'ai-silicon-wafer',
    localPath: '/assets/interface-library/ai/ai-silicon-wafer.webp',
    webp800Path: '/assets/interface-library/ai/ai-silicon-wafer-800.webp',
    classification: 'interface_editorial_photography',
    isDocumentaryEvidence: false,
    domain: 'ai',
    subjectCategory: 'semiconductor_macro',
    orientation: 'landscape',
    naturalWidth: 1600,
    naturalHeight: 1068,
    fileSizeBytes: 272686,
    webp800Bytes: 78012,
    objectPosition: '50% 35%',
    intendedRoles: ['desk_companion', 'dossier_opener'],
    title: 'A close up of a metal plate with squares on it',
    creator: 'Laura Ockel',
    creatorProfileUrl: null,
    sourcePageUrl:
      'https://unsplash.com/photos/a-close-up-of-a-metal-plate-with-squares-on-it-0Gw_p-RQq8k',
    licenseName: 'Unsplash License',
    licenseUrl: UNSPLASH_LICENSE_URL,
    verifiedDate: '2026-11-27',
    intendedUsage:
      'AI Frontier macro detail plate and semiconductor/export-control dossier openings.',
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

  'ai-data-center': {
    id: 'ai-data-center',
    localPath: '/assets/interface-library/ai/ai-data-center.webp',
    webp800Path: '/assets/interface-library/ai/ai-data-center-800.webp',
    classification: 'interface_editorial_photography',
    isDocumentaryEvidence: false,
    domain: 'ai',
    subjectCategory: 'compute_infrastructure',
    orientation: 'portrait',
    naturalWidth: 1067,
    naturalHeight: 1600,
    fileSizeBytes: 219390,
    webp800Bytes: 73000,
    objectPosition: '62% 38%',
    intendedRoles: ['desk_spine', 'dossier_portrait'],
    title: 'Two server racks filled with electronic components and wires',
    creator: 'Eric Stoynov',
    creatorProfileUrl: null,
    sourcePageUrl:
      'https://unsplash.com/photos/two-server-racks-filled-with-electronic-components-and-wires-k27hkqXuveo',
    licenseName: 'Unsplash License',
    licenseUrl: UNSPLASH_LICENSE_URL,
    verifiedDate: '2026-11-27',
    intendedUsage:
      'AI Frontier vertical instrumentation spine and compute-infrastructure dossier openers.',
    altEn:
      'Two vertical blue research instrumentation racks densely populated with electronic circuit boards, signal cabling, and indicator lights',
    altZh: '两座密集排列着绿色电路模块、信号线缆与指示灯的深蓝色科研机柜',
    captionEn:
      'High-density electronic instrumentation racks and compute cabling (TRIUMF, Vancouver).',
    captionZh: '高密度电子科研机柜与硬件互联布线（摄于温哥华 TRIUMF 实验室）。',
    editorialContextNoteEn:
      'Editorial context photograph · Research hardware at TRIUMF, Vancouver — not any named AI company’s data center.',
    editorialContextNoteZh:
      '编务语境摄影 · 摄于温哥华 TRIUMF 科研机构，并非任何特定 AI 企业的数据中心现场。',
  },

  'ai-chip-architecture': {
    id: 'ai-chip-architecture',
    localPath: '/assets/interface-library/ai/ai-chip-architecture.webp',
    webp800Path: '/assets/interface-library/ai/ai-chip-architecture-800.webp',
    classification: 'interface_editorial_photography',
    isDocumentaryEvidence: false,
    domain: 'ai',
    subjectCategory: 'chip_architecture',
    orientation: 'portrait',
    naturalWidth: 1235,
    naturalHeight: 1600,
    fileSizeBytes: 552174,
    webp800Bytes: 100386,
    objectPosition: '50% 48%',
    intendedRoles: ['desk_spine', 'desk_companion', 'dossier_portrait'],
    title: 'D8742 microscope die shot',
    creator: 'Zom-B',
    creatorProfileUrl: null,
    sourcePageUrl:
      'https://commons.wikimedia.org/wiki/File:D8742_microscope_die_shot.png',
    licenseName: 'CC BY-SA 4.0',
    licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0',
    verifiedDate: '2026-11-28',
    intendedUsage:
      'Microprocessor architecture, custom accelerators, and silicon design stories.',
    altEn:
      'High-magnification optical microscope die photograph showing golden geometric logic blocks, memory arrays, and perimeter bond pads of an integrated circuit',
    altZh: '高倍光学显微镜拍摄的集成电路芯片裸片，展现金色几何逻辑模块、存储阵列与外围焊盘',
    captionEn:
      'Optical microscope die photography revealing integrated-circuit logic geometry.',
    captionZh: '高倍光学显微镜头下的集成电路芯片裸片几何架构。',
    editorialContextNoteEn:
      'Editorial context photograph · Archival microcontroller die micrograph, not a contemporary GPU or proprietary AI chip.',
    editorialContextNoteZh:
      '编务语境摄影 · 经典芯片裸片显微档案图，并非当下特定企业的专有 AI 加速器架构。',
  },

  'ai-supercomputer-hall': {
    id: 'ai-supercomputer-hall',
    localPath: '/assets/interface-library/ai/ai-supercomputer-hall.webp',
    webp800Path: '/assets/interface-library/ai/ai-supercomputer-hall-800.webp',
    classification: 'interface_editorial_photography',
    isDocumentaryEvidence: false,
    domain: 'ai',
    subjectCategory: 'supercomputer_hall',
    orientation: 'landscape',
    naturalWidth: 1600,
    naturalHeight: 900,
    fileSizeBytes: 198840,
    webp800Bytes: 53554,
    objectPosition: '50% 50%',
    intendedRoles: ['desk_companion', 'dossier_opener'],
    title: 'Summit supercomputer (31430045337)',
    creator: 'Oak Ridge National Laboratory',
    creatorProfileUrl: null,
    sourcePageUrl:
      'https://commons.wikimedia.org/wiki/File:Summit_supercomputer_(31430045337).jpg',
    licenseName: 'CC BY 2.0',
    licenseUrl: 'https://creativecommons.org/licenses/by/2.0',
    verifiedDate: '2026-11-28',
    intendedUsage:
      'Large-scale training clusters, national compute capacity, and hyperscale AI infrastructure.',
    altEn:
      'Row of black high-performance compute cabinets with angled geometric graphics lining a supercomputer hall at Oak Ridge National Laboratory',
    altZh: '橡树岭国家实验室超算大厅内成排排列的高性能计算黑色机柜走廊',
    captionEn:
      'High-performance supercomputing cabinet row at Oak Ridge National Laboratory.',
    captionZh: '美国橡树岭国家实验室高性能超算集群机柜阵列。',
    editorialContextNoteEn:
      'Editorial context photograph · Summit supercomputer at ORNL, not a private training cluster cited in any signal.',
    editorialContextNoteZh:
      '编务语境摄影 · 摄于美国橡树岭国家实验室，不代表报道中任何商业公司的算力集群。',
  },

  'ai-robotics-automation': {
    id: 'ai-robotics-automation',
    localPath: '/assets/interface-library/ai/ai-robotics-automation.webp',
    webp800Path: '/assets/interface-library/ai/ai-robotics-automation-800.webp',
    classification: 'interface_editorial_photography',
    isDocumentaryEvidence: false,
    domain: 'ai',
    subjectCategory: 'robotics_automation',
    orientation: 'landscape',
    naturalWidth: 1600,
    naturalHeight: 1295,
    fileSizeBytes: 200840,
    webp800Bytes: 66526,
    objectPosition: '55% 45%',
    intendedRoles: ['desk_companion', 'dossier_opener'],
    title: 'UR16e robot arm',
    creator: 'Auledas',
    creatorProfileUrl: null,
    sourcePageUrl:
      'https://commons.wikimedia.org/wiki/File:UR16e_robot_arm.png',
    licenseName: 'CC BY-SA 4.0',
    licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0',
    verifiedDate: '2026-11-28',
    intendedUsage:
      'Embodied AI, industrial robotics, physical automation, and precision manipulation stories.',
    altEn:
      'Six-axis collaborative industrial robotic arm mounted on a perforated steel fixture table beside its teach-pendant controller',
    altZh: '安装在多孔钢制工装台上的六轴协作工业机械臂与示教控制终端',
    captionEn:
      'Six-axis collaborative robotic manipulator and controller on an engineering bench.',
    captionZh: '工程实验台上的六轴工业协作机械臂与控制终端。',
    editorialContextNoteEn:
      'Editorial context photograph · Generic industrial robotics hardware, not documentation of a specific robotics launch.',
    editorialContextNoteZh:
      '编务语境摄影 · 通用工业机器人硬件语境，非特定具身智能或机器人发布会现场。',
  },

  'ai-research-laboratory': {
    id: 'ai-research-laboratory',
    localPath: '/assets/interface-library/ai/ai-research-laboratory.webp',
    webp800Path: '/assets/interface-library/ai/ai-research-laboratory-800.webp',
    classification: 'interface_editorial_photography',
    isDocumentaryEvidence: false,
    domain: 'ai',
    subjectCategory: 'research_laboratory',
    orientation: 'landscape',
    naturalWidth: 1600,
    naturalHeight: 1063,
    fileSizeBytes: 352568,
    webp800Bytes: 84332,
    objectPosition: '50% 50%',
    intendedRoles: ['desk_companion', 'dossier_opener'],
    title: 'CERN Control Center',
    creator: 'Torkild Retvedt',
    creatorProfileUrl: null,
    sourcePageUrl:
      'https://commons.wikimedia.org/wiki/File:CERN_Control_Center.jpg',
    licenseName: 'CC BY-SA 2.0',
    licenseUrl: 'https://creativecommons.org/licenses/by-sa/2.0',
    verifiedDate: '2026-11-28',
    intendedUsage:
      'Research laboratories, scientific governance, safety evaluations, and frontier systems monitoring.',
    altEn:
      'Elevated view of researchers conferring inside the circular console floor of the CERN Control Center',
    altZh: '俯拍科研人员在欧洲核子研究中心环形控制台大厅内交流协作',
    captionEn:
      'Scientific operations consoles and researchers inside the CERN Control Center.',
    captionZh: '欧洲核子研究中心（CERN）控制中心大厅与科研监测控制台。',
    editorialContextNoteEn:
      'Editorial context photograph · Archival view of CERN Control Center, not any cited AI lab facility.',
    editorialContextNoteZh:
      '编务语境摄影 · CERN 控制中心档案影像，非报道中任何特定 AI 实验室内部实拍。',
  },

  'ai-optics-photonics': {
    id: 'ai-optics-photonics',
    localPath: '/assets/interface-library/ai/ai-optics-photonics.webp',
    webp800Path: '/assets/interface-library/ai/ai-optics-photonics-800.webp',
    classification: 'interface_editorial_photography',
    isDocumentaryEvidence: false,
    domain: 'ai',
    subjectCategory: 'optics_photonics',
    orientation: 'landscape',
    naturalWidth: 1600,
    naturalHeight: 1067,
    fileSizeBytes: 449950,
    webp800Bytes: 119658,
    objectPosition: '50% 50%',
    intendedRoles: ['desk_companion', 'dossier_opener'],
    title: 'Laser trap optical table — Stanford physics laboratory',
    creator: 'Steve Jurvetson',
    creatorProfileUrl: null,
    sourcePageUrl:
      'https://commons.wikimedia.org/wiki/File:Bose-Einstein_condensate,_a_cloud_of_super-cooled_Rubidium_atoms_in_a_Laser_trap_on_an_Optical_table_-_In_a_game_of_catch_%26_release,_the_atoms_will_shoot_up_a_30_ft._tall_Atomic_fountain_-_Stanford.jpg',
    licenseName: 'CC BY 2.0',
    licenseUrl: 'https://creativecommons.org/licenses/by/2.0',
    verifiedDate: '2026-11-28',
    intendedUsage:
      'Optical interconnects, photonics, laser lithography, and experimental physics research.',
    altEn:
      'Dense array of precision mirrors, optical mounts, laser tubing, and vacuum assemblies arranged across a steel optical bench',
    altZh: '精密光学实验台上密布的激光反射镜、光学支架、光纤与真空组件',
    captionEn:
      'Precision optical bench and laser instrumentation in an experimental physics lab.',
    captionZh: '实验物理实验室中的精密光学平台与激光干涉组件。',
    editorialContextNoteEn:
      'Editorial context photograph · Academic physics optical table, not documentation of a specific commercial product.',
    editorialContextNoteZh:
      '编务语境摄影 · 高校物理实验室光学平台实景，非特定商业光互联或光刻设备实拍。',
  },

  'ai-scientific-instrument': {
    id: 'ai-scientific-instrument',
    localPath: '/assets/interface-library/ai/ai-scientific-instrument.webp',
    webp800Path:
      '/assets/interface-library/ai/ai-scientific-instrument-800.webp',
    classification: 'interface_editorial_photography',
    isDocumentaryEvidence: false,
    domain: 'ai',
    subjectCategory: 'scientific_instrument',
    orientation: 'landscape',
    naturalWidth: 1600,
    naturalHeight: 1151,
    fileSizeBytes: 199376,
    webp800Bytes: 56312,
    objectPosition: '50% 52%',
    intendedRoles: ['desk_companion', 'dossier_opener'],
    title: 'Scanning electron microscope - UFCH JH (2020) 01',
    creator: 'Tadeáš Bednarz',
    creatorProfileUrl: null,
    sourcePageUrl:
      'https://commons.wikimedia.org/wiki/File:Scanning_electron_microscope_-_UFCH_JH_(2020)_01.jpg',
    licenseName: 'CC BY-SA 4.0',
    licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0',
    verifiedDate: '2026-11-28',
    intendedUsage:
      'AI for science, biotech/materials discovery, metrology, and precision laboratory instruments.',
    altEn:
      'Scanning electron microscope column beside a laboratory monitor displaying high-resolution cellular microstructure imagery',
    altZh: '科研实验室中的扫描电子显微镜主柱与显示微观结构图像的监测屏幕',
    captionEn:
      'Scanning electron microscope column and analytical workstation.',
    captionZh: '扫描电子显微镜精密柱体与微观结构分析工作台。',
    editorialContextNoteEn:
      'Editorial context photograph · Generic laboratory electron microscope, not documentation of a specific scientific claim.',
    editorialContextNoteZh:
      '编务语境摄影 · 通用扫描电镜实验室设备，非特定科研论文或实验结果的直接证据。',
  },

  'ai-engineering-workspace': {
    id: 'ai-engineering-workspace',
    localPath: '/assets/interface-library/ai/ai-engineering-workspace.webp',
    webp800Path:
      '/assets/interface-library/ai/ai-engineering-workspace-800.webp',
    classification: 'interface_editorial_photography',
    isDocumentaryEvidence: false,
    domain: 'ai',
    subjectCategory: 'engineering_workspace',
    orientation: 'landscape',
    naturalWidth: 1600,
    naturalHeight: 1065,
    fileSizeBytes: 306792,
    webp800Bytes: 75490,
    objectPosition: '55% 48%',
    intendedRoles: ['documentary_break', 'desk_companion', 'dossier_opener'],
    title: 'Engineers at Work on Webb at Johnson Space Center',
    creator: 'NASA / Desiree Stover',
    creatorProfileUrl: null,
    sourcePageUrl:
      'https://commons.wikimedia.org/wiki/File:Engineers_at_Work_on_Webb_at_Johnson_Space_Center.jpg',
    licenseName: 'Public Domain (NASA)',
    licenseUrl: 'https://commons.wikimedia.org/wiki/Commons:Licensing',
    verifiedDate: '2026-11-28',
    intendedUsage:
      'Frontier engineering teams, cleanroom assembly, space/science compute milestones.',
    altEn:
      'Cleanroom engineers in white protective garments inspecting the hexagonal gold-coated mirror segments inside a high-bay laboratory',
    altZh: '身着白色无尘服的工程师在高洁净实验大厅内检测金色六边形光学镜面阵列',
    captionEn:
      'Cleanroom engineers inspecting precision hexagonal optical segments (NASA JSC).',
    captionZh: '高洁净实验室内的工程师与精密六边形镜面工程总装（NASA）。',
    editorialContextNoteEn:
      'Editorial context photograph · Archival NASA cleanroom engineering photo, not documentation of any cited company.',
    editorialContextNoteZh:
      '编务语境摄影 · NASA 洁净室工程档案照，非报道中特定机构或研发项目的现场记录。',
  },

  'ai-advanced-materials': {
    id: 'ai-advanced-materials',
    localPath: '/assets/interface-library/ai/ai-advanced-materials.webp',
    webp800Path: '/assets/interface-library/ai/ai-advanced-materials-800.webp',
    classification: 'interface_editorial_photography',
    isDocumentaryEvidence: false,
    domain: 'ai',
    subjectCategory: 'advanced_materials',
    orientation: 'landscape',
    naturalWidth: 1600,
    naturalHeight: 1060,
    fileSizeBytes: 83068,
    webp800Bytes: 23334,
    objectPosition: '50% 50%',
    intendedRoles: ['desk_companion', 'dossier_opener'],
    title: 'UV Cured Powder Coating on Carbon Fiber',
    creator: 'Speedoflight1',
    creatorProfileUrl: null,
    sourcePageUrl:
      'https://commons.wikimedia.org/wiki/File:UV_Cured_Powder_Coating_on_Carbon_Fiber_.jpg',
    licenseName: 'CC BY-SA 4.0',
    licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0',
    verifiedDate: '2026-11-28',
    intendedUsage:
      'Advanced materials science, lightweight composites, hardware substrates, and industrial R&D.',
    altEn:
      'Studio macro close-up of woven carbon-fiber composite cylinders resting beside matte and coated engineering tubes',
    altZh: '棚拍微距下的碳纤维编织复合材料管件与精密涂层工程样本',
    captionEn:
      'Woven carbon-fiber composite cylinders and engineered surface coatings.',
    captionZh: '碳纤维编织复合材料与工程涂层表面微距细节。',
    editorialContextNoteEn:
      'Editorial context photograph · Generic materials-science studio macro, not a specific manufacturer’s hardware.',
    editorialContextNoteZh:
      '编务语境摄影 · 通用先进材料微距语境，非特定厂商的专有硬件部件实拍。',
  },

  // ===========================================================================
  // ECONOMIC OUTLOOK — 10 CURATED INSTITUTIONAL & ECONOMIC HUMANISM ASSETS
  // ===========================================================================
  'economy-stock-exchange': {
    id: 'economy-stock-exchange',
    localPath: '/assets/interface-library/economy/economy-stock-exchange.webp',
    webp800Path:
      '/assets/interface-library/economy/economy-stock-exchange-800.webp',
    classification: 'interface_editorial_photography',
    isDocumentaryEvidence: false,
    domain: 'economy',
    subjectCategory: 'financial_institutions',
    orientation: 'portrait',
    naturalWidth: 1067,
    naturalHeight: 1600,
    fileSizeBytes: 310984,
    webp800Bytes: 91324,
    objectPosition: '50% 45%',
    intendedRoles: ['desk_spine', 'dossier_portrait'],
    title: 'New york stock exchange building facade with columns',
    creator: 'Maxim Klimashin',
    creatorProfileUrl: 'https://unsplash.com/@maxim_klimashin',
    sourcePageUrl:
      'https://unsplash.com/photos/new-york-stock-exchange-building-facade-with-columns-1QSXCd0LHVs',
    licenseName: 'Unsplash License',
    licenseUrl: UNSPLASH_LICENSE_URL,
    verifiedDate: '2026-11-27',
    intendedUsage:
      'Economic Outlook vertical institutional spine and capital-markets dossier openings.',
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

  'economy-central-bank': {
    id: 'economy-central-bank',
    localPath: '/assets/interface-library/economy/economy-central-bank.webp',
    webp800Path:
      '/assets/interface-library/economy/economy-central-bank-800.webp',
    classification: 'interface_editorial_photography',
    isDocumentaryEvidence: false,
    domain: 'economy',
    subjectCategory: 'central_bank',
    orientation: 'portrait',
    naturalWidth: 1024,
    naturalHeight: 1600,
    fileSizeBytes: 232724,
    webp800Bytes: 50726,
    objectPosition: '50% 34%',
    intendedRoles: ['desk_spine', 'dossier_portrait'],
    title: 'European Central Bank - Frankfurt - Germany - March 8th 2026',
    creator: 'Norbert Nagel',
    creatorProfileUrl: null,
    sourcePageUrl:
      'https://commons.wikimedia.org/wiki/File:European_Central_Bank_-_Frankfurt_-_Germany_-_March_8th_2026.jpg',
    licenseName: 'CC BY-SA 4.0',
    licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0',
    verifiedDate: '2026-11-28',
    intendedUsage:
      'Central-bank monetary policy, interest-rate decisions, inflation, and sovereign bond dossiers.',
    altEn:
      'Glass twin-tower headquarters of the European Central Bank rising above the Main riverfront in Frankfurt under a crisp blue sky',
    altZh: '法兰克福美因河畔矗立于晴空下的欧洲中央银行双子玻璃塔楼总部',
    captionEn:
      'European Central Bank headquarters towers along the Frankfurt riverfront.',
    captionZh: '法兰克福美因河畔的欧洲中央银行总部建筑群。',
    editorialContextNoteEn:
      'Editorial context photograph · Architectural exterior of the ECB headquarters, not documentation of a specific policy announcement.',
    editorialContextNoteZh:
      '编务语境摄影 · 欧洲央行总部建筑外景，不代表本期具体利率决议或货币政策发布会现场。',
  },

  'economy-financial-district': {
    id: 'economy-financial-district',
    localPath: '/assets/interface-library/economy/economy-financial-district.webp',
    webp800Path:
      '/assets/interface-library/economy/economy-financial-district-800.webp',
    classification: 'interface_editorial_photography',
    isDocumentaryEvidence: false,
    domain: 'economy',
    subjectCategory: 'financial_district',
    orientation: 'landscape',
    naturalWidth: 1600,
    naturalHeight: 900,
    fileSizeBytes: 596292,
    webp800Bytes: 138650,
    objectPosition: '50% 48%',
    intendedRoles: ['desk_panorama', 'dossier_opener'],
    title: 'Frankfurt am Main, Central business district (2024)',
    creator: 'Dr. Thomas Liptak',
    creatorProfileUrl: null,
    sourcePageUrl:
      'https://commons.wikimedia.org/wiki/File:Frankfurt_am_Main,_Central_business_district_(2024).jpg',
    licenseName: 'CC BY-SA 4.0',
    licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0',
    verifiedDate: '2026-11-28',
    intendedUsage:
      'Banking clusters, corporate finance, credit markets, and urban financial districts.',
    altEn:
      'Elevated daylight view across Frankfurt’s central banking district towers surrounded by low-rise commercial blocks',
    altZh: '俯拍阳光下的法兰克福中央金融区高层银行大厦与周边商业街区',
    captionEn:
      'Elevated view across Frankfurt’s central banking and financial district.',
    captionZh: '俯瞰欧洲重要金融中心法兰克福中央商务区高楼群。',
    editorialContextNoteEn:
      'Editorial context photograph · Generic financial-district aerial view, not tied to a specific institution or market session.',
    editorialContextNoteZh:
      '编务语境摄影 · 通用国际金融区航拍语境，不代表特定金融机构或交易时段现场。',
  },

  'economy-manufacturing-factory': {
    id: 'economy-manufacturing-factory',
    localPath:
      '/assets/interface-library/economy/economy-manufacturing-factory.webp',
    webp800Path:
      '/assets/interface-library/economy/economy-manufacturing-factory-800.webp',
    classification: 'interface_editorial_photography',
    isDocumentaryEvidence: false,
    domain: 'economy',
    subjectCategory: 'manufacturing_factory',
    orientation: 'landscape',
    naturalWidth: 1600,
    naturalHeight: 1067,
    fileSizeBytes: 300530,
    webp800Bytes: 80656,
    objectPosition: '50% 50%',
    intendedRoles: ['desk_companion', 'dossier_opener'],
    title: 'Car factory assembly line - Gliwice, Poland',
    creator: 'Marek Ślusarczyk',
    creatorProfileUrl: null,
    sourcePageUrl:
      'https://commons.wikimedia.org/wiki/File:001_Car_factory_assembly_line_-_Opel_factory_in_Gliwice,_Poland.jpg',
    licenseName: 'CC BY 3.0',
    licenseUrl: 'https://creativecommons.org/licenses/by/3.0',
    verifiedDate: '2026-11-28',
    intendedUsage:
      'Industrial output, automotive/EV policy, PMI trends, and factory labor economics.',
    altEn:
      'Vehicles moving along an illuminated modern automotive final-assembly production line',
    altZh: '灯火通明的现代化汽车总装车间生产线上依次推进的车身',
    captionEn:
      'Modern automotive final-assembly production line (Gliwice, Poland).',
    captionZh: '现代化汽车总装生产线与工业制造现场（摄于波兰）。',
    editorialContextNoteEn:
      'Editorial context photograph · Archival European auto assembly line, not documentation of any cited automaker.',
    editorialContextNoteZh:
      '编务语境摄影 · 欧洲汽车制造厂档案照，并非报道中任何特定车企或关税事件的现场。',
  },

  'economy-global-trade': {
    id: 'economy-global-trade',
    localPath: '/assets/interface-library/economy/economy-global-trade.webp',
    webp800Path:
      '/assets/interface-library/economy/economy-global-trade-800.webp',
    classification: 'interface_editorial_photography',
    isDocumentaryEvidence: false,
    domain: 'economy',
    subjectCategory: 'global_trade',
    orientation: 'portrait',
    naturalWidth: 1067,
    naturalHeight: 1600,
    fileSizeBytes: 426262,
    webp800Bytes: 109134,
    objectPosition: '50% 45%',
    intendedRoles: ['desk_spine', 'dossier_portrait'],
    title: 'Train loaded with containers bound for Hamburg harbour',
    creator: 'Virtual-Pano',
    creatorProfileUrl: null,
    sourcePageUrl:
      'https://commons.wikimedia.org/wiki/File:00423_Train_loaded_with_containers_bound_for_Hamburg_harbour.jpg',
    licenseName: 'CC BY 4.0',
    licenseUrl: 'https://creativecommons.org/licenses/by/4.0',
    verifiedDate: '2026-11-28',
    intendedUsage:
      'Tariffs, cross-border freight rail, export volumes, and global trade flows.',
    altEn:
      'High-angle perspective of an intermodal freight train carrying colorful shipping containers curving along parallel rail tracks',
    altZh: '高角度俯拍满载彩色标准集装箱的铁路货运专列沿铁轨蜿蜒前行',
    captionEn:
      'Intermodal container freight rail corridor bound for maritime export terminals.',
    captionZh: '驶向海运枢纽的多式联运集装箱铁路货运通道。',
    editorialContextNoteEn:
      'Editorial context photograph · Generic freight rail logistics imagery, not tied to a specific tariff or trade shipment.',
    editorialContextNoteZh:
      '编务语境摄影 · 通用铁路货运物流语境，非特定关税或贸易争端中的具体货物实拍。',
  },

  'economy-energy-infrastructure': {
    id: 'economy-energy-infrastructure',
    localPath:
      '/assets/interface-library/economy/economy-energy-infrastructure.webp',
    webp800Path:
      '/assets/interface-library/economy/economy-energy-infrastructure-800.webp',
    classification: 'interface_editorial_photography',
    isDocumentaryEvidence: false,
    domain: 'economy',
    subjectCategory: 'energy_infrastructure',
    orientation: 'landscape',
    naturalWidth: 1600,
    naturalHeight: 913,
    fileSizeBytes: 334352,
    webp800Bytes: 69042,
    objectPosition: '50% 56%',
    intendedRoles: ['documentary_break', 'desk_companion', 'dossier_opener'],
    title: 'PS20 & PS10 solar power plants',
    creator: 'kallerna',
    creatorProfileUrl: null,
    sourcePageUrl:
      'https://commons.wikimedia.org/wiki/File:PS20_%26_PS10_solar_power_plants.jpg',
    licenseName: 'CC BY-SA 4.0',
    licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0',
    verifiedDate: '2026-11-28',
    intendedUsage:
      'Energy transition, grid power generation, oil/gas/renewables macro economics.',
    altEn:
      'Aerial view of concentric heliostat mirror arrays surrounding two tall white concentrated solar power towers across sunlit fields',
    altZh: '航拍两座高耸光热发电塔与环绕其四周的同心定日镜阵列',
    captionEn:
      'Concentrated solar power towers and concentric heliostat fields (Andalusia).',
    captionZh: '大型塔式光热发电站与同心定日镜能源基础设施（摄于西班牙）。',
    editorialContextNoteEn:
      'Editorial context photograph · Archival solar power facility in Spain, not documentation of a specific grid event.',
    editorialContextNoteZh:
      '编务语境摄影 · 西班牙光热电站档案航拍，非报道中特定能源项目或电网事件现场。',
  },

  'economy-commodity-production': {
    id: 'economy-commodity-production',
    localPath:
      '/assets/interface-library/economy/economy-commodity-production.webp',
    webp800Path:
      '/assets/interface-library/economy/economy-commodity-production-800.webp',
    classification: 'interface_editorial_photography',
    isDocumentaryEvidence: false,
    domain: 'economy',
    subjectCategory: 'commodity_production',
    orientation: 'landscape',
    naturalWidth: 1600,
    naturalHeight: 798,
    fileSizeBytes: 375510,
    webp800Bytes: 75304,
    objectPosition: '50% 54%',
    intendedRoles: ['desk_panorama', 'desk_companion', 'dossier_opener'],
    title: 'Mina de Chuquicamata, Calama, Chile, 2016-02-01, DD 110-112 PAN',
    creator: 'Diego Delso',
    creatorProfileUrl: null,
    sourcePageUrl:
      'https://commons.wikimedia.org/wiki/File:Mina_de_Chuquicamata,_Calama,_Chile,_2016-02-01,_DD_110-112_PAN.JPG',
    licenseName: 'CC BY-SA 4.0',
    licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0',
    verifiedDate: '2026-11-28',
    intendedUsage:
      'Critical minerals, copper/lithium extraction, commodity cycles, and raw-material supply.',
    altEn:
      'Wide panoramic view of vast terraced earthen benches descending into the open-pit Chuquicamata copper mine in northern Chile',
    altZh: '全景呈现智利北部丘基卡马塔露天铜矿层层深入的宏大阶梯矿坑',
    captionEn:
      'Terraced open-pit copper extraction at Chuquicamata (northern Chile).',
    captionZh: '智利丘基卡马塔露天铜矿阶梯矿层与大宗商品开采语境。',
    editorialContextNoteEn:
      'Editorial context photograph · Archival mining panorama, not documentation of any specific resource deal or strike.',
    editorialContextNoteZh:
      '编务语境摄影 · 大宗商品开采档案全景，不代表具体矿业交易或停产事件现场。',
  },

  'economy-retail-consumption': {
    id: 'economy-retail-consumption',
    localPath: '/assets/interface-library/economy/economy-retail-consumption.webp',
    webp800Path:
      '/assets/interface-library/economy/economy-retail-consumption-800.webp',
    classification: 'interface_editorial_photography',
    isDocumentaryEvidence: false,
    domain: 'economy',
    subjectCategory: 'retail_consumption',
    orientation: 'portrait',
    naturalWidth: 1214,
    naturalHeight: 1600,
    fileSizeBytes: 437004,
    webp800Bytes: 105906,
    objectPosition: '50% 52%',
    intendedRoles: ['desk_spine', 'dossier_portrait'],
    title: 'Galleria Vittorio Emanuele II Milan',
    creator: 'Jakub Hałun',
    creatorProfileUrl: null,
    sourcePageUrl:
      'https://commons.wikimedia.org/wiki/File:20110724_Galleria_Vittorio_Emanuele_II_Milan_5410.jpg',
    licenseName: 'CC BY-SA 4.0',
    licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0',
    verifiedDate: '2026-11-28',
    intendedUsage:
      'Household demand, retail sales, consumer confidence, and urban commercial life.',
    altEn:
      'Pedestrians gathering before the arched glass-and-stone retail arcade of Galleria Vittorio Emanuele II in Milan',
    altZh: '行人与消费者穿行于米兰埃马努埃莱二世拱廊商业入口广场',
    captionEn:
      'Urban commercial arcade and everyday pedestrian retail life (Milan).',
    captionZh: '欧洲都市商业拱廊与日常消费活动场景（摄于米兰）。',
    editorialContextNoteEn:
      'Editorial context photograph · Generic urban retail architecture, not documentation of a specific consumer report.',
    editorialContextNoteZh:
      '编务语境摄影 · 通用城市零售与消费场景，非特定消费数据或商业事件现场。',
  },

  'economy-supply-chain': {
    id: 'economy-supply-chain',
    localPath: '/assets/interface-library/economy/economy-supply-chain.webp',
    webp800Path:
      '/assets/interface-library/economy/economy-supply-chain-800.webp',
    classification: 'interface_editorial_photography',
    isDocumentaryEvidence: false,
    domain: 'economy',
    subjectCategory: 'supply_chain',
    orientation: 'landscape',
    naturalWidth: 1600,
    naturalHeight: 1200,
    fileSizeBytes: 404576,
    webp800Bytes: 93854,
    objectPosition: '50% 62%',
    intendedRoles: ['desk_companion', 'dossier_opener'],
    title: 'Factory steel coil inventory',
    creator: 'Shandong Mingtong Metal Manufacturing',
    creatorProfileUrl: null,
    sourcePageUrl:
      'https://commons.wikimedia.org/wiki/File:Factory_steel_coil_inventory.jpg',
    licenseName: 'CC BY-SA 4.0',
    licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0',
    verifiedDate: '2026-11-28',
    intendedUsage:
      'Industrial supply chains, steel/metals tariffs, warehousing, and inventory cycles.',
    altEn:
      'Rows of heavy rolled steel coils stacked neatly inside an industrial metalworking warehouse',
    altZh: '大型工业仓库内整齐码放的成排大型冷轧钢卷库存',
    captionEn:
      'Rolled industrial steel coil inventory inside a metalworking warehouse.',
    captionZh: '工业仓储内的成排大型钢卷库存与上游产业链语境。',
    editorialContextNoteEn:
      'Editorial context photograph · Generic industrial inventory photo, not tied to a named manufacturer or tariff order.',
    editorialContextNoteZh:
      '编务语境摄影 · 通用工业仓储与供应链语境，不代表特定企业库存或贸易制裁对象。',
  },

  'economy-infrastructure-investment': {
    id: 'economy-infrastructure-investment',
    localPath:
      '/assets/interface-library/economy/economy-infrastructure-investment.webp',
    webp800Path:
      '/assets/interface-library/economy/economy-infrastructure-investment-800.webp',
    classification: 'interface_editorial_photography',
    isDocumentaryEvidence: false,
    domain: 'economy',
    subjectCategory: 'infrastructure_investment',
    orientation: 'portrait',
    naturalWidth: 1067,
    naturalHeight: 1600,
    fileSizeBytes: 405992,
    webp800Bytes: 94980,
    objectPosition: '50% 44%',
    intendedRoles: ['desk_spine', 'dossier_portrait'],
    title: 'Hoover Dam, Nevada (Arizona, USA) -- 2012 -- 6130',
    creator: 'Dietmar Rabich',
    creatorProfileUrl: null,
    sourcePageUrl:
      'https://commons.wikimedia.org/wiki/File:Hoover_Dam,_Nevada_(Arizona,_USA)_--_2012_--_6130.jpg',
    licenseName: 'CC BY-SA 4.0',
    licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0',
    verifiedDate: '2026-11-28',
    intendedUsage:
      'Public capital expenditure, civil infrastructure investment, water/power grids, and fiscal stimulus.',
    altEn:
      'Concrete hydroelectric intake tower and angled high-voltage transmission pylons anchored into canyon rock at Hoover Dam',
    altZh: '胡佛大坝峡谷岩壁上的混凝土水利进水塔与高压输电铁塔基础设施',
    captionEn:
      'Large-scale hydroelectric and power-transmission civil infrastructure (Hoover Dam).',
    captionZh: '大型水利发电与高压输电基础设施工程（胡佛大坝）。',
    editorialContextNoteEn:
      'Editorial context photograph · Archival US civil-infrastructure photo, not documentation of a cited public works project.',
    editorialContextNoteZh:
      '编务语境摄影 · 大型水利与电网基建档案照，非本期具体财政投资或基建项目实拍。',
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
 * Verifies that an asset path strictly points to the local domain-organized WebP library
 * and never hotlinks an external image host.
 */
export function isLocalInterfaceLibraryPath(path: string): boolean {
  return /^\/assets\/interface-library\/(world|ai|economy)\/[a-z0-9-]+\.webp$/.test(
    path
  );
}

// =============================================================================
// STORY-SPECIFIC ART DIRECTION MATCHING (ALL 30 CURATED PHOTOGRAPHS)
// =============================================================================

interface PhotoTopicRule {
  photoId: InterfacePhotoId;
  pattern: RegExp;
}

const WORLD_PHOTO_RULES: readonly PhotoTopicRule[] = [
  {
    photoId: 'world-maritime-port',
    pattern:
      /\b(port|harbor|harbour|container|shipping|freight|cargo|maritime|vessel|tanker|red[- ]?sea)\b|(港口|集装箱|航运|海运|油轮|货轮|红海)/i,
  },
  {
    photoId: 'world-global-transport',
    pattern:
      /\b(canal|panama|suez|locks|aviation|corridor|logistics|transit)\b|(运河|巴拿马|苏伊士|物流|航道|通道)/i,
  },
  {
    photoId: 'world-coastline-geography',
    pattern:
      /\b(strait|hormuz|bosphorus|taiwan[- ]?strait|border|coast|sea[- ]?lane|island|territor|arctic)\b|(海峡|霍尔木兹|博斯普鲁斯|边境|海岸|海域|领土|北极)/i,
  },
  {
    photoId: 'world-international-assembly',
    pattern:
      /\b(un[- ]?general|security[- ]?council|united[- ]?nations|summit|g7|g20|asean|brics|multilateral|ceasefire[- ]?talks|peace[- ]?talks)\b|(联合国|安理会|峰会|多边|停火谈判|和平谈判|七国集团|二十国集团)/i,
  },
  {
    photoId: 'world-public-space',
    pattern:
      /\b(parliament|congress|senate|election|ballot|referendum|eu|european[- ]?union|legislation|court|constitutional|antitrust)\b|(议会|国会|大选|选举|公投|欧盟|欧洲议会|立法|法院|宪政)/i,
  },
  {
    photoId: 'world-diplomatic-institution',
    pattern:
      /\b(diploma|treaty|sanction|nato|alliance|envoy|foreign[- ]?minister|embassy|accord)\b|(外交|条约|制裁|北约|盟友|外长|特使|协议)/i,
  },
  {
    photoId: 'world-earth-observation',
    pattern:
      /\b(satellite|orbit|space|climate|emissions|wildfire|hurricane|typhoon|earthquake|global[- ]?warming)\b|(卫星|轨道|太空|气候|碳排放|地震|台风|山火)/i,
  },
  {
    photoId: 'world-urban-infrastructure',
    pattern:
      /\b(bridge|rail|highway|metro|grid|infrastructure|coastal)\b|(桥梁|铁路|公路|基建|基础设施)/i,
  },
  {
    photoId: 'world-human-environment',
    pattern:
      /\b(migration|refugee|commuter|public[- ]?health|strike|protest|citizen|housing|demographic|humanitarian)\b|(移民|难民|公共卫生|罢工|民生|人口|人道)/i,
  },
  {
    photoId: 'world-city-aerial',
    pattern:
      /\b(city|capital|metropolitan|urban|governance|municipal|policy|budget)\b|(首都|城市|都市|治理|政策|预算)/i,
  },
];

const AI_PHOTO_RULES: readonly PhotoTopicRule[] = [
  {
    photoId: 'ai-silicon-wafer',
    pattern:
      /\b(wafer|lithography|euv|asml|foundry|tsmc|silicon|fab|export[- ]?control)\b|(晶圆|光刻|台积电|阿斯麦|代工|硅片|出口管制)/i,
  },
  {
    photoId: 'ai-chip-architecture',
    pattern:
      /\b(chip|chips|semiconductor|gpu|tpu|blackwell|nvidia|amd|npu|accelerator|microprocessor|die|asic)\b|(芯片|半导体|英伟达|算力芯片|处理器|加速器)/i,
  },
  {
    photoId: 'ai-supercomputer-hall',
    pattern:
      /\b(supercomputer|training[- ]?cluster|hyperscaler|gigawatt|exaflop|compute[- ]?cluster|stargate)\b|(超算|超级计算|训练集群|智算中心|万卡)/i,
  },
  {
    photoId: 'ai-data-center',
    pattern:
      /\b(data[- ]?center|server|rack|cloud|infrastructure|compute|capex|power[- ]?grid)\b|(数据中心|服务器|机柜|云计算|算力|基础设施)/i,
  },
  {
    photoId: 'ai-robotics-automation',
    pattern:
      /\b(robot|robotics|humanoid|embodied|autonomous[- ]?vehicle|drone|automation|actuator)\b|(机器人|具身智能|自动驾驶|无人机|自动化|机械臂)/i,
  },
  {
    photoId: 'ai-optics-photonics',
    pattern:
      /\b(photonic|optical|laser|quantum|interconnect|co-packaged)\b|(光子|光学|激光|量子|光互联)/i,
  },
  {
    photoId: 'ai-scientific-instrument',
    pattern:
      /\b(biotech|protein|drug[- ]?discovery|microscope|biology|chemistry|scientific[- ]?ai|alphafold|material[- ]?discovery)\b|(生物|蛋白质|制药|显微镜|科研|科学发现)/i,
  },
  {
    photoId: 'ai-engineering-workspace',
    pattern:
      /\b(space|orbital[- ]?compute|satellite|aerospace|cleanroom|engineering|hardware[- ]?team)\b|(太空|轨道计算|航天|洁净室|工程总装)/i,
  },
  {
    photoId: 'ai-advanced-materials',
    pattern:
      /\b(battery|graphene|composite|carbon|superconductor|material|substrate|packaging)\b|(材料|电池|石墨烯|超导|先进封装|基板)/i,
  },
  {
    photoId: 'ai-research-laboratory',
    pattern:
      /\b(research|benchmark|model|reasoning|safety|alignment|evaluation|open[- ]?weight|llm|agent|frontier)\b|(研究|大模型|推理|安全|对齐|基准|开源|智能体|前沿模型)/i,
  },
];

const ECONOMY_PHOTO_RULES: readonly PhotoTopicRule[] = [
  {
    photoId: 'economy-central-bank',
    pattern:
      /\b(central[- ]?bank|federal[- ]?reserve|fed\b|ecb|boj|pboc|boe|interest[- ]?rate|rate[- ]?cut|rate[- ]?hike|monetary|inflation|cpi|pce)\b|(央行|美联储|欧央行|日本央行|利率|降息|加息|通胀|货币政策)/i,
  },
  {
    photoId: 'economy-stock-exchange',
    pattern:
      /\b(stock|equit|dow|nasdaq|s&p|nyse|exchange|ipo|earnings|rally|sell[- ]?off|wall[- ]?street|nikkei|hang[- ]?seng)\b|(股市|美股|亚太股市|道指|纳指|标普|恒生|日经|交易所|财报)/i,
  },
  {
    photoId: 'economy-financial-district',
    pattern:
      /\b(bank|banking|credit|bond|yield|treasury|sovereign[- ]?debt|currency|fx|private[- ]?equity|hedge[- ]?fund|liquidity|finance|fiscal)\b|(银行|信贷|国债|收益率|主权债务|汇率|金融|财政)/i,
  },
  {
    photoId: 'economy-energy-infrastructure',
    pattern:
      /\b(energy|oil|crude|gas|lng|opec|solar|wind|nuclear|electricity|power|grid|renewable|carbon)\b|(能源|原油|石油|天然气|光伏|风电|核电|电力|电网|新能源)/i,
  },
  {
    photoId: 'economy-commodity-production',
    pattern:
      /\b(copper|lithium|gold|silver|rare[- ]?earth|mining|mine|metal|commodity|ore|grain|wheat)\b|(铜|锂|黄金|稀土|矿产|矿业|大宗商品|金属|粮食)/i,
  },
  {
    photoId: 'economy-manufacturing-factory',
    pattern:
      /\b(factory|manufacturing|auto|ev\b|electric[- ]?vehicle|pmi|industrial[- ]?output|production|plant)\b|(工厂|制造|汽车|电动车|工业产出|产能|生产线)/i,
  },
  {
    photoId: 'economy-global-trade',
    pattern:
      /\b(tariff|trade|export|import|customs|freight|wto|container|logistics|shipping)\b|(关税|贸易|出口|进口|海关|货运|集装箱|外贸)/i,
  },
  {
    photoId: 'economy-supply-chain',
    pattern:
      /\b(supply[- ]?chain|steel|aluminum|aluminium|inventory|warehouse|procurement|reshoring)\b|(供应链|钢铁|铝|库存|仓储|产业链)/i,
  },
  {
    photoId: 'economy-retail-consumption',
    pattern:
      /\b(retail|consumer|spending|household|wage|labor|labour|employment|jobs|housing|mortgage|real[- ]?estate)\b|(零售|消费|居民|就业|薪资|通胀压力|房地产|楼市|按揭)/i,
  },
  {
    photoId: 'economy-infrastructure-investment',
    pattern:
      /\b(infrastructure|stimulus|capex|investment|public[- ]?works|debt[- ]?ceiling|budget|gdp)\b|(基建|投资|资本支出|财政刺激|预算|GDP)/i,
  },
];

function rulesForDomain(domain: SignalDomain): readonly PhotoTopicRule[] {
  if (domain === 'ai') return AI_PHOTO_RULES;
  if (domain === 'economy') return ECONOMY_PHOTO_RULES;
  return WORLD_PHOTO_RULES;
}

/**
 * Selectively pairs an Expanded dossier with a non-documentary local interface
 * photograph ONLY when:
 * 1. The signal has NO approved documentary/verified `media_assets` (verified
 *    evidence always takes exclusive precedence in `StoryVisual`), AND
 * 2. The signal is high-priority (`importance >= 4`) and clearly aligns with
 *    one of our 30 curated editorial photographic themes.
 *
 * Returns `null` when a signal should stay on `StoryVisual` (original editorial
 * illustration or typographic cover plate), preserving visual variety.
 */
export function selectEditorialPhotoForDossier(
  signal: ParsedSignal,
  options: { excludePhotoIds?: ReadonlySet<string> | readonly string[] } = {}
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

  const excluded = new Set(options.excludePhotoIds ?? []);
  const combinedText = [
    signal.topic,
    signal.headline,
    ...signal.tags,
  ]
    .filter(Boolean)
    .join(' ');

  // Pass 1: Domain-native subject rules (highest precision)
  for (const rule of rulesForDomain(signal.domain)) {
    if (!excluded.has(rule.photoId) && rule.pattern.test(combinedText)) {
      return INTERFACE_IMAGE_LIBRARY[rule.photoId];
    }
  }

  // Pass 2: Selective cross-domain resonance (e.g., semiconductor tariffs in Economy,
  // or maritime chokepoints in Economy)
  if (signal.domain === 'economy') {
    for (const crossId of [
      'ai-silicon-wafer',
      'world-maritime-port',
    ] as const) {
      const rule = [...AI_PHOTO_RULES, ...WORLD_PHOTO_RULES].find(
        (r) => r.photoId === crossId
      );
      if (rule && !excluded.has(crossId) && rule.pattern.test(combinedText)) {
        return INTERFACE_IMAGE_LIBRARY[crossId];
      }
    }
  }

  return null;
}

/**
 * Selects a curated, content-responsive set of non-repeating local editorial photos
 * for each of the three distinct domain desks on the Briefing front page.
 */
export function selectDeskPhotoSet(
  domain: SignalDomain,
  domainSignals: readonly ParsedSignal[],
  excludeIds: ReadonlySet<string> | readonly string[] = []
): {
  primary: InterfacePhotoAsset;
  secondary: InterfacePhotoAsset;
  tertiary: InterfacePhotoAsset;
} {
  const excluded = new Set(excludeIds);
  const combinedText = domainSignals
    .slice(0, 4)
    .map((s) => `${s.topic} ${s.headline} ${s.tags.join(' ')}`)
    .join(' ');

  const pickFirst = (
    preferred: readonly InterfacePhotoId[],
    fallbackPool: readonly InterfacePhotoId[]
  ): InterfacePhotoAsset => {
    for (const id of preferred) {
      if (!excluded.has(id)) {
        excluded.add(id);
        return INTERFACE_IMAGE_LIBRARY[id];
      }
    }
    for (const id of fallbackPool) {
      if (!excluded.has(id)) {
        excluded.add(id);
        return INTERFACE_IMAGE_LIBRARY[id];
      }
    }
    return INTERFACE_IMAGE_LIBRARY[fallbackPool[0]];
  };

  if (domain === 'world') {
    const matchedLandscape = WORLD_PHOTO_RULES.filter((r) =>
      r.pattern.test(combinedText)
    ).map((r) => r.photoId);

    const primary = pickFirst(
      [
        ...matchedLandscape.filter((id) =>
          [
            'world-city-aerial',
            'world-coastline-geography',
            'world-diplomatic-institution',
            'world-public-space',
            'world-earth-observation',
          ].includes(id)
        ),
        'world-city-aerial',
      ],
      [
        'world-city-aerial',
        'world-coastline-geography',
        'world-diplomatic-institution',
        'world-public-space',
      ]
    );

    const secondary = pickFirst(
      [
        ...matchedLandscape,
        'world-maritime-port',
        'world-international-assembly',
      ],
      [
        'world-maritime-port',
        'world-international-assembly',
        'world-global-transport',
        'world-urban-infrastructure',
      ]
    );

    const tertiary = pickFirst(
      [
        'world-international-assembly',
        'world-human-environment',
        'world-diplomatic-institution',
        'world-urban-infrastructure',
      ],
      [
        'world-diplomatic-institution',
        'world-human-environment',
        'world-global-transport',
        'world-earth-observation',
      ]
    );

    return { primary, secondary, tertiary };
  }

  if (domain === 'ai') {
    const matchedAi = AI_PHOTO_RULES.filter((r) =>
      r.pattern.test(combinedText)
    ).map((r) => r.photoId);

    // Primary for AI desk is a tall vertical spine (portrait)
    const primary = pickFirst(
      [
        ...matchedAi.filter(
          (id) => INTERFACE_IMAGE_LIBRARY[id].orientation === 'portrait'
        ),
        'ai-data-center',
        'ai-chip-architecture',
      ],
      ['ai-data-center', 'ai-chip-architecture']
    );

    // Secondary is a crisp landscape macro/technical plate
    const secondary = pickFirst(
      [
        ...matchedAi.filter(
          (id) => INTERFACE_IMAGE_LIBRARY[id].orientation === 'landscape'
        ),
        'ai-silicon-wafer',
        'ai-supercomputer-hall',
      ],
      [
        'ai-silicon-wafer',
        'ai-supercomputer-hall',
        'ai-optics-photonics',
        'ai-robotics-automation',
      ]
    );

    // Tertiary is a complementary lab/engineering/robotics photograph
    const tertiary = pickFirst(
      [
        'ai-engineering-workspace',
        'ai-optics-photonics',
        'ai-robotics-automation',
        'ai-research-laboratory',
        'ai-scientific-instrument',
      ],
      [
        'ai-engineering-workspace',
        'ai-research-laboratory',
        'ai-optics-photonics',
        'ai-advanced-materials',
      ]
    );

    return { primary, secondary, tertiary };
  }

  // Economic Outlook
  const matchedEcon = ECONOMY_PHOTO_RULES.filter((r) =>
    r.pattern.test(combinedText)
  ).map((r) => r.photoId);

  // Primary for Economy desk is a commanding portrait institutional spine
  const primary = pickFirst(
    [
      ...matchedEcon.filter((id) =>
        [
          'economy-central-bank',
          'economy-stock-exchange',
          'economy-global-trade',
          'economy-retail-consumption',
        ].includes(id)
      ),
      'economy-stock-exchange',
      'economy-central-bank',
    ],
    [
      'economy-stock-exchange',
      'economy-central-bank',
      'economy-global-trade',
      'economy-retail-consumption',
    ]
  );

  // Secondary is a real-economy industrial / energy / commodity landscape plate
  const secondary = pickFirst(
    [
      ...matchedEcon.filter(
        (id) => INTERFACE_IMAGE_LIBRARY[id].orientation === 'landscape'
      ),
      'economy-energy-infrastructure',
      'economy-manufacturing-factory',
      'economy-commodity-production',
    ],
    [
      'economy-energy-infrastructure',
      'economy-manufacturing-factory',
      'economy-supply-chain',
      'economy-financial-district',
    ]
  );

  // Tertiary is a contrasting trade / supply chain / district companion
  const tertiary = pickFirst(
    [
      'economy-commodity-production',
      'economy-supply-chain',
      'economy-financial-district',
      'economy-manufacturing-factory',
    ],
    [
      'economy-supply-chain',
      'economy-financial-district',
      'economy-commodity-production',
      'economy-energy-infrastructure',
    ]
  );

  return { primary, secondary, tertiary };
}
