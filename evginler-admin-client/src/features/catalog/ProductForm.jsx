import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useMemo } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { Button } from '../../components/Button'
import { FormField, inputClass, selectClass, textareaClass } from './FormField'
import { productSchema } from './schemas'

function getIds(items) {
  if (!Array.isArray(items)) return []
  return items.map((item) => (typeof item === 'string' ? item : item?._id || item?.id)).filter(Boolean)
}

function getImageText(product) {
  if (Array.isArray(product?.imageUrl)) return product.imageUrl.join('\n')
  return product?.imageUrl || ''
}

export function ProductForm({ brands, categories, isPending, mode, onSubmit, product }) {
  const form = useForm({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: '',
      price: '',
      discount: 0,
      stock: '',
      size: '',
      categories: [],
      subcategories: [],
      brands: [],
      description: '',
      imageUrlsText: '',
    },
  })
  const watchedCategoryIds = useWatch({
    control: form.control,
    name: 'categories',
  })

  useEffect(() => {
    if (product) {
      form.reset({
        name: product.name || '',
        price: product.price ?? '',
        discount: product.discount ?? 0,
        stock: product.stock ?? '',
        size: product.size ?? '',
        categories: getIds(product.categories),
        subcategories: product.subcategories || [],
        brands: getIds(product.brands),
        description: product.description || '',
        imageUrlsText: getImageText(product),
      })
      return
    }

    form.reset({
      name: '',
      price: '',
      discount: 0,
      stock: '',
      size: '',
      categories: [],
      subcategories: [],
      brands: [],
      description: '',
      imageUrlsText: '',
    })
  }, [form, product])

  const subcategoryOptions = useMemo(
    () => {
      const selectedCategoryIds = watchedCategoryIds || []
      return categories
        .filter((category) => selectedCategoryIds.includes(category._id))
        .flatMap((category) => category.subcategories || [])
    },
    [categories, watchedCategoryIds],
  )

  return (
    <form className="grid gap-5 rounded-md border border-[#dfe7e1] bg-white p-5" onSubmit={form.handleSubmit(onSubmit)}>
      <div className="grid gap-4 md:grid-cols-2">
        <FormField label="Ürün adı" error={form.formState.errors.name}>
          <input className={inputClass} {...form.register('name')} />
        </FormField>
        <FormField label="Fiyat" error={form.formState.errors.price}>
          <input className={inputClass} type="number" min="0" step="0.01" {...form.register('price')} />
        </FormField>
        <FormField label="İndirim (%)" error={form.formState.errors.discount}>
          <input className={inputClass} type="number" min="0" max="100" {...form.register('discount')} />
        </FormField>
        <FormField label="Stok" error={form.formState.errors.stock}>
          <input className={inputClass} type="number" min="0" {...form.register('stock')} />
        </FormField>
        <FormField label="Beden / Ölçü kodu" error={form.formState.errors.size}>
          <input className={inputClass} type="number" min="0" placeholder="Örn. 220" {...form.register('size')} />
        </FormField>
        <FormField label="Marka" error={form.formState.errors.brands}>
          <select className={selectClass} multiple {...form.register('brands')}>
            {brands.map((brand) => (
              <option key={brand._id} value={brand._id}>
                {brand.name}
              </option>
            ))}
          </select>
        </FormField>
        <FormField label="Kategori" error={form.formState.errors.categories}>
          <select className={selectClass} multiple {...form.register('categories')}>
            {categories.map((category) => (
              <option key={category._id} value={category._id}>
                {category.name}
              </option>
            ))}
          </select>
        </FormField>
        <FormField label="Alt kategori" error={form.formState.errors.subcategories}>
          <select className={selectClass} multiple {...form.register('subcategories')}>
            {subcategoryOptions.map((subcategory) => (
              <option key={subcategory} value={subcategory}>
                {subcategory}
              </option>
            ))}
          </select>
        </FormField>
      </div>

      <FormField label="Açıklama" error={form.formState.errors.description}>
        <textarea className={textareaClass} {...form.register('description')} />
      </FormField>
      <FormField label="Görsel URL'leri" error={form.formState.errors.imageUrlsText}>
        <textarea className={textareaClass} placeholder="Her satıra bir görsel URL" {...form.register('imageUrlsText')} />
      </FormField>
      <div>
        <Button type="submit" disabled={isPending}>
          {isPending ? 'Kaydediliyor' : mode === 'edit' ? 'Ürünü güncelle' : 'Ürün oluştur'}
        </Button>
      </div>
    </form>
  )
}
