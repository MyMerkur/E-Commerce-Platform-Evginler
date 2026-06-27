import { z } from 'zod'

export const profileSchema = z.object({
  name: z.string().min(2, 'Ad en az 2 karakter olmalı.'),
  surname: z.string().min(2, 'Soyad en az 2 karakter olmalı.'),
  email: z.string().email('Geçerli bir e-posta girin.'),
  phone: z.string().min(10, 'Telefon numarası en az 10 haneli olmalı.'),
})

export const addressSchema = z.object({
  title: z.string().min(2, 'Adres başlığı zorunludur.'),
  identityNumber: z.string().min(10, 'T.C. kimlik/vergi numarası zorunludur.'),
  city: z.string().min(2, 'Şehir zorunludur.'),
  district: z.string().min(2, 'İlçe zorunludur.'),
  street: z.string().min(2, 'Mahalle/sokak zorunludur.'),
  zipCode: z.string().min(4, 'Posta kodu zorunludur.'),
  country: z.string().min(2, 'Ülke zorunludur.'),
  fullAddress: z.string().min(10, 'Açık adres en az 10 karakter olmalı.'),
})
