export function AuthFormField({ label, error, ...props }) {
  return (
    <label className="block">
      <span className="text-sm font-semibold text-[#5f5148]">{label}</span>
      <input
        className="mt-2 h-11 w-full rounded-md border border-[#ddd6c8] bg-white px-3 text-sm outline-none transition focus:border-[#3d5e35] focus:shadow-[0_0_0_3px_rgba(61,94,53,0.08)]"
        {...props}
      />
      {error ? <span className="mt-1 block text-sm text-[#b83a38]">{error.message}</span> : null}
    </label>
  )
}
