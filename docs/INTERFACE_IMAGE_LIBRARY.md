# WORLD SIGNAL — Interface Image Library

> Curated visual-design assets for the frontend art direction.
> This manifest is **not** a newsroom evidence registry and must never be treated as editorial verification.

Repository: https://github.com/rockybuildingaiweb3-boop/world-signal  
Base reviewed: main at dd5f343ebed0136ff216ae92d6962dd20ef79733  
Research date: 2026-11-27

## 1. Purpose and separation

The existing docs/MEDIA_ASSET_POLICY.md remains authoritative for images attached to specific news signals.

This library has a separate, narrower purpose: give the frontend team a small set of high-quality photographic assets for art-direction exploration and, where appropriate, restrained site-level editorial design.

These photographs are **generic visual context**. They must not be represented as proof of a current event, a photograph of a particular breaking incident, or a verified image of a facility mentioned in a signal.

Do not add these files to canonical edition media_assets. Do not register them as documentary news media. Do not use them to imply an event location, date, casualty, participant, company endorsement, or causal claim.

Do not build a stock-photo gallery or asset-browsing product. These are a handful of selected visual resources integrated into the publication's design—not a competing image service.

## 2. Curated starter set

All five individual Unsplash source pages were inspected on 2026-11-27. Each page displayed the image as free to use under the Unsplash License at the time of review. The Unsplash License permits broad commercial and non-commercial use, subject to its restrictions; in particular, it prohibits compiling Unsplash images to replicate a similar or competing service.

Prefer preserving photographer credit in local asset metadata and, where visually appropriate, in unobtrusive captions or credits even though attribution is not generally required by the standard Unsplash License.

| ID | Target local path | Image / creator | Suggested design use | Source page | Download endpoint |
|---|---|---|---|---|---|
| world-city-aerial | public/assets/interface-library/world-city-aerial.jpg | “Aerial view of a city skyline at dusk” — Klaus Birner (@thebrowny) | World Events cover texture, urban systems, global city feature composition | https://unsplash.com/photos/aerial-view-of-a-city-skyline-at-dusk-3mdHgIGJdrM | https://unsplash.com/photos/3mdHgIGJdrM/download?force=true |
| world-maritime-port | public/assets/interface-library/world-maritime-port.jpg | “Container ships and cranes at a busy port” — Wolfgang Weiser (@hamburgmeinefreundin); Hamburg, Germany | Trade, logistics and supply-chain visual composition; generic contextual imagery only | https://unsplash.com/photos/container-ships-and-cranes-at-a-busy-port-azTSkG93BG4 | https://unsplash.com/photos/azTSkG93BG4/download?force=true |
| ai-data-center | public/assets/interface-library/ai-data-center.jpg | “Two server racks filled with electronic components and wires” — Eric Stoynov; TRIUMF, Vancouver, Canada | AI infrastructure, compute, research and data-center layouts | https://unsplash.com/photos/two-server-racks-filled-with-electronic-components-and-wires-k27hkqXuveo | https://unsplash.com/photos/k27hkqXuveo/download?force=true |
| ai-silicon-wafer | public/assets/interface-library/ai-silicon-wafer.jpg | “A close up of a metal plate with squares on it” — Laura Ockel; 4-inch silicon wafer macro | Semiconductor, chip manufacturing and technical feature imagery | https://unsplash.com/photos/a-close-up-of-a-metal-plate-with-squares-on-it-0Gw_p-RQq8k | https://unsplash.com/photos/0Gw_p-RQq8k/download?force=true |
| economy-stock-exchange | public/assets/interface-library/economy-stock-exchange.jpg | “New york stock exchange building facade with columns” — Maxim Klimashin (@maxim_klimashin); New York, USA | Economic Outlook / institutions / market architecture feature composition | https://unsplash.com/photos/new-york-stock-exchange-building-facade-with-columns-1QSXCd0LHVs | https://unsplash.com/photos/1QSXCd0LHVs/download?force=true |

License reference for all five entries: https://unsplash.com/license

Photographer profile links:
- Klaus Birner: https://unsplash.com/@thebrowny
- Wolfgang Weiser: https://unsplash.com/@hamburgmeinefreundin
- Eric Stoynov: https://unsplash.com/@ericstoynov
- Laura Ockel: https://unsplash.com/@lauraockel
- Maxim Klimashin: https://unsplash.com/@maxim_klimashin

## 3. Download and local-asset requirements

The current task workspace should download the five images from the individual Unsplash download endpoints above. Do not hotlink them in production.

1. Save the files to the exact target paths in the table.
2. Confirm each response is a valid image file, not an HTML page or redirect-error document.
3. Inspect every downloaded image locally before using it.
4. Record actual byte sizes and image dimensions in the asset manifest.
5. Keep the original downloaded JPEGs as the source masters.
6. Generate optimized WebP derivatives only when the current build pipeline supports them; do not silently overwrite the originals.
7. Use responsive image sizing and lazy loading for below-the-fold assets. Keep only the actual initial-viewport lead visual eager.
8. Use appropriate object-position values per asset. Do not apply one global crop.
9. Do not crop the original source masters. Cropping in the UI is permitted only as a presentation choice for these stock assets; retain a full uncropped source file.

Create public/assets/interface-library/README.md after download. For every file, record:
- local path
- source title
- photographer / creator
- source page URL
- license name
- license URL
- date checked
- actual file size
- pixel dimensions
- intended interface use
- note that this is non-documentary generic imagery

If any endpoint cannot be downloaded, the file fails image validation, or its source metadata cannot be reconciled, do not create a placeholder file and do not silently replace it with another image. Report the missing item.

## 4. Rights and editorial guardrails

- The Unsplash standard license does not eliminate other rights that may apply to recognizable people, private property, artwork, logos, trademarks, or depicted brands.
- Never imply endorsement by a person, photographer, organization, company, or institution appearing in a photograph.
- The server-rack photograph is at TRIUMF in Vancouver. It is not a photograph of any particular AI company's data center.
- The maritime photograph is from Hamburg. It is not documentation of a specific conflict, blockade, canal incident, or port event.
- The stock-exchange photograph shows the New York Stock Exchange facade. Do not use it to claim that a specific transaction or market move occurred there.
- The city photograph is generic city imagery; do not infer a specific city or geopolitical location from it.
- The silicon-wafer photograph is descriptive of wafer/chip manufacturing generally; do not represent it as an image of a named chipmaker's proprietary process.
- If a signal-specific image is needed, use the source and item-level rights checks required by docs/MEDIA_ASSET_POLICY.md. This interface library is not a shortcut around that policy.

## 5. Recommended design application

Use the library to demonstrate a stronger photographic language—not to put an image into every section.

Suggested applications:
- One carefully cropped editorial image in the Briefing lead spread when the asset materially strengthens the composition.
- Asymmetric image-led secondary feature layouts.
- Small image / text pairings in the three domain desks.
- A visually differentiated image header for selected Expanded dossiers.
- A restrained, editorial image strip in the landing page, not a generic card grid.

Do not use these five images simultaneously as a repeating decorative wallpaper. Do not repeat the same image in multiple adjacent cards. Mix photography with existing original illustrations and typographic cover plates.

Preserve strong text contrast. Dark gradients or scrims may be used only as local legibility treatments, not as a universal overlay that obscures the photograph.

The image is a compositional element; its relationship with headline, deck, caption, spacing, and surrounding typography is what should make the page feel art-directed.

## 6. Official references

- Unsplash License: https://unsplash.com/license
- Unsplash Terms: https://unsplash.com/terms
- Unsplash Help — commercial and personal use: https://help.unsplash.com/en/articles/2612315-can-i-use-unsplash-images-for-personal-or-commercial-projects
- Unsplash Help — releases and trademarks: https://help.unsplash.com/en/articles/2612329-releases-and-trademarks

This manifest documents a research shortlist. It is not a legal opinion, a guarantee of third-party model/property releases, or approval for use as event-specific news photography.
