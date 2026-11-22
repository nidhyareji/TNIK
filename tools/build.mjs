import {readdir, readFile, mkdir, copyFile, writeFile} from "node:fs/promises";
import {extname, resolve} from "node:path";
import {fileURLToPath} from "node:url";
import {contentTypes} from "../server/local.mjs";

const root = fileURLToPath(new URL("../", import.meta.url));
const appRoot = resolve(root, "public");
const read = file => readFile(resolve(root, file), "utf8");
async function filesIn(folder = "") {
  const entries = await readdir(resolve(appRoot, folder), {withFileTypes:true});
  const nested = await Promise.all(entries.map(entry => {
    const name = [folder, entry.name].filter(Boolean).join("/");
    return entry.isDirectory() ? filesIn(name) : [name];
  }));
  return nested.flat();
}
const removeImports = code => code.replace(/^import .+\r?\n/gm, "");
const removeExports = code => code.replace(/^export /gm, "");
const safeScript = code => code.replace(/<\/script/gi, "<\\/script");
const assets = {};
for (const file of await filesIn()) {
  const type = contentTypes[extname(file)];
  if (!type) continue;
  assets["/" + file] = {type, bytes: (await readFile(resolve(appRoot, file))).toString("base64")};
}

const api = await read("public/api.js");
const server = removeImports(await read("server/api.mjs"));
const worker = `${api}
${server}
const workerAssets = ${JSON.stringify(assets)};
export default {
  async fetch(request, env) {
    const result = await handleApi(request, env);
    if (result) return result;
    if (!["GET","HEAD"].includes(request.method)) return new Response("Method not allowed", {status:405});
    const pathname = new URL(request.url).pathname;
    const asset = workerAssets[pathname === "/" ? "/index.html" : pathname];
    if (!asset) return new Response("Page not found", {status:404});
    const bytes = request.method === "HEAD" ? null : Uint8Array.from(atob(asset.bytes), character => character.charCodeAt(0));
    return new Response(bytes, {headers: {"Content-Type":asset.type, "X-Content-Type-Options":"nosniff", "Cache-Control": "public, max-age=300"}});
  }
};
`;
await mkdir(resolve(root, "dist/server"), {recursive:true});
await mkdir(resolve(root, "dist/.openai"), {recursive:true});
await copyFile(resolve(root, ".openai/hosting.json"), resolve(root, "dist/.openai/hosting.json"));
await writeFile(resolve(root, "dist/server/index.js"), worker);

if (process.argv[2]) {
  const inlineAssets = Object.fromEntries(Object.entries(assets)
    .filter(([file]) => file.startsWith("/assets/"))
    .map(([file, asset]) => ["." + file, "data:" + asset.type + ";base64," + asset.bytes]));
  const css = (await read("public/styles.css")).replace(/url\("\.\/assets\/[^"]+"\)/g, match => {
    const asset = inlineAssets[match.slice(5, -2)];
    return asset ? 'url("' + asset + '")' : "none";
  });
  const scripts = [api, await read("public/results.js"), await read("public/data.js"), await read("public/app.js")]
    .map(code => removeExports(removeImports(code))).join("\n");
  const html = (await read("public/index.html"))
    .replace('href="/assets/mark.svg"', 'href="' + inlineAssets["./assets/mark.svg"] + '"')
    .replace('<link rel="stylesheet" href="/styles.css">', () => "<style>" + css + "</style>")
    .replace('<script type="module" src="/app.js"></script>', "")
    .replace("</body>", () => '<script type="module">const offlineAssets = ' + JSON.stringify(inlineAssets) + ';\n' + safeScript(scripts) + '</script>\n</body>');
  await writeFile(resolve(process.argv[2]), html);
}
