import { z } from 'zod'

const requiredNumber = (message) =>
  z.coerce.number({ error: message }).refine((value) => Number.isFinite(value), message)

export const productSchema = z.object({
  name: z.string().min(2, 'Ürün adı en az 2 karakter olmalı.'),
  price: requiredNumber('Fiyat zorunludur.').min(1, 'Fiyat 0’dan büyük olmalı.'),
  discount: z.coerce.number().min(0, 'İndirim negatif olamaz.').max(100, 'İndirim en fazla 100 olabilir.'),
  stock: z.coerce.number().int('Stok tam sayı olmalı.').min(0, 'Stok negatif olamaz.'),
  size: z.preprocess(
    (value) => (value === '' || value === null || value === undefined ? undefined : Number(value)),
    z.number().min(0, 'Beden/ölçü sayısal olmalı.').optional(),
  ),
  categories: z.array(z.string()).min(1, 'En az bir kategori seçin.'),
  subcategories: z.array(z.string()).optional(),
  brands: z.array(z.string()).min(1, 'En az bir marka seçin.'),
  description: z.string().optional(),
  imageUrlsText: z.string().min(5, 'En az bir görsel URL girin.'),
})

export const categorySchema = z.object({
  name: z.string().min(2, 'Kategori adı en az 2 karakter olmalı.'),
  subcategoriesText: z.string().optional(),
})

export const brandSchema = z.object({
  name: z.string().min(2, 'Marka adı en az 2 karakter olmalı.'),
  imageUrl: z.string().url('Geçerli bir görsel URL girin.').or(z.literal('')),
})

export function splitLines(value) {
  return String(value || '')
    .split('\n')
    .map((item) => item.trim())
    .filter(Boolean)
}
