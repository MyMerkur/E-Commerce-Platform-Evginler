import { useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { useLocation, useNavigate } from 'react-router-dom'
import { cartApi } from '../../api/cartApi'
import { useAuthStore } from '../../store/authStore'
import { useCartStore } from '../../store/cartStore'

export function useCartActions() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const location = useLocation()
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const setCart = useCartStore((state) => state.setCart)

  const syncCart = (data) => {
    setCart(data)
    queryClient.invalidateQueries({ queryKey: ['cart'] })
  }

  const addItem = useMutation({
    mutationFn: ({ productId, quantity = 1 }) => {
      if (!isAuthenticated) {
        toast.error('Sepete eklemek için giriş yapmalısınız.')
        navigate('/login', { state: { from: location } })
        return Promise.reject(new Error('AUTH_REQUIRED'))
      }

      return cartApi.addItem({ productId, quantity })
    },
    onSuccess: (data) => {
      syncCart(data)
      toast.success('Ürün sepete eklendi.')
    },
    onError: (error) => {
      if (error.message !== 'AUTH_REQUIRED') {
        console.error(error)
      }
    },
  })

  const updateItem = useMutation({
    mutationFn: ({ productId, quantity }) => cartApi.updateItem(productId, quantity),
    onSuccess: syncCart,
  })

  const removeItem = useMutation({
    mutationFn: (productId) => cartApi.removeItem(productId),
    onSuccess: (data) => {
      syncCart(data)
      toast.success('Ürün sepetten çıkarıldı.')
    },
  })

  return { addItem, updateItem, removeItem }
}
