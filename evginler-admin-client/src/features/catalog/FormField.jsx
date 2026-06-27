export function FormField({ label, error, children }) {
  return (
    <label className="block">
      <span className="text-sm font-semibold text-[#4f5d54]">{label}</span>
      <div className="mt-2">{children}</div>
      {error ? <span className="mt-1 block text-sm text-[#963d3d]">{error.message}</span> : null}
    </label>
  )
}

export const inputClass =
  'h-11 w-full rounded-md border border-[#cfd9d2] bg-white px-3 text-sm outline-none transition focus:border-[#20493f]'

export const textareaClass =
  'min-h-28 w-full rounded-md border border-[#cfd9d2] bg-white px-3 py-3 text-sm outline-none transition focus:border-[#20493f]'

export const selectClass =
  'min-h-11 w-full rounded-md border border-[#cfd9d2] bg-white px-3 py-2 text-sm outline-none transition focus:border-[#20493f]'
