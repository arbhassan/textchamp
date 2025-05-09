import { NextResponse } from 'next/server'
import { supabase } from '@/utils/supabase'

export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    
    // Test if we have the environment variables
    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.json({
        status: 'error',
        message: 'Missing Supabase credentials in environment variables',
        env: {
          hasSupabaseUrl: !!supabaseUrl,
          hasSupabaseAnonKey: !!supabaseAnonKey
        }
      }, { status: 500 })
    }
    
    // Try to get the session (this should not throw errors even if not authenticated)
    const { data, error } = await supabase.auth.getSession()
    
    return NextResponse.json({
      status: 'success',
      message: 'Supabase configuration is valid',
      auth: {
        hasSession: !!data.session,
        error: error ? error.message : null
      },
      env: {
        hasSupabaseUrl: !!supabaseUrl,
        hasSupabaseAnonKey: !!supabaseAnonKey
      }
    })
  } catch (error: any) {
    return NextResponse.json({
      status: 'error',
      message: 'Error testing Supabase auth',
      error: error.message
    }, { status: 500 })
  }
} 