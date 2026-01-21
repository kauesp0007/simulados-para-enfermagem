"use strict";

const fs = require("fs");
const path = require("path");

const BASE_URL = "https://simulados-para-enfermagem.com.br";
const RUN_ROOT = process.cwd();

// Seus HTML estão aqui:
const HTML_DIR = path.join(RUN_ROOT, "simulados-para-enfermagem");

// sitemap.xml será criado aqui (na raiz onde você rodou o comando):
const OUTPUT_FILE = path.join(RUN_ROOT, "sitemap.xml");

// Se quiser ignorar alguns HTML, coloque aqui (deixe vazio se quiser incluir tudo)
const IGNORE_FILES = new Set([
  // "admin-panel.html",
  // "dashboard.html",
  // "settings.html",
  // "template-base.html",
]);

function escapeXml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

async function listHtmlFiles(dir) {
  if (!fs.existsSync(dir)) return [];
  const entries = await fs.promises.readdir(dir, { withFileTypes: true });

  return entries
    .filter((e) => e.isFile() && e.name.toLowerCase().endsWith(".html"))
    .map((e) => e.name)
    .filter((name) => !IGNORE_FILES.has(name))
    .map((name) => path.join(dir, name));
}

function buildUrl(filePath) {
  const rel = path.relative(RUN_ROOT, filePath).split(path.sep).join("/");
  return `${BASE_URL}/${rel}`;
}

function makeUrlEntry(url) {
  const u = escapeXml(url);
  return [
    "  <url>",
    `    <loc>${u}</loc>`,
    `    <xhtml:link rel="alternate" hreflang="pt-BR" href="${u}" />`,
    `    <xhtml:link rel="alternate" hreflang="x-default" href="${u}" />`,
    "  </url>",
  ].join("\n");
}

async function main() {
  const htmlFiles = await listHtmlFiles(HTML_DIR);

  if (htmlFiles.length === 0) {
    console.error("❌ Nenhum .html encontrado em:", HTML_DIR);
    console.error("➡️ Teste no PowerShell:");
    console.error("   dir .\\simulados-para-enfermagem\\*.html");
    process.exit(1);
  }

  htmlFiles.sort((a, b) => a.localeCompare(b, "pt-BR"));

  const entries = htmlFiles.map((file) => makeUrlEntry(buildUrl(file))).join("\n");

  const xml =
    '<?xml version="1.0" encoding="UTF-8"?>\n' +
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n' +
    '        xmlns:xhtml="http://www.w3.org/1999/xhtml">\n\n' +
    entries +
    "\n\n</urlset>\n";

  await fs.promises.writeFile(OUTPUT_FILE, xml, "utf8");

  console.log("✅ sitemap.xml gerado com sucesso!");
  console.log("📂 HTML_DIR:", HTML_DIR);
  console.log("📄 Caminho:", OUTPUT_FILE);
  console.log("🔢 Total de URLs:", htmlFiles.length);
}

main().catch((err) => {
  console.error("❌ Erro:", err);
  process.exit(1);
});
