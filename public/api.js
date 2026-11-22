const PUBCHEM = "https://pubchem.ncbi.nlm.nih.gov/rest/pug";
const PROPERTY_NAMES = [
  "Title", "MolecularFormula", "MolecularWeight", "SMILES", "ConnectivitySMILES",
  "InChI", "InChIKey", "XLogP", "TPSA", "HBondDonorCount", "HBondAcceptorCount",
  "RotatableBondCount", "Charge", "IUPACName"
].join(",");
const COMPOUND_TYPES = new Set(["auto", "name", "cid", "smiles", "inchikey", "inchi"]);
const cache = new Map();
const pending = new Map();

export class ResearchApiError extends Error {
  constructor(message, status = 502) {
    super(message);
    this.name = "ResearchApiError";
    this.status = status;
  }
}

function cached(key, fn) {
  const existing = cache.get(key);
  if (existing?.expiresAt > Date.now()) return Promise.resolve(existing.value);
  if (pending.has(key)) return pending.get(key);

  const task = Promise.resolve().then(fn).then(value => {
    if (!["unavailable", "partial"].includes(value.status)) {
      if (cache.size >= 128) cache.delete(cache.keys().next().value);
      cache.set(key, {value, expiresAt: Date.now() + 15 * 60 * 1000});
    }
    return value;
  }).finally(() => pending.delete(key));
  pending.set(key, task);
  return task;
}

async function requestData(url, source, {parse = "json", init, fetcher = fetch, timeout = 9500} = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);
  try {
    const response = await fetcher(url, {
      ...init,
      signal: controller.signal,
      headers: {Accept: parse === "json" ? "application/json" : "text/plain", ...init?.headers},
    });
    if (response.status === 404) throw new ResearchApiError(`No matching record was found at ${source}.`, 404);
    if (!response.ok) throw new ResearchApiError(`${source} returned HTTP ${response.status}. Try again shortly.`);
    return parse === "text" ? await response.text() : await response.json();
  } catch (error) {
    if (error instanceof ResearchApiError) throw error;
    throw new ResearchApiError(`${source} could not be reached. Try again when you’re online.`);
  } finally {
    clearTimeout(timer);
  }
}

const textQuery = (value, limit = 240) => {
  const cleaned = String(value ?? "").trim();
  if (!cleaned || cleaned.length > limit || /[\x00-\x1F\x7F]/.test(cleaned)) {
    throw new ResearchApiError(`Enter a query of 1 to ${limit} characters.`, 400);
  }
  return cleaned;
};

function compoundQuery(input, type) {
  const value = textQuery(input, 900);
  if (!COMPOUND_TYPES.has(type)) throw new ResearchApiError("Select a supported compound identifier type.", 400);
  if (type !== "auto") {
    if (type === "cid" && !/^\d{1,12}$/.test(value)) throw new ResearchApiError("Enter a numeric PubChem CID.", 400);
    if (type === "inchikey" && !/^[A-Z]{14}-[A-Z]{10}-[A-Z]$/i.test(value)) {
      throw new ResearchApiError("Enter a complete InChIKey.", 400);
    }
    return {type, value: type === "inchikey" ? value.toUpperCase() : value};
  }
  if (/^(?:CID\s*[:#]?\s*)?\d{1,12}$/i.test(value)) return {type: "cid", value: value.match(/\d+$/)[0]};
  if (/^[A-Z]{14}-[A-Z]{10}-[A-Z]$/i.test(value)) return {type: "inchikey", value: value.toUpperCase()};
  if (/^InChI=/i.test(value)) return {type: "inchi", value};
  return {type: "name", value};
}

function pubChemRequest(type, value, operation, fetcher) {
  if (["smiles", "inchi"].includes(type)) {
    const init = {
      method: "POST",
      headers: {"Content-Type": "application/x-www-form-urlencoded"},
      body: new URLSearchParams({[type]: value})
    };
    return requestData(`${PUBCHEM}/compound/${type}/${operation}`, "PubChem", {init, fetcher});
  }
  return requestData(`${PUBCHEM}/compound/${type}/${encodeURIComponent(value)}/${operation}`, "PubChem", {fetcher});
}

function numeric(value) {
  if (value === undefined || value === null || value === "") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export async function externalCompound(input, type = "auto", fetcher = fetch) {
  const selected = compoundQuery(input, type);
  return cached(`compound:${type}:${selected.type}:${selected.value}`, async () => {
    const operation = `property/${PROPERTY_NAMES}/JSON`;
    let response;
    try {
      response = await pubChemRequest(selected.type, selected.value, operation, fetcher);
    } catch (error) {
      if (type !== "auto" || selected.type !== "name" || error.status !== 404) throw error;
      const plausibleSmiles = /^[A-Za-z0-9@+\-\[\]()=#$%.\\/]+$/.test(selected.value) &&
        /[\d@()=#[\].\\/]/.test(selected.value);
      if (!plausibleSmiles) throw error;
      response = await pubChemRequest("smiles", selected.value, operation, fetcher);
    }
    const rows = response.PropertyTable?.Properties;
    if (!Array.isArray(rows)) throw new ResearchApiError("PubChem returned an unexpected compound response.");
    const row = rows[0];
    if (!row?.CID) throw new ResearchApiError("PubChem returned no usable compound records for this query.", 404);
    const synonymsResult = await pubChemRequest("cid", row.CID, "synonyms/JSON", fetcher)
      .then(data => ({synonyms: data.InformationList?.Information?.[0]?.Synonym?.slice(0, 20) ?? [], synonymsStatus: "reviewed"}))
      .catch(() => ({synonyms: [], synonymsStatus: "unavailable"}));
    const cid = row.CID;
    return {
      compound: {
        name: row.Title || row.IUPACName || `PubChem CID ${cid}`,
        cid,
        formula: row.MolecularFormula ?? null,
        weight: numeric(row.MolecularWeight),
        smiles: row.SMILES ?? row.IsomericSMILES ?? null,
        connectivitySmiles: row.ConnectivitySMILES ?? row.CanonicalSMILES ?? null,
        inchi: row.InChI ?? null,
        inchiKey: row.InChIKey ?? null,
        iupacName: row.IUPACName ?? null,
        logP: numeric(row.XLogP),
        tpsa: numeric(row.TPSA),
        hbd: numeric(row.HBondDonorCount),
        hba: numeric(row.HBondAcceptorCount),
        rotatableBonds: numeric(row.RotatableBondCount),
        formalCharge: numeric(row.Charge),
        imageUrl: `${PUBCHEM}/compound/cid/${cid}/PNG?image_size=large`,
        sourceUrl: `https://pubchem.ncbi.nlm.nih.gov/compound/${cid}`,
        ...synonymsResult
      },
      matchCount: rows.length,
      alternatives: rows.slice(1, 8).map(other => ({cid: other.CID, name: other.Title || other.IUPACName || `PubChem CID ${other.CID}`})),
      source: "PubChem",
      retrievedAt: new Date().toISOString()
    };
  });
}

async function viaBackend(path, params, fallback) {
  if (typeof window === "undefined" || window.location.protocol === "file:") return fallback();
  try {
    return await requestData(`/api/${path}?${new URLSearchParams(params)}`, "TNIK Insight", {
      timeout: 23000,
      fetcher: async (url, init) => {
        const response = await fetch(url, init);
        if (!response.headers.get("Content-Type")?.includes("application/json") || response.status === 501) {
          throw new ResearchApiError("No application API was detected.", 501);
        }
        if (!response.ok) {
          const error = await response.json().catch(() => ({}));
          throw new ResearchApiError(error.message || `The lookup returned HTTP ${response.status}.`, response.status);
        }
        return response;
      }
    });
  } catch (error) {
    if (error.status === 501) return fallback();
    throw error;
  }
}

export function lookupCompound(query, type = "auto") {
  return viaBackend("compound", {q: query, type}, () => externalCompound(query, type));
}


