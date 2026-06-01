import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext(null)

// Only fetch columns the app actually uses — much faster than SELECT *
const PROFILE_COLS = 'id,name,email,role,department,semester,profile_picture,is_verified_developer,is_top_performer,contact_email,linkedin_url,created_at,bio,phone,address,dob,nationality,languages,professional_title,github_url,twitter_url,instagram_url,facebook_url,website_url'

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const profileLoadedForUserIdRef = useRef(null)

  const fetchProfile = useCallback(async (userId) => {
    // Single attempt — retries just add latency for a happy path
    const { data, error } = await supabase
      .from('users')
      .select(PROFILE_COLS)
      .eq('id', userId)
      .maybeSingle()

    if (!error) {
      setProfile(data ?? null)
      return true
    }
    console.error('users profile fetch failed', error)
    setProfile(null)
    return false
  }, [])

  const refreshFromSession = useCallback(async () => {
    try {
      const { data: { session: nextSession } } = await supabase.auth.getSession()
      setSession(nextSession ?? null)
      if (nextSession?.user?.id) {
        const ok = await fetchProfile(nextSession.user.id)
        profileLoadedForUserIdRef.current = ok ? nextSession.user.id : null
      } else {
        profileLoadedForUserIdRef.current = null
        setProfile(null)
      }
    } catch (error) {
      console.error('auth getSession failed', error)
    }
  }, [fetchProfile])

  useEffect(() => {
    let alive = true

    const initAuth = async () => {
      setLoading(true)
      try {
        // getSession reads from local storage — no network round-trip, very fast
        const { data: { session: initialSession } } = await supabase.auth.getSession()
        if (!alive) return
        setSession(initialSession ?? null)
        if (initialSession?.user?.id) {
          const ok = await fetchProfile(initialSession.user.id)
          profileLoadedForUserIdRef.current = ok ? initialSession.user.id : null
        } else {
          profileLoadedForUserIdRef.current = null
          setProfile(null)
        }
      } catch (error) {
        console.error('auth init failed', error)
      } finally {
        if (alive) setLoading(false)
      }
    }

    void initAuth()

    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, nextSession) => {
      if (event === 'INITIAL_SESSION') return

      try {
        setSession(nextSession ?? null)
        const uid = nextSession?.user?.id ?? null

        if (!uid) {
          profileLoadedForUserIdRef.current = null
          setProfile(null)
          return
        }

        // Skip re-fetch on simple token refresh — same user, profile unchanged
        if (event === 'TOKEN_REFRESHED' && profileLoadedForUserIdRef.current === uid) return

        const ok = await fetchProfile(uid)
        profileLoadedForUserIdRef.current = ok ? uid : null
      } catch (error) {
        console.error('auth state change handling failed', error)
      }
    })

    return () => {
      alive = false
      authListener.subscription.unsubscribe()
    }
  }, [fetchProfile])

  const signOut = useCallback(async () => {
    // Optimistic logout: clear state immediately so the UI redirects instantly
    setProfile(null)
    setSession(null)
    profileLoadedForUserIdRef.current = null
    // Fire the server call in background — don't wait for it
    supabase.auth.signOut().catch(console.error)
  }, [])

  const value = useMemo(
    () => ({
      session,
      profile,
      loading,
      refreshFromSession,
      signOut,
      refreshProfile: async (updatedRow) => {
        if (updatedRow != null && typeof updatedRow === 'object') {
          setProfile((prev) => (prev ? { ...prev, ...updatedRow } : updatedRow))
          return
        }
        if (session?.user?.id) {
          const ok = await fetchProfile(session.user.id)
          profileLoadedForUserIdRef.current = ok ? session.user.id : null
        }
      },
    }),
    [session, profile, loading, refreshFromSession, signOut, fetchProfile],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  return useContext(AuthContext)
}
