import { Link, useSearchParams } from 'react-router-dom'
import { CheckCircle2, ShoppingBag, XCircle } from 'lucide-react'
import { Button } from '../components/Button'

export function PaymentResultPage({ status }) {
  const [searchParams] = useSearchParams()
  const isSuccess = status === 'success'
  const message = searchParams.get('errorMessage')

  return (
    <section className="mx-auto max-w-2xl px-4 py-20 text-center sm:px-6 lg:px-8">
      <div className="overflow-hidden rounded-2xl border border-[#ddd6c8] bg-white shadow-lg">
        {/* Icon band */}
        <div className={`px-8 py-10 ${isSuccess ? 'bg-[#edf2eb]' : 'bg-[#f5ecee]'}`}>
          {isSuccess ? (
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#3d5e35]/10">
              <CheckCircle2 className="h-10 w-10 text-[#3d5e35]" />
            </div>
          ) : (
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#7c2d3f]/10">
              <XCircle className="h-10 w-10 text-[#7c2d3f]" />
            </div>
          )}
        </div>

        {/* Content */}
        <div className="px-8 py-8">
          <h1 className="text-2xl font-bold tracking-tight text-[#1e1a17] sm:text-3xl">
            {isSuccess ? 'Ödeme başarılı!' : 'Ödeme tamamlanamadı'}
          </h1>
          <p className="mt-3 text-[#6b6058] leading-7">
            {isSuccess
              ? 'Siparişiniz oluşturuldu. Kargo ve sipariş durumunu profilinizden takip edebilirsiniz.'
              : message || 'Ödeme sırasında bir hata oluştu. Sepetinizi kontrol edip tekrar deneyebilirsiniz.'}
          </p>

          {isSuccess && (
            <div className="mt-6 rounded-xl border border-[#ddd6c8] bg-[#faf8f4] p-4 text-sm text-[#6b6058]">
              <p className="font-semibold text-[#1e1a17]">Sonraki adımlar</p>
              <ul className="mt-2 space-y-1 text-left">
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#3d5e35]" />
                  Siparişlerim sayfasından durumu takip edin
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#3d5e35]" />
                  Kargo takip numaranız hazır olunca bildirim alırsınız
                </li>
              </ul>
            </div>
          )}

          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            {isSuccess ? (
              <>
                <Button as={Link} to="/profile/orders" size="lg">
                  Siparişlerime git
                </Button>
                <Button as={Link} to="/products" variant="outline" size="lg">
                  <ShoppingBag className="h-4 w-4" />
                  Alışverişe devam et
                </Button>
              </>
            ) : (
              <>
                <Button as={Link} to="/cart" size="lg">
                  Sepete dön
                </Button>
                <Button as={Link} to="/checkout" variant="outline" size="lg">
                  Tekrar dene
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
