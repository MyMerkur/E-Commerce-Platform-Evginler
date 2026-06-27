import { Navigate, useLocation } from 'react-router-dom'
import { LoadingState } from './LoadingState'
import { useAuth } from '../hooks/useAuth'
import { useAuthStore } from '../store/authStore'

export function ProtectedRoute({ children }) {
  const location = useLocation()
  const { data, isLoading, isFetching } = useAuth()
  const storeAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const isAuthenticated = storeAuthenticated || data?.isAuthenticated === true

  if (isLoading || (isFetching && !data)) {
    return <LoadingState label="Oturum kontrol ediliyor" />
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  return children
}
