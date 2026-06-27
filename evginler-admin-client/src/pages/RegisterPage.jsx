import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { Link, useNavigate } from 'react-router-dom'
import { adminAuthApi } from '../api/adminAuthApi'
import { Button } from '../components/Button'
import { AuthField } from '../features/auth/AuthField'
import { registerSchema } from '../features/auth/schemas'
import { useAdminAuthStore } from '../store/adminAuthStore'

export function RegisterPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const setAuth = useAdminAuthStore((state) => state.setAuth)
  const form = useForm({ resolver: zodResolver(registerSchema), defaultValues: { name: '', email: '', password: '' } })
  const register = useMutation({
    mutationFn: adminAuthApi.register,
    onSuccess: (admin) => {
      setAuth({ admin, isAuthenticated: true })
      queryClient.invalidateQueries({ queryKey: ['admin', 'me'] })
      toast.success('Admin hesabı oluşturuldu.')
      navigate('/dashboard', { replace: true })
    },
  })

  return (
    <section className="grid min-h-screen place-items-center bg-[#f6f7f4] px-4">
      <div className="w-full max-w-md rounded-md border border-[#dfe7e1] bg-white p-6 shadow-sm">
        <p className="text-sm font-bold text-[#963d3d]">Evginler Admin</p>
        <h1 className="mt-2 text-3xl font-bold text-[#17211d]">Admin kaydı</h1>
        <form className="mt-6 space-y-4" onSubmit={form.handleSubmit((values) => register.mutate(values))}>
          <AuthField label="Ad Soyad" error={form.formState.errors.name} {...form.register('name')} />
          <AuthField label="E-posta" type="email" error={form.formState.errors.email} {...form.register('email')} />
          <AuthField label="Şifre" type="password" error={form.formState.errors.password} {...form.register('password')} />
          <Button className="w-full" disabled={register.isPending}>
            Kayıt oluştur
          </Button>
        </form>
        <p className="mt-5 text-sm text-[#66756c]">
          Zaten hesabınız var mı?{' '}
          <Link to="/login" className="font-bold text-[#20493f]">
            Giriş yap
          </Link>
        </p>
      </div>
    </section>
  )
}
