import { zodResolver } from '@hookform/resolvers/zod'
import { useQuery } from '@tanstack/react-query'
import { CreditCard } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { checkoutApi } from '../../api/checkoutApi'
import { Button } from '../../components/Button'
import { formatCurrency } from '../../utils/formatters'
import { formatCardNumber, formatCvc, getPaymentYears, paymentSchema } from './paymentSchema'

const months = Array.from({ length: 12 }, (_, index) => String(index + 1).padStart(2, '0'))

const CARD_TYPE_LABELS = {
  CREDIT_CARD: 'Kredi Kartı',
  DEBIT_CARD: 'Banka Kartı',
  PREPAID_CARD: 'Ön Ödemeli Kart',
}

const inputClass =
  'mt-2 h-11 w-full rounded-md border border-[#ddd6c8] bg-white px-3 text-sm outline-none transition focus:border-[#3d5e35] focus:shadow-[0_0_0_3px_rgba(61,94,53,0.08)]'

function FieldError({ error }) {
  return error ? <span className="mt-1 block text-sm text-[#b83a38]">{error.message}</span> : null
}

export function PaymentForm({ disabled, isPending, onSubmit }) {
  const {
    formState: { errors },
    handleSubmit,
    register,
    reset,
    watch,
  } = useForm({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      cardHolderName: '',
      cardNumber: '',
      expireMonth: '',
      expireYear: '',
      cvc: '',
    },
  })

  const cardNumberField = register('cardNumber')
  const cvcField = register('cvc')
  const cardNumberValue = watch('cardNumber')

  const [bin, setBin] = useState('')
  const [installment, setInstallment] = useState(1)

  useEffect(() => {
    const digits = String(cardNumberValue || '').replace(/\D/g, '')
    const timeout = setTimeout(() => {
      setBin(digits.length >= 6 ? digits.slice(0, 6) : '')
    }, 500)
    return () => clearTimeout(timeout)
  }, [cardNumberValue])

  useEffect(() => {
    setInstallment(1)
  }, [bin])

  const { data: installmentInfo } = useQuery({
    queryKey: ['installments', bin],
    queryFn: () => checkoutApi.getInstallments({ binNumber: bin }),
    enabled: bin.length === 6,
    retry: false,
  })

  const installmentOptions = installmentInfo?.installments || []
  const showInstallmentPicker = installmentInfo?.cardType === 'CREDIT_CARD' && installmentOptions.length > 1

  const submitPayment = (values) => {
    onSubmit({ ...values, installment }, reset)
  }

  return (
    <form className="mt-6 grid gap-4 sm:grid-cols-2" onSubmit={handleSubmit(submitPayment)}>
      <label className="block sm:col-span-2">
        <span className="text-sm font-semibold text-[#5f5148]">Kart sahibi</span>
        <input
          autoComplete="cc-name"
          className={inputClass + ' uppercase'}
          placeholder="AD SOYAD"
          {...register('cardHolderName')}
        />
        <FieldError error={errors.cardHolderName} />
      </label>

      <label className="block sm:col-span-2">
        <span className="text-sm font-semibold text-[#5f5148]">Kart numarası</span>
        <input
          inputMode="numeric"
          autoComplete="cc-number"
          className={inputClass}
          placeholder="0000 0000 0000 0000"
          {...cardNumberField}
          onChange={(event) => {
            event.target.value = formatCardNumber(event.target.value)
            cardNumberField.onChange(event)
          }}
        />
        <FieldError error={errors.cardNumber} />
      </label>

      {bin.length === 6 && installmentInfo?.cardType ? (
        <div className="sm:col-span-2 flex items-center gap-2 text-xs font-semibold text-[#5f5148]">
          <CreditCard className="h-3.5 w-3.5 text-[#3d5e35]" />
          {installmentInfo.bankName ? `${installmentInfo.bankName} · ` : ''}
          {CARD_TYPE_LABELS[installmentInfo.cardType] || 'Kart'}
        </div>
      ) : null}

      {showInstallmentPicker ? (
        <label className="block sm:col-span-2">
          <span className="text-sm font-semibold text-[#5f5148]">Taksit seçenekleri</span>
          <select
            className={inputClass}
            value={installment}
            onChange={(event) => setInstallment(Number(event.target.value))}
          >
            {installmentOptions.map((option) => (
              <option key={option.installmentNumber} value={option.installmentNumber}>
                {option.installmentNumber === 1
                  ? `Tek Çekim — ${formatCurrency(option.totalPrice)}`
                  : `${option.installmentNumber} Taksit — ${formatCurrency(option.installmentPrice)} x ${option.installmentNumber} (Toplam ${formatCurrency(option.totalPrice)})`}
              </option>
            ))}
          </select>
        </label>
      ) : null}

      <label className="block">
        <span className="text-sm font-semibold text-[#5f5148]">Son kullanma ayı</span>
        <select
          autoComplete="cc-exp-month"
          className={inputClass}
          {...register('expireMonth')}
        >
          <option value="">Ay</option>
          {months.map((month) => (
            <option key={month} value={month}>
              {month}
            </option>
          ))}
        </select>
        <FieldError error={errors.expireMonth} />
      </label>

      <label className="block">
        <span className="text-sm font-semibold text-[#5f5148]">Son kullanma yılı</span>
        <select
          autoComplete="cc-exp-year"
          className={inputClass}
          {...register('expireYear')}
        >
          <option value="">Yıl</option>
          {getPaymentYears().map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>
        <FieldError error={errors.expireYear} />
      </label>

      <label className="block">
        <span className="text-sm font-semibold text-[#5f5148]">CVC</span>
        <input
          inputMode="numeric"
          autoComplete="cc-csc"
          className={inputClass}
          placeholder="000"
          {...cvcField}
          onChange={(event) => {
            event.target.value = formatCvc(event.target.value)
            cvcField.onChange(event)
          }}
        />
        <FieldError error={errors.cvc} />
      </label>

      <div className="sm:col-span-2">
        <Button type="submit" disabled={disabled || isPending} className="w-full" size="lg">
          <CreditCard className="h-4 w-4" />
          {isPending ? '3D Secure başlatılıyor…' : 'Güvenli ödeme başlat'}
        </Button>
      </div>
    </form>
  )
}
