import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import toast from 'react-hot-toast'
import { adminCategoriesApi } from '../api/adminCategoriesApi'
import { Button } from '../components/Button'
import { EmptyState } from '../components/EmptyState'
import { LoadingState } from '../components/LoadingState'
import { PageHeader } from '../components/PageHeader'
import { CategoryForm } from '../features/catalog/CategoryForm'
import { splitLines } from '../features/catalog/schemas'

export function CategoriesPage() {
  const [editingCategory, setEditingCategory] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const queryClient = useQueryClient()
  const { data: categories = [], isLoading, isError } = useQuery({ queryKey: ['admin', 'categories'], queryFn: adminCategoriesApi.getCategories })
  const saveCategory = useMutation({
    mutationFn: (values) => {
      const payload = { name: values.name, subcategories: splitLines(values.subcategoriesText) }
      return editingCategory
        ? adminCategoriesApi.updateCategory(editingCategory._id, payload)
        : adminCategoriesApi.createCategory(payload)
    },
    onSuccess: () => {
      setEditingCategory(null)
      setShowForm(false)
      queryClient.invalidateQueries({ queryKey: ['admin', 'categories'] })
      toast.success('Kategori kaydedildi.')
    },
    onError: (error) => {
      if (!error.toastShown) toast.error(error.message || 'Kategori kaydedilemedi.')
    },
  })
  const deleteCategory = useMutation({
    mutationFn: adminCategoriesApi.deleteCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'categories'] })
      toast.success('Kategori silindi.')
    },
    onError: (error) => {
      if (!error.toastShown) toast.error(error.message || 'Kategori silinemedi.')
    },
  })

  const handleDelete = (category) => {
    if (window.confirm(`${category.name} kategorisini silmek istediğinize emin misiniz?`)) {
      deleteCategory.mutate(category._id)
    }
  }

  if (isLoading) return <LoadingState label="Kategoriler yükleniyor" />
  if (isError) return <EmptyState title="Kategoriler alınamadı" description="Bir süre sonra tekrar deneyin." />

  return (
    <section>
      <PageHeader
        title="Kategoriler"
        description="Kategori ve alt kategori listesini yönetin."
        action={<Button onClick={() => { setEditingCategory(null); setShowForm((value) => !value) }}>Yeni kategori</Button>}
      />
      {(showForm || editingCategory) ? (
        <div className="mb-6">
          <CategoryForm
            category={editingCategory}
            isPending={saveCategory.isPending}
            onCancel={() => { setEditingCategory(null); setShowForm(false) }}
            onSubmit={(values) => saveCategory.mutate(values)}
          />
        </div>
      ) : null}
      {!categories.length ? <EmptyState title="Kategori yok" /> : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {categories.map((category) => (
            <article key={category._id} className="rounded-md border border-[#dfe7e1] bg-white p-5">
              <h2 className="font-bold text-[#17211d]">{category.name}</h2>
              <p className="mt-3 text-sm text-[#66756c]">{category.subcategories?.join(', ') || 'Alt kategori yok'}</p>
              <div className="mt-5 flex gap-2">
                <Button type="button" variant="outline" onClick={() => { setEditingCategory(category); setShowForm(true) }}>Düzenle</Button>
                <Button type="button" variant="danger" disabled={deleteCategory.isPending} onClick={() => handleDelete(category)}>Sil</Button>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  )
}
