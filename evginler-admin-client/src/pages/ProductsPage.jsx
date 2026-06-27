import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { adminProductsApi } from '../api/adminProductsApi'
import { Button } from '../components/Button'
import { EmptyState } from '../components/EmptyState'
import { LoadingState } from '../components/LoadingState'
import { PageHeader } from '../components/PageHeader'
import { formatCurrency } from '../utils/formatters'

export function ProductsPage() {
  const [selectedProductIds, setSelectedProductIds] = useState([])
  const queryClient = useQueryClient()
  const { data: products = [], isLoading, isError } = useQuery({ queryKey: ['admin', 'products'], queryFn: adminProductsApi.getProducts })
  const selectedCount = selectedProductIds.length
  const allVisibleSelected = products.length > 0 && selectedCount === products.length
  const selectedProductSet = useMemo(() => new Set(selectedProductIds), [selectedProductIds])
  const deleteProduct = useMutation({
    mutationFn: adminProductsApi.deleteProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'products'] })
      setSelectedProductIds([])
      toast.success('Ürün silindi.')
    },
    onError: (error) => {
      if (!error.toastShown) toast.error(error.message || 'Ürün silinemedi.')
    },
  })
  const bulkStatus = useMutation({
    mutationFn: adminProductsApi.updateProductsStatus,
    onSuccess: (_, payload) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'products'] })
      setSelectedProductIds([])
      toast.success(payload.isActive ? 'Seçili ürünler yayına alındı.' : 'Seçili ürünler yayından kaldırıldı.')
    },
    onError: (error) => {
      if (!error.toastShown) toast.error(error.message || 'Ürün durumları güncellenemedi.')
    },
  })

  const handleDelete = (product) => {
    if (window.confirm(`${product.name} ürününü silmek istediğinize emin misiniz?`)) {
      deleteProduct.mutate(product._id)
    }
  }

  const toggleProduct = (productId) => {
    setSelectedProductIds((current) =>
      current.includes(productId) ? current.filter((id) => id !== productId) : [...current, productId],
    )
  }

  const toggleAllProducts = () => {
    setSelectedProductIds(allVisibleSelected ? [] : products.map((product) => product._id))
  }

  const handleBulkStatus = (isActive) => {
    if (selectedProductIds.length === 0) {
      toast.error('En az bir ürün seçmelisiniz.')
      return
    }

    bulkStatus.mutate({ productIds: selectedProductIds, isActive })
  }

  if (isLoading) return <LoadingState label="Ürünler yükleniyor" />
  if (isError) return <EmptyState title="Ürünler alınamadı" description="Bir süre sonra tekrar deneyin." />

  return (
    <section>
      <PageHeader title="Ürünler" description="Ürün kataloğunu görüntüleyin." action={<Button as={Link} to="/products/new">Yeni ürün</Button>} />
      {!products.length ? <EmptyState title="Ürün yok" description="Ürünler eklendiğinde burada listelenecek." /> : (
        <div className="overflow-hidden rounded-md border border-[#dfe7e1] bg-white">
          <div className="flex flex-col gap-3 border-b border-[#dfe7e1] bg-[#f8faf8] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm font-medium text-[#4f5d54]">
              {selectedCount > 0 ? `${selectedCount} ürün seçildi` : 'Toplu işlem için ürün seçin'}
            </p>
            <div className="flex flex-wrap gap-2">
              <Button type="button" disabled={selectedCount === 0 || bulkStatus.isPending} onClick={() => handleBulkStatus(true)}>
                Seçili ürünleri yayına al
              </Button>
              <Button type="button" variant="outline" disabled={selectedCount === 0 || bulkStatus.isPending} onClick={() => handleBulkStatus(false)}>
                Seçili ürünleri yayından kaldır
              </Button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead className="bg-[#edf2ef] text-[#4f5d54]">
                <tr>
                  <th className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={allVisibleSelected}
                      onChange={toggleAllProducts}
                      className="h-4 w-4 rounded border-[#b8c7bd] text-[#2f5d50] focus:ring-[#2f5d50]"
                      aria-label="Tüm ürünleri seç"
                    />
                  </th>
                  <th className="px-4 py-3">Ürün</th>
                  <th className="px-4 py-3">Durum</th>
                  <th className="px-4 py-3">Kategori</th>
                  <th className="px-4 py-3">Stok</th>
                  <th className="px-4 py-3">Fiyat</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#dfe7e1]">
                {products.map((product) => (
                  <tr key={product._id}>
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedProductSet.has(product._id)}
                        onChange={() => toggleProduct(product._id)}
                        className="h-4 w-4 rounded border-[#b8c7bd] text-[#2f5d50] focus:ring-[#2f5d50]"
                        aria-label={`${product.name} ürününü seç`}
                      />
                    </td>
                    <td className="px-4 py-3 font-semibold text-[#17211d]">{product.name}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${product.isActive ? 'bg-[#e4f5ea] text-[#27633a]' : 'bg-[#f3eee8] text-[#8a5a2b]'}`}>
                        {product.isActive ? 'Aktif' : 'Pasif'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[#66756c]">{product.categories?.map((category) => category.name).join(', ') || '-'}</td>
                    <td className="px-4 py-3">{product.stock}</td>
                    <td className="px-4 py-3">{formatCurrency(product.discountedPrice || product.price)}</td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <Button as={Link} to={`/products/${product._id}/edit`} variant="outline">Düzenle</Button>
                        <Button type="button" variant="danger" disabled={deleteProduct.isPending} onClick={() => handleDelete(product)}>Sil</Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </section>
  )
}
