import { createClient } from '@supabase/supabase-js'
import { AUTH_USE_SESSION_ONLY_KEY } from './authPersistence'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
const supabaseServiceRole = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Missing Supabase env vars. Check .env file.')
}

/** No-op lock — avoids Web Locks API contention that stalls getSession across HMR reloads */
const authNoOpLock = async (_name, _acquireTimeout, fn) => await fn()

function pickUserAuthStorage() {
  if (typeof window === 'undefined') return undefined
  try {
    if (window.localStorage.getItem(AUTH_USE_SESSION_ONLY_KEY) === '1') return window.sessionStorage
  } catch { /* ignore */ }
  return window.localStorage
}

/** Unified storage adapter: reads from both storages, writes to primary only */
const authUserStorage = {
  getItem: (key) => {
    if (typeof window === 'undefined') return null
    const primary = pickUserAuthStorage()
    if (!primary) return null
    const secondary = primary === window.sessionStorage ? window.localStorage : window.sessionStorage
    try { return primary.getItem(key) ?? secondary?.getItem(key) ?? null } catch { return null }
  },
  setItem: (key, value) => {
    if (typeof window === 'undefined') return
    const primary = pickUserAuthStorage()
    if (!primary) return
    const secondary = primary === window.sessionStorage ? window.localStorage : window.sessionStorage
    try { secondary?.removeItem(key) } catch { /* ignore */ }
    try { primary.setItem(key, value) } catch { /* ignore */ }
  },
  removeItem: (key) => {
    if (typeof window === 'undefined') return
    try { window.localStorage.removeItem(key); window.sessionStorage.removeItem(key) } catch { /* ignore */ }
  },
}

/** Singleton user-facing client — prevents multiple GoTrueClient instances on HMR */
const createUserClient = () =>
  createClient(supabaseUrl ?? '', supabaseAnonKey ?? '', {
    auth: {
      lock: authNoOpLock,
      storage: authUserStorage,
      // Detected session faster by skipping URL hash parsing on non-auth pages
      detectSessionInUrl: true,
      flowType: 'pkce',
    },
    global: {
      // Faster fetch by reducing keepalive overhead
      fetch: (...args) => fetch(...args),
    },
  })

export const supabase =
  typeof window !== 'undefined'
    ? window.__supabaseClient || (window.__supabaseClient = createUserClient())
    : createUserClient()

/**
 * Admin client — uses service role key, completely bypasses RLS.
 * Uses a SEPARATE storageKey ('sb-admin') so it never conflicts with the user client.
 * persistSession + autoRefreshToken disabled for maximum speed.
 */
export const supabaseAdmin = supabaseServiceRole
  ? createClient(supabaseUrl ?? '', supabaseServiceRole, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
        storageKey: 'sb-admin-noop',   // <-- separate key, stops GoTrueClient conflicts
        lock: authNoOpLock,
      },
    })
  : null
