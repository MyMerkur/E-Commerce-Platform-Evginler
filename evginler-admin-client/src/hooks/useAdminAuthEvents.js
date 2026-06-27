import { useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAdminAuthStore } from '../store/adminAuthStore'
import { ADMIN_AUTH_REQUIRED_EVENT } from '../utils/authEvents'

export function useAdminAuthEvents() {
  const navigate = useNavigate()
  const location = useLocation()
  const clearAuth = useAdminAuthStore((state) => state.clearAuth)

  useEffect(() => {
    const handleAuthRequired = (event) => {
      clearAuth()
      if (event.detail?.shouldRedirect === false) return
      navigate('/login', { replace: true, state: { from: location } })
    }

    window.addEventListener(ADMIN_AUTH_REQUIRED_EVENT, handleAuthRequired)
    return () => window.removeEventListener(ADMIN_AUTH_REQUIRED_EVENT, handleAuthRequired)
  }, [clearAuth, location, navigate])
}
