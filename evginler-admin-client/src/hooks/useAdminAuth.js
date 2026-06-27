import { useQuery } from '@tanstack/react-query'
import { useEffect } from 'react'
import { adminAuthApi } from '../api/adminAuthApi'
import { useAdminAuthStore } from '../store/adminAuthStore'

export function useAdminAuth() {
  const setAuth = useAdminAuthStore((state) => state.setAuth)
  const query = useQuery({
    queryKey: ['admin', 'me'],
    queryFn: adminAuthApi.me,
    staleTime: 1000 * 60 * 5,
    retry: false,
  })

  useEffect(() => {
    if (query.data) setAuth(query.data)
  }, [query.data, setAuth])

  return query
}
