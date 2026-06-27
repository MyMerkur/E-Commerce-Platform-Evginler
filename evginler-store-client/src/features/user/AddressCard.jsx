import { CheckCircle2, MapPin, Pencil } from 'lucide-react'
import { Button } from '../../components/Button'

export function AddressCard({ address, isSelected, isSelecting, onEdit, onSelect }) {
  return (
    <article
      className={`rounded-xl border p-4 transition ${
        isSelected ? 'border-[#3d5e35] bg-[#edf2eb]' : 'border-[#ddd6c8] bg-white'
      }`}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-lg font-bold text-[#1e1a17]">{address.title}</h3>
            {isSelected ? (
              <span className="inline-flex items-center gap-1 rounded-md bg-[#3d5e35] px-2 py-1 text-xs font-bold text-white">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Seçili adres
              </span>
            ) : null}
          </div>
          <p className="mt-2 flex items-center gap-2 text-sm font-semibold text-[#5f5148]">
            <MapPin className="h-4 w-4 text-[#7c2d3f]" />
            {address.city} / {address.district}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {!isSelected ? (
            <Button type="button" variant="outline" disabled={isSelecting} onClick={() => onSelect(address)}>
              {isSelecting ? 'Seçiliyor…' : 'Seçili yap'}
            </Button>
          ) : null}
          <Button type="button" variant="secondary" onClick={() => onEdit(address)}>
            <Pencil className="h-4 w-4" />
            Düzenle
          </Button>
        </div>
      </div>
      <div className="mt-4 space-y-1 text-sm leading-6 text-[#6b6058]">
        <p>{address.fullAddress}</p>
        <p>
          {address.street} · {address.zipCode} · {address.country}
        </p>
      </div>
    </article>
  )
}
