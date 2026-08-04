import { copyFile, mkdir } from "node:fs/promises";

const target = new URL("../wps-addin/shared/", import.meta.url);
await mkdir(target, { recursive: true });
await copyFile(new URL("../lib/citation.js", import.meta.url), new URL("citation.js", target));
await copyFile(new URL("../lib/citation-checker.js", import.meta.url), new URL("citation-checker.js", target));
await copyFile(new URL("../lib/legal-citation-rules.js", import.meta.url), new URL("legal-citation-rules.js", target));

console.log("WPS add-in shared citation core synchronized.");
