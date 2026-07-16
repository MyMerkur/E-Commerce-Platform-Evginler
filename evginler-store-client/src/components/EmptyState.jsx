import { Link } from 'react-router-dom'
import { PackageSearch } from 'lucide-react'
import { Button } from './Button'

export function EmptyState({ title, description, actionLabel, actionTo, icon: Icon = PackageSearch }) {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center justify-center rounded-md border border-dashed border-border bg-white px-8 py-16 text-center">
      <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-surface-muted">
        <Icon className="h-7 w-7 text-muted-light" />
      </div>
      <h2 className="font-display text-xl font-bold text-ink">{title}</h2>
      {description ? <p className="mt-3 max-w-xs text-sm leading-6 text-muted">{description}</p> : null}
      {actionLabel && actionTo ? (
        <Button as={Link} to={actionTo} className="mt-8">
          {actionLabel}
        </Button>
      ) : null}
    </div>
  )
}
