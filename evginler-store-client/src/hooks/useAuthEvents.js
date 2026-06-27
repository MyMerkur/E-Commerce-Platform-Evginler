import { useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { AUTH_REQUIRED_EVENT } from '../utils/authEvents'
import { useAuthStore } from '../store/authStore'
import { useCartStore } from '../store/cartStore'

export function useAuthEvents() {
  const navigate = useNavigate()
  const location = useLocation()
  const clearAuth = useAuthStore((state) => state.clearAuth)
  const clearCart = useCartStore((state) => state.clearCart)

  useEffect(() => {
    const handleAuthRequired = (event) => {
      clearAuth()
      clearCart()

      const isAuthPage = location.pathname === '/login' || location.pathname === '/register'
      if (event.detail?.shouldRedirect === false || isAuthPage) return

      navigate('/login', {
        replace: true,
        state: {
          from: {
            pathname: event.detail?.redirectTo || `${location.pathname}${location.search}`,
          },
        },
      })
    }

    window.addEventListener(AUTH_REQUIRED_EVENT, handleAuthRequired)
    return () => window.removeEventListener(AUTH_REQUIRED_EVENT, handleAuthRequired)
  }, [clearAuth, clearCart, location.pathname, location.search, navigate])
}
