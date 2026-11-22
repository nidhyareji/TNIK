import {ResearchApiError, externalCompound} from "../public/api.js";

export async function handleApi(request, _env, fetcher = fetch) {
  const {pathname, searchParams} = new URL(request.url);
  if (!["/api/compound", "/api/depiction"].includes(pathname)) return null;

  const headers = {"Cache-Control": "no-store", "X-Content-Type-Options": "nosniff"};
  if (request.method !== "GET") {
    return Response.json({message: "Use GET for this lookup."}, {status: 405, headers: {...headers, Allow: "GET"}});
  }

  try {
    if (pathname === "/api/depiction") {
      const cid = searchParams.get("cid") || "";
      if (!/^\d{1,12}$/.test(cid)) throw new ResearchApiError("Enter a valid PubChem CID.", 400);
      const image = await fetcher("https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/cid/" + cid + "/PNG?image_size=large", {
        headers: {Accept: "image/png"}, signal: AbortSignal.timeout(8000)
      });
      if (!image.ok || !/^image\/png(?:;|$)/i.test(image.headers.get("content-type") || "")) {
        throw new ResearchApiError("The PubChem structure image could not be loaded.", image.status === 404 ? 404 : 502);
      }
      return new Response(image.body, {headers: {...headers, "Content-Type": "image/png", "Cache-Control": "public, max-age=604800"}});
    }
    const result = await externalCompound(searchParams.get("q"), searchParams.get("type") ?? "auto", fetcher);
    return Response.json(result, {headers});
  } catch (error) {
    const status = error instanceof ResearchApiError ? error.status : 502;
    const message = error instanceof ResearchApiError ? error.message : "PubChem could not be reached. Try again when online.";
    return Response.json({message}, {status, headers});
  }
}
