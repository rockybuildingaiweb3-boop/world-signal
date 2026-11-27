import type { EditorialAssetId } from '../../lib/editorial/editorialAssetRegistry';

import geopoliticsCoverUrl from '../../assets/images/editorial_cover_geopolitics_1795752024180.jpg';
import diplomacyCoverUrl from '../../assets/images/editorial_cover_diplomacy_1795752026803.jpg';
import electionsGovernanceUrl from '../../assets/images/editorial_subject_elections_governance_1795787677374.jpg';
import climateHumanitarianUrl from '../../assets/images/editorial_subject_climate_humanitarian_1795787682148.jpg';
import aiFrontierCoverUrl from '../../assets/images/editorial_cover_ai_frontier_1795752024354.jpg';
import chipsComputeUrl from '../../assets/images/editorial_subject_chips_compute_1795787680346.jpg';
import aiSafetyAgentsUrl from '../../assets/images/editorial_subject_ai_safety_agents_1795787681268.jpg';
import economyCoverUrl from '../../assets/images/editorial_cover_economy_1795752025611.jpg';
import monetaryMarketsUrl from '../../assets/images/editorial_subject_monetary_markets_1795787681435.jpg';

export const EDITORIAL_ASSET_URLS: Record<EditorialAssetId, string> = {
  conflict_maritime_plate: geopoliticsCoverUrl,
  diplomacy_summit_plate: diplomacyCoverUrl,
  elections_governance_plate: electionsGovernanceUrl,
  climate_humanitarian_plate: climateHumanitarianUrl,
  ai_models_research_plate: aiFrontierCoverUrl,
  chips_compute_plate: chipsComputeUrl,
  ai_safety_cyber_plate: aiSafetyAgentsUrl,
  trade_fiscal_plate: economyCoverUrl,
  monetary_markets_plate: monetaryMarketsUrl,
};
