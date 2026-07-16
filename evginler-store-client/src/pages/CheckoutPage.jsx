import { useMutation, useQuery } from '@tanstack/react-query'
import { AlertCircle, Home, Lock, PackageCheck, ShieldCheck, Truck } from 'lucide-react'
import { useEffect } from 'react'
import toast from 'react-hot-toast'
import { Link, useNavigate } from 'react-router-dom'
import { checkoutApi } from '../api/checkoutApi'
import { Button } from '../components/Button'
import { EmptyState } from '../components/EmptyState'
import { LoadingState } from '../components/LoadingState'
import { PaymentForm } from '../features/checkout/PaymentForm'
import { startThreeDSecure } from '../features/checkout/threeDSecure'
import { formatCurrency, getProductImage } from '../utils/formatters'

const steps = [
  { label: 'Adres', icon: Home },
  { label: 'Ödeme', icon: Lock },
  { label: 'Onay', icon: PackageCheck },
]

function StepBar({ currentStep = 1 }) {
  return (
    <div className="flex items-center justify-center gap-0 rounded-xl border border-[#ddd6c8] bg-white p-5 shadow-sm">
      {steps.map((step, index) => {
        const stepNumber = index + 1
        const isDone = stepNumber < currentStep
        const isActive = stepNumber === currentStep
        return (
          <div key={step.label} className="flex items-center">
            <div className="flex flex-col items-center gap-1.5">
              <div
                className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold transition-colors ${
                  isDone
                    ? 'bg-[#3d5e35] text-white'
                    : isActive
                      ? 'bg-[#edf2eb] text-[#3d5e35] ring-2 ring-[#3d5e35]'
                      : 'bg-[#f0ece4] text-[#a49588]'
                }`}
              >
                {isDone ? <step.icon className="h-4 w-4" /> : stepNumber}
              </div>
              <span
                className={`text-xs font-semibold ${
                  isActive ? 'text-[#3d5e35]' : isDone ? 'text-[#5a7a54]' : 'text-[#a49588]'
                }`}
              >
                {step.label}
              </span>
            </div>
            {index < steps.length - 1 ? (
              <div
                className={`mx-3 h-px w-10 sm:w-16 ${isDone ? 'bg-[#3d5e35]' : 'bg-[#ddd6c8]'}`}
              />
            ) : null}
          </div>
        )
      })}
    </div>
  )
}

function CheckoutAddress({ address }) {
  if (!address) {
    return (
      <div className="flex gap-3 rounded-xl border border-[#f0c8a4] bg-[#fff7ed] p-5 text-sm text-[#7a4a16]">
        <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
        <div>
          <p className="font-bold text-base text-[#5a3010]">Teslimat adresi seçilmedi</p>
          <p className="mt-1 leading-6 text-[#7a4a16]">
            Ödemeye geçmeden önce profil sayfanızdan bir teslimat adresi ekleyin ve seçin.
          </p>
          <Button as={Link} to="/profile/addresses" variant="outline" className="mt-4 bg-white">
            Adresleri yönet
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-xl border border-[#ddd6c8] bg-white shadow-sm">
      <div className="flex items-center gap-2 border-b border-[#ddd6c8] bg-[#edf2eb] px-5 py-3">
        <Home className="h-4 w-4 text-[#3d5e35]" />
        <span className="text-sm font-bold text-[#3d5e35]">Teslimat adresi</span>
      </div>
      <div className="p-5">
        <h2 className="font-bold text-[#1e1a17]">{address.title}</h2>
        <p className="mt-2 text-sm leading-6 text-[#6b6058]">{address.fullAddress}</p>
        <p className="text-sm text-[#8c7e72]">
          {address.district} / {address.city} · {address.zipCode} · {address.country}
        </p>
        <Button as={Link} to="/profile/addresses" variant="outline" size="sm" className="mt-4">
          Adresi değiştir
        </Button>
      </div>
    </div>
  )
}

function OrderSummary({ cartItems, totals }) {
  return (
    <aside className="h-fit rounded-xl border border-[#ddd6c8] bg-white shadow-sm">
      <div className="border-b border-[#ddd6c8] px-5 py-4">
        <h2 className="font-bold text-[#1e1a17]">Sipariş özeti</h2>
      </div>

      <div className="max-h-72 space-y-3 overflow-auto p-5 pr-4">
        {cartItems.map((item) => (
          <div key={item.productId || item._id} className="grid grid-cols-[56px_1fr] gap-3">
            <img src={getProductImage(item)} alt="" className="h-14 w-14 rounded-xl object-cover shadow-sm" />
            <div>
              <p className="line-clamp-2 text-sm font-semibold leading-snug text-[#1e1a17]">{item.name}</p>
              <p className="mt-1 text-xs text-[#6b6058]">
                {item.quantity} adet · {formatCurrency(item.price)}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="border-t border-[#ddd6c8] p-5 space-y-3 text-sm">
        <div className="flex justify-between">
          <span className="text-[#6b6058]">Ara toplam</span>
          <span className="font-semibold">{formatCurrency(totals.totalPriceWithoutShipping)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-[#6b6058]">Kargo</span>
          <span className={`font-semibold ${totals.shippingFee ? '' : 'text-[#3d5e35]'}`}>
            {totals.shippingFee ? formatCurrency(totals.shippingFee) : 'Ücretsiz'}
          </span>
        </div>
        <div className="flex justify-between border-t border-[#ddd6c8] pt-4 text-base font-bold text-[#3d5e35]">
          <span>Toplam</span>
          <span>{formatCurrency(totals.totalPrice)}</span>
        </div>
      </div>

      {/* Trust mini badges */}
      <div className="border-t border-[#ddd6c8] bg-[#faf8f4] px-5 py-4">
        <div className="space-y-2">
          {[
            { icon: ShieldCheck, text: '3D Secure güvenli ödeme' },
            { icon: Truck, text: 'Hızlı ve özenli kargolama' },
            { icon: PackageCheck, text: 'Sipariş sonrası takip' },
          ].map((item) => (
            <div key={item.text} className="flex items-center gap-2 text-xs text-[#5f5148]">
              <item.icon className="h-3.5 w-3.5 text-[#3d5e35]" />
              {item.text}
            </div>
          ))}
        </div>
      </div>
    </aside>
  )
}

export function CheckoutPage() {
  const navigate = useNavigate()
  const { data, isError, isLoading } = useQuery({
    queryKey: ['checkout'],
    queryFn: checkoutApi.getCheckout,
    retry: false,
  })

  const cartItems = data?.cartItems || []
  const totals = data?.totals || {}
  const hasSelectedAddress = Boolean(data?.selectedAddress)
  const isCartEmpty = !isLoading && cartItems.length === 0

  useEffect(() => {
    if (isCartEmpty) {
      navigate('/cart', { replace: true })
    }
  }, [isCartEmpty, navigate])

  const processPayment = useMutation({
    mutationFn: checkoutApi.processPayment,
    onError: (error) => {
      if (!error.toastShown) {
        toast.error(error.message || 'Ödeme başlatılamadı.')
      }
    },
  })

  const handlePaymentSubmit = (values, resetForm) => {
    processPayment.mutate(
      {
        cardHolderName: values.cardHolderName.trim(),
        cardNumber: values.cardNumber,
        expireMonth: values.expireMonth,
        expireYear: values.expireYear,
        cvc: values.cvc,
        installment: values.installment || 1,
      },
      {
        onSuccess: (paymentResponse) => {
          resetForm()
          const started = startThreeDSecure(paymentResponse)

          if (!started) {
            toast.error('3D Secure yanıtı alınamadı. Lütfen tekrar deneyin.')
          }
        },
      },
    )
  }

  if (isLoading) return <LoadingState label="Ödeme bilgileri hazırlanıyor" />
  if (isError) {
    return (
      <section className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
        <EmptyState
          title="Ödeme bilgileri alınamadı"
          description="Sepetinizi ve giriş durumunuzu kontrol edip tekrar deneyin."
          actionLabel="Sepete dön"
          actionTo="/cart"
        />
      </section>
    )
  }
  if (isCartEmpty) return <LoadingState label="Sepete yönlendiriliyor" />

  return (
    <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-7 grid gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-[#7c2d3f]">Güvenli ödeme</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-[#1e1a17]">Siparişinizi tamamlayın</h1>
        </div>
        <StepBar currentStep={hasSelectedAddress ? 2 : 1} />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        <div className="space-y-5">
          <CheckoutAddress address={data?.selectedAddress} />

          <div className="overflow-hidden rounded-xl border border-[#ddd6c8] bg-white shadow-sm">
            <div className="flex items-center gap-2 border-b border-[#ddd6c8] bg-[#edf2eb] px-5 py-3">
              <ShieldCheck className="h-4 w-4 text-[#3d5e35]" />
              <span className="text-sm font-bold text-[#3d5e35]">Kart bilgileri</span>
              <span className="ml-auto text-xs text-[#6b6058]">SSL ile şifrelendi</span>
            </div>
            <div className="p-6">
              <PaymentForm
                disabled={!hasSelectedAddress}
                isPending={processPayment.isPending}
                onSubmit={handlePaymentSubmit}
              />
            </div>
          </div>

          <div className="flex items-start gap-3 rounded-xl border border-[#ddd6c8] bg-[#faf8f4] p-5 text-sm text-[#6b6058]">
            <PackageCheck className="mt-0.5 h-5 w-5 shrink-0 text-[#3d5e35]" />
            <p className="leading-6">
              3D Secure doğrulamasından sonra bankanız ödeme sonucunu Evginler sistemine iletir ve siparişiniz otomatik
              oluşturulur. Kart bilgileriniz tarayıcıda saklanmaz.
            </p>
          </div>
        </div>

        <OrderSummary cartItems={cartItems} totals={totals} />
      </div>
    </section>
  )
}
