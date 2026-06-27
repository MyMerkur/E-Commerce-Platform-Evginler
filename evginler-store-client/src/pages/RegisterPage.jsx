import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { Link, useNavigate } from 'react-router-dom'
import { authApi } from '../api/authApi'
import { Button } from '../components/Button'
import { AuthFormField } from '../features/auth/AuthFormField'
import { registerSchema } from '../features/auth/schemas'

export function RegisterPage() {
  const navigate = useNavigate()
  const form = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: '', surname: '', email: '', phone: '', password: '' },
  })
  const register = useMutation({
    mutationFn: authApi.register,
    onSuccess: () => {
      toast.success('Kayıt oluşturuldu. Giriş yapabilirsiniz.')
      navigate('/login')
    },
  })

  return (
    <section className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="rounded-xl border border-[#ddd6c8] bg-white p-6 shadow-sm">
        {/* Brand context */}
        <div className="mb-6 rounded-xl bg-[#faf8f4] p-4">
          <p className="text-xs font-bold uppercase tracking-widest text-[#7c2d3f]">Evginler</p>
          <p className="mt-1 text-sm leading-6 text-[#6b6058]">
            Hesabınızla siparişlerinizi ve favorilerinizi kolayca takip edin. Ardahan'ın güvenilir ev mağazasında alışveriş yapın.
          </p>
        </div>

        <p className="text-xs font-bold uppercase tracking-widest text-[#7c2d3f]">Yeni hesap</p>
        <h1 className="mt-2 text-2xl font-bold text-[#1e1a17]">Kayıt ol</h1>
        <form className="mt-6 grid gap-4 sm:grid-cols-2" onSubmit={form.handleSubmit((values) => register.mutate(values))}>
          <AuthFormField label="Ad" error={form.formState.errors.name} {...form.register('name')} />
          <AuthFormField label="Soyad" error={form.formState.errors.surname} {...form.register('surname')} />
          <AuthFormField label="E-posta" type="email" error={form.formState.errors.email} {...form.register('email')} />
          <AuthFormField label="Telefon" error={form.formState.errors.phone} {...form.register('phone')} />
          <div className="sm:col-span-2">
            <AuthFormField
              label="Şifre"
              type="password"
              error={form.formState.errors.password}
              {...form.register('password')}
            />
          </div>
          <Button className="sm:col-span-2" size="lg" disabled={register.isPending}>
            {register.isPending ? 'Kayıt oluşturuluyor…' : 'Kayıt ol'}
          </Button>
        </form>
        <p className="mt-5 text-sm text-[#6b6058]">
          Zaten hesabınız var mı?{' '}
          <Link to="/login" className="font-semibold text-[#7c2d3f] hover:underline">
            Giriş yapın
          </Link>
        </p>
      </div>
    </section>
  )
}
