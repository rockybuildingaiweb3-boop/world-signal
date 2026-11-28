# WORLD SIGNAL — Curated Local Interface Image Library

> **Classification**: `interface_editorial_photography` (**Non-Documentary — `isDocumentaryEvidence: false`**)
> **Total Curated Assets**: **30 photographs** (10 World Events · 10 AI Frontier · 10 Economic Outlook — 60 optimized uncropped WebP files: 1600w primary + 800w responsive)
> **Total Footprint on Disk**: **11.02 MB** (World: 3.11 MB · AI: 3.40 MB · Economy: 4.51 MB)
> **Machine-Readable Manifest**: `public/assets/interface-library/manifest.json`
> **TypeScript Registry**: `src/lib/editorial/interfaceImageLibrary.ts`

---

## Editorial Separation & Integrity Policy

1. **Strict Isolation from Documentary News Media**: Every photograph in this directory is generic editorial art-direction photography used for visual worlds, section openers, panoramic pacing breaks, and high-priority dossier atmosphere. It is **never** registered in `src/lib/editorial/editorialAssetRegistry.ts` and **never** overrides verified signal `media_assets`.
2. **Non-Documentary Disclosure**: Every rendered plate carries an explicit bilingual non-documentary designation (`Editorial context photo · Non-documentary` / `编辑视觉配图 · 非新闻现场实拍`), photographer attribution, source page link, and license link.
3. **Zero Hotlinking**: All 30 photographs are stored locally under `public/assets/interface-library/{world,ai,economy}/`. Production code never hotlinks remote image hosts.
4. **Visual Inspection & Per-Asset Focal Points**: Every downloaded image was visually inspected prior to registration and assigned an asset-specific `objectPosition` focal point rather than a blind global crop.

---

## World Events (10 Assets) — `public/assets/interface-library/world/`

Visual World: *Global Documentary* — open broadsheet framing, global geography, diplomatic institutions, maritime infrastructure, and human environments.

| Asset ID | Category | Dimensions | 1600w / 800w | Focal Point | Creator | License | Source |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `world-city-aerial` | urban_geopolitics | 1600×1067 (landscape) | 395 KB / 106 KB | `50% 10%` | Klaus Birner | [Unsplash License](https://unsplash.com/license) | [Source](https://unsplash.com/photos/aerial-view-of-a-city-skyline-at-dusk-3mdHgIGJdrM) |
| `world-maritime-port` | maritime_logistics | 1600×900 (landscape) | 198 KB / 52 KB | `50% 52%` | Wolfgang Weiser | [Unsplash License](https://unsplash.com/license) | [Source](https://unsplash.com/photos/container-ships-and-cranes-at-a-busy-port-azTSkG93BG4) |
| `world-diplomatic-institution` | diplomatic_architecture | 1600×873 (landscape) | 141 KB / 28 KB | `38% 45%` | Daryan Shamkhali | [CC0](https://creativecommons.org/publicdomain/zero/1.0/deed.en) | [Source](https://commons.wikimedia.org/wiki/File:Sunset_over_UN_building_(Unsplash).jpg) |
| `world-international-assembly` | international_assembly | 1600×1067 (landscape) | 361 KB / 99 KB | `50% 44%` | Basil D Soufi | [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0) | [Source](https://commons.wikimedia.org/wiki/File:United_Nations_General_Assembly_Hall_(2).jpg) |
| `world-global-transport` | global_transport | 1600×1200 (landscape) | 160 KB / 24 KB | `50% 42%` | Adam Jones | [CC BY-SA 2.0](https://creativecommons.org/licenses/by-sa/2.0) | [Source](https://commons.wikimedia.org/wiki/File:Container_Ship_Enters_Miraflores_Locks_-_Panama_Canal.jpg) |
| `world-earth-observation` | earth_observation | 1600×1064 (landscape) | 131 KB / 34 KB | `50% 68%` | Kjell Lindgren / NASA | [Public Domain (NASA)](https://www.nasa.gov/nasa-brand-center/images-and-media/) | [Source](https://images.nasa.gov/details/iss045e176195) |
| `world-coastline-geography` | coastline_geography | 1600×948 (landscape) | 184 KB / 33 KB | `50% 58%` | Sergey Ashmarin | [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0) | [Source](https://commons.wikimedia.org/wiki/File:Bosphorus,_aerial_view_-_Turkey_-_panoramio.jpg) |
| `world-urban-infrastructure` | urban_infrastructure | 1600×900 (landscape) | 254 KB / 56 KB | `50% 52%` | Frank Schulenburg | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) | [Source](https://commons.wikimedia.org/wiki/File:Golden_Gate_Bridge_as_seen_from_Marshall%E2%80%99s_Beach,_March_2018.jpg) |
| `world-human-environment` | human_environment | 1600×1067 (landscape) | 389 KB / 99 KB | `50% 58%` | Mike Peel | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) | [Source](https://commons.wikimedia.org/wiki/File:At_New_York_City_2023_008.jpg) |
| `world-public-space` | public_institution | 1600×903 (landscape) | 348 KB / 91 KB | `50% 55%` | Diliff | [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0) | [Source](https://commons.wikimedia.org/wiki/File:European_Parliament_Strasbourg_Hemicycle_-_Diliff.jpg) |

---

## AI Frontier (10 Assets) — `public/assets/interface-library/ai/`

Visual World: *Scientific Modernism* — nocturnal architectural precision, silicon fabrication, supercomputing halls, photonics, robotics, and engineering cleanrooms.

| Asset ID | Category | Dimensions | 1600w / 800w | Focal Point | Creator | License | Source |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `ai-silicon-wafer` | semiconductor_macro | 1600×1068 (landscape) | 266 KB / 76 KB | `50% 35%` | Laura Ockel | [Unsplash License](https://unsplash.com/license) | [Source](https://unsplash.com/photos/a-close-up-of-a-metal-plate-with-squares-on-it-0Gw_p-RQq8k) |
| `ai-data-center` | compute_infrastructure | 1067×1600 (portrait) | 214 KB / 71 KB | `62% 38%` | Eric Stoynov | [Unsplash License](https://unsplash.com/license) | [Source](https://unsplash.com/photos/two-server-racks-filled-with-electronic-components-and-wires-k27hkqXuveo) |
| `ai-chip-architecture` | chip_architecture | 1235×1600 (portrait) | 539 KB / 98 KB | `50% 48%` | Zom-B | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) | [Source](https://commons.wikimedia.org/wiki/File:D8742_microscope_die_shot.png) |
| `ai-supercomputer-hall` | supercomputer_hall | 1600×900 (landscape) | 194 KB / 52 KB | `50% 50%` | Oak Ridge National Laboratory | [CC BY 2.0](https://creativecommons.org/licenses/by/2.0) | [Source](https://commons.wikimedia.org/wiki/File:Summit_supercomputer_(31430045337).jpg) |
| `ai-robotics-automation` | robotics_automation | 1600×1295 (landscape) | 196 KB / 65 KB | `55% 45%` | Auledas | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) | [Source](https://commons.wikimedia.org/wiki/File:UR16e_robot_arm.png) |
| `ai-research-laboratory` | research_laboratory | 1600×1063 (landscape) | 344 KB / 82 KB | `50% 50%` | Torkild Retvedt | [CC BY-SA 2.0](https://creativecommons.org/licenses/by-sa/2.0) | [Source](https://commons.wikimedia.org/wiki/File:CERN_Control_Center.jpg) |
| `ai-optics-photonics` | optics_photonics | 1600×1067 (landscape) | 439 KB / 117 KB | `50% 50%` | Steve Jurvetson | [CC BY 2.0](https://creativecommons.org/licenses/by/2.0) | [Source](https://commons.wikimedia.org/wiki/File:Bose-Einstein_condensate,_a_cloud_of_super-cooled_Rubidium_atoms_in_a_Laser_trap_on_an_Optical_table_-_In_a_game_of_catch_%26_release,_the_atoms_will_shoot_up_a_30_ft._tall_Atomic_fountain_-_Stanford.jpg) |
| `ai-scientific-instrument` | scientific_instrument | 1600×1151 (landscape) | 195 KB / 55 KB | `50% 52%` | Tadeáš Bednarz | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) | [Source](https://commons.wikimedia.org/wiki/File:Scanning_electron_microscope_-_UFCH_JH_(2020)_01.jpg) |
| `ai-engineering-workspace` | engineering_workspace | 1600×1065 (landscape) | 300 KB / 74 KB | `55% 48%` | NASA / Desiree Stover | [Public Domain (NASA)](https://commons.wikimedia.org/wiki/Commons:Licensing) | [Source](https://commons.wikimedia.org/wiki/File:Engineers_at_Work_on_Webb_at_Johnson_Space_Center.jpg) |
| `ai-advanced-materials` | advanced_materials | 1600×1060 (landscape) | 81 KB / 23 KB | `50% 50%` | Speedoflight1 | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) | [Source](https://commons.wikimedia.org/wiki/File:UV_Cured_Powder_Coating_on_Carbon_Fiber_.jpg) |

---

## Economic Outlook (10 Assets) — `public/assets/interface-library/economy/`

Visual World: *Institutional & Economic Humanism* — warm parchment-salmon financial authority paired with central banks, real-world factories, energy grids, commodities, retail life, and civil infrastructure.

| Asset ID | Category | Dimensions | 1600w / 800w | Focal Point | Creator | License | Source |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `economy-stock-exchange` | financial_institutions | 1067×1600 (portrait) | 304 KB / 89 KB | `50% 45%` | Maxim Klimashin | [Unsplash License](https://unsplash.com/license) | [Source](https://unsplash.com/photos/new-york-stock-exchange-building-facade-with-columns-1QSXCd0LHVs) |
| `economy-central-bank` | central_bank | 1024×1600 (portrait) | 227 KB / 50 KB | `50% 34%` | Norbert Nagel | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) | [Source](https://commons.wikimedia.org/wiki/File:European_Central_Bank_-_Frankfurt_-_Germany_-_March_8th_2026.jpg) |
| `economy-financial-district` | financial_district | 1600×900 (landscape) | 582 KB / 135 KB | `50% 48%` | Dr. Thomas Liptak | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) | [Source](https://commons.wikimedia.org/wiki/File:Frankfurt_am_Main,_Central_business_district_(2024).jpg) |
| `economy-manufacturing-factory` | manufacturing_factory | 1600×1067 (landscape) | 293 KB / 79 KB | `50% 50%` | Marek Ślusarczyk | [CC BY 3.0](https://creativecommons.org/licenses/by/3.0) | [Source](https://commons.wikimedia.org/wiki/File:001_Car_factory_assembly_line_-_Opel_factory_in_Gliwice,_Poland.jpg) |
| `economy-global-trade` | global_trade | 1067×1600 (portrait) | 416 KB / 107 KB | `50% 45%` | Virtual-Pano | [CC BY 4.0](https://creativecommons.org/licenses/by/4.0) | [Source](https://commons.wikimedia.org/wiki/File:00423_Train_loaded_with_containers_bound_for_Hamburg_harbour.jpg) |
| `economy-energy-infrastructure` | energy_infrastructure | 1600×913 (landscape) | 327 KB / 67 KB | `50% 56%` | kallerna | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) | [Source](https://commons.wikimedia.org/wiki/File:PS20_%26_PS10_solar_power_plants.jpg) |
| `economy-commodity-production` | commodity_production | 1600×798 (landscape) | 367 KB / 74 KB | `50% 54%` | Diego Delso | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) | [Source](https://commons.wikimedia.org/wiki/File:Mina_de_Chuquicamata,_Calama,_Chile,_2016-02-01,_DD_110-112_PAN.JPG) |
| `economy-retail-consumption` | retail_consumption | 1214×1600 (portrait) | 427 KB / 103 KB | `50% 52%` | Jakub Hałun | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) | [Source](https://commons.wikimedia.org/wiki/File:20110724_Galleria_Vittorio_Emanuele_II_Milan_5410.jpg) |
| `economy-supply-chain` | supply_chain | 1600×1200 (landscape) | 395 KB / 92 KB | `50% 62%` | Shandong Mingtong Metal Manufacturing | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) | [Source](https://commons.wikimedia.org/wiki/File:Factory_steel_coil_inventory.jpg) |
| `economy-infrastructure-investment` | infrastructure_investment | 1067×1600 (portrait) | 396 KB / 93 KB | `50% 44%` | Dietmar Rabich | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) | [Source](https://commons.wikimedia.org/wiki/File:Hoover_Dam,_Nevada_(Arizona,_USA)_--_2012_--_6130.jpg) |
