import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { adminBrandsApi } from '../api/adminBrandsApi'
import { adminCategoriesApi } from '../api/adminCategoriesApi'
import { adminProductsApi } from '../api/adminProductsApi'
import { Button } from '../components/Button'
import { LoadingState } from '../components/LoadingState'
import { PageHeader } from '../components/PageHeader'
import { ProductForm } from '../features/catalog/ProductForm'
import { splitLines } from '../features/catalog/schemas'

function toProductPayload(values) {
  return {
    name: values.name,
    price: values.price,
    discount: values.discount,
    stock: values.stock,
    size: values.size,
    categories: values.categories,
    subcategories: values.subcategories || [],
    brands: values.brands,
    description: values.description,
    imageUrl: splitLines(values.imageUrlsText),
  }
}

export function ProductFormPage({ mode }) {
  const { productId } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const isEdit = mode === 'edit'
  const { data: categories = [], isLoading: categoriesLoading } = useQuery({
    queryKey: ['admin', 'categories'],
    queryFn: adminCategoriesApi.getCategories,
  })
  const { data: brands = [], isLoading: brandsLoading } = useQuery({
    queryKey: ['admin', 'brands'],
    queryFn: adminBrandsApi.getBrands,
  })
  const { data: product, isLoading: productLoading } = useQuery({
    queryKey: ['admin', 'products', productId],
    queryFn: () => adminProductsApi.getProduct(productId),
    enabled: isEdit,
  })

  const saveProduct = useMutation({
    mutationFn: (values) =>
      isEdit ? adminProductsApi.updateProduct(productId, toProductPayload(values)) : adminProductsApi.createProduct(toProductPayload(values)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'products'] })
      toast.success(isEdit ? 'Ürün güncellendi.' : 'Ürün oluşturuldu.')
      navigate('/products')
    },
    onError: (error) => {
      if (!error.toastShown) toast.error(error.message || 'Ürün kaydedilemedi.')
    },
  })

  if (categoriesLoading || brandsLoading || productLoading) return <LoadingState label="Ürün formu hazırlanıyor" />

  return (
    <section>
      <PageHeader
        title={isEdit ? 'Ürün düzenle' : 'Yeni ürün'}
        description="Ürün katalog bilgilerini güncelleyin."
        action={<Button as={Link} to="/products" variant="outline">Ürünlere dön</Button>}
      />
      <ProductForm
        brands={brands}
        categories={categories}
        isPending={saveProduct.isPending}
        mode={mode}
        onSubmit={(values) => saveProduct.mutate(values)}
        product={product}
      />
    </section>
  )
}
