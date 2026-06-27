import { useQuery } from '@tanstack/react-query'
import { useEffect } from 'react'
import { authApi } from '../api/authApi'
import { useAuthStore } from '../store/authStore'

export function useAuth() {
  const setAuth = useAuthStore((state) => state.setAuth)

  const query = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: authApi.me,
    retry: false,
    staleTime: 1000 * 60 * 5,
  })

  useEffect(() => {
    if (query.data) {
      setAuth(query.data)
    }
  }, [query.data, setAuth])

  return query
}
