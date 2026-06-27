export const ADMIN_AUTH_REQUIRED_EVENT = 'evginler-admin:auth-required'

export function notifyAdminAuthRequired(detail = {}) {
  window.dispatchEvent(new CustomEvent(ADMIN_AUTH_REQUIRED_EVENT, { detail }))
}
