import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().email('Geçerli bir e-posta girin.'),
  password: z.string().min(1, 'Şifre zorunludur.'),
})

export const registerSchema = z.object({
  name: z.string().min(2, 'Ad en az 2 karakter olmalı.'),
  surname: z.string().min(2, 'Soyad en az 2 karakter olmalı.'),
  email: z.string().email('Geçerli bir e-posta girin.'),
  phone: z.string().min(10, 'Telefon numarası girin.'),
  password: z.string().min(6, 'Şifre en az 6 karakter olmalı.'),
})
