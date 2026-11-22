import {createServer} from "node:http";
import {readFile} from "node:fs/promises";
import {extname, resolve, sep} from "node:path";
import {fileURLToPath} from "node:url";
import {Readable} from "node:stream";
import {handleApi} from "./api.mjs";

const root = fileURLToPath(new URL("../public/", import.meta.url)).replace(/[\\/]$/, "");
export const contentTypes = {
  ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8", ".svg": "image/svg+xml", ".png": "image/png", ".webp": "image/webp"
};

export async function localResponse(request, fetcher = fetch) {
  const api = await handleApi(request, null, fetcher);
  if (api) return api;
  if (!["GET", "HEAD"].includes(request.method)) return new Response("Method not allowed", {status: 405});
  const {pathname} = new URL(request.url);
  const filename = resolve(root, "." + (pathname === "/" ? "/index.html" : pathname));
  if (!filename.startsWith(root + sep) || !Object.hasOwn(contentTypes, extname(filename))) {
    return new Response("Page not found", {status: 404});
  }
  try {
    const body = await readFile(filename);
    return new Response(request.method === "HEAD" ? null : body, {
      headers: {"content-type": contentTypes[extname(filename)], "x-content-type-options": "nosniff"}
    });
  } catch {
    return new Response("Page not found", {status: 404});
  }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const port = Number(process.env.PORT || 4173);
  const origin = "http://127.0.0.1:" + port;
  createServer(async (request, outgoing) => {
    try {
      const response = await localResponse(new Request(new URL(request.url, origin), {method: request.method}));
      outgoing.writeHead(response.status, Object.fromEntries(response.headers));
      if (response.body) Readable.fromWeb(response.body).pipe(outgoing);
      else outgoing.end();
    } catch {
      outgoing.writeHead(500, {"content-type": "text/plain; charset=utf-8"});
      outgoing.end("The application could not serve this request.");
    }
  }).listen(port, "127.0.0.1", () => console.log("Local: " + origin));
}
