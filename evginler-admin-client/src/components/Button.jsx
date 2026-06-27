export function Button({ as: Component = 'button', className = '', variant = 'primary', ...props }) {
  const variants = {
    primary: 'bg-[#20493f] text-white hover:bg-[#18392f]',
    secondary: 'bg-[#edf2ef] text-[#17211d] hover:bg-[#e0e8e3]',
    outline: 'border border-[#cfd9d2] bg-white text-[#17211d] hover:bg-[#f5f8f6]',
    danger: 'bg-[#963d3d] text-white hover:bg-[#7d3030]',
    ghost: 'text-[#17211d] hover:bg-[#edf2ef]',
  }

  return (
    <Component
      className={`inline-flex min-h-10 items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${variants[variant]} ${className}`}
      {...props}
    />
  )
}
