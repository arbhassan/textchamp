"use client"

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { supabase, initSupabaseAuth } from '@/utils/supabase'
import { useRouter } from 'next/navigation'
import { Session, User } from '@supabase/supabase-js'

interface AuthContextType {
  user: User | null
  session: Session | null
  isLoading: boolean
  signIn: (email: string, password: string) => Promise<{ error: any }>
  signUp: (email: string, password: string, userData: any) => Promise<{ error: any, data: any }>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const initializeAuth = async () => {
      console.log("AuthContext: Initializing auth...")
      try {
        // First try our improved initialization that validates the session
        const initialUser = await initSupabaseAuth()
        if (initialUser) {
          console.log("AuthContext: Initialized with user", initialUser.email)
          setUser(initialUser)
          
          // Also get the full session for completeness
          const { data: { session } } = await supabase.auth.getSession()
          setSession(session)
        } else {
          console.log("AuthContext: Initialized with no user")
          setUser(null)
          setSession(null)
        }
      } catch (error) {
        console.error("AuthContext: Error during initialization", error)
        setUser(null)
        setSession(null)
      } finally {
        setIsLoading(false)
      }
    }

    // Initialize the auth state
    initializeAuth()

    // Set up the auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log("AuthContext: Auth state changed, event:", _event)
      console.log("AuthContext: New session:", session ? "Has session" : "No session")
      if (session?.user) {
        console.log("AuthContext: Session user:", session.user.email)
      }
      
      setSession(session)
      setUser(session?.user ?? null)
      setIsLoading(false)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const signUp = async (email: string, password: string, userData: any) => {
    console.log("AuthContext: Signing up user:", email)
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: userData.firstName,
          last_name: userData.lastName,
          phone: userData.phone,
          current_level: userData.currentLevel,
          school_name: userData.schoolName,
          current_grade: userData.currentGrade,
          user_type: userData.userType
        }
      }
    })
    
    console.log("AuthContext: Sign up result:", { data, error })
    return { data, error }
  }

  const signIn = async (email: string, password: string) => {
    console.log("AuthContext: Signing in user:", email)
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    
    console.log("AuthContext: Sign in result:", { data, error })
    return { data, error }
  }

  const signOut = async () => {
    console.log("AuthContext: Signing out user")
    await supabase.auth.signOut()
    router.push('/signin')
  }

  const value = {
    user,
    session,
    isLoading,
    signIn,
    signUp,
    signOut
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
} 