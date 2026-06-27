export function AuthField({ label, error, ...props }) {
  return (
    <label className="block">
      <span className="text-sm font-semibold text-[#4f5d54]">{label}</span>
      <input
        className="mt-2 h-11 w-full rounded-md border border-[#cfd9d2] bg-white px-3 text-sm outline-none transition focus:border-[#20493f]"
        {...props}
      />
      {error ? <span className="mt-1 block text-sm text-[#963d3d]">{error.message}</span> : null}
    </label>
  )
}
