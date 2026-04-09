import { createClient } from '@supabase/supabase-js'
import { AUTH_USE_SESSION_ONLY_KEY } from './authPersistence'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
const supabaseServiceRole = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Missing Supabase env vars. Check .env file.')
}

/** No-op lock avoids Web Locks API contention (multi-tab / HMR) that slows or stalls getSession. */
const authNoOpLock = async (_name, _acquireTimeout, fn) => await fn()

function pickUserAuthStorage() {
  if (typeof window === 'undefined') return undefined
  try {
    if (window.localStorage.getItem(AUTH_USE_SESSION_ONLY_KEY) === '1') return window.sessionStorage
  } catch {
    /* ignore */
  }
  return window.localStorage
}

/** Remember me off → session-only storage; on → localStorage (default). */
const authUserStorage = {
  getItem: (key) => {
    if (typeof window === 'undefined') return null
    const primary = pickUserAuthStorage()
    if (!primary) return null
    const secondary = primary === window.sessionStorage ? window.localStorage : window.sessionStorage
    try {
      return primary.getItem(key) ?? secondary?.getItem(key) ?? null
    } catch {
      return null
    }
  },
  setItem: (key, value) => {
    if (typeof window === 'undefined') return
    const primary = pickUserAuthStorage()
    if (!primary) return
    const secondary = primary === window.sessionStorage ? window.localStorage : window.sessionStorage
    try {
      secondary?.removeItem(key)
    } catch {
      /* ignore */
    }
    try {
      primary.setItem(key, value)
    } catch {
      /* ignore */
    }
  },
  removeItem: (key) => {
    if (typeof window === 'undefined') return
    try {
      window.localStorage.removeItem(key)
      window.sessionStorage.removeItem(key)
    } catch {
      /* ignore */
    }
  },
}

export const supabase = createClient(supabaseUrl ?? '', supabaseAnonKey ?? '', {
  auth: {
    lock: authNoOpLock,
    storage: authUserStorage,
  },
})
export const supabaseAdmin = supabaseServiceRole
  ? createClient(supabaseUrl ?? '', supabaseServiceRole, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        lock: authNoOpLock,
      },
    })
  : null
