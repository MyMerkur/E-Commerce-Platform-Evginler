import { Navigate, useLocation } from 'react-router-dom'
import { useAdminAuth } from '../hooks/useAdminAuth'
import { useAdminAuthStore } from '../store/adminAuthStore'
import { LoadingState } from './LoadingState'

export function ProtectedRoute({ children }) {
  const location = useLocation()
  const { data, isLoading, isFetching } = useAdminAuth()
  const storeAuthenticated = useAdminAuthStore((state) => state.isAuthenticated)
  const isAuthenticated = storeAuthenticated || data?.isAuthenticated === true

  if (isLoading || (isFetching && !data)) {
    return <LoadingState label="Admin oturumu kontrol ediliyor" />
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  return children
}
