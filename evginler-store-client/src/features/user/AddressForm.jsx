import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { Button } from '../../components/Button'
import { AuthFormField } from '../auth/AuthFormField'
import { addressSchema } from './profileSchemas'

const emptyAddress = {
  title: '',
  identityNumber: '',
  city: '',
  district: '',
  street: '',
  zipCode: '',
  country: 'Türkiye',
  fullAddress: '',
}

function normalizeAddress(address) {
  return {
    title: address?.title || '',
    identityNumber: String(address?.identityNumber || ''),
    city: address?.city || '',
    district: address?.district || '',
    street: address?.street || '',
    zipCode: String(address?.zipCode || ''),
    country: address?.country || 'Türkiye',
    fullAddress: address?.fullAddress || '',
  }
}

export function AddressForm({ address, isPending, onCancel, onSubmit }) {
  const form = useForm({
    resolver: zodResolver(addressSchema),
    defaultValues: emptyAddress,
  })

  useEffect(() => {
    form.reset(address ? normalizeAddress(address) : emptyAddress)
  }, [address, form])

  const isEditing = Boolean(address)

  return (
    <form
      className="grid gap-4 rounded-xl border border-[#ddd6c8] bg-[#faf8f4] p-5 sm:grid-cols-2"
      onSubmit={form.handleSubmit(onSubmit)}
    >
      <AuthFormField label="Adres başlığı" error={form.formState.errors.title} {...form.register('title')} />
      <AuthFormField
        label="T.C. kimlik / Vergi no"
        error={form.formState.errors.identityNumber}
        {...form.register('identityNumber')}
      />
      <AuthFormField label="Şehir" error={form.formState.errors.city} {...form.register('city')} />
      <AuthFormField label="İlçe" error={form.formState.errors.district} {...form.register('district')} />
      <AuthFormField label="Mahalle / Sokak" error={form.formState.errors.street} {...form.register('street')} />
      <AuthFormField label="Posta kodu" error={form.formState.errors.zipCode} {...form.register('zipCode')} />
      <AuthFormField label="Ülke" error={form.formState.errors.country} {...form.register('country')} />
      <label className="block sm:col-span-2">
        <span className="text-sm font-semibold text-[#5f5148]">Açık adres</span>
        <textarea
          className="mt-2 min-h-28 w-full rounded-md border border-[#ddd6c8] bg-white px-3 py-3 text-sm outline-none transition focus:border-[#3d5e35] focus:shadow-[0_0_0_3px_rgba(61,94,53,0.08)]"
          {...form.register('fullAddress')}
        />
        {form.formState.errors.fullAddress ? (
          <span className="mt-1 block text-sm text-[#b83a38]">{form.formState.errors.fullAddress.message}</span>
        ) : null}
      </label>
      <div className="flex flex-col gap-2 sm:col-span-2 sm:flex-row">
        <Button type="submit" disabled={isPending}>
          {isPending ? 'Kaydediliyor…' : isEditing ? 'Adresi güncelle' : 'Adres ekle'}
        </Button>
        {isEditing ? (
          <Button type="button" variant="outline" onClick={onCancel}>
            Vazgeç
          </Button>
        ) : null}
      </div>
    </form>
  )
}
