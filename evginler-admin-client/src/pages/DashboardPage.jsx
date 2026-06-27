import { useQuery } from '@tanstack/react-query'
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { adminDashboardApi } from '../api/adminDashboardApi'
import { LoadingState } from '../components/LoadingState'
import { PageHeader } from '../components/PageHeader'
import { formatCurrency } from '../utils/formatters'

export function DashboardPage() {
  const { data, isLoading } = useQuery({ queryKey: ['admin', 'dashboard'], queryFn: adminDashboardApi.getDashboard })

  if (isLoading) return <LoadingState label="Dashboard hazırlanıyor" />

  const counts = data?.counts || {}
  const totals = data?.totals || {}
  const chartData = [
    { name: 'Gelen', adet: counts.incomingOrders || 0 },
    { name: 'Teslim', adet: counts.deliveredOrders || 0 },
    { name: 'İade', adet: counts.returnedOrders || 0 },
  ]

  return (
    <section>
      <PageHeader title="Dashboard" description="Sipariş, kazanç ve son ürünlerin genel görünümü." />
      <div className="grid gap-4 md:grid-cols-3">
        {[
          ['Gelen sipariş', counts.incomingOrders || 0],
          ['Teslim edilen', counts.deliveredOrders || 0],
          ['İade edilen', counts.returnedOrders || 0],
        ].map(([label, value]) => (
          <div key={label} className="rounded-md border border-[#dfe7e1] bg-white p-5">
            <p className="text-sm text-[#66756c]">{label}</p>
            <p className="mt-2 text-3xl font-bold text-[#20493f]">{value}</p>
          </div>
        ))}
      </div>
      <div className="mt-4 grid gap-4 xl:grid-cols-[1fr_360px]">
        <div className="rounded-md border border-[#dfe7e1] bg-white p-5">
          <h2 className="text-lg font-bold text-[#17211d]">Sipariş dağılımı</h2>
          <div className="mt-4 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Area type="monotone" dataKey="adet" stroke="#20493f" fill="#dce9e1" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="rounded-md border border-[#dfe7e1] bg-white p-5">
          <h2 className="text-lg font-bold text-[#17211d]">Finans özeti</h2>
          <div className="mt-4 space-y-3 text-sm">
            <div className="flex justify-between"><span>Toplam sipariş</span><strong>{formatCurrency(totals.totalOrdersPrice)}</strong></div>
            <div className="flex justify-between"><span>İade toplamı</span><strong>{formatCurrency(totals.totalReturnedPrice)}</strong></div>
            <div className="flex justify-between border-t border-[#dfe7e1] pt-3 text-[#20493f]"><span>Net kazanç</span><strong>{formatCurrency(totals.netEarnings)}</strong></div>
          </div>
        </div>
      </div>
    </section>
  )
}
