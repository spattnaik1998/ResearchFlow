import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase-server'

/**
 * Server-side logout endpoint
 *
 * Responsibilities:
 * 1. Invalidate Supabase session (clears auth.*.json cookies)
 * 2. Set Cache-Control headers to prevent caching authenticated state
 * 3. Return 200 so client proceeds with redirect
 *
 * This endpoint is called from client AFTER auth store is cleared, not before.
 * It ensures server-side session is invalidated and browser caches are busted.
 */
export async function POST() {
  try {
    const supabase = await createSupabaseServerClient()

    // Call signOut to invalidate the session
    // This triggers Supabase to set auth cookies with empty values
    const { error } = await supabase.auth.signOut()

    if (error) {
      console.error('[Logout API] signOut error:', error)
      // Continue anyway - we still want to bust cache and set proper headers
    }

    // Return response with cache-busting headers
    // These tell browser/CDN to never serve this response from cache
    const response = NextResponse.json(
      { success: true },
      { status: 200 }
    )

    // Prevent caching of authenticated state
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0')
    response.headers.set('Pragma', 'no-cache')
    response.headers.set('Expires', '0')

    // Prevent intermediate proxy caching
    response.headers.set('Surrogate-Control', 'no-store')

    return response
  } catch (error) {
    console.error('[Logout API] Exception during logout:', error)
    // Return success anyway - client cleanup is more important than server error
    const response = NextResponse.json(
      { success: true },
      { status: 200 }
    )
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0')
    response.headers.set('Pragma', 'no-cache')
    response.headers.set('Expires', '0')
    return response
  }
}
