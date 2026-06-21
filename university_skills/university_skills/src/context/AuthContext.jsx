import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext(null)

// Only fetch columns the app actually uses — much faster than SELECT *
const PROFILE_COLS = 'id,name,email,role,department,semester,profile_picture,is_verified_developer,is_top_performer,contact_email,linkedin_url,created_at,bio,phone,address,dob,nationality,languages,professional_title,github_url,twitter_url,instagram_url,facebook_url,website_url'

const getCachedSession = () => {
  try {
    const s = localStorage.getItem('skillsphere_session')
    return s ? JSON.parse(s) : null
  } catch {
    return null
  }
}

const getCachedProfile = () => {
  try {
    const p = localStorage.getItem('skillsphere_profile')
    return p ? JSON.parse(p) : null
  } catch {
    return null
  }
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(getCachedSession)
  const [profile, setProfile] = useState(getCachedProfile)
  
  // Set initial loading state to true only if we don't have consistent cached data
  const [loading, setLoading] = useState(() => {
    const cachedSession = getCachedSession()
    const cachedProfile = getCachedProfile()
    const isConsistent = cachedSession?.user?.id && cachedProfile?.id && cachedSession.user.id === cachedProfile.id
    return !isConsistent
  })

  // profileFetching = true while a profile fetch is in-flight (used by ProtectedRoute)
  const [profileFetching, setProfileFetching] = useState(false)
  const profileLoadedForUserIdRef = useRef(
    (() => {
      try {
        const s = getCachedSession()
        const p = getCachedProfile()
        return (s?.user?.id && p?.id && s.user.id === p.id) ? s.user.id : null
      } catch {
        return null
      }
    })()
  )

  const handleSetSession = useCallback((nextSession) => {
    setSession(nextSession)
    try {
      if (nextSession) {
        localStorage.setItem('skillsphere_session', JSON.stringify(nextSession))
      } else {
        localStorage.removeItem('skillsphere_session')
        localStorage.removeItem('skillsphere_profile')
      }
    } catch (err) {
      console.error('Failed to cache session in localStorage', err)
    }
  }, [])

  const handleSetProfile = useCallback((nextProfile) => {
    setProfile(nextProfile)
    try {
      if (nextProfile) {
        localStorage.setItem('skillsphere_profile', JSON.stringify(nextProfile))
      } else {
        localStorage.removeItem('skillsphere_profile')
      }
    } catch (err) {
      console.error('Failed to cache profile in localStorage', err)
    }
  }, [])

  const fetchProfile = useCallback(async (userId) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select(PROFILE_COLS)
        .eq('id', userId)
        .maybeSingle()

      if (!error) {
        handleSetProfile(data ?? null)
        return true
      }
      console.error('users profile fetch failed', error)
      return false
    } catch (err) {
      console.error('fetchProfile crashed', err)
      return false
    }
  }, [handleSetProfile])

  const refreshFromSession = useCallback(async () => {
    try {
      const { data: { session: nextSession } } = await supabase.auth.getSession()
      handleSetSession(nextSession ?? null)
      if (nextSession?.user?.id) {
        const ok = await fetchProfile(nextSession.user.id)
        profileLoadedForUserIdRef.current = ok ? nextSession.user.id : (getCachedProfile()?.id === nextSession.user.id ? nextSession.user.id : null)
      } else {
        profileLoadedForUserIdRef.current = null
        handleSetProfile(null)
      }
    } catch (error) {
      console.error('auth getSession failed', error)
    }
  }, [fetchProfile, handleSetSession, handleSetProfile])

  useEffect(() => {
    let alive = true

    const initAuth = async () => {
      const cachedSession = getCachedSession()
      const cachedProfile = getCachedProfile()
      const isConsistent = cachedSession?.user?.id && cachedProfile?.id && cachedSession.user.id === cachedProfile.id

      if (!isConsistent) {
        setLoading(true)
      }

      try {
        const { data: { session: initialSession } } = await supabase.auth.getSession()
        if (!alive) return
        
        handleSetSession(initialSession ?? null)
        
        if (initialSession?.user?.id) {
          const ok = await fetchProfile(initialSession.user.id)
          if (ok) {
            profileLoadedForUserIdRef.current = initialSession.user.id
          } else if (cachedProfile && cachedProfile.id === initialSession.user.id) {
            // Keep using the cached profile on network failure
            profileLoadedForUserIdRef.current = initialSession.user.id
          } else {
            profileLoadedForUserIdRef.current = null
          }
        } else {
          profileLoadedForUserIdRef.current = null
          handleSetProfile(null)
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
        handleSetSession(nextSession ?? null)
        const uid = nextSession?.user?.id ?? null

        if (!uid) {
          profileLoadedForUserIdRef.current = null
          handleSetProfile(null)
          return
        }

        // Skip re-fetch on simple token refresh — same user, profile unchanged
        if (event === 'TOKEN_REFRESHED' && profileLoadedForUserIdRef.current === uid) return

        // Mark profile as fetching so ProtectedRoute shows loading instead of redirecting
        // ONLY if we don't already have profile loaded for this user to avoid flickering loading screen!
        const hasCached = profileLoadedForUserIdRef.current === uid
        if (!hasCached) {
          setProfileFetching(true)
        }
        
        const ok = await fetchProfile(uid)
        if (ok) {
          profileLoadedForUserIdRef.current = uid
        } else {
          const cachedProfile = getCachedProfile()
          if (cachedProfile && cachedProfile.id === uid) {
            profileLoadedForUserIdRef.current = uid
          } else {
            profileLoadedForUserIdRef.current = null
          }
        }
      } catch (error) {
        console.error('auth state change handling failed', error)
      } finally {
        setProfileFetching(false)
      }
    })

    return () => {
      alive = false
      authListener.subscription.unsubscribe()
    }
  }, [fetchProfile, handleSetSession, handleSetProfile])

  const signOut = useCallback(async () => {
    // Clear state/cache immediately so the UI redirects instantly
    handleSetProfile(null)
    handleSetSession(null)
    profileLoadedForUserIdRef.current = null
    // Fire the server call in background — don't wait for it
    supabase.auth.signOut().catch(console.error)
  }, [handleSetProfile, handleSetSession])

  const value = useMemo(
    () => ({
      session,
      profile,
      loading,
      profileFetching,
      refreshFromSession,
      signOut,
      refreshProfile: async (updatedRow) => {
        if (updatedRow != null && typeof updatedRow === 'object') {
          handleSetProfile(prev => (prev ? { ...prev, ...updatedRow } : updatedRow))
          return
        }
        if (session?.user?.id) {
          const ok = await fetchProfile(session.user.id)
          if (ok) {
            profileLoadedForUserIdRef.current = session.user.id
          }
        }
      },
    }),
    [session, profile, loading, profileFetching, refreshFromSession, signOut, fetchProfile, handleSetProfile],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  return useContext(AuthContext)
}
