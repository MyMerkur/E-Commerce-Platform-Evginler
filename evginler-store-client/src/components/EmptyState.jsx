import { Link } from 'react-router-dom'
import { PackageSearch } from 'lucide-react'
import { Button } from './Button'

export function EmptyState({ title, description, actionLabel, actionTo, icon: Icon = PackageSearch }) {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center justify-center rounded-xl border border-dashed border-[#ddd6c8] bg-white px-8 py-16 text-center">
      <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-[#f0ece4]">
        <Icon className="h-7 w-7 text-[#8c7e72]" />
      </div>
      <h2 className="text-xl font-bold text-[#1e1a17]">{title}</h2>
      {description ? <p className="mt-3 max-w-xs text-sm leading-6 text-[#6b6058]">{description}</p> : null}
      {actionLabel && actionTo ? (
        <Button as={Link} to={actionTo} className="mt-8">
          {actionLabel}
        </Button>
      ) : null}
    </div>
  )
}
