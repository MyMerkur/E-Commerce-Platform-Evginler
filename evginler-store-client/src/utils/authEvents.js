export const AUTH_REQUIRED_EVENT = 'evginler:auth-required'

export function notifyAuthRequired(detail = {}) {
  window.dispatchEvent(new CustomEvent(AUTH_REQUIRED_EVENT, { detail }))
}
