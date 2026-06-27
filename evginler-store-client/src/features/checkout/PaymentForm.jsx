import { zodResolver } from '@hookform/resolvers/zod'
import { CreditCard } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { Button } from '../../components/Button'
import { formatCardNumber, formatCvc, getPaymentYears, paymentSchema } from './paymentSchema'

const months = Array.from({ length: 12 }, (_, index) => String(index + 1).padStart(2, '0'))

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

  const submitPayment = (values) => {
    onSubmit(values, reset)
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
