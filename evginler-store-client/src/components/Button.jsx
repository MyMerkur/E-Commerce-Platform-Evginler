export function Button({ as: Component = 'button', className = '', variant = 'primary', size = 'md', ...props }) {
  const variants = {
    primary:
      'bg-[#7c2d3f] text-white shadow-sm hover:bg-[#6a2535] hover:shadow-md active:scale-[0.98] active:shadow-none',
    secondary: 'bg-[#f0ece4] text-[#1e1a17] hover:bg-[#e6e0d6] active:scale-[0.98]',
    outline:
      'border border-[#ddd6c8] bg-white text-[#1e1a17] hover:bg-[#faf8f4] hover:border-[#7c2d3f] active:scale-[0.98]',
    ghost: 'text-[#1e1a17] hover:bg-[#f0ece4] active:scale-[0.98]',
    danger: 'bg-[#b83a38] text-white shadow-sm hover:bg-[#9e3030] hover:shadow-md active:scale-[0.98]',
  }

  const sizes = {
    sm: 'min-h-9 px-3 py-1.5 text-xs',
    md: 'min-h-11 px-5 py-2.5 text-sm',
    lg: 'min-h-12 px-6 py-3 text-base',
  }

  return (
    <Component
      className={`inline-flex items-center justify-center gap-2 rounded-lg font-semibold tracking-tight transition-all duration-150 disabled:cursor-not-allowed disabled:opacity-50 ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    />
  )
}
