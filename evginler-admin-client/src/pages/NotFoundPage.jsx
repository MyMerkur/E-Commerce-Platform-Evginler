import { Link } from 'react-router-dom'
import { Button } from '../components/Button'

export function NotFoundPage() {
  return (
    <section className="grid min-h-screen place-items-center bg-[#f6f7f4] px-4 text-center">
      <div>
        <h1 className="text-4xl font-bold text-[#17211d]">Sayfa bulunamadı</h1>
        <p className="mt-3 text-[#66756c]">Aradığınız admin ekranı mevcut değil.</p>
        <Button as={Link} to="/dashboard" className="mt-6">
          Dashboard'a dön
        </Button>
      </div>
    </section>
  )
}
