import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import toast from 'react-hot-toast'
import { adminBrandsApi } from '../api/adminBrandsApi'
import { Button } from '../components/Button'
import { EmptyState } from '../components/EmptyState'
import { LoadingState } from '../components/LoadingState'
import { PageHeader } from '../components/PageHeader'
import { BrandForm } from '../features/catalog/BrandForm'

export function BrandsPage() {
  const [editingBrand, setEditingBrand] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const queryClient = useQueryClient()
  const { data: brands = [], isLoading, isError } = useQuery({ queryKey: ['admin', 'brands'], queryFn: adminBrandsApi.getBrands })
  const saveBrand = useMutation({
    mutationFn: (values) =>
      editingBrand ? adminBrandsApi.updateBrand(editingBrand._id, values) : adminBrandsApi.createBrand(values),
    onSuccess: () => {
      setEditingBrand(null)
      setShowForm(false)
      queryClient.invalidateQueries({ queryKey: ['admin', 'brands'] })
      toast.success('Marka kaydedildi.')
    },
    onError: (error) => {
      if (!error.toastShown) toast.error(error.message || 'Marka kaydedilemedi.')
    },
  })
  const deleteBrand = useMutation({
    mutationFn: adminBrandsApi.deleteBrand,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'brands'] })
      toast.success('Marka silindi.')
    },
    onError: (error) => {
      if (!error.toastShown) toast.error(error.message || 'Marka silinemedi.')
    },
  })

  const handleDelete = (brand) => {
    if (window.confirm(`${brand.name} markasını silmek istediğinize emin misiniz?`)) {
      deleteBrand.mutate(brand._id)
    }
  }

  if (isLoading) return <LoadingState label="Markalar yükleniyor" />
  if (isError) return <EmptyState title="Markalar alınamadı" description="Bir süre sonra tekrar deneyin." />

  return (
    <section>
      <PageHeader
        title="Markalar"
        description="Marka listesini yönetin."
        action={<Button onClick={() => { setEditingBrand(null); setShowForm((value) => !value) }}>Yeni marka</Button>}
      />
      {(showForm || editingBrand) ? (
        <div className="mb-6">
          <BrandForm
            brand={editingBrand}
            isPending={saveBrand.isPending}
            onCancel={() => { setEditingBrand(null); setShowForm(false) }}
            onSubmit={(values) => saveBrand.mutate(values)}
          />
        </div>
      ) : null}
      {!brands.length ? <EmptyState title="Marka yok" /> : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {brands.map((brand) => (
            <article key={brand._id} className="rounded-md border border-[#dfe7e1] bg-white p-5">
              <div className="flex items-center gap-4">
                {brand.imageUrl ? <img src={brand.imageUrl} alt="" className="h-14 w-14 rounded-md object-cover" /> : <div className="h-14 w-14 rounded-md bg-[#edf2ef]" />}
                <h2 className="font-bold text-[#17211d]">{brand.name}</h2>
              </div>
              <div className="mt-5 flex gap-2">
                <Button type="button" variant="outline" onClick={() => { setEditingBrand(brand); setShowForm(true) }}>Düzenle</Button>
                <Button type="button" variant="danger" disabled={deleteBrand.isPending} onClick={() => handleDelete(brand)}>Sil</Button>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  )
}
