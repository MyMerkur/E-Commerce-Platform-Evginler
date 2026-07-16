import { Mail } from 'lucide-react'
import { useState } from 'react'
import toast from 'react-hot-toast'

export function NewsletterBlock() {
  const [email, setEmail] = useState('')

  const handleSubmit = (event) => {
    event.preventDefault()
    if (!email.trim()) return
    toast.success('Teşekkürler! Bülten kaydı çok yakında aktif olacak.')
    setEmail('')
  }

  return (
    <section className="bg-olive">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center gap-6 text-center lg:flex-row lg:justify-between lg:text-left">
          <div>
            <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-md bg-white/15 lg:mx-0">
              <Mail className="h-5 w-5 text-white" />
            </div>
            <h2 className="mt-4 font-display text-2xl font-extrabold uppercase tracking-tight text-white sm:text-3xl">
              Kampanyalardan ilk sen haberdar ol
            </h2>
            <p className="mt-2 max-w-md text-sm leading-6 text-white/75">
              E-posta adresini bırak, yeni koleksiyonlar ve indirimler kutunda olsun.
            </p>
          </div>
          <form onSubmit={handleSubmit} className="flex w-full max-w-md gap-2">
            <input
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="E-posta adresin"
              className="h-12 w-full rounded-md border-0 bg-white px-4 text-sm text-ink outline-none placeholder:text-muted-light"
            />
            <button
              type="submit"
              className="h-12 shrink-0 rounded-md bg-ink px-6 text-sm font-bold uppercase tracking-wide text-white transition hover:bg-black"
            >
              Katıl
            </button>
          </form>
        </div>
      </div>
    </section>
  )
}
