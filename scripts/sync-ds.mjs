#!/usr/bin/env node
/**
 * Sync Agorapulse Design System CSS + fonts from node_modules into ./ds/.
 * Runs automatically via `postinstall` in package.json.
 *
 * Why not import directly from node_modules? The DS font-face.css uses relative
 * url() paths that assume fonts sit two levels up from css-ui/. We keep everything
 * under ./ds/ and rewrite those paths to ../fonts/averta/ so they resolve inside ds/.
 */
import { cp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const ds = join(root, "ds");
const theme = join(root, "node_modules/@agorapulse/ui-theme/assets");
const symbol = join(root, "node_modules/@agorapulse/ui-symbol/icons");

await rm(ds, { recursive: true, force: true });
await mkdir(join(ds, "css-ui"), { recursive: true });

await Promise.all([
  cp(join(theme, "desktop_variables.css"), join(ds, "desktop_variables.css")),
  cp(join(theme, "style/css-ui/index.css"), join(ds, "css-ui/index.css")),
  cp(join(theme, "fonts"), join(ds, "fonts"), { recursive: true }),
  cp(join(symbol, "ap-icons.css"), join(ds, "ap-icons.css")),
]);

// Rewrite font-face.css: ../../fonts/averta/ → ../fonts/averta/
const fontFace = await readFile(join(theme, "style/css-ui/font-face.css"), "utf8");
await writeFile(
  join(ds, "css-ui/font-face.css"),
  fontFace.replaceAll("../../fonts/averta/", "../fonts/averta/"),
);

console.log("✓ Design System synced to ./ds/");
