import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Temporarily disable middleware redirects for debugging
const DISABLE_AUTH_REDIRECTS = true

export async function middleware(request: NextRequest) {
  // For debugging - log current path
  console.log("Middleware running for path:", request.nextUrl.pathname)
  
  // Skip middleware during development/debugging if needed
  if (DISABLE_AUTH_REDIRECTS) {
    console.log("Middleware: Auth redirects disabled for debugging")
    return NextResponse.next()
  }
  
  // Create a Supabase client configured to use cookies
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
  
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error("Missing Supabase credentials in environment variables")
    return NextResponse.next()
  }
  
  // Special handling for auth callback URLs
  if (
    request.nextUrl.pathname.includes('auth/callback') ||
    request.nextUrl.pathname.startsWith('/api') ||
    request.nextUrl.pathname.includes('/supabase') ||
    request.nextUrl.pathname.includes('/reset-password') && request.nextUrl.hash
  ) {
    console.log("Middleware: Skipping for auth/callback path", request.nextUrl.pathname)
    return NextResponse.next()
  }
  
  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true
    }
  })

  try {
    // Get the session from supabase using the cookie
    const { data: { session }, error } = await supabase.auth.getSession()
    
    if (error) {
      console.error("Error getting session in middleware:", error)
    }

    console.log("Middleware session check:", session ? "Authenticated" : "Not authenticated")
    
    // Define auth routes and public routes
    const isAuthRoute = ['/signin', '/signup'].includes(request.nextUrl.pathname)
    const isPublicRoute = ['/forgot-password', '/reset-password', '/test-auth'].includes(request.nextUrl.pathname)
    
    // Skip auth check for specific paths
    if (request.nextUrl.pathname.startsWith('/api') || 
        request.nextUrl.pathname.includes('supabase') ||
        request.nextUrl.pathname.includes('auth')) {
      console.log("Middleware: Skipping redirect for API/auth route")
      return NextResponse.next()
    }
    
    // If there's no session and the user is trying to access a protected route
    if (!session && !isAuthRoute && !isPublicRoute) {
      console.log("Middleware: Redirecting unauthenticated user to signin")
      // Redirect to the signin page if the user is not authenticated and not already on an auth or public page
      const redirectUrl = new URL('/signin', request.url)
      return NextResponse.redirect(redirectUrl)
    }

    // If the user is authenticated and trying to access an auth route, redirect to dashboard
    if (session && isAuthRoute) {
      console.log("Middleware: Redirecting authenticated user to dashboard")
      const redirectUrl = new URL('/', request.url)
      return NextResponse.redirect(redirectUrl)
    }

    console.log("Middleware: Allowing request to proceed")
    return NextResponse.next()
  } catch (error) {
    console.error("Middleware exception:", error)
    return NextResponse.next()
  }
}

// Run the middleware only on specific routes to avoid unnecessary processing
export const config = {
  matcher: [
    '/',
    '/signin',
    '/signup',
    '/forgot-password',
    '/reset-password',
    '/narratcomp',
    '/nonnarratcomp',
    '/visualtextcomp',
    '/fullpractice',
  ],
} 