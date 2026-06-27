import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().email('Geçerli bir e-posta girin.'),
  password: z.string().min(6, 'Şifre en az 6 karakter olmalı.'),
})

export const registerSchema = loginSchema.extend({
  name: z.string().min(2, 'Ad en az 2 karakter olmalı.'),
})
