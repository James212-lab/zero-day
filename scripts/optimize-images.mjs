"use strict";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const IMG_DIR = path.resolve(__dirname, "..", "images");

async function main() {
  let hasSharp = false;
  try {
    await import("sharp");
    hasSharp = true;
  } catch {
    console.log("sharp not installed — run: npm i -D sharp");
  }
  if (!hasSharp) return;

  const { default: sharp } = await import("sharp");
  const files = fs.existsSync(IMG_DIR)
    ? fs.readdirSync(IMG_DIR).filter((f) => /\.(jpe?g|png)$/i.test(f))
    : [];
  if (!files.length) {
    console.log("No images found in images/. Generate them via google-flow-prompts.txt first.");
    return;
  }

  let saved = 0;
  for (const f of files) {
    const src = path.join(IMG_DIR, f);
    const dest = path.join(IMG_DIR, f.replace(/\.(jpe?g|png)$/i, ".webp"));
    const before = fs.statSync(src).size;
    await sharp(src)
      .resize({ width: 1600, withoutEnlargement: true })
      .webp({ quality: 80 })
      .toFile(dest);
    const after = fs.statSync(dest).size;
    const pct = (100 * (before - after)) / before;
    saved++;
    console.log(`${f} -> ${path.basename(dest)} (-${pct.toFixed(1)}%)`);
  }
  console.log(`\nOptimized ${saved} images.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});