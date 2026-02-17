'use server'

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

/**
 * Get the authenticated user from a server context (API route, server component, etc.)
 * Returns null if user is not authenticated
 */
export async function getUser() {
  const cookieStore = await cookies()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  return user
}

/**
 * Create a Supabase client for the browser (client component)
 * Should be imported from the client context
 */
export function createBrowserClient() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          // Return empty array for browser context
          return []
        },
        setAll() {
          // No-op for browser context
        },
      },
    }
  )
}

// getAuthErrorMessage moved to lib/auth-errors.ts for client-side usage
