import { ChevronRight } from 'lucide-react'
import { Link } from 'react-router-dom'

export function SectionHeading({ eyebrow, title, linkTo, linkLabel = 'Tümünü gör', className = '' }) {
  return (
    <div className={`mb-7 flex items-end justify-between gap-4 ${className}`}>
      <div>
        {eyebrow ? (
          <p className="text-xs font-bold uppercase tracking-widest text-maroon">{eyebrow}</p>
        ) : null}
        <h2 className="mt-1.5 font-display text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">
          {title}
        </h2>
      </div>
      {linkTo ? (
        <Link
          to={linkTo}
          className="inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-maroon transition hover:underline"
        >
          {linkLabel} <ChevronRight className="h-4 w-4" />
        </Link>
      ) : null}
    </div>
  )
}
