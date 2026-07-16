export function LoadingState({ label = 'Yükleniyor' }) {
  return (
    <div className="flex min-h-72 flex-col items-center justify-center gap-5">
      <div className="relative h-12 w-12">
        <div className="absolute inset-0 rounded-full border-[3px] border-border" />
        <div className="absolute inset-0 animate-spin rounded-full border-[3px] border-transparent border-t-olive" />
        <div className="absolute inset-[5px] rounded-full bg-surface-muted opacity-50" />
      </div>
      <div className="text-center">
        <p className="text-sm font-semibold text-ink">{label}</p>
        <p className="mt-1 text-xs text-muted-light">Lütfen bekleyin…</p>
      </div>
    </div>
  )
}
