import type {
  ParsedSignal,
  SignalDomain,
  SignalMediaAsset,
} from '../../types/edition';

export type EditorialAssetId =
  | 'conflict_maritime_plate'
  | 'diplomacy_summit_plate'
  | 'elections_governance_plate'
  | 'climate_humanitarian_plate'
  | 'ai_models_research_plate'
  | 'chips_compute_plate'
  | 'ai_safety_cyber_plate'
  | 'trade_fiscal_plate'
  | 'monetary_markets_plate';

export type EditorialSubjectCategory =
  | 'conflict_maritime'
  | 'diplomacy_summit'
  | 'elections_governance'
  | 'climate_humanitarian'
  | 'ai_models_research'
  | 'chips_compute'
  | 'ai_safety_cyber'
  | 'trade_fiscal'
  | 'monetary_markets';

export type StoryVisualMode =
  | 'verified_media'
  | 'editorial_illustration'
  | 'verified_documentary'
  | 'grounded_visual'
  | 'typographic_cover';

export type VisualMatchStrength = 'strong' | 'moderate' | 'fallback';

export type VisualSlotContext = 'hero' | 'secondary' | 'desk' | 'dossier';

export interface EditorialAsset {
  id: EditorialAssetId;
  subjectCategory: EditorialSubjectCategory;
  applicableDomains: SignalDomain[];
  aspectRatios: Array<'16:10' | '16:9' | '4:3' | '21:9'>;
  classification: 'original_editorial_illustration';
  lightSuitability: 'high' | 'medium';
  darkSuitability: 'high' | 'medium';
  subjectLabelEn: string;
  subjectLabelZh: string;
  altEn: string;
  altZh: string;
  creditEn: string;
  creditZh: string;
  usageGuidance: string;
}

export interface VerifiedDocumentaryMedia {
  src: string;
  alt: string;
  caption: string;
  credit: string;
  sourceUrl?: string;
}

export interface SubjectClassificationResult {
  category: EditorialSubjectCategory;
  matchStrength: VisualMatchStrength;
  matchedTokens: string[];
}

export interface VisualSelectionOptions {
  context?: VisualSlotContext;
  excludeAssetIds?: ReadonlySet<string> | readonly string[];
  excludeMediaUrls?: ReadonlySet<string> | readonly string[];
  preferredMode?: StoryVisualMode;
  verifiedMedia?: VerifiedDocumentaryMedia | null;
}

export interface VisualSelectionResult {
  mode: StoryVisualMode;
  asset: EditorialAsset | null;
  selectedMedia: SignalMediaAsset | null;
  fallbackAsset: EditorialAsset | null;
  subjectCategory: EditorialSubjectCategory;
  matchStrength: VisualMatchStrength;
  subjectLabelEn: string;
  subjectLabelZh: string;
}

export interface GroundedSignalStats {
  independentOriginsCount: number;
  claimsCount: number;
  sourcesCount: number;
  confirmedClaimsCount: number;
  reportedClaimsCount: number;
  disputedOrUnverifiedCount: number;
  timelineCount: number;
  timelineSpanLabel: string | null;
  timelinePoints: Array<{ dateLabel: string; summary: string }>;
}

const EDITORIAL_CREDIT_EN =
  'Original Editorial Illustration · Conceptual, non-documentary';
const EDITORIAL_CREDIT_ZH =
  '原创编务版画插图 · 概念性视觉，非现场纪实摄影';

export const EDITORIAL_ASSET_REGISTRY: Record<EditorialAssetId, EditorialAsset> =
  {
    conflict_maritime_plate: {
      id: 'conflict_maritime_plate',
      subjectCategory: 'conflict_maritime',
      applicableDomains: ['world'],
      aspectRatios: ['16:10', '16:9', '4:3', '21:9'],
      classification: 'original_editorial_illustration',
      lightSuitability: 'high',
      darkSuitability: 'high',
      subjectLabelEn: 'Geopolitics & Maritime Security',
      subjectLabelZh: '地缘冲突与航运安全',
      altEn:
        'Original modernist editorial print illustration of arched colonnades, maritime corridors, and meridian lines symbolizing geopolitical conflict and strategic sea lanes',
      altZh:
        '现代主义编务版画插图：古典拱廊、海洋通道与经纬弧线，象征地缘冲突与战略航道',
      creditEn: EDITORIAL_CREDIT_EN,
      creditZh: EDITORIAL_CREDIT_ZH,
      usageGuidance:
        'Use for conflict, maritime chokepoints, defense posture, and strategic security signals.',
    },
    diplomacy_summit_plate: {
      id: 'diplomacy_summit_plate',
      subjectCategory: 'diplomacy_summit',
      applicableDomains: ['world'],
      aspectRatios: ['16:10', '16:9', '4:3', '21:9'],
      classification: 'original_editorial_illustration',
      lightSuitability: 'high',
      darkSuitability: 'high',
      subjectLabelEn: 'Diplomacy & Multilateral Summits',
      subjectLabelZh: '多边外交与国际峰会',
      altEn:
        'Original modernist editorial print illustration of a geometric diplomatic assembly hall overlooking a calm horizon',
      altZh: '现代主义编务版画插图：多边议事几何空间与远方海平线，象征国际外交与峰会',
      creditEn: EDITORIAL_CREDIT_EN,
      creditZh: EDITORIAL_CREDIT_ZH,
      usageGuidance:
        'Use for treaties, ceasefires, summits, alliances, and diplomatic negotiations.',
    },
    elections_governance_plate: {
      id: 'elections_governance_plate',
      subjectCategory: 'elections_governance',
      applicableDomains: ['world', 'economy'],
      aspectRatios: ['16:10', '16:9', '4:3', '21:9'],
      classification: 'original_editorial_illustration',
      lightSuitability: 'high',
      darkSuitability: 'high',
      subjectLabelEn: 'Governance, Law & Elections',
      subjectLabelZh: '宪政选举与法治治理',
      altEn:
        'Original modernist editorial print illustration of tiered parliamentary amphitheater arcs, civic columns, and an abstract balance scale',
      altZh: '现代主义编务版画插图：议会阶梯弧线、石柱廊与天平几何结构，象征选举与法治治理',
      creditEn: EDITORIAL_CREDIT_EN,
      creditZh: EDITORIAL_CREDIT_ZH,
      usageGuidance:
        'Use for elections, parliamentary votes, constitutional courts, legislation, and human rights.',
    },
    climate_humanitarian_plate: {
      id: 'climate_humanitarian_plate',
      subjectCategory: 'climate_humanitarian',
      applicableDomains: ['world', 'economy'],
      aspectRatios: ['16:10', '16:9', '4:3', '21:9'],
      classification: 'original_editorial_illustration',
      lightSuitability: 'high',
      darkSuitability: 'high',
      subjectLabelEn: 'Climate, Energy & Public Safety',
      subjectLabelZh: '气候能源与公共安全',
      altEn:
        'Original modernist editorial print illustration of atmospheric isobar arcs, hydroelectric concrete arches, and layered terrain strata',
      altZh: '现代主义编务版画插图：大气等压弧线、水利拱坝与大地层理，象征气候、能源与公共安全',
      creditEn: EDITORIAL_CREDIT_EN,
      creditZh: EDITORIAL_CREDIT_ZH,
      usageGuidance:
        'Use for climate transitions, energy infrastructure, natural disasters, public health, and humanitarian relief.',
    },
    ai_models_research_plate: {
      id: 'ai_models_research_plate',
      subjectCategory: 'ai_models_research',
      applicableDomains: ['ai'],
      aspectRatios: ['16:10', '16:9', '4:3', '21:9'],
      classification: 'original_editorial_illustration',
      lightSuitability: 'high',
      darkSuitability: 'high',
      subjectLabelEn: 'Frontier Models & Scientific AI',
      subjectLabelZh: '前沿模型与基础研究',
      altEn:
        'Original modernist editorial print illustration of optical glass prisms, geometric axes, and structured drafting planes representing AI research and frontier models',
      altZh: '现代主义编务版画插图：光学棱镜、精密坐标网格与测绘平面，象征人工智能前沿研究',
      creditEn: EDITORIAL_CREDIT_EN,
      creditZh: EDITORIAL_CREDIT_ZH,
      usageGuidance:
        'Use for model releases, scientific breakthroughs, mathematical reasoning, and AI lab research.',
    },
    chips_compute_plate: {
      id: 'chips_compute_plate',
      subjectCategory: 'chips_compute',
      applicableDomains: ['ai', 'economy'],
      aspectRatios: ['16:10', '16:9', '4:3', '21:9'],
      classification: 'original_editorial_illustration',
      lightSuitability: 'high',
      darkSuitability: 'high',
      subjectLabelEn: 'Semiconductors & Compute Infrastructure',
      subjectLabelZh: '半导体与算力基础设施',
      altEn:
        'Original modernist editorial print illustration of isometric silicon wafer lattices, copper busbars, and monolithic compute architecture',
      altZh: '现代主义编务版画插图：等轴晶圆栅格、铜质母线与算力建筑体块，象征半导体与算力基础设施',
      creditEn: EDITORIAL_CREDIT_EN,
      creditZh: EDITORIAL_CREDIT_ZH,
      usageGuidance:
        'Use for semiconductors, AI clusters, data centers, cloud infrastructure, and hardware industry shifts.',
    },
    ai_safety_cyber_plate: {
      id: 'ai_safety_cyber_plate',
      subjectCategory: 'ai_safety_cyber',
      applicableDomains: ['ai', 'world'],
      aspectRatios: ['16:10', '16:9', '4:3', '21:9'],
      classification: 'original_editorial_illustration',
      lightSuitability: 'high',
      darkSuitability: 'high',
      subjectLabelEn: 'AI Safety, Agents & Cyber Defense',
      subjectLabelZh: '人工智能安全、智能体与网络防御',
      altEn:
        'Original modernist editorial print illustration of concentric calibration rings, architectural shields, and geometric logic gates',
      altZh: '现代主义编务版画插图：同心校准环、几何盾牌与逻辑门结构，象征人工智能安全与网络安全',
      creditEn: EDITORIAL_CREDIT_EN,
      creditZh: EDITORIAL_CREDIT_ZH,
      usageGuidance:
        'Use for AI safety, alignment, agentic governance, evaluations, and cyber-conflict/cybersecurity.',
    },
    trade_fiscal_plate: {
      id: 'trade_fiscal_plate',
      subjectCategory: 'trade_fiscal',
      applicableDomains: ['economy'],
      aspectRatios: ['16:10', '16:9', '4:3', '21:9'],
      classification: 'original_editorial_illustration',
      lightSuitability: 'high',
      darkSuitability: 'high',
      subjectLabelEn: 'Global Trade & Industrial Supply Chains',
      subjectLabelZh: '全球贸易与产业链格局',
      altEn:
        'Original modernist editorial print illustration of sculptural columns, freight volumes, and architectural balance representing global trade and industrial policy',
      altZh: '现代主义编务版画插图：贸易柱廊、货运体块与均衡结构，象征全球贸易与产业政策',
      creditEn: EDITORIAL_CREDIT_EN,
      creditZh: EDITORIAL_CREDIT_ZH,
      usageGuidance:
        'Use for tariffs, trade agreements, corporate finance, supply chains, housing, and industrial policy.',
    },
    monetary_markets_plate: {
      id: 'monetary_markets_plate',
      subjectCategory: 'monetary_markets',
      applicableDomains: ['economy'],
      aspectRatios: ['16:10', '16:9', '4:3', '21:9'],
      classification: 'original_editorial_illustration',
      lightSuitability: 'high',
      darkSuitability: 'high',
      subjectLabelEn: 'Central Banks, Rates & Capital Markets',
      subjectLabelZh: '央行政策、通胀与资本市场',
      altEn:
        'Original modernist editorial print illustration of classical bank vault columns, brass pendulums, and concentric equilibrium rings',
      altZh: '现代主义编务版画插图：央行柱式、黄铜摆锤与同心均衡环，象征货币政策与资本市场',
      creditEn: EDITORIAL_CREDIT_EN,
      creditZh: EDITORIAL_CREDIT_ZH,
      usageGuidance:
        'Use for central banks, inflation, sovereign debt, bond yields, currencies, and market policy.',
    },
  };

const CATEGORY_TO_ASSET_ID: Record<EditorialSubjectCategory, EditorialAssetId> = {
  conflict_maritime: 'conflict_maritime_plate',
  diplomacy_summit: 'diplomacy_summit_plate',
  elections_governance: 'elections_governance_plate',
  climate_humanitarian: 'climate_humanitarian_plate',
  ai_models_research: 'ai_models_research_plate',
  chips_compute: 'chips_compute_plate',
  ai_safety_cyber: 'ai_safety_cyber_plate',
  trade_fiscal: 'trade_fiscal_plate',
  monetary_markets: 'monetary_markets_plate',
};

const DOMAIN_FALLBACK_ORDER: Record<SignalDomain, EditorialAssetId[]> = {
  world: [
    'conflict_maritime_plate',
    'diplomacy_summit_plate',
    'elections_governance_plate',
    'climate_humanitarian_plate',
  ],
  ai: [
    'ai_models_research_plate',
    'chips_compute_plate',
    'ai_safety_cyber_plate',
  ],
  economy: [
    'monetary_markets_plate',
    'trade_fiscal_plate',
    'chips_compute_plate',
    'climate_humanitarian_plate',
  ],
};

interface CategoryRule {
  category: EditorialSubjectCategory;
  domains?: SignalDomain[];
  exactTopics: string[];
  tagPatterns: RegExp[];
  headlinePatterns: RegExp[];
}

const SUBJECT_RULES: CategoryRule[] = [
  {
    category: 'ai_safety_cyber',
    exactTopics: [
      'ai-safety',
      'ai_safety',
      'ai_security',
      'ai-security',
      'cybersecurity',
      'cyber-conflict',
      'cyber',
    ],
    tagPatterns: [
      /\b(ai[-_ ]?safety|alignment|guardrail|red[-_ ]?team|cyber|ransomware|espionage|malware|agentic|zero[-_ ]?day)\b/i,
      /(人工智能安全|网络安全|对齐|越狱|漏洞|智能体安全)/,
    ],
    headlinePatterns: [
      /\b(cyberattack|cybersecurity|ai safety|alignment|zero-day|autonomous agent|red-team)\b/i,
      /(网络攻击|网络安全|AI安全|人工智能安全|漏洞)/,
    ],
  },
  {
    category: 'chips_compute',
    exactTopics: [
      'infrastructure',
      'semiconductors',
      'chips',
      'compute',
      'hardware',
      'industry',
    ],
    tagPatterns: [
      /\b(chip|chips|semiconductor|gpu|tpu|foundry|tsmc|nvidia|asml|data[-_ ]?center|compute|orbital[-_ ]?compute|wafer|fab|cloud[-_ ]?infrastructure|capex)\b/i,
      /(芯片|半导体|算力|晶圆|数据中心|光刻|基础设施|英伟达|台积电)/,
    ],
    headlinePatterns: [
      /\b(chip|semiconductor|gpu|data center|foundry|wafer|compute cluster|nvidia|tsmc|asml)\b/i,
      /(芯片|半导体|算力|数据中心|晶圆|光刻机)/,
    ],
  },
  {
    category: 'ai_models_research',
    domains: ['ai'],
    exactTopics: [
      'research',
      'model-capability',
      'research-mathematics',
      'mathematics',
      'developer-tools',
      'foundation-models',
    ],
    tagPatterns: [
      /\b(llm|model|benchmark|reasoning|open[-_ ]?weight|training|multimodal|math|theorem|scientific[-_ ]?ai|developer[-_ ]?tools)\b/i,
      /(大模型|前沿模型|推理|基准测试|开源模型|数学|科研|开发者工具)/,
    ],
    headlinePatterns: [
      /\b(frontier model|reasoning model|benchmark|open-weight|language model|theorem|developer tool)\b/i,
      /(大模型|推理模型|基准|数学证明|开源权重)/,
    ],
  },
  {
    category: 'monetary_markets',
    exactTopics: [
      'central-banks',
      'inflation',
      'markets',
      'market_policy',
      'market-policy',
      'sovereign-debt',
      'macroeconomics',
      'monetary-policy',
    ],
    tagPatterns: [
      /\b(central[-_ ]?bank|fed|ecb|boj|pboc|inflation|cpi|interest[-_ ]?rate|yield|bond|treasury|sovereign[-_ ]?debt|currency|fx|equity|stock[-_ ]?market|liquidity)\b/i,
      /(央行|美联储|通胀|利率|国债|主权债务|汇率|资本市场|股市|货币政策)/,
    ],
    headlinePatterns: [
      /\b(central bank|federal reserve|ecb|inflation|interest rate|bond yield|sovereign debt|currency|markets)\b/i,
      /(央行|美联储|通胀|降息|加息|国债|主权债务|汇市|股市)/,
    ],
  },
  {
    category: 'trade_fiscal',
    exactTopics: [
      'trade',
      'corporate-finance',
      'corporate',
      'consumer',
      'housing',
      'fiscal-policy',
      'supply-chain',
    ],
    tagPatterns: [
      /\b(tariff|trade|export|import|supply[-_ ]?chain|sanction|housing|mortgage|retail|consumer|m&a|earnings|fiscal|budget|tax)\b/i,
      /(关税|贸易|出口|进口|供应链|房地产|消费|财报|并购|财政|税收)/,
    ],
    headlinePatterns: [
      /\b(tariff|trade deal|supply chain|housing|consumer spending|fiscal budget|export control)\b/i,
      /(关税|贸易|供应链|楼市|消费|财政预算|出口管制)/,
    ],
  },
  {
    category: 'elections_governance',
    exactTopics: [
      'elections',
      'justice',
      'human-rights',
      'domestic-politics',
      'domestic-policy',
      'technology-law',
      'governance',
      'regulation',
    ],
    tagPatterns: [
      /\b(election|ballot|parliament|congress|senate|court|supreme[-_ ]?court|ruling|antitrust|regulation|legislation|constitution|human[-_ ]?rights|referendum|cabinet)\b/i,
      /(选举|大选|议会|国会|法院|裁决|立法|监管|反垄断|人权|宪政|公投|内阁)/,
    ],
    headlinePatterns: [
      /\b(election|parliament|court rules|legislation|antitrust|referendum|constitutional|lawmakers)\b/i,
      /(大选|选举|议会|法院|立法|反垄断|法案)/,
    ],
  },
  {
    category: 'climate_humanitarian',
    exactTopics: [
      'climate',
      'disaster',
      'health',
      'public-safety',
      'humanitarian',
      'energy',
    ],
    tagPatterns: [
      /\b(climate|emissions|carbon|renewable|grid|power|oil|gas|lng|earthquake|flood|wildfire|typhoon|hurricane|pandemic|outbreak|vaccine|humanitarian|famine|refugee|water)\b/i,
      /(气候|碳排放|能源|电网|石油|天然气|地震|洪灾|台风|公共卫生|疫情|人道|难民|灾害)/,
    ],
    headlinePatterns: [
      /\b(climate|emissions|energy grid|earthquake|flood|wildfire|outbreak|humanitarian|oil price|lng)\b/i,
      /(气候|能源|电网|地震|洪灾|人道主义|疫情|原油|天然气)/,
    ],
  },
  {
    category: 'diplomacy_summit',
    exactTopics: ['diplomacy', 'summit', 'treaties', 'alliances'],
    tagPatterns: [
      /\b(diplomacy|diplomatic|summit|treaty|ceasefire|negotiation|accord|nato|g7|g20|asean|brics|un[-_ ]?security|envoy|bilateral|multilateral|alliance)\b/i,
      /(外交|峰会|条约|停火|谈判|协议|北约|联合国|东盟|特使|盟友|多边)/,
    ],
    headlinePatterns: [
      /\b(summit|diplomatic|ceasefire talks|treaty|peace talks|foreign ministers|alliance)\b/i,
      /(峰会|外交|停火谈判|和平谈判|条约|外长会)/,
    ],
  },
  {
    category: 'conflict_maritime',
    exactTopics: ['conflict', 'defense', 'security', 'geopolitics', 'military'],
    tagPatterns: [
      /\b(war|conflict|strike|missile|maritime|strait|hormuz|red[-_ ]?sea|shipping|naval|military|defense|troops|border|insurgency|escalation|drone)\b/i,
      /(战争|冲突|空袭|导弹|海峡|霍尔木兹|航运|海军|军事|防务|边境|无人机|地缘)/,
    ],
    headlinePatterns: [
      /\b(war|airstrike|missile|strait|maritime|naval|military|conflict|shipping lane|troops)\b/i,
      /(战争|冲突|空袭|导弹|海峡|航道|军事|军队)/,
    ],
  },
];

function normalizeToken(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, '-');
}

export function classifySignalSubject(
  signal: ParsedSignal
): SubjectClassificationResult {
  const normalizedTopic = normalizeToken(signal.topic || '');
  const tagText = signal.tags.join(' ');
  const headlineText = signal.headline || '';

  // Pass 1: Exact structured topic match (highest precision, zero guessing)
  for (const rule of SUBJECT_RULES) {
    if (rule.domains && !rule.domains.includes(signal.domain)) continue;
    if (
      normalizedTopic &&
      rule.exactTopics.some((topic) => topic === normalizedTopic)
    ) {
      return {
        category: rule.category,
        matchStrength: 'strong',
        matchedTokens: [`topic:${normalizedTopic}`],
      };
    }
  }

  // Pass 2: Structured tag + geography taxonomy match
  for (const rule of SUBJECT_RULES) {
    if (rule.domains && !rule.domains.includes(signal.domain)) continue;
    const tagMatch = rule.tagPatterns.find((pattern) => pattern.test(tagText));
    if (tagMatch) {
      return {
        category: rule.category,
        matchStrength: 'strong',
        matchedTokens: [`tag:${tagMatch.source.slice(0, 24)}`],
      };
    }
  }

  // Pass 3: Guarded phrase match on headline (moderate confidence)
  for (const rule of SUBJECT_RULES) {
    if (rule.domains && !rule.domains.includes(signal.domain)) continue;
    const headlineMatch = rule.headlinePatterns.find((pattern) =>
      pattern.test(headlineText)
    );
    if (headlineMatch) {
      return {
        category: rule.category,
        matchStrength: 'moderate',
        matchedTokens: [`headline:${headlineMatch.source.slice(0, 24)}`],
      };
    }
  }

  // Pass 4: Domain-level fallback classification (never pretended as strong match)
  const fallbackCategory: EditorialSubjectCategory =
    signal.domain === 'ai'
      ? 'ai_models_research'
      : signal.domain === 'economy'
        ? 'trade_fiscal'
        : 'conflict_maritime';

  return {
    category: fallbackCategory,
    matchStrength: 'fallback',
    matchedTokens: [`domain:${signal.domain}`],
  };
}

function toExclusionSet(
  exclude?: ReadonlySet<string> | readonly string[]
): Set<string> {
  if (!exclude) return new Set();
  return exclude instanceof Set ? new Set(exclude) : new Set(exclude);
}

function isHttpsUrlString(url: string | undefined): boolean {
  if (!url || typeof url !== 'string') return false;
  try {
    const parsed = new URL(url.trim());
    return parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

/**
 * Defensive runtime gate ensuring only fully verified, rights-cleared HTTPS media assets
 * are ever rendered publicly, even if constructed outside parseEdition().
 */
export function isApprovedMediaAsset(asset: SignalMediaAsset | null | undefined): boolean {
  if (!asset) return false;
  if (asset.isApprovedForDisplay !== true) return false;
  if (!asset.rights || asset.rights.public_web_display_allowed !== true) return false;
  if (!isHttpsUrlString(asset.asset_url) || !isHttpsUrlString(asset.source_page_url)) {
    return false;
  }
  if (
    !['public_domain', 'cc0', 'cc_by', 'cc_by_sa', 'explicit_permission', 'editorial_license'].includes(asset.rights.basis) ||
    !isHttpsUrlString(asset.rights.license_url) ||
    typeof asset.rights.crop_allowed !== 'boolean' ||
    !asset.rights.verified_at ||
    !Number.isFinite(Date.parse(asset.rights.verified_at))
  ) {
    return false;
  }
  if (
    !asset.verification ||
    asset.verification.source_page_checked !== true ||
    asset.verification.direct_asset_checked !== true ||
    asset.verification.visual_content_checked !== true ||
    asset.verification.caption_context_checked !== true
  ) {
    return false;
  }
  if (
    !asset.caption.trim() ||
    !asset.alt_text.trim() ||
    !asset.creator.trim() ||
    !asset.credit_line.trim() ||
    !asset.rights.license_name.trim() ||
    !asset.rights.rights_holder.trim()
  ) {
    return false;
  }
  return true;
}

/**
 * Selects the primary approved visual asset (hero placement first, then supporting)
 * and the remaining supporting gallery assets without duplicating the primary item.
 */
export function selectApprovedSignalMedia(
  signal: ParsedSignal,
  options: { excludeMediaUrls?: ReadonlySet<string> | readonly string[] } = {}
): { primary: SignalMediaAsset | null; supporting: SignalMediaAsset[] } {
  const excludedUrls = toExclusionSet(options.excludeMediaUrls);
  const approved = (signal.mediaAssets ?? []).filter((item) =>
    isApprovedMediaAsset(item)
  );

  if (approved.length === 0) {
    return { primary: null, supporting: [] };
  }

  const primary =
    approved.find(
      (item) =>
        item.placement === 'hero' && !excludedUrls.has(item.asset_url)
    ) ??
    approved.find(
      (item) =>
        item.placement === 'supporting' && !excludedUrls.has(item.asset_url)
    ) ??
    null;

  const supporting = approved.filter(
    (item) => !primary || item.media_id !== primary.media_id
  );

  return { primary, supporting };
}

/**
 * Resolves the graceful local fallback when a verified remote media asset fails to load.
 */
export function resolveBrokenMediaFallback(
  selection: Pick<VisualSelectionResult, 'fallbackAsset'>
): { mode: 'editorial_illustration' | 'typographic_cover'; asset: EditorialAsset | null } {
  if (selection.fallbackAsset) {
    return {
      mode: 'editorial_illustration',
      asset: selection.fallbackAsset,
    };
  }
  return {
    mode: 'typographic_cover',
    asset: null,
  };
}

function selectLocalFallbackAsset(
  signal: ParsedSignal,
  classification: SubjectClassificationResult,
  primaryAsset: EditorialAsset,
  context: VisualSlotContext,
  excluded: Set<string>
): EditorialAsset | null {
  if (context === 'dossier') {
    return classification.matchStrength === 'strong' && !excluded.has(primaryAsset.id)
      ? primaryAsset
      : null;
  }

  if (!excluded.has(primaryAsset.id)) {
    return primaryAsset;
  }

  if (context === 'hero' || context === 'desk') {
    const alternates = DOMAIN_FALLBACK_ORDER[signal.domain];
    for (const altId of alternates) {
      if (!excluded.has(altId)) {
        return EDITORIAL_ASSET_REGISTRY[altId];
      }
    }
  }

  return null;
}

export function selectVisualStrategyForSignal(
  signal: ParsedSignal,
  options: VisualSelectionOptions = {}
): VisualSelectionResult {
  const {
    context = 'secondary',
    excludeAssetIds,
    excludeMediaUrls,
    preferredMode,
    verifiedMedia = null,
  } = options;

  const excluded = toExclusionSet(excludeAssetIds);
  const classification = classifySignalSubject(signal);
  const primaryAssetId = CATEGORY_TO_ASSET_ID[classification.category];
  const primaryAsset = EDITORIAL_ASSET_REGISTRY[primaryAssetId];
  const fallbackAsset = selectLocalFallbackAsset(
    signal,
    classification,
    primaryAsset,
    context,
    excluded
  );

  // Explicit mode override for grounded data visuals or intentional typographic covers
  if (preferredMode === 'grounded_visual') {
    return {
      mode: 'grounded_visual',
      asset: null,
      selectedMedia: null,
      fallbackAsset: null,
      subjectCategory: classification.category,
      matchStrength: classification.matchStrength,
      subjectLabelEn: primaryAsset.subjectLabelEn,
      subjectLabelZh: primaryAsset.subjectLabelZh,
    };
  }

  if (preferredMode === 'typographic_cover') {
    return {
      mode: 'typographic_cover',
      asset: null,
      selectedMedia: null,
      fallbackAsset: null,
      subjectCategory: classification.category,
      matchStrength: classification.matchStrength,
      subjectLabelEn: primaryAsset.subjectLabelEn,
      subjectLabelZh: primaryAsset.subjectLabelZh,
    };
  }

  // Precedence 1 & 2: Approved signal media_assets (placement: 'hero' first, then 'supporting')
  const { primary: selectedSignalMedia } = selectApprovedSignalMedia(signal, {
    excludeMediaUrls,
  });
  if (selectedSignalMedia) {
    return {
      mode: 'verified_media',
      asset: null,
      selectedMedia: selectedSignalMedia,
      fallbackAsset,
      subjectCategory: classification.category,
      matchStrength: 'strong',
      subjectLabelEn: primaryAsset.subjectLabelEn,
      subjectLabelZh: primaryAsset.subjectLabelZh,
    };
  }

  // Backward-compatible explicit verifiedMedia prop override
  if (verifiedMedia && verifiedMedia.src) {
    return {
      mode: 'verified_documentary',
      asset: primaryAsset,
      selectedMedia: null,
      fallbackAsset: primaryAsset,
      subjectCategory: classification.category,
      matchStrength: 'strong',
      subjectLabelEn: primaryAsset.subjectLabelEn,
      subjectLabelZh: primaryAsset.subjectLabelZh,
    };
  }

  // Precedence 3 (Dossier): Local editorial illustration only on strong non-excluded match;
  // otherwise intentional typographic cover plate.
  if (context === 'dossier') {
    if (
      classification.matchStrength === 'strong' &&
      !excluded.has(primaryAsset.id)
    ) {
      return {
        mode: 'editorial_illustration',
        asset: primaryAsset,
        selectedMedia: null,
        fallbackAsset: null,
        subjectCategory: classification.category,
        matchStrength: classification.matchStrength,
        subjectLabelEn: primaryAsset.subjectLabelEn,
        subjectLabelZh: primaryAsset.subjectLabelZh,
      };
    }

    return {
      mode: 'typographic_cover',
      asset: null,
      selectedMedia: null,
      fallbackAsset: null,
      subjectCategory: classification.category,
      matchStrength: classification.matchStrength,
      subjectLabelEn: primaryAsset.subjectLabelEn,
      subjectLabelZh: primaryAsset.subjectLabelZh,
    };
  }

  // Precedence 3 (Briefing): Primary local subject match available and unused
  if (!excluded.has(primaryAsset.id)) {
    return {
      mode: 'editorial_illustration',
      asset: primaryAsset,
      selectedMedia: null,
      fallbackAsset: null,
      subjectCategory: classification.category,
      matchStrength: classification.matchStrength,
      subjectLabelEn: primaryAsset.subjectLabelEn,
      subjectLabelZh: primaryAsset.subjectLabelZh,
    };
  }

  // Hero / Desk anti-repetition: try a distinct domain-appropriate alternate asset
  if (context === 'hero' || context === 'desk') {
    const alternates = DOMAIN_FALLBACK_ORDER[signal.domain];
    for (const altId of alternates) {
      if (!excluded.has(altId)) {
        const altAsset = EDITORIAL_ASSET_REGISTRY[altId];
        return {
          mode: 'editorial_illustration',
          asset: altAsset,
          selectedMedia: null,
          fallbackAsset: null,
          subjectCategory: classification.category,
          matchStrength: 'moderate',
          subjectLabelEn: primaryAsset.subjectLabelEn,
          subjectLabelZh: primaryAsset.subjectLabelZh,
        };
      }
    }
  }

  // Precedence 4: Grounded evidence visual (when claims/timeline exist) or typographic cover
  if (
    context === 'secondary' &&
    (signal.claims.length > 0 || signal.timelineEvents.length > 0)
  ) {
    return {
      mode: 'grounded_visual',
      asset: null,
      selectedMedia: null,
      fallbackAsset: null,
      subjectCategory: classification.category,
      matchStrength: classification.matchStrength,
      subjectLabelEn: primaryAsset.subjectLabelEn,
      subjectLabelZh: primaryAsset.subjectLabelZh,
    };
  }

  return {
    mode: 'typographic_cover',
    asset: null,
    selectedMedia: null,
    fallbackAsset: null,
    subjectCategory: classification.category,
    matchStrength: classification.matchStrength,
    subjectLabelEn: primaryAsset.subjectLabelEn,
    subjectLabelZh: primaryAsset.subjectLabelZh,
  };
}

export function extractGroundedSignalStats(
  signal: ParsedSignal
): GroundedSignalStats {
  let confirmedClaimsCount = 0;
  let reportedClaimsCount = 0;
  let disputedOrUnverifiedCount = 0;

  for (const claim of signal.claims) {
    if (claim.status === 'confirmed') confirmedClaimsCount += 1;
    else if (claim.status === 'reported' || claim.status === 'official_claim') {
      reportedClaimsCount += 1;
    } else {
      disputedOrUnverifiedCount += 1;
    }
  }

  const timelinePoints =
    signal.timelineEvents.length > 0
      ? signal.timelineEvents.map((ev) => ({
          dateLabel: ev.occurred_at.slice(0, 10),
          summary: ev.title || ev.summary,
        }))
      : signal.sections.timelineEntries.map((entry) => ({
          dateLabel: entry.dateLabel || '—',
          summary: entry.text,
        }));

  const datedLabels = timelinePoints
    .map((p) => p.dateLabel)
    .filter((d) => d && d !== '—');
  const timelineSpanLabel =
    datedLabels.length >= 2
      ? `${datedLabels[0]} – ${datedLabels[datedLabels.length - 1]}`
      : datedLabels[0] ?? signal.event.start_date ?? null;

  return {
    independentOriginsCount: signal.independentOriginCount,
    claimsCount: signal.claims.length,
    sourcesCount: signal.sources.length,
    confirmedClaimsCount,
    reportedClaimsCount,
    disputedOrUnverifiedCount,
    timelineCount: timelinePoints.length,
    timelineSpanLabel,
    timelinePoints,
  };
}
