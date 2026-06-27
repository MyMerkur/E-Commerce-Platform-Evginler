import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import toast from 'react-hot-toast'
import { userApi } from '../api/userApi'
import { EmptyState } from '../components/EmptyState'
import { LoadingState } from '../components/LoadingState'
import { AddressCard } from '../features/user/AddressCard'
import { AddressForm } from '../features/user/AddressForm'
import { FavoriteProducts } from '../features/user/FavoriteProducts'
import { OrderHistory } from '../features/user/OrderHistory'
import { ProfileInfoForm } from '../features/user/ProfileInfoForm'
import { ProfileLayout } from '../features/user/ProfileLayout'
import { ProfileOverview } from '../features/user/ProfileSections'
import { getAddressId } from '../utils/address'

const titles = {
  overview: 'Profil özeti',
  info: 'Bilgilerim',
  addresses: 'Adreslerim',
  orders: 'Siparişlerim',
  favorites: 'Favorilerim',
}

function useProfileQuery(enabled = true) {
  return useQuery({
    queryKey: ['user', 'profile'],
    queryFn: userApi.getProfile,
    enabled,
    retry: false,
  })
}

function ProfileInfoSection() {
  const { data: profile, isLoading } = useProfileQuery()

  if (isLoading) return <LoadingState label="Bilgileriniz yükleniyor" />

  return <ProfileInfoForm profile={profile} />
}

function AddressesSection() {
  const [editingAddress, setEditingAddress] = useState(null)
  const [formKey, setFormKey] = useState(0)
  const queryClient = useQueryClient()
  const { data: addressesData = [], isLoading: addressesLoading } = useQuery({
    queryKey: ['user', 'addresses'],
    queryFn: userApi.getAddresses,
    retry: false,
  })
  const { data: profile, isLoading: profileLoading } = useProfileQuery()

  const createAddress = useMutation({
    mutationFn: userApi.createAddress,
    onSuccess: () => {
      setFormKey((current) => current + 1)
      queryClient.invalidateQueries({ queryKey: ['user', 'addresses'] })
      toast.success('Adres eklendi.')
    },
    onError: (error) => {
      if (!error.toastShown) {
        toast.error(error.message || 'Adres eklenemedi.')
      }
    },
  })

  const updateAddress = useMutation({
    mutationFn: ({ addressId, values }) => userApi.updateAddress(addressId, values),
    onSuccess: () => {
      setEditingAddress(null)
      queryClient.invalidateQueries({ queryKey: ['user', 'addresses'] })
      toast.success('Adres güncellendi.')
    },
    onError: (error) => {
      if (!error.toastShown) {
        toast.error(error.message || 'Adres güncellenemedi.')
      }
    },
  })

  const selectAddress = useMutation({
    mutationFn: (addressId) => userApi.selectAddress(addressId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user', 'profile'] })
      toast.success('Seçili adres güncellendi.')
    },
    onError: (error) => {
      if (!error.toastShown) {
        toast.error(error.message || 'Seçili adres güncellenemedi.')
      }
    },
  })

  if (addressesLoading || profileLoading) return <LoadingState label="Adresleriniz yükleniyor" />

  const addresses = Array.isArray(addressesData) ? addressesData : addressesData?.addresses || []
  const selectedAddressId = String(profile?.selectedAddress?._id || profile?.selectedAddress || '')
  const isSaving = createAddress.isPending || updateAddress.isPending

  const handleSubmit = (values) => {
    if (editingAddress) {
      updateAddress.mutate({ addressId: getAddressId(editingAddress), values })
      return
    }

    createAddress.mutate(values)
  }

  return (
    <div className="grid gap-6">
      <AddressForm
        key={editingAddress ? getAddressId(editingAddress) : formKey}
        address={editingAddress}
        isPending={isSaving}
        onCancel={() => setEditingAddress(null)}
        onSubmit={handleSubmit}
      />

      {addresses.length ? (
        <div className="grid gap-4">
          {addresses.map((address) => {
            const addressId = getAddressId(address)
            return (
              <AddressCard
                key={addressId}
                address={address}
                isSelected={String(addressId) === selectedAddressId}
                isSelecting={selectAddress.isPending}
                onEdit={setEditingAddress}
                onSelect={() => selectAddress.mutate(addressId)}
              />
            )
          })}
        </div>
      ) : (
        <EmptyState
          title="Kayıtlı adresiniz yok"
          description="Teslimat için kullanacağınız adresi yukarıdaki formdan ekleyebilirsiniz."
        />
      )}
    </div>
  )
}

function OrdersSection() {
  const {
    data: ordersData = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['user', 'orders'],
    queryFn: userApi.getOrders,
    retry: false,
  })

  if (isLoading) return <LoadingState label="Siparişleriniz yükleniyor" />
  if (isError) {
    return (
      <EmptyState
        title="Siparişler alınamadı"
        description="Bir süre sonra tekrar deneyin veya hesabınızla yeniden giriş yapın."
      />
    )
  }

  const orders = Array.isArray(ordersData) ? ordersData : ordersData?.orders || []

  return <OrderHistory orders={orders} />
}

function FavoritesSection() {
  const {
    data: favoritesData = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['user', 'favorites'],
    queryFn: userApi.getFavorites,
    retry: false,
  })

  if (isLoading) return <LoadingState label="Favorileriniz yükleniyor" />
  if (isError) {
    return (
      <EmptyState
        title="Favoriler alınamadı"
        description="Bir süre sonra tekrar deneyin veya hesabınızla yeniden giriş yapın."
      />
    )
  }

  const favorites = Array.isArray(favoritesData) ? favoritesData : favoritesData?.favorites || []

  return <FavoriteProducts favorites={favorites} />
}

export function ProfilePage({ section }) {
  const { data: profile, isLoading } = useProfileQuery(section === 'overview')

  const content = {
    overview: isLoading ? <LoadingState label="Profiliniz yükleniyor" /> : <ProfileOverview profile={profile} />,
    info: <ProfileInfoSection />,
    addresses: <AddressesSection />,
    orders: <OrdersSection />,
    favorites: <FavoritesSection />,
  }

  return <ProfileLayout title={titles[section] || titles.overview}>{content[section] || content.overview}</ProfileLayout>
}
