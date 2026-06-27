import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Search } from 'lucide-react'
import { useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { adminOrdersApi } from '../api/adminOrdersApi'
import { Button } from '../components/Button'
import { EmptyState } from '../components/EmptyState'
import { LoadingState } from '../components/LoadingState'
import { PageHeader } from '../components/PageHeader'
import { ConfirmOrderModal } from '../features/orders/ConfirmOrderModal'
import { OrderCard } from '../features/orders/OrderCard'
import { getCustomer, getOrderId, getOrderNumber } from '../features/orders/orderHelpers'

const statusTitles = {
  all: 'Tüm siparişler',
  incoming: 'Gelen siparişler',
  confirmed: 'Onaylanan siparişler',
  delivered: 'Teslim edilen siparişler',
  returned: 'İade siparişleri',
  canceled: 'İptal edilen siparişler',
}

function filterOrdersLocally(orders, searchQuery) {
  const query = searchQuery.trim().toLowerCase()
  if (!query) return orders

  return orders.filter((order) => {
    const customer = getCustomer(order)
    return (
      String(getOrderNumber(order) || '').toLowerCase().includes(query) ||
      customer.name.toLowerCase().includes(query) ||
      customer.email.toLowerCase().includes(query)
    )
  })
}

export function OrdersPage({ status = 'all' }) {
  const [searchDraft, setSearchDraft] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [confirmingOrder, setConfirmingOrder] = useState(null)
  const queryClient = useQueryClient()
  const params = {
    ...(status === 'all' ? {} : { status }),
    ...(searchQuery ? { searchQuery } : {}),
  }
  const {
    data: orders = [],
    isError,
    isLoading,
  } = useQuery({
    queryKey: ['admin', 'orders', status, searchQuery],
    queryFn: () => adminOrdersApi.getOrders(params),
  })

  const visibleOrders = useMemo(() => filterOrdersLocally(orders, searchQuery), [orders, searchQuery])

  const confirmOrder = useMutation({
    mutationFn: ({ orderId, values }) => adminOrdersApi.confirmOrder(orderId, values),
    onSuccess: () => {
      setConfirmingOrder(null)
      queryClient.invalidateQueries({ queryKey: ['admin', 'orders'] })
      queryClient.invalidateQueries({ queryKey: ['admin', 'dashboard'] })
      toast.success('Sipariş onaylandı.')
    },
    onError: (error) => {
      if (!error.toastShown) toast.error(error.message || 'Sipariş onaylanamadı.')
    },
  })

  const deliverOrder = useMutation({
    mutationFn: adminOrdersApi.deliverOrder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'orders'] })
      queryClient.invalidateQueries({ queryKey: ['admin', 'dashboard'] })
      toast.success('Sipariş teslim edildi olarak işaretlendi.')
    },
    onError: (error) => {
      if (!error.toastShown) toast.error(error.message || 'Sipariş güncellenemedi.')
    },
  })

  const submitSearch = (event) => {
    event.preventDefault()
    setSearchQuery(searchDraft.trim())
  }

  const handleDeliver = (order) => {
    if (window.confirm(`#${getOrderNumber(order)} siparişini teslim edildi olarak işaretlemek istiyor musunuz?`)) {
      deliverOrder.mutate(getOrderId(order))
    }
  }

  if (isLoading) return <LoadingState label="Siparişler yükleniyor" />
  if (isError) return <EmptyState title="Siparişler alınamadı" description="Bir süre sonra tekrar deneyin." />

  return (
    <section>
      <PageHeader
        title={statusTitles[status]}
        description="Siparişleri durumlarına göre takip edin, onaylayın ve teslim sürecini yönetin."
        action={
          <form onSubmit={submitSearch} className="flex w-full gap-2 md:w-96">
            <label className="flex h-10 flex-1 items-center gap-2 rounded-md border border-[#cfd9d2] bg-white px-3">
              <Search className="h-4 w-4 text-[#66756c]" />
              <input
                value={searchDraft}
                onChange={(event) => setSearchDraft(event.target.value)}
                placeholder="Sipariş no veya müşteri ara"
                className="w-full bg-transparent text-sm outline-none"
              />
            </label>
            <Button type="submit">Ara</Button>
          </form>
        }
      />

      {!visibleOrders.length ? (
        <EmptyState title="Sipariş yok" description="Bu filtrede sipariş bulunamadı." />
      ) : (
        <div className="grid gap-4">
          {visibleOrders.map((order) => (
            <OrderCard
              key={getOrderId(order) || getOrderNumber(order)}
              isDelivering={deliverOrder.isPending}
              onConfirm={setConfirmingOrder}
              onDeliver={handleDeliver}
              order={order}
              status={status}
            />
          ))}
        </div>
      )}

      <ConfirmOrderModal
        isPending={confirmOrder.isPending}
        onClose={() => setConfirmingOrder(null)}
        onSubmit={(values) => confirmOrder.mutate({ orderId: getOrderId(confirmingOrder), values })}
        order={confirmingOrder}
      />
    </section>
  )
}
