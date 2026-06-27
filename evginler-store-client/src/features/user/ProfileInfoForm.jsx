import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { userApi } from '../../api/userApi'
import { Button } from '../../components/Button'
import { AuthFormField } from '../auth/AuthFormField'
import { profileSchema } from './profileSchemas'
import { useAuthStore } from '../../store/authStore'

export function ProfileInfoForm({ profile }) {
  const queryClient = useQueryClient()
  const setAuth = useAuthStore((state) => state.setAuth)
  const form = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: '',
      surname: '',
      email: '',
      phone: '',
    },
  })

  useEffect(() => {
    if (profile) {
      form.reset({
        name: profile.name || '',
        surname: profile.surname || '',
        email: profile.email || '',
        phone: String(profile.phone || ''),
      })
    }
  }, [form, profile])

  const updateProfile = useMutation({
    mutationFn: userApi.updateProfile,
    onSuccess: (updatedProfile) => {
      queryClient.setQueryData(['user', 'profile'], updatedProfile)
      queryClient.invalidateQueries({ queryKey: ['auth', 'me'] })
      setAuth({ user: updatedProfile, isAuthenticated: true })
      toast.success('Bilgileriniz güncellendi.')
    },
    onError: (error) => {
      if (!error.toastShown) {
        toast.error(error.message || 'Bilgiler güncellenemedi.')
      }
    },
  })

  return (
    <form className="grid gap-4 sm:grid-cols-2" onSubmit={form.handleSubmit((values) => updateProfile.mutate(values))}>
      <AuthFormField label="Ad" error={form.formState.errors.name} {...form.register('name')} />
      <AuthFormField label="Soyad" error={form.formState.errors.surname} {...form.register('surname')} />
      <AuthFormField label="E-posta" type="email" error={form.formState.errors.email} {...form.register('email')} />
      <AuthFormField label="Telefon" error={form.formState.errors.phone} {...form.register('phone')} />
      <div className="sm:col-span-2">
        <Button disabled={updateProfile.isPending}>{updateProfile.isPending ? 'Kaydediliyor' : 'Bilgileri kaydet'}</Button>
      </div>
    </form>
  )
}
