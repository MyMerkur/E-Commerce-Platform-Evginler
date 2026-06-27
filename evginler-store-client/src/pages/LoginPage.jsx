import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { authApi } from '../api/authApi'
import { Button } from '../components/Button'
import { AuthFormField } from '../features/auth/AuthFormField'
import { loginSchema } from '../features/auth/schemas'
import { useAuthStore } from '../store/authStore'

export function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const queryClient = useQueryClient()
  const setAuth = useAuthStore((state) => state.setAuth)
  const from = location.state?.from?.pathname || '/'
  const form = useForm({ resolver: zodResolver(loginSchema), defaultValues: { email: '', password: '' } })
  const login = useMutation({
    mutationFn: authApi.login,
    onSuccess: (user) => {
      const authState = { user, isAuthenticated: true }
      setAuth(authState)
      queryClient.setQueryData(['auth', 'me'], authState)
      queryClient.invalidateQueries({ queryKey: ['cart'] })
      toast.success('Giriş başarılı.')
      navigate(from, { replace: true })
    },
  })

  return (
    <section className="mx-auto grid max-w-5xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
      <div className="rounded-xl border border-[#ddd6c8] bg-white p-6 shadow-sm">
        {/* Brand context */}
        <div className="mb-6 rounded-xl bg-[#faf8f4] p-4">
          <p className="text-xs font-bold uppercase tracking-widest text-[#7c2d3f]">Evginler</p>
          <p className="mt-1 text-sm leading-6 text-[#6b6058]">
            Hesabınızla siparişlerinizi ve favorilerinizi kolayca takip edin.
          </p>
        </div>

        <p className="text-xs font-bold uppercase tracking-widest text-[#7c2d3f]">Hesabım</p>
        <h1 className="mt-2 text-2xl font-bold text-[#1e1a17]">Giriş yap</h1>
        <form className="mt-6 space-y-4" onSubmit={form.handleSubmit((values) => login.mutate(values))}>
          <AuthFormField label="E-posta" type="email" error={form.formState.errors.email} {...form.register('email')} />
          <AuthFormField
            label="Şifre"
            type="password"
            error={form.formState.errors.password}
            {...form.register('password')}
          />
          <Button className="w-full" size="lg" disabled={login.isPending}>
            {login.isPending ? 'Giriş yapılıyor…' : 'Giriş yap'}
          </Button>
        </form>
        <p className="mt-5 text-sm text-[#6b6058]">
          Hesabınız yok mu?{' '}
          <Link to="/register" className="font-semibold text-[#7c2d3f] hover:underline">
            Kayıt olun
          </Link>
        </p>
      </div>
      <div className="hidden overflow-hidden rounded-xl lg:block">
        <img
          src="https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1000&q=85"
          alt="Sade ve sıcak ev dekorasyonu"
          className="h-full min-h-[520px] w-full object-cover"
        />
      </div>
    </section>
  )
}
