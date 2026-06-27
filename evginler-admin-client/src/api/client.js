import axios from 'axios'
import toast from 'react-hot-toast'
import { notifyAdminAuthRequired } from '../utils/authEvents'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3030/api'

let csrfToken = null
let csrfPromise = null

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    Accept: 'application/json',
  },
})

export async function getCsrfToken() {
  if (csrfToken) return csrfToken
  if (csrfPromise) return csrfPromise

  csrfPromise = apiClient
    .get('/csrf-token')
    .then((response) => {
      csrfToken = response.data?.data?.csrfToken
      return csrfToken
    })
    .finally(() => {
      csrfPromise = null
    })

  return csrfPromise
}

apiClient.interceptors.request.use(async (config) => {
  const method = config.method?.toLowerCase()
  if (['post', 'put', 'patch', 'delete'].includes(method)) {
    const token = await getCsrfToken()
    if (token) config.headers['X-CSRF-Token'] = token
  }
  return config
})

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      if (!error.config?.silent) {
        toast.error('Admin oturumu gerekli.')
        error.toastShown = true
      }
      notifyAdminAuthRequired({ shouldRedirect: !['/login', '/register'].includes(window.location.pathname) })
      return Promise.reject(error)
    }

    if (error.response?.status === 403 && error.config && !error.config.__csrfRetry) {
      csrfToken = null
      error.config.__csrfRetry = true
      const token = await getCsrfToken()
      if (token) error.config.headers['X-CSRF-Token'] = token
      return apiClient(error.config)
    }

    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      'Beklenmeyen bir hata oluştu.'

    if (!error.config?.silent) {
      toast.error(message)
      error.toastShown = true
    }

    return Promise.reject(error)
  },
)

export function unwrapApiResponse(response) {
  const body = response.data

  if (body && typeof body === 'object' && 'success' in body) {
    if (!body.success) {
      const error = new Error(body.message || 'İstek başarısız oldu.')
      error.errors = body.errors
      throw error
    }

    return body.data
  }

  return body
}
