export function LoadingState({ label = 'Yükleniyor' }) {
  return (
    <div className="flex min-h-56 items-center justify-center text-sm text-[#66756c]">
      <span className="h-5 w-5 animate-spin rounded-full border-2 border-[#cfd9d2] border-t-[#20493f]" />
      <span className="ml-3">{label}</span>
    </div>
  )
}
