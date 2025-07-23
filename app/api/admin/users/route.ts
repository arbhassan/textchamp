import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Default secret for demo purposes - should be changed in production
const DEFAULT_ADMIN_SECRET = 'admin123'

export async function GET(request: Request) {
  // Check authentication
  const adminSecret = request.headers.get('x-admin-secret')
  const validSecret = process.env.ADMIN_API_SECRET || DEFAULT_ADMIN_SECRET
  
  if (adminSecret !== validSecret) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  try {
    // Create a Supabase client with service role key (admin access)
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    
    // Validate required environment variables
    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json({ 
        error: 'Server configuration error: Missing Supabase credentials',
        details: 'Please ensure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in your environment variables.' 
      }, { status: 500 })
    }
    
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)
    
    // Fetch all users using pagination
    let allUsers: any[] = []
    let page = 1
    const perPage = 1000 // Maximum allowed per page
    let hasMore = true
    
    while (hasMore) {
      const { data, error } = await supabaseAdmin.auth.admin.listUsers({
        page,
        perPage
      })
      
      if (error) {
        throw error
      }
      
      if (data.users && data.users.length > 0) {
        allUsers = allUsers.concat(data.users)
        // If we got fewer users than perPage, we've reached the end
        hasMore = data.users.length === perPage
        page++
      } else {
        hasMore = false
      }
    }
    
    return NextResponse.json({ users: allUsers }, { status: 200 })
  } catch (error) {
    console.error('Error fetching users:', error)
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch users'
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
} 