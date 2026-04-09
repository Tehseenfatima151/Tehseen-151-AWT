/** When set, Supabase auth tokens use sessionStorage (cleared when browser closes). */
export const AUTH_USE_SESSION_ONLY_KEY = 'portfolio_auth_use_session_only'

export function setAuthSessionOnly(sessionOnly) {
  if (typeof window === 'undefined') return
  if (sessionOnly) {
    window.localStorage.setItem(AUTH_USE_SESSION_ONLY_KEY, '1')
  } else {
    window.localStorage.removeItem(AUTH_USE_SESSION_ONLY_KEY)
  }
}

/** Must match redirect URL in Supabase → Authentication → URL configuration. */
export function getPasswordResetRedirectUrl() {
  if (typeof window === 'undefined') return ''
  return `${window.location.origin}/auth/reset-password`
}
