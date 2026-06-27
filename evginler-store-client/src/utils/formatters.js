export function formatCurrency(value) {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
    maximumFractionDigits: 2,
  }).format(Number(value || 0))
}

export const PRODUCT_IMAGE_PLACEHOLDER =
  'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=900&q=80'

export function getProductImages(product) {
  const imageSources = []

  if (Array.isArray(product?.images)) {
    product.images.forEach((image) => {
      if (typeof image === 'string') {
        imageSources.push(image)
      } else if (image?.url) {
        imageSources.push(image.url)
      }
    })
  }

  if (Array.isArray(product?.imageUrl)) {
    imageSources.push(...product.imageUrl)
  } else if (typeof product?.imageUrl === 'string') {
    imageSources.push(product.imageUrl)
  }

  if (typeof product?.image === 'string') {
    imageSources.push(product.image)
  }

  return [...new Set(imageSources.map((image) => normalizeImageUrl(image)).filter(Boolean))]
}

export function getProductImage(product) {
  return getProductImages(product)[0] || PRODUCT_IMAGE_PLACEHOLDER
}

export function normalizeImageUrl(url) {
  if (!url) return null
  if (/^https?:\/\//i.test(url)) return url

  const assetBaseUrl = import.meta.env.VITE_ASSET_BASE_URL || 'http://localhost:5050'
  const normalizedPath = url.startsWith('/') ? url : `/${url}`
  return `${assetBaseUrl}${normalizedPath}`
}

export function getDiscountedPrice(product) {
  if (!product?.discount) return product?.price || 0
  return product.price - product.price * (product.discount / 100)
}
