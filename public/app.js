import {candidates, evidenceFor, nextStepFor, publications, sources, target} from "./data.js";
import {lookupCompound} from "./api.js";
import {studyResults} from "./results.js";

const main = document.querySelector("#main");
const header = document.querySelector("#topbar");
const footer = document.querySelector("#footer");
const live = document.querySelector("#live");
const external = new Map();
let searchSequence = 0;
const navigation = [["home", "Overview"], ["explore", "Compound Explorer"], ["compare", "Compare"], ["research", "TNIK & IPF Research"]];
const statusText = {
  supported: "Supported", partial: "Partial", missing: "No evidence found",
  conflicting: "Conflicting", not_assessed: "Not assessed"
};
const drawings = {
  flask: '<path d="M9 3h6m-5 0v7l-5 8a2 2 0 0 0 2 3h10a2 2 0 0 0 2-3l-5-8V3M8 15h8"/>',
  search: '<circle cx="10.8" cy="10.8" r="6.3"/><path d="m16 16 4 4"/>',
  layers: '<path d="m12 3 9 5-9 5-9-5 9-5zm-9 9 9 5 9-5m-18 4 9 5 9-5"/>',
  compare: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M12 5v14m-6-9h3m6 0h3"/>',
  atom: '<circle cx="12" cy="12" r="1.2"/><ellipse cx="12" cy="12" rx="10" ry="4"/><ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(60 12 12)"/><ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(-60 12 12)"/>',
  chevron: '<path d="m9 6 6 6-6 6"/>',
  book: '<path d="M12 5v15M3 5h5c2 0 4 1 4 3 0-2 2-3 4-3h5v14h-5c-2 0-4 0-4 2 0-2-2-2-4-2H3z"/>',
  print: '<path d="M7 8V3h10v5M7 16H4V8h16v8h-3m-10-3h10v8H7zM16 11h1"/>',
  menu: '<path d="M4 6h16M4 12h16M4 18h16"/>',
  close: '<path d="m6 6 12 12M18 6 6 18"/>',
  add: '<path d="M12 5v14M5 12h14"/>',
  list: '<path d="M9 6h11M9 12h11M9 18h11M4 6h.01M4 12h.01M4 18h.01"/>'
};
const icon = name => `<svg class="icon" viewBox="0 0 24 24" aria-hidden="true">${drawings[name]}</svg>`;
const safe = value => String(value ?? "").replace(/[&<>"']/g, char => (
  {"&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;"}[char]
));
const square = (name, tone = "") => `<span class="icon-square ${tone}">${icon(name)}</span>`;
const badge = (label, tone = "") => `<span class="badge ${tone}">${safe(label)}</span>`;
const evidenceBadge = status => badge(statusText[status] || statusText.not_assessed, Object.hasOwn(statusText, status) ? status : "not_assessed");
const assetPath = path => typeof offlineAssets === "undefined" ? path : offlineAssets[path] || path;
const brand = `<a class="brand" href="#home" aria-label="TNIK Insight overview"><img src="${assetPath("./assets/mark.svg")}" width="39" height="39" alt=""><span>TNIK <strong>Insight</strong></span></a>`;
const byId = id => candidates.find(compound => compound.id === id);
const profileLink = compound => `#compound/${compound.project ? compound.id : compound.cid}`;
const literatureLink = compound => `https://europepmc.org/search?query=${encodeURIComponent(`"${compound.name}" AND (TNIK OR "pulmonary fibrosis")`)}`;
const date = value => new Intl.DateTimeFormat("en-IN", {dateStyle:"medium", timeZone:"Asia/Kolkata"}).format(value ? new Date(value) : new Date());
const printButton = `<button type="button" class="btn secondary" data-print>${icon("print")} Print / Save as PDF</button>`;

function externalLink(label, url, className = "source-link") {
  if (!url || !/^https:\/\//i.test(url)) return safe(label);
  return `<a class="${className}" href="${safe(url)}" target="_blank" rel="noopener noreferrer">${safe(label)}</a>`;
}

const sourceLink = source => source ? externalLink(source.label, source.url) : "";
const value = (text, unit = "") => text == null || text === "" ? "—" : `${safe(text)}${unit ? ` ${safe(unit)}` : ""}`;

function shell(active) {
  header.innerHTML = `<div class="wrap top-inner">${brand}
    <button type="button" class="icon-btn menu-toggle" data-menu aria-controls="navigation" aria-expanded="false" aria-label="Toggle navigation">${icon("menu")}</button>
    <nav id="navigation" class="primary-nav" aria-label="Main navigation">${navigation.map(([id, label]) => `<a href="#${id}" ${id === active ? 'aria-current="page"' : ""}>${label}</a>`).join("")}</nav>
    <a class="top-link" href="#explore">${icon("search")} Find a compound</a>
  </div>`;
  footer.innerHTML = `<div class="wrap footer-inner">${brand}<p>Preclinical research and academic demonstration</p><a class="source-link" href="#research">Sources &amp; methods</a></div>`;
}

function heading(label, title, intro, actions = "") {
  return `<section class="wrap page-head"><div><p class="kicker">${label}</p><h1>${safe(title)}</h1>${intro ? `<p class="page-intro">${safe(intro)}</p>` : ""}</div><div class="report-toolbar no-print">${actions}</div></section>`;
}

function searchForm({hero = false} = {}) {
  const id = hero ? "hero" : "explorer";
  return `<form class="search-box" data-search data-hero="${hero}" role="search">
    ${icon("search")}<label class="sr-only" for="query-${id}">Compound identifier</label>
    <input id="query-${id}" name="q" type="search" maxlength="900" required autocomplete="off" placeholder="${hero ? "Try Tepotinib or 25171648" : "Enter a name, CID, InChIKey, or SMILES"}">
    ${hero ? "" : `<label class="sr-only" for="format-${id}">Identifier type</label><select name="type" id="format-${id}"><option value="auto">Auto detect</option><option value="name">Name</option><option value="cid">PubChem CID</option><option value="inchikey">InChIKey</option><option value="smiles">SMILES</option></select>`}
    <button class="btn primary" type="submit">Search</button>
  </form>`;
}

function cards() {
  return `<div class="candidate-grid">${candidates.map((compound, index) => `<a class="candidate-card card" href="${profileLink(compound)}">
    <div class="card-top">${square("atom", ["", "purple", "blue", "gold"][index % 4])}${icon("chevron")}</div>
    <h3>${safe(compound.name)}</h3>
    <p>${safe(compound.target)}</p>
    <div class="card-meta">${badge(compound.id === "tepotinib" ? "Project follow-up" : "Project candidate", compound.id === "tepotinib" ? "teal" : "")}</div>
  </a>`).join("")}</div>`;
}

function home() {
  return `<section class="wrap hero">
    <div class="hero-art" aria-hidden="true"></div>
    <div class="hero-copy"><p class="kicker">${icon("flask")} Pulmonary fibrosis research</p>
      <h1>Which compound <br>should we <em>test next?</em></h1>
      <p>Compare the evidence behind TNIK research candidates for idiopathic pulmonary fibrosis and see what your lab would need to verify next.</p>
      ${searchForm({hero:true})}
      <div class="hero-actions"><a class="btn secondary" href="#compare">${icon("compare")} Compare candidates</a><a class="btn text" href="#research">Explore the TNIK–IPF research</a></div>
    </div><span class="hero-note">Conceptual lung illustration</span></section>
    <section class="wrap section" aria-labelledby="original-candidates">
      <div class="section-title"><div><p class="kicker">Original TNIK research</p><h2 id="original-candidates">Project compounds</h2><p>Open a profile to review its findings and evidence gaps.</p></div><a class="btn secondary" href="#explore">${icon("search")} Open Explorer</a></div>
      ${cards()}
    </section>
    <section class="wrap section workflow" aria-label="Research workflow">
      <a class="panel" href="#explore">${square("layers")}<div><h3>Inspect the evidence</h3><p>Check computational results, assays, and fibrosis studies.</p></div></a>
      <a class="panel" href="#compare">${square("compare", "purple")}<div><h3>Compare candidates</h3><p>See evidence gaps side by side and export a report.</p></div></a>
    </section>`;
}

function explorer(q = "", type = "auto") {
  return `${heading("Compound Explorer", "Find a compound", "Search the original dataset or look up an additional compound in PubChem.")}
    <div class="wrap page-body"><section class="panel search-panel">${searchForm()}<p class="small">The four project profiles are available offline. Other searches require internet access.</p></section>
    <div id="search-result" aria-live="polite"></div>
    <section class="section"><div class="section-title"><div><h2>Original project candidates</h2><p>Four compounds from the original computational comparison.</p></div></div>${cards()}</section>
    </div>`;
}

function details(entries) {
  return `<dl class="details">${entries.map(([label, content]) => `<dt>${safe(label)}</dt><dd>${content}</dd>`).join("")}</dl>`;
}

const dockingFields = [
  ["Docking score (kcal/mol)", "score", 3],
  ["Nearby TNIK residues (within 4 Å)", "nearby"],
  ["Shared JWK pocket residues", "overlap"],
  ["Potential hydrogen-bond geometry candidates", "hydrogen"],
  ["Potential nonpolar carbon contacts (atom pairs)", "carbon"],
  ["Closest heavy-atom contact (Å)", "closest", 3]
];
const dockingValue = (record, key, digits) => record ? record[key].toFixed(digits ?? 0) : "—";
const fileSource = (key, sheet = "") => `<p class="small">Source <strong>${safe(studyResults.files[key])}</strong>${sheet ? ` · ${safe(sheet)}` : ""}</p>`;

function poseInteractions(compound) {
  const record = studyResults.interactions[compound.id];
  if (!record) return "";
  return `<section class="panel"><h2>Selected-pose interaction analysis</h2>
    <p>PLIP annotations for ${safe(record.pose)} use a different pose analysis from the four-candidate table. The two sets of contact counts should be read in their own contexts.</p>
    ${details([["Hydrogen-bond records", value(record.hydrogen)], ["Hydrophobic records", value(record.hydrophobic)], ["Halogen-bond records", value(record.halogen)], ["Salt-bridge records", value(record.salt)], ["Hydrogen-bond residues", safe(record.hydrogenResidues.join(", "))]])}
    ${fileSource("interactions", "Interaction_Summary and Hydrogen_Bonds")}</section>`;
}

function compoundImage(compound) {
  const src = compound.project ? assetPath(`./assets/compound-${compound.cid}.png`) : location.protocol === "file:" ? compound.imageUrl : `/api/depiction?cid=${encodeURIComponent(compound.cid)}`;
  return `<figure class="molecule"><img src="${safe(src)}" alt="2D chemical structure of ${safe(compound.name)}"><p hidden>Structure depiction unavailable. ${sourceLink(compound.source)}</p></figure>`;
}

function evidenceTable(rows) {
  return `<div class="table-wrap" tabindex="0" role="region" aria-label="Evidence table"><table class="evidence-table"><thead><tr><th scope="col">Evidence category</th><th scope="col">Status</th><th scope="col">Finding and source</th></tr></thead>
    <tbody>${rows.map(row => `<tr><th scope="row">${safe(row.label)}</th><td>${evidenceBadge(row.status)}</td><td>${safe(row.detail)}${row.source ? `<div class="row-source">${sourceLink(row.source)}</div>` : ""}</td></tr>`).join("")}</tbody></table></div>`;
}

function nextStep(compound, rows) {
  const inhibition = rows.find(row => row.key === "inhibition");
  if (inhibition?.status === "not_assessed") {
    return compound.project
      ? {title:"Review functional TNIK inhibition evidence", detail:"Verify identity-matched assay records first. If direct functional data are absent from the reviewed sources, direct TNIK inhibition is the next evidence needed."}
      : {title:"Review compound-specific evidence", detail:"Start with identity-matched human TNIK assay records and pulmonary fibrosis publications."};
  }
  if (inhibition?.status === "supported" && rows.find(row => row.key === "cellular")?.status !== "supported") {
    return {title:"Review disease-relevant cellular evidence", detail:"Check whether a pulmonary fibroblast study supports an antifibrotic effect and addresses TNIK dependence."};
  }
  return nextStepFor(compound, rows);
}

function reportDate() {
  return `<p class="report-only small">TNIK Insight · Preclinical research report · Generated ${safe(date())}</p>`;
}

function profile(compound) {
  const rows = evidenceFor(compound);
  const next = nextStep(compound, rows);
  const props = compound.properties || {};
  const idDetails = [
    ["PubChem CID", value(compound.cid)], ["Formula", value(compound.formula)], ["Molecular weight", value(compound.weight, "g/mol")],
    ["XLogP", value(props.xlogp)], ["Polar surface area", value(props.tpsa, "Å²")],
    ["H-bond donors / acceptors", `${value(props.donors)} / ${value(props.acceptors)}`], ["Rotatable bonds", value(props.rotatableBonds)], ["Formal charge", value(props.charge)],
    ["InChIKey", `<code>${value(compound.inchiKey)}</code>`], ["SMILES", `<code>${value(compound.smiles)}</code>`]
  ];
  const observations = [...(compound.observations || [])].filter(item => item.label !== "Docked pose overlap with JWK");
  const docking = studyResults.docking[compound.id];
  return `${heading(compound.project ? "Original project candidate" : "External compound · PubChem", compound.name, compound.description || "Chemical identity retrieved from PubChem. Compound-specific evidence awaits review.", printButton)}
  <div class="wrap page-body">${reportDate()}<div class="layout">
    <div class="stack">
      <section class="panel next"><p class="kicker">Next evidence needed</p><h2>${safe(next.title)}</h2><p>${safe(next.detail)}</p>${compound.project ? "" : `<p>${externalLink("Search Europe PMC", literatureLink(compound))}</p>`}</section>
      <section class="panel"><h2>Evidence Gap Detector</h2><p>Open the cited source to inspect a finding. “Not assessed” indicates a question awaiting review.</p>${evidenceTable(rows)}</section>
      ${docking ? `<section class="panel"><div class="split"><h2>Original docking results</h2>${badge("Computational", "computational")}</div><p>These values describe the modeled pose. Binding affinity and functional inhibition require their own evidence.</p>
        ${details(dockingFields.map(([label,key,digits]) => [label,dockingValue(docking,key,digits)]))}
        ${fileSource("docking")}
        ${observations.length ? `<ul class="steps">${observations.map(item => `<li><strong>${safe(item.label)}</strong><p>${safe(item.detail)}</p><small>${safe(item.source)}</small></li>`).join("")}</ul>` : ""}
        <p><a class="source-link" href="#research">Project provenance and sources</a></p></section>` : ""}
      ${poseInteractions(compound)}
    </div>
    <aside class="stack"><section class="panel"><h2>Chemical identity</h2>${compoundImage(compound)}${details(idDetails)}
      ${compound.synonyms?.length ? `<details><summary>Synonyms</summary><p>${safe(compound.synonyms.slice(0, 20).join(" · "))}</p></details>` : ""}
      <p class="small">Computed descriptors · ${sourceLink(compound.source)}${compound.retrievedAt ? ` · Retrieved ${safe(date(compound.retrievedAt))}` : ""}</p>
      </section>
      ${compound.labelSource ? `<section class="panel"><h2>Drug-label context</h2><p><strong>Known target:</strong> ${safe(compound.target)}</p><p>${safe(compound.use)}</p><p>${safe(compound.safety)}</p><p>${sourceLink(compound.labelSource)}</p></section>` : ""}
    </aside></div></div>`;
}

function compared(selection) {
  const chosen = selection.map(byId).filter(Boolean);
  const sets = chosen.map(compound => evidenceFor(compound));
  const labels = evidenceFor(chosen[0]).map(row => row.label);
  return `<div class="table-wrap" tabindex="0" role="region" aria-label="Candidate comparison"><table class="compare-table">
    <thead><tr><th scope="col">Evidence category</th>${chosen.map(compound => `<th scope="col"><a class="source-link" href="${profileLink(compound)}">${safe(compound.name)}</a></th>`).join("")}</tr></thead>
    <tbody><tr><th scope="row">Known pharmacology</th>${chosen.map(compound => `<td>${safe(compound.target)}<div class="row-source">${sourceLink(compound.labelSource)}</div></td>`).join("")}</tr>
    ${dockingFields.map(([label,key,digits]) => `<tr><th scope="row">${label}</th>${chosen.map(compound => `<td>${dockingValue(studyResults.docking[compound.id],key,digits)}</td>`).join("")}</tr>`).join("")}
    ${labels.map((label, i) => `<tr><th scope="row">${safe(label)}</th>${sets.map(rows => `<td>${evidenceBadge(rows[i].status)}<p>${safe(rows[i].detail)}</p>${rows[i].source ? `<div class="row-source">${sourceLink(rows[i].source)}</div>` : ""}</td>`).join("")}</tr>`).join("")}
    <tr class="next-row"><th scope="row">Next evidence needed</th>${chosen.map((compound, i) => {
      const step = nextStep(compound, sets[i]);
      return `<td><strong>${safe(step.title)}</strong><p>${safe(step.detail)}</p></td>`;
    }).join("")}</tr></tbody></table></div>`;
}

function comparison(selection) {
  return `${heading("Candidate comparison", "Compare research candidates", "Compare evidence and next steps for two to four compounds from the original project.", printButton)}
    <div class="wrap page-body">${reportDate()}<section class="panel"><fieldset class="choices no-print"><legend>Select candidates</legend>
    ${candidates.map(item => `<label class="choice"><input type="checkbox" value="${item.id}" ${selection.includes(item.id) ? "checked" : ""}>${safe(item.name)}</label>`).join("")}</fieldset>
    <div id="comparison-table">${compared(selection)}</div>${fileSource("docking")}<p class="small">Each finding applies to its own assay, model, or study. Docking scores and contact counts describe modeled poses.</p></section></div>`;
}

function projectResults() {
  const {redocking, models, domain, screening} = studyResults;
  return `<section class="panel"><div class="split"><h2>Four-candidate docking comparison</h2>${badge("Computational", "computational")}</div>
    <p>Tepotinib and ponatinib differ by just 0.010 kcal/mol in their docking scores. Pocket overlap and modeled contacts give additional context for follow-up.</p>
    <figure class="study-figure"><img src="${assetPath("./assets/four-candidate-comparison.webp")}" alt="Comparative docking scores and structural contact counts for ponatinib, tepotinib, entrectinib and nilotinib">
    <figcaption>Supplied project figure. A numeric version is available in <a class="source-link" href="#compare">Compare</a>.</figcaption></figure>
    ${fileSource("docking")}</section>
    <div class="results-grid">
    <section class="panel"><h2>Reference redocking</h2><p>The modeled JWK pose was compared with its experimental pose in human TNIK (6RA7).</p>
    ${details([["Direct RMSD", value(redocking.rmsd.toFixed(3), "Å")], ["Project threshold", value(redocking.threshold.toFixed(1), "Å")], ["Heavy atoms matched", value(redocking.atoms)], ["Vina version", value(redocking.vina)]])}
    <p class="small">The reported RMSD met the project’s pose-reproduction threshold.</p>${fileSource("redocking")}</section>
    <section class="panel"><h2>Analogue screening</h2><p>The virtual screen generated ${screening.generated} analogues, retained ${screening.similar} after similarity filtering, and shortlisted ${screening.shortlisted}.</p>
    ${details([["Met both drug-likeness filters", value(screening.compliant)], ["Similarity cutoff", value(screening.similarityThreshold)]])}
    <p class="small">These are computational screening counts. The shortlist requires experimental follow-up.</p>${fileSource("screening", "Analogue_generation_summary and Top_22_integrated_candidates")}</section>
    </div>
    <section class="panel"><h2>Model evaluation</h2><p>Held-out results for five models on ${models[0].testCount} compounds. RMSE and MAE are in pIC₅₀ units.</p>
    <div class="table-wrap" tabindex="0" role="region" aria-label="Model evaluation"><table><thead><tr><th scope="col">Model</th><th scope="col">Test R²</th><th scope="col">Test RMSE</th><th scope="col">Test MAE</th></tr></thead>
    <tbody>${models.map(model => `<tr><th scope="row">${safe(model.name)}</th><td>${model.r2.toFixed(4)}</td><td>${model.rmse.toFixed(4)}</td><td>${model.mae.toFixed(4)}</td></tr>`).join("")}</tbody></table></div>
    <p>Random Forest had the lowest test error in this comparison. Its mean absolute error was ${domain.insideMAE.toFixed(3)} for ${domain.inside} compounds inside the similarity domain and ${domain.outsideMAE.toFixed(3)} for ${domain.outside} outside it (similarity cutoff ${domain.threshold}). The outside-domain group is small.</p>
    ${fileSource("models", "Model_Comparison and AD_Summary")}</section>`;
}

function research() {
  return `${heading("Research library", "TNIK & IPF research", "Target rationale, project provenance, and publications for further reading.")}
  <div class="wrap page-body stack">
    <div class="research-grid">
      <section class="panel">${square("atom")}<h2>Human TNIK</h2><p>${safe(target.description)}</p>${details([["Protein", safe(target.name)], ["Reference structure", "6RA7 · TNIK with JWK"], ["Method", "X-ray diffraction · 1.20 Å"]])}<p>${sourceLink(target.source)} · ${externalLink("View structure in RCSB", target.structure.viewer)}</p></section>
      <section class="panel">${square("flask", "purple")}<h2>Why pulmonary fibrosis?</h2><p>Idiopathic pulmonary fibrosis is a progressive scarring disease of the lungs. TNIK has been investigated as a therapeutic target in fibrosis research, including a phase 2a study of rentosertib in IPF.</p><p>That study provides context for the target. It assessed rentosertib and its specific study population.</p><p>${externalLink("Read the phase 2a study", publications[0].url)}</p></section>
      <section class="panel">${square("layers", "blue")}<h2>Original study</h2><p>The workflow covers curated TNIK bioactivity, model evaluation, virtual screening, and comparison against a crystallographic reference.</p><p>The project tables supply docking, redocking, pose annotations, model evaluation, and analogue screening results. Live predictions require the trained model.</p></section>
    </div>
    ${projectResults()}
    <section><div class="section-title"><div><h2>Selected publications</h2><p>Primary studies with summaries and limitations.</p></div></div>
    <div class="paper-grid">${publications.map(paper => `<article class="card paper-card">${badge(paper.type, paper.type === "Clinical trial" ? "teal" : "")}<h3>${safe(paper.title)}</h3><p class="pub-meta">${safe(paper.authors)} · ${safe(paper.journal)} · ${safe(paper.year)}</p><p>${safe(paper.summary)}</p><p><strong>Study scope:</strong> ${safe(paper.limitation)}</p><p>${externalLink("DOI " + paper.doi, paper.url)}</p></article>`).join("")}</div></section>
    <section class="panel"><h2>Data sources</h2>${details(sources.map(source => [source.label, `${safe(source.role)} · ${externalLink("Source", source.url)}`]))}</section>
  </div>`;
}

function localMatch(query, type) {
  const cid = query.match(/^(?:CID\s*[:#]?\s*)?(\d+)$/i)?.[1];
  return candidates.find(item => {
    if (type === "cid") return String(item.cid) === query;
    if (type === "smiles") return item.smiles === query;
    if (type === "inchikey") return item.inchiKey.toLowerCase() === query.toLowerCase();
    if (type === "auto" && (String(item.cid) === cid || item.smiles === query || item.inchiKey.toLowerCase() === query.toLowerCase())) return true;
    return [item.name, ...item.synonyms].some(term => term.toLowerCase() === query.toLowerCase());
  });
}

function externalProfile(result) {
  const record = result.compound;
  return {
    ...record, id: String(record.cid), retrievedAt: result.retrievedAt,
    source: {label:`PubChem · CID ${record.cid}`, url: record.sourceUrl},
    properties: {xlogp:record.logP, tpsa:record.tpsa, donors:record.hbd, acceptors:record.hba, rotatableBonds:record.rotatableBonds, charge:record.formalCharge}
  };
}

async function runSearch(query, type) {
  const form = main.querySelector("[data-search]");
  if (!form) return;
  form.elements.q.value = query;
  form.elements.type.value = type;
  const resultPanel = document.querySelector("#search-result");
  const match = localMatch(query, type);
  if (match) {
    location.hash = profileLink(match);
    return;
  }
  const current = ++searchSequence;
  resultPanel.innerHTML = `<div class="panel result"><p>Looking up ${safe(query)} in PubChem…</p></div>`;
  resultPanel.setAttribute("aria-busy", "true");
  try {
    const result = await lookupCompound(query, type);
    if (current !== searchSequence) return;
    const entry = externalProfile(result);
    external.set(entry.id, entry);
    if (result.matchCount > 1) {
      const options = [result.compound, ...result.alternatives];
      resultPanel.innerHTML = `<section class="panel result"><h2>Choose a matching compound</h2><p>PubChem returned ${safe(result.matchCount)} matches. Confirm the compound before viewing its profile.</p><ul class="match-list">${options.map(option => `<li><a class="source-link" href="#compound/${encodeURIComponent(option.cid)}">${safe(option.name)} · CID ${safe(option.cid)}</a></li>`).join("")}</ul></section>`;
    } else {
      location.hash = profileLink(candidates.find(item => item.cid === entry.cid) || entry);
    }
  } catch (error) {
    if (current !== searchSequence) return;
    const heading = error.status === 404 ? "No compound found" : error.status === 400 ? "Check the identifier" : "PubChem lookup unavailable";
    resultPanel.innerHTML = `<section class="panel result" role="alert"><h2>${heading}</h2><p>${safe(error.message)}</p><p>The original project compounds remain available below.</p></section>`;
  } finally {
    resultPanel.removeAttribute("aria-busy");
  }
}

function selectionFor(params) {
  const selection = [...new Set((params.get("ids") || "").split(","))].filter(byId);
  return selection.length >= 2 ? selection : [candidates[0].id, candidates[1].id];
}

function captureImageFailures() {
  for (const image of main.querySelectorAll(".molecule img")) {
    const showFallback = () => { image.hidden = true; image.nextElementSibling.hidden = false; };
    image.addEventListener("error", showFallback, {once:true});
    if (image.complete && image.naturalWidth === 0) showFallback();
  }
}

async function route(moveFocus = true) {
  const current = ++searchSequence;
  const [path, query] = location.hash.slice(1).split("?");
  const [page, id] = (path || "home").split("/");
  const params = new URLSearchParams(query);
  shell(page === "compound" ? "explore" : page);
  if (page === "compound") {
    let compound = byId(id) || candidates.find(item => String(item.cid) === id) || external.get(id);
    if (!compound && /^\d{1,12}$/.test(id || "")) {
      main.innerHTML = heading("Compound Explorer", "Loading compound", "Retrieving its chemical identity from PubChem.");
      try {
        compound = externalProfile(await lookupCompound(id, "cid"));
        external.set(id, compound);
      } catch (error) {
        if (current !== searchSequence) return;
        main.innerHTML = `${heading("Compound Explorer", error.status === 404 ? "No compound found" : "Compound lookup unavailable", error.message)}<div class="wrap page-body"><a class="btn secondary" href="#explore">Return to Explorer</a></div>`;
        return;
      }
      if (current !== searchSequence) return;
    }
    main.innerHTML = compound ? profile(compound) : `${heading("Compound Explorer", "Compound not found", "Choose a compound from the Explorer.")}<div class="wrap page-body"><a class="btn secondary" href="#explore">Return to Explorer</a></div>`;
    captureImageFailures();
  } else if (page === "explore") {
    main.innerHTML = explorer();
    if (params.get("q")) void runSearch(params.get("q"), params.get("type") || "auto");
  } else if (page === "compare") {
    main.innerHTML = comparison(selectionFor(params));
  } else if (page === "research") {
    main.innerHTML = research();
  } else {
    main.innerHTML = home();
  }
  document.title = `${main.querySelector("h1")?.textContent.replace(/\s+/g, " ") || "Research"} | TNIK Insight`;
  if (moveFocus) {
    window.scrollTo(0, 0);
    main.focus({preventScroll:true});
  }
}

document.addEventListener("submit", event => {
  if (!event.target.matches("[data-search]")) return;
  event.preventDefault();
  const form = event.target;
  const data = new FormData(form);
  const query = String(data.get("q")).trim();
  const type = String(data.get("type") || "auto");
  if (!query) return;
  const match = localMatch(query, type);
  if (match) {
    location.hash = profileLink(match);
  } else if (form.dataset.hero === "true") {
    location.hash = `#explore?${new URLSearchParams({q:query, type})}`;
  } else {
    history.replaceState(null, "", `#explore?${new URLSearchParams({q:query, type})}`);
    void runSearch(query, type);
  }
});

document.addEventListener("change", event => {
  if (!event.target.matches(".choices input")) return;
  const selected = [...main.querySelectorAll(".choices input:checked")].map(input => input.value);
  if (selected.length < 2) {
    event.target.checked = true;
    live.textContent = "Select at least two compounds.";
    return;
  }
  history.replaceState(null, "", `#compare?${new URLSearchParams({ids:selected.join(",")})}`);
  document.querySelector("#comparison-table").innerHTML = compared(selected);
  live.textContent = `Comparing ${selected.length} compounds.`;
});

document.addEventListener("click", event => {
  if (event.target.closest("[data-print]")) window.print();
  const menu = event.target.closest("[data-menu]");
  if (!menu) return;
  const open = header.querySelector("#navigation").classList.toggle("open");
  menu.setAttribute("aria-expanded", String(open));
  menu.innerHTML = icon(open ? "close" : "menu");
});

window.addEventListener("hashchange", () => {
  if (location.hash !== "#main") void route();
});
void route(false);



