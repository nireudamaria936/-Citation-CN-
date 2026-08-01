import { cp, mkdir, rm, writeFile } from "node:fs/promises";

const output = new URL("../gh-pages-dist/", import.meta.url);
const workerUrl = new URL("../dist/server/index.js", import.meta.url);
workerUrl.searchParams.set("export", Date.now().toString());

await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });

const { default: worker } = await import(workerUrl.href);
const response = await worker.fetch(
  new Request("https://citation-cn.github.io/", { headers: { accept: "text/html" } }),
  { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } },
  { waitUntil() {}, passThroughOnException() {} },
);

if (!response.ok) throw new Error(`Static render failed: ${response.status}`);

let html = await response.text();
html = html.replace(/(?:src|href)="\/(?!\/)/g, (match) => match.replace('"/', '"./'));
html = html.replace(/(["'])\/assets\//g, "$1./assets/");
await writeFile(new URL("index.html", output), html);

await cp(new URL("../dist/client/", import.meta.url), output, { recursive: true, force: true });
await writeFile(new URL(".nojekyll", output), "");
await writeFile(new URL("404.html", output), html);

console.log("GitHub Pages site exported to gh-pages-dist/");
