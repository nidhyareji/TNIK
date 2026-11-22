import {test} from "node:test";
import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
import {candidates, evidenceFor} from "../public/data.js";
import {localResponse} from "../server/local.mjs";

const local = (path, fetcher) => localResponse(new Request("http://localhost" + path), fetcher);
const json = data => Response.json(data);
const properties = [
  {CID:2244, Title:"Aspirin", MolecularFormula:"C9H8O4", MolecularWeight:"180.16", Charge:0},
  {CID:123456, Title:"Second matching record"}
];

test("offline project dataset identifies four unique candidates and limits evidence claims", async () => {
  assert.equal(new Set(candidates.map(item => item.cid)).size, 4);
  for (const item of candidates) {
    const png = await readFile(new URL("../public/assets/compound-" + item.cid + ".png", import.meta.url));
    assert.deepEqual([...png.subarray(0, 8)], [137,80,78,71,13,10,26,10]);
    const rows = evidenceFor(item);
    assert.equal(rows.find(row => row.key === "inhibition").status, "not_assessed");
    assert.equal(rows.find(row => row.key === "antifibrotic").status, item.id === "nilotinib" ? "supported" : "not_assessed");
  }
});

test("lookup preserves identifiers, computed zero, and ambiguity", async () => {
  const fetcher = async url => url.includes("/synonyms/")
    ? json({InformationList:{Information:[{Synonym:["Acetylsalicylic acid"]}]}})
    : json({PropertyTable:{Properties:properties}});
  const result = await local("/api/compound?q=aspirin-check", fetcher);
  assert.equal(result.status, 200);
  const data = await result.json();
  assert.equal(data.compound.cid, 2244);
  assert.equal(data.compound.formalCharge, 0);
  assert.equal(data.matchCount, 2);
  assert.equal(data.alternatives[0].cid, 123456);
  assert.deepEqual(data.compound.synonyms, ["Acetylsalicylic acid"]);
});

test("a miss, an invalid identifier and a provider outage stay distinct", async () => {
  assert.equal((await local("/api/compound?q=absent-check", async () => new Response(null,{status:404}))).status, 404);
  assert.equal((await local("/api/compound?q=bad&type=cid", async () => assert.fail("Unexpected upstream request"))).status, 400);
  assert.equal((await local("/api/compound?q=offline-check", async () => {throw new Error("Offline");})).status, 502);
});

test("explicit SMILES uses an encoded form and cannot change the upstream host", async () => {
  const result = await local("/api/compound?q=C%23N&type=smiles", async (url, init) => {
    assert.match(url, /^https:\/\/pubchem\.ncbi\.nlm\.nih\.gov\/rest\/pug\/compound\//);
    if (url.includes("synonyms")) return json({});
    assert.equal(init.method, "POST");
    assert.equal(init.body.get("smiles"), "C#N");
    return json({PropertyTable:{Properties:[{CID:768,Title:"Hydrogen cyanide"}]}});
  });
  assert.equal(result.status, 200);
});

test("the local app serves its shell without network", async () => {
  const result = await local("/", async () => assert.fail("Unexpected upstream request"));
  assert.equal(result.status, 200);
  assert.match(await result.text(), /TNIK Insight/);
  assert.equal((await local("/missing.js", async () => assert.fail("Unexpected upstream request"))).status, 404);
});
