import { Inbox } from 'lucide-react'
import { Button } from './Button'

export function EmptyState({ title, description, actionLabel, actionTo }) {
  return (
    <div className="rounded-md border border-dashed border-[#cfd9d2] bg-white px-6 py-12 text-center">
      <Inbox className="mx-auto h-10 w-10 text-[#74857a]" />
      <h2 className="mt-4 text-xl font-bold text-[#17211d]">{title}</h2>
      {description ? <p className="mx-auto mt-2 max-w-md text-sm text-[#66756c]">{description}</p> : null}
      {actionLabel && actionTo ? (
        <Button as="a" href={actionTo} className="mt-6">
          {actionLabel}
        </Button>
      ) : null}
    </div>
  )
}
