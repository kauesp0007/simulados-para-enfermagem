"use strict";

/**
 * Gera sitemap.xml automaticamente
 * - index.html vem da raiz
 * - demais HTML vêm de assets/app/html
 * - sitemap.xml é salvo na raiz do repositório
 */

const fs = require("fs");
const path = require("path");

// Base do site
const BASE_URL = "https://simulados-para-enfermagem.com.br";

// Pasta onde o comando é executado (raiz do repo)
const PROJECT_ROOT = process.cwd();

// Caminhos definidos por você
const ROOT_INDEX = path.join(PROJECT_ROOT, "index.html");
const HTML_DIR = path.join(PROJECT_ROOT, "assets", "app", "html");
const OUTPUT_FILE = path.join(PROJECT_ROOT, "sitemap.xml");

// HTMLs que NÃO entram no sitemap (se precisar)
const IGNORE_FILES = new Set([
  // "admin.html",
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

function buildUrl(relativePath) {
  return `${BASE_URL}/${relativePath}`;
}

function urlEntry(url) {
  const u = escapeXml(url);
  return [
    "  <url>",
    `    <loc>${u}</loc>`,
    `    <xhtml:link rel="alternate" hreflang="pt-BR" href="${u}" />`,
    `    <xhtml:link rel="alternate" hreflang="x-default" href="${u}" />`,
    "  </url>",
  ].join("\n");
}

async function listHtmlFiles(dir) {
  if (!fs.existsSync(dir)) return [];
  const entries = await fs.promises.readdir(dir, { withFileTypes: true });
  return entries
    .filter(
      (e) =>
        e.isFile() &&
        e.name.toLowerCase().endsWith(".html") &&
        !IGNORE_FILES.has(e.name)
    )
    .map((e) => e.name);
}

async function main() {
  const urls = [];

  // 1️⃣ index.html da raiz
  if (fs.existsSync(ROOT_INDEX)) {
    urls.push(buildUrl(""));
  } else {
    console.warn("⚠️ index.html não encontrado na raiz.");
  }

  // 2️⃣ HTMLs de assets/app/html
  const htmlFiles = await listHtmlFiles(HTML_DIR);

  for (const file of htmlFiles) {
    const relativePath = `assets/app/html/${file}`;
    urls.push(buildUrl(relativePath));
  }

  if (urls.length === 0) {
    console.error("❌ Nenhuma URL encontrada para gerar o sitemap.");
    process.exit(1);
  }

  const xml =
    '<?xml version="1.0" encoding="UTF-8"?>\n' +
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n' +
    '        xmlns:xhtml="http://www.w3.org/1999/xhtml">\n\n' +
    urls.map(urlEntry).join("\n\n") +
    "\n\n</urlset>\n";

  await fs.promises.writeFile(OUTPUT_FILE, xml, "utf8");

  console.log("✅ sitemap.xml gerado com sucesso!");
  console.log("📄 Caminho:", OUTPUT_FILE);
  console.log("🔢 Total de URLs:", urls.length);
}

main().catch((err) => {
  console.error("❌ Erro ao gerar sitemap:", err);
  process.exit(1);
});
