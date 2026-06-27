import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { Button } from '../../components/Button'
import { brandSchema } from './schemas'
import { FormField, inputClass } from './FormField'

export function BrandForm({ brand, isPending, onCancel, onSubmit }) {
  const form = useForm({
    resolver: zodResolver(brandSchema),
    defaultValues: { name: '', imageUrl: '' },
  })

  useEffect(() => {
    form.reset({ name: brand?.name || '', imageUrl: brand?.imageUrl || '' })
  }, [brand, form])

  return (
    <form className="grid gap-4 rounded-md border border-[#dfe7e1] bg-white p-5" onSubmit={form.handleSubmit(onSubmit)}>
      <FormField label="Marka adı" error={form.formState.errors.name}>
        <input className={inputClass} {...form.register('name')} />
      </FormField>
      <FormField label="Görsel URL" error={form.formState.errors.imageUrl}>
        <input className={inputClass} placeholder="https://..." {...form.register('imageUrl')} />
      </FormField>
      <div className="flex gap-2">
        <Button type="submit" disabled={isPending}>{brand ? 'Markayı güncelle' : 'Marka ekle'}</Button>
        {brand ? <Button type="button" variant="outline" onClick={onCancel}>Vazgeç</Button> : null}
      </div>
    </form>
  )
}
