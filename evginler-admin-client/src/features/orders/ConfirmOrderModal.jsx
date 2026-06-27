import { zodResolver } from '@hookform/resolvers/zod'
import { X } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { Button } from '../../components/Button'
import { getOrderNumber } from './orderHelpers'

const confirmOrderSchema = z.object({
  courier: z.string().min(2, 'Kargo firması zorunludur.'),
  trackingNumber: z.string().min(3, 'Kargo takip numarası zorunludur.'),
})

export function ConfirmOrderModal({ isPending, onClose, onSubmit, order }) {
  const form = useForm({
    resolver: zodResolver(confirmOrderSchema),
    defaultValues: {
      courier: order?.courier || '',
      trackingNumber: order?.trackingNumber || '',
    },
  })

  if (!order) return null

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 px-4" onMouseDown={onClose}>
      <div
        className="w-full max-w-lg rounded-md border border-[#dfe7e1] bg-white p-5 shadow-xl"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-bold text-[#963d3d]">Sipariş onaylama</p>
            <h2 className="mt-1 text-2xl font-bold text-[#17211d]">#{getOrderNumber(order)}</h2>
          </div>
          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-[#dfe7e1]"
            onClick={onClose}
            aria-label="Kapat"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form className="mt-5 grid gap-4" onSubmit={form.handleSubmit(onSubmit)}>
          <label className="block">
            <span className="text-sm font-semibold text-[#4f5d54]">Kargo firması</span>
            <input
              className="mt-2 h-11 w-full rounded-md border border-[#cfd9d2] px-3 text-sm outline-none focus:border-[#20493f]"
              placeholder="Yurtiçi Kargo"
              {...form.register('courier')}
            />
            {form.formState.errors.courier ? (
              <span className="mt-1 block text-sm text-[#963d3d]">{form.formState.errors.courier.message}</span>
            ) : null}
          </label>
          <label className="block">
            <span className="text-sm font-semibold text-[#4f5d54]">Kargo takip no</span>
            <input
              className="mt-2 h-11 w-full rounded-md border border-[#cfd9d2] px-3 text-sm outline-none focus:border-[#20493f]"
              placeholder="TRK123456"
              {...form.register('trackingNumber')}
            />
            {form.formState.errors.trackingNumber ? (
              <span className="mt-1 block text-sm text-[#963d3d]">{form.formState.errors.trackingNumber.message}</span>
            ) : null}
          </label>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Onaylanıyor' : 'Siparişi onayla'}
            </Button>
            <Button type="button" variant="outline" onClick={onClose}>
              Vazgeç
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
