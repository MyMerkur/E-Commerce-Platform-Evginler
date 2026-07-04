import { useEffect } from 'react'

const SITE_NAME = 'Evginler Ev Tekstili'
const SITE_URL = 'https://evginlerevtekstil.com'
const DEFAULT_TITLE = 'Evginler Ev Tekstili'
const DEFAULT_DESCRIPTION =
  "Evginler Ev Tekstili - Ardahan'dan Türkiye'ye kaliteli ev tekstili ürünleri. Nevresim takımları, havlu, çarşaf ve daha fazlası."
const DEFAULT_IMAGE = `${SITE_URL}/img/logo.jpg`

function upsertMeta(attr, key, content) {
  let el = document.querySelector(`meta[${attr}="${key}"]`)
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attr, key)
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
}

function upsertCanonical(href) {
  let el = document.querySelector('link[rel="canonical"]')
  if (!el) {
    el = document.createElement('link')
    el.setAttribute('rel', 'canonical')
    document.head.appendChild(el)
  }
  el.setAttribute('href', href)
}

function upsertJsonLd(data) {
  const el = document.getElementById('seo-jsonld')
  if (!data) {
    if (el) el.remove()
    return
  }

  const script = el || document.createElement('script')
  script.type = 'application/ld+json'
  script.id = 'seo-jsonld'
  script.textContent = JSON.stringify(data)
  if (!el) document.head.appendChild(script)
}

function applyTags({ title, description, image, url, type }) {
  document.title = title
  upsertMeta('name', 'description', description)
  upsertMeta('property', 'og:site_name', SITE_NAME)
  upsertMeta('property', 'og:title', title)
  upsertMeta('property', 'og:description', description)
  upsertMeta('property', 'og:image', image)
  upsertMeta('property', 'og:url', url)
  upsertMeta('property', 'og:type', type)
  upsertMeta('name', 'twitter:card', 'summary_large_image')
  upsertMeta('name', 'twitter:title', title)
  upsertMeta('name', 'twitter:description', description)
  upsertMeta('name', 'twitter:image', image)
  upsertCanonical(url)
}

/**
 * Sayfa başına title/meta description/Open Graph/Twitter Card/canonical etiketlerini
 * ve isteğe bağlı JSON-LD yapılandırılmış verisini günceller. Unmount olduğunda
 * site geneli varsayılanlara döner.
 */
export function Seo({ title, description, image, url, type = 'website', jsonLd }) {
  useEffect(() => {
    applyTags({
      title: title ? `${title} | ${SITE_NAME}` : DEFAULT_TITLE,
      description: description || DEFAULT_DESCRIPTION,
      image: image || DEFAULT_IMAGE,
      url: url || SITE_URL,
      type,
    })
    upsertJsonLd(jsonLd || null)

    return () => {
      applyTags({
        title: DEFAULT_TITLE,
        description: DEFAULT_DESCRIPTION,
        image: DEFAULT_IMAGE,
        url: SITE_URL,
        type: 'website',
      })
      upsertJsonLd(null)
    }
  }, [title, description, image, url, type, jsonLd])

  return null
}
