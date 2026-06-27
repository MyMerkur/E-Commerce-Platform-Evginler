import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { Button } from '../../components/Button'
import { categorySchema } from './schemas'
import { FormField, inputClass, textareaClass } from './FormField'

export function CategoryForm({ category, isPending, onCancel, onSubmit }) {
  const form = useForm({
    resolver: zodResolver(categorySchema),
    defaultValues: { name: '', subcategoriesText: '' },
  })

  useEffect(() => {
    form.reset({
      name: category?.name || '',
      subcategoriesText: category?.subcategories?.join('\n') || '',
    })
  }, [category, form])

  return (
    <form className="grid gap-4 rounded-md border border-[#dfe7e1] bg-white p-5" onSubmit={form.handleSubmit(onSubmit)}>
      <FormField label="Kategori adı" error={form.formState.errors.name}>
        <input className={inputClass} {...form.register('name')} />
      </FormField>
      <FormField label="Alt kategoriler" error={form.formState.errors.subcategoriesText}>
        <textarea className={textareaClass} placeholder="Her satıra bir alt kategori" {...form.register('subcategoriesText')} />
      </FormField>
      <div className="flex gap-2">
        <Button type="submit" disabled={isPending}>{category ? 'Kategoriyi güncelle' : 'Kategori ekle'}</Button>
        {category ? <Button type="button" variant="outline" onClick={onCancel}>Vazgeç</Button> : null}
      </div>
    </form>
  )
}
