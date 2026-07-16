const variants = {
  discount: 'bg-maroon text-white',
  new: 'bg-ink text-white',
  outline: 'border border-border bg-white text-ink',
  olive: 'bg-olive text-white',
}

export function Badge({ children, variant = 'discount', className = '' }) {
  return (
    <span
      className={`inline-flex items-center rounded-sm px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide shadow-sm ${variants[variant]} ${className}`}
    >
      {children}
    </span>
  )
}
