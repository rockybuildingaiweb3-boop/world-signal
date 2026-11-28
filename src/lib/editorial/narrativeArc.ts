import type { ParsedSignal } from '../../types/edition';

export interface NarrativeStage {
  readonly id: string;
  readonly stepNumber: string;
  readonly targetSectionId: string;
  readonly labelEn: string;
  readonly labelZh: string;
  readonly subEn: string;
  readonly subZh: string;
  readonly matchesSectionIds: readonly string[];
}

/**
 * Computes the grounded editorial narrative arc for a signal dossier,
 * strictly including ONLY stages backed by actual content in this signal.
 * Never invents causal links or unsupported stages.
 */
export function buildSignalNarrativeArc(signal: ParsedSignal): NarrativeStage[] {
  const stages: NarrativeStage[] = [];

  if (signal.sections.whatHappened || signal.sections.verifiedFacts) {
    stages.push({
      id: 'event',
      stepNumber: '01',
      targetSectionId: signal.sections.whatHappened
        ? 'sec-what-happened'
        : 'sec-verified-facts',
      labelEn: 'Global Event',
      labelZh: '核心事实',
      subEn: 'Verified record',
      subZh: '发生了什么',
      matchesSectionIds: ['sec-what-happened', 'sec-verified-facts'],
    });
  }

  if (
    signal.sections.timeline ||
    signal.timelineEvents.length > 0 ||
    signal.sections.sourcePerspectives
  ) {
    stages.push({
      id: 'context',
      stepNumber: String(stages.length + 1).padStart(2, '0'),
      targetSectionId:
        signal.sections.timeline || signal.timelineEvents.length > 0
          ? 'sec-timeline'
          : 'sec-why-it-matters',
      labelEn: 'Context & Chronology',
      labelZh: '演进与语境',
      subEn:
        signal.event.geography[0] ??
        (signal.timelineEvents.length > 0
          ? `${signal.timelineEvents.length} milestones`
          : 'Perspectives'),
      subZh:
        signal.event.geography[0] ??
        (signal.timelineEvents.length > 0
          ? `${signal.timelineEvents.length} 个节点`
          : '多方视角'),
      matchesSectionIds: ['sec-timeline'],
    });
  }

  if (signal.sections.whyItMatters || signal.sections.analysis) {
    stages.push({
      id: 'consequence',
      stepNumber: String(stages.length + 1).padStart(2, '0'),
      targetSectionId: signal.sections.whyItMatters
        ? 'sec-why-it-matters'
        : 'sec-analysis',
      labelEn: 'Consequence & Analysis',
      labelZh: '结构影响',
      subEn: 'Why it matters',
      subZh: '深度研判',
      matchesSectionIds: ['sec-why-it-matters', 'sec-analysis'],
    });
  }

  if (signal.sections.personalRelevance) {
    stages.push({
      id: 'relevance',
      stepNumber: String(stages.length + 1).padStart(2, '0'),
      targetSectionId: 'sec-personal-relevance',
      labelEn: 'Personal Relevance',
      labelZh: '切身关联',
      subEn: 'Real-world impact',
      subZh: '现实传导',
      matchesSectionIds: ['sec-personal-relevance'],
    });
  }

  if (
    signal.sections.whatToWatch ||
    signal.sections.scenarios ||
    signal.sections.uncertainties
  ) {
    stages.push({
      id: 'watch',
      stepNumber: String(stages.length + 1).padStart(2, '0'),
      targetSectionId: signal.sections.whatToWatch
        ? 'sec-what-to-watch'
        : signal.sections.scenarios
          ? 'sec-scenarios'
          : 'sec-uncertainties',
      labelEn: 'What to Watch',
      labelZh: '后续观察',
      subEn: 'Scenarios & signals',
      subZh: '情景与风险',
      matchesSectionIds: [
        'sec-uncertainties',
        'sec-scenarios',
        'sec-what-to-watch',
      ],
    });
  }

  return stages;
}
