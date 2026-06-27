import { Link } from 'react-router-dom'
import { Button } from '../components/Button'

export function NotFoundPage() {
  return (
    <section className="mx-auto max-w-xl px-4 py-20 text-center">
      <p className="text-xs font-bold uppercase tracking-widest text-[#7c2d3f]">404</p>
      <h1 className="mt-3 text-3xl font-bold text-[#1e1a17]">Sayfa bulunamadı</h1>
      <p className="mt-3 text-[#6b6058]">Aradığınız sayfa taşınmış veya artık yayında olmayabilir.</p>
      <Button as={Link} to="/" className="mt-8" size="lg">
        Ana sayfaya dön
      </Button>
    </section>
  )
}
