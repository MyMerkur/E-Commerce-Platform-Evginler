import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { adminAuthApi } from '../api/adminAuthApi'
import { Button } from '../components/Button'
import { AuthField } from '../features/auth/AuthField'
import { loginSchema } from '../features/auth/schemas'
import { useAdminAuthStore } from '../store/adminAuthStore'

export function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const queryClient = useQueryClient()
  const setAuth = useAdminAuthStore((state) => state.setAuth)
  const from = location.state?.from?.pathname || '/dashboard'
  const form = useForm({ resolver: zodResolver(loginSchema), defaultValues: { email: '', password: '' } })
  const login = useMutation({
    mutationFn: adminAuthApi.login,
    onSuccess: (admin) => {
      const authState = { admin, isAuthenticated: true }
      setAuth(authState)
      queryClient.setQueryData(['admin', 'me'], authState)
      toast.success('Admin girişi başarılı.')
      navigate(from, { replace: true })
    },
  })

  return (
    <section className="grid min-h-screen place-items-center bg-[#f6f7f4] px-4">
      <div className="w-full max-w-md rounded-md border border-[#dfe7e1] bg-white p-6 shadow-sm">
        <p className="text-sm font-bold text-[#963d3d]">Evginler Admin</p>
        <h1 className="mt-2 text-3xl font-bold text-[#17211d]">Giriş yap</h1>
        <form className="mt-6 space-y-4" onSubmit={form.handleSubmit((values) => login.mutate(values))}>
          <AuthField label="E-posta" type="email" error={form.formState.errors.email} {...form.register('email')} />
          <AuthField label="Şifre" type="password" error={form.formState.errors.password} {...form.register('password')} />
          <Button className="w-full" disabled={login.isPending}>
            Giriş yap
          </Button>
        </form>
        <p className="mt-5 text-sm text-[#66756c]">
          Admin hesabı yok mu?{' '}
          <Link to="/register" className="font-bold text-[#20493f]">
            Kayıt oluştur
          </Link>
        </p>
      </div>
    </section>
  )
}
