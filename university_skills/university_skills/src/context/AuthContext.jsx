import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  const isTransientLockError = (error) => {
    const msg = String(error?.message ?? error ?? '')
    return msg.includes('Lock "') || msg.includes('navigatorLock')
  }

  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

  const fetchProfile = useCallback(async (userId) => {
    for (let attempt = 0; attempt < 3; attempt += 1) {
      const { data, error } = await supabase.from('users').select('*').eq('id', userId).maybeSingle()
      if (!error) {
        setProfile(data ?? null)
        return
      }

      if (isTransientLockError(error) && attempt < 2) {
        await sleep(120 * (attempt + 1))
        continue
      }

      console.error('users profile fetch failed', error)
      setProfile(null)
      return
    }
  }, [])

  const refreshFromSession = useCallback(async () => {
    try {
      const {
        data: { session: nextSession },
      } = await supabase.auth.getSession()
      setSession(nextSession ?? null)
      if (nextSession?.user?.id) {
        await fetchProfile(nextSession.user.id)
      } else {
        setProfile(null)
      }
    } catch (error) {
      console.error('auth getSession failed', error)
      // keep previous session/profile to avoid redirect loops
    }
  }, [fetchProfile])

  useEffect(() => {
    let alive = true

    const initAuth = async () => {
      setLoading(true)
      try {
        const {
          data: { session: initialSession },
        } = await supabase.auth.getSession()
        if (!alive) return
        setSession(initialSession ?? null)
        if (initialSession?.user?.id) {
          await fetchProfile(initialSession.user.id)
        } else {
          setProfile(null)
        }
      } catch (error) {
        console.error('auth init getSession failed', error)
      } finally {
        if (alive) setLoading(false)
      }
    }

    void initAuth()

    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, nextSession) => {
      if (event === 'INITIAL_SESSION') return

      try {
        setSession(nextSession ?? null)
        if (nextSession?.user?.id) {
          await fetchProfile(nextSession.user.id)
        } else {
          setProfile(null)
        }
      } catch (error) {
        console.error('auth state change handling failed', error)
      }
    })

    return () => {
      alive = false
      authListener.subscription.unsubscribe()
    }
  }, [fetchProfile])

  const value = useMemo(
    () => ({
      session,
      profile,
      loading,
      refreshFromSession,
      refreshProfile: async (updatedRow) => {
        if (updatedRow != null && typeof updatedRow === 'object') {
          setProfile((prev) => (prev ? { ...prev, ...updatedRow } : updatedRow))
          return
        }
        if (session?.user?.id) await fetchProfile(session.user.id)
      },
      signOut: () => supabase.auth.signOut(),
    }),
    [session, profile, loading, refreshFromSession, fetchProfile],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  return useContext(AuthContext)
}
