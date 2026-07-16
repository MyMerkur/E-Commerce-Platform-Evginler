export function Button({ as: Component = 'button', className = '', variant = 'primary', size = 'md', ...props }) {
  const variants = {
    primary:
      'bg-maroon text-white shadow-sm hover:bg-maroon-dark hover:shadow-md active:scale-[0.98] active:shadow-none',
    secondary: 'bg-ink text-white hover:bg-black active:scale-[0.98]',
    outline:
      'border border-border bg-white text-ink hover:border-maroon hover:bg-surface-muted active:scale-[0.98]',
    ghost: 'text-ink hover:bg-surface-muted active:scale-[0.98]',
    danger: 'bg-[#b83a38] text-white shadow-sm hover:bg-[#9e3030] hover:shadow-md active:scale-[0.98]',
  }

  const sizes = {
    sm: 'min-h-9 px-3 py-1.5 text-xs',
    md: 'min-h-11 px-5 py-2.5 text-sm',
    lg: 'min-h-12 px-6 py-3 text-base',
  }

  return (
    <Component
      className={`inline-flex items-center justify-center gap-2 rounded-md font-semibold tracking-tight transition-all duration-150 disabled:cursor-not-allowed disabled:opacity-50 ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    />
  )
}
