import { z } from 'zod'

const onlyDigits = (value) => String(value || '').replace(/\D/g, '')

export const paymentSchema = z.object({
  cardHolderName: z.string().min(3, 'Kart sahibi adı en az 3 karakter olmalı.'),
  cardNumber: z
    .string()
    .transform(onlyDigits)
    .refine((value) => value.length >= 15 && value.length <= 16, 'Kart numarası 15-16 haneli olmalı.'),
  expireMonth: z.string().regex(/^(0[1-9]|1[0-2])$/, 'Geçerli bir ay seçin.'),
  expireYear: z.string().regex(/^\d{4}$/, 'Geçerli bir yıl seçin.'),
  cvc: z
    .string()
    .transform(onlyDigits)
    .refine((value) => value.length >= 3 && value.length <= 4, 'CVC 3-4 haneli olmalı.'),
})

export function formatCardNumber(value) {
  return onlyDigits(value).slice(0, 16).replace(/(.{4})/g, '$1 ').trim()
}

export function formatCvc(value) {
  return onlyDigits(value).slice(0, 4)
}

export function getPaymentYears() {
  const currentYear = new Date().getFullYear()
  return Array.from({ length: 13 }, (_, index) => String(currentYear + index))
}
