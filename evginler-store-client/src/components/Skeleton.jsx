export function Skeleton({ className = '' }) {
  return <div className={`shimmer rounded-md ${className}`} aria-hidden="true" />
}

export function ProductCardSkeleton() {
  return (
    <div className="flex flex-col overflow-hidden rounded-md border border-border bg-surface">
      <Skeleton className="aspect-square w-full rounded-none" />
      <div className="flex flex-col gap-2.5 p-4">
        <Skeleton className="h-4 w-4/5" />
        <Skeleton className="h-4 w-2/5" />
        <Skeleton className="h-6 w-1/3" />
      </div>
    </div>
  )
}
