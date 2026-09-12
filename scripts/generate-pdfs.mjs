"use strict";
import puppeteer from "puppeteer-core";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const PDF_DIR = path.join(ROOT, "pdfs");
const BASE_URL = "http://localhost:3097";
const EDGE_PATH = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const APP_DIR = path.join(ROOT, ".next", "server", "app", "module");

const PRINT_CSS = `
  @media print {
    body, main { background: #ffffff !important; }
    body { color: #1e293b !important; }
    header, footer, aside, nav, .no-print, #sidebar { display: none !important; }
    .scanline-overlay, .grid-lines { display: none !important; }
    main { padding: 0 !important; max-width: none !important; margin: 0 !important; }
    .lg\\:col-span-2 { display: none !important; }
    .grid { display: block !important; }
    .lg\\:col-span-3 { width: 100% !important; }
    .prose-lesson { max-width: none !important; }
    .prose-lesson h1 { color: #1e293b; border-bottom-color: #e2e8f0; }
    .prose-lesson h2, .prose-lesson h3, .prose-lesson h4 { color: #334155; }
    .prose-lesson p, .prose-lesson li { color: #475569; }
    .prose-lesson code { background: #f1f5f9 !important; color: #6366f1 !important; border-color: #e2e8f0 !important; }
    .prose-lesson pre { background: #f8fafc !important; color: #0f172a !important; border-color: #e2e8f0 !important; }
    .prose-lesson pre code { background: transparent !important; color: inherit !important; }
    .prose-lesson blockquote { background: #eef2ff !important; border-left-color: #6366f1 !important; }
    .prose-lesson th { background: #f1f5f9 !important; }
    .cyber-card, .terminal { box-shadow: none !important; border-color: #e2e8f0 !important; background: #ffffff !important; }
    a { color: #4f46e5 !important; text-decoration: none !important; }
  }
`;

async function listModuleSlugs() {
  const slugs = [];
  for (const entry of fs.readdirSync(APP_DIR, { withFileTypes: true })) {
    if (entry.isDirectory() && !entry.name.startsWith("[") && !entry.name.endsWith(".segments")) {
      slugs.push(entry.name);
    }
  }
  return slugs.sort();
}

function listLessonSlugs(moduleSlug) {
  const dir = path.join(APP_DIR, moduleSlug);
  const slugs = [];
  for (const name of fs.readdirSync(dir)) {
    if (name.endsWith(".html") && !name.startsWith("[") && name !== "page.html") {
      slugs.push(name.replace(/\.html$/, ""));
    }
  }
  return slugs.sort();
}

async function makePdf(page, url, outPath) {
  await page.goto(url, { waitUntil: "networkidle0", timeout: 45000 });
  try {
    await page.waitForSelector(".lg\\:col-span-3, .cyber-card, .prose-lesson", { timeout: 15000 });
  } catch {
    /* module index or short page — fine */
  }
  await page.addStyleTag({ content: PRINT_CSS });
  await page.pdf({
    path: outPath,
    format: "A4",
    margin: { top: "18mm", bottom: "18mm", left: "14mm", right: "14mm" },
    printBackground: true,
    preferCSSPageSize: false,
  });
}

const filter = process.argv.find((a) => a.startsWith("--module="))?.split("=")[1];

(async () => {
  const moduleSlugs = await listModuleSlugs();
  const targets = filter ? moduleSlugs.filter((s) => s.includes(filter)) : moduleSlugs;

  fs.mkdirSync(PDF_DIR, { recursive: true });
  const browser = await puppeteer.launch({
    executablePath: EDGE_PATH,
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-gpu"],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 1600 });

  let ok = 0;
  let fail = 0;
  const started = Date.now();

  for (const modSlug of targets) {
    const modDir = path.join(PDF_DIR, modSlug);
    fs.mkdirSync(modDir, { recursive: true });

    const indexPdf = path.join(modDir, "00-module.pdf");
    try {
      await makePdf(page, `${BASE_URL}/module/${modSlug}`, indexPdf);
      console.log(`  ✓ ${modSlug}/00-module.pdf`);
      ok++;
    } catch (err) {
      console.error(`  ✗ ${modSlug}/00-module.pdf: ${err.message}`);
      fail++;
    }

    const lessons = listLessonSlugs(modSlug);
    for (const lessonSlug of lessons) {
      const pdfPath = path.join(modDir, `${lessonSlug}.pdf`);
      try {
        await makePdf(page, `${BASE_URL}/module/${modSlug}/${lessonSlug}`, pdfPath);
        console.log(`  ✓ ${modSlug}/${lessonSlug}.pdf`);
        ok++;
      } catch (err) {
        console.error(`  ✗ ${modSlug}/${lessonSlug}.pdf: ${err.message}`);
        fail++;
      }
    }
  }

  await browser.close();
  const mins = ((Date.now() - started) / 60000).toFixed(1);
  console.log(`\nDone in ${mins} min. OK=${ok} FAIL=${fail}`);
  console.log(`PDFs: ${PDF_DIR}`);
  process.exit(fail ? 1 : 0);
})().catch((e) => {
  console.error("FATAL", e);
  process.exit(1);
});