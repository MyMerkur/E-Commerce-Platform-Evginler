export function PageHeader({ eyebrow = 'Yönetim', title, description, action }) {
  return (
    <div className="mb-6 flex flex-col gap-4 rounded-md border border-[#dfe7e1] bg-white p-5 md:flex-row md:items-end md:justify-between">
      <div>
        <p className="text-sm font-bold text-[#963d3d]">{eyebrow}</p>
        <h1 className="mt-1 text-3xl font-bold text-[#17211d]">{title}</h1>
        {description ? <p className="mt-2 text-sm text-[#66756c]">{description}</p> : null}
      </div>
      {action}
    </div>
  )
}
