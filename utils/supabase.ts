import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Missing Supabase credentials. Please check your environment variables.")
}

// Create a Supabase client with special configuration for browser environments
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storageKey: 'supabase.auth.token'
  }
})

// Call this when the app initializes to check if we're authenticated
export const initSupabaseAuth = async () => {
  try {
    console.log("Initializing Supabase auth...")
    
    // Try to get the current session
    const { data, error } = await supabase.auth.getSession()
    
    if (error) {
      console.error("Error getting initial session:", error)
      return null
    }
    
    // If we have a session, verify it works
    if (data.session) {
      console.log("Found existing session for user:", data.session.user.email)
      
      // Get user details to verify the session is valid
      const { data: userData, error: userError } = await supabase.auth.getUser()
      
      if (userError) {
        console.error("Error verifying user session:", userError)
        return null
      }
      
      console.log("Session verified for user:", userData.user.email)
      return userData.user
    } else {
      console.log("No existing session found")
      return null
    }
  } catch (error) {
    console.error("Exception during auth initialization:", error)
    return null
  }
}

// Debug function to check session status
export const checkSupabaseSession = async () => {
  try {
    const { data, error } = await supabase.auth.getSession()
    
    console.log("Supabase session check:", data?.session ? "Authenticated" : "Not authenticated")
    if (data?.session) {
      console.log("Session user:", data.session.user.email)
    }
    
    if (error) {
      console.error("Error checking Supabase session:", error)
    }
    
    return { data, error }
  } catch (error) {
    console.error("Exception checking Supabase session:", error)
    return { data: { session: null }, error }
  }
} 