// Build öncesi çalışır: gerçek ürün listesini backend'den çekip public/sitemap.xml'i üretir.
// Vite, public/ klasörünün içeriğini olduğu gibi dist/'e kopyaladığı için bu script
// `vite build`'den ÖNCE çalışmalı (bkz. package.json "build" script'i).
import { writeFileSync, readFileSync, existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const SITE_URL = 'https://evginlerevtekstil.com'
const OUTPUT_PATH = path.join(__dirname, '..', 'public', 'sitemap.xml')

function loadApiBaseUrl() {
  const envPath = path.join(__dirname, '..', '.env.production')
  if (existsSync(envPath)) {
    const content = readFileSync(envPath, 'utf-8')
    const match = content.match(/^VITE_API_BASE_URL\s*=\s*(.+)$/m)
    if (match) return match[1].trim()
  }
  return process.env.VITE_API_BASE_URL || 'http://localhost:5050/api'
}

function xmlEscape(value) {
  return String(value).replace(/[<>&'"]/g, (char) => ({
    '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;',
  })[char])
}

function buildUrlEntry(loc, { changefreq, priority, lastmod }) {
  return [
    '  <url>',
    `    <loc>${xmlEscape(loc)}</loc>`,
    lastmod ? `    <lastmod>${new Date(lastmod).toISOString().slice(0, 10)}</lastmod>` : null,
    changefreq ? `    <changefreq>${changefreq}</changefreq>` : null,
    priority ? `    <priority>${priority}</priority>` : null,
    '  </url>',
  ].filter(Boolean).join('\n')
}

function writeFallbackSitemap(reason) {
  console.warn(`[sitemap] Ürün listesi alınamadı (${reason}), sadece statik sayfalarla sitemap üretiliyor.`)
  const entries = [
    buildUrlEntry(`${SITE_URL}/`, { changefreq: 'daily', priority: '1.0' }),
    buildUrlEntry(`${SITE_URL}/products`, { changefreq: 'daily', priority: '0.9' }),
  ]
  writeSitemap(entries)
}

function writeSitemap(entries) {
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries.join('\n')}\n</urlset>\n`
  writeFileSync(OUTPUT_PATH, xml)
  console.log(`[sitemap] ${OUTPUT_PATH} yazıldı (${entries.length} URL).`)
}

async function main() {
  const apiBaseUrl = loadApiBaseUrl()

  let products
  try {
    const response = await fetch(`${apiBaseUrl}/store/products`, { signal: AbortSignal.timeout(10_000) })
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    const body = await response.json()
    if (!body.success || !Array.isArray(body.data)) throw new Error('beklenmeyen yanıt biçimi')
    products = body.data
  } catch (error) {
    writeFallbackSitemap(error.message)
    return
  }

  const entries = [
    buildUrlEntry(`${SITE_URL}/`, { changefreq: 'daily', priority: '1.0' }),
    buildUrlEntry(`${SITE_URL}/products`, { changefreq: 'daily', priority: '0.9' }),
    ...products.map((product) =>
      buildUrlEntry(`${SITE_URL}/products/${product._id}`, {
        changefreq: 'weekly',
        priority: '0.8',
        lastmod: product.updatedAt,
      })
    ),
  ]

  writeSitemap(entries)
}

main()
