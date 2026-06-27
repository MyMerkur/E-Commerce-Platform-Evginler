import { useQuery } from '@tanstack/react-query'
import { useEffect } from 'react'
import { cartApi } from '../api/cartApi'
import { useAuthStore } from '../store/authStore'
import { useCartStore } from '../store/cartStore'

export function useCart() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const setCart = useCartStore((state) => state.setCart)

  const query = useQuery({
    queryKey: ['cart'],
    queryFn: cartApi.getCart,
    enabled: isAuthenticated,
    retry: false,
  })

  useEffect(() => {
    if (query.data) {
      setCart(query.data)
    }
  }, [query.data, setCart])

  return query
}
