# TNIK Insight

A light-theme web prototype for comparing TNIK research candidates in idiopathic pulmonary fibrosis.

## Run the demo offline

Open the standalone HTML file delivered alongside this source folder in a browser. It includes the four project profiles, the evidence matrix, candidate comparison, and all local artwork. Select **Print / Save as PDF** on a profile or comparison, then select your browser's **Save as PDF** destination.

## Run with live lookup

Use Node.js 20 or later and run `npm start` from this folder. Open the printed local address. The local server proxies public PubChem compound lookup and depictions. An internet connection is needed for lookups outside the bundled dataset. Run `npm test` to check API behavior and project data. The application uses no install-time dependencies.

Run `npm run build` to build the Sites Worker at `dist/server/index.js`. To regenerate the offline demo, run `node tools/build.mjs ../TNIK-Insight-Offline.html`.

## Data and model scope

The website includes the supplied structural results, redocking summary, model evaluation, selected PLIP pose annotations, and analogue screening totals. Source names are shown by each result. The analogue workbook’s scaffold breakdown differs between its overview and ranked list, so the site uses the agreed aggregate count of 22. Verified molecular dynamics outputs and a saved model were unavailable. The website does not run training, docking, dynamics, or live model predictions.

Candidate depictions were rendered offline by RDKit from the PubChem-derived SMILES after confirming the reported molecular formula and InChIKey. PubChem is the source of chemical identifiers and computed descriptors. See **TNIK & IPF Research** for the structure record, publications, and source links.

The lung art in `public/assets/lung-hero.webp` was generated with the built-in image tool as a conceptual illustration. The brief was a bright, mint clinical editorial illustration of a translucent pair of adult lungs with fine teal bronchial branching and subtle cloudy texture near one lung base, on a near-white mint background without labels.
