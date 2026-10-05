// Builds app.min.js from src/app.js and inlines minified src/style.css into index.html's <style> block.
import { build } from "esbuild";
import { readFileSync, writeFileSync } from "node:fs";

await build({
  entryPoints: ["src/app.js"], bundle: true, minify: true, format: "iife", target: "es2020",
  banner: { js: "/* Built from src/app.js. Do not edit; run npm run build. */" },
  outfile: "app.min.js",
});

const { outputFiles: [css] } = await build({ entryPoints: ["src/style.css"], minify: true, write: false });
const html = readFileSync("index.html", "utf8");
const block = /<style>[\s\S]*?<\/style>/;
if (!block.test(html)) throw new Error("index.html has no <style></style> block to fill");
writeFileSync("index.html", html.replace(block, () => `<style>/* Built from src/style.css. Do not edit; run npm run build. */${css.text.trim()}</style>`));
