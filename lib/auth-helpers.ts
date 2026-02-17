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

/**
 * Get error message from Supabase auth error
 */
export function getAuthErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    const message = error.message.toLowerCase()

    if (message.includes('invalid login credentials')) {
      return 'Invalid email or password'
    }
    if (message.includes('email not confirmed')) {
      return 'Please verify your email before logging in'
    }
    if (message.includes('user already registered')) {
      return 'Email already registered. Try logging in instead.'
    }
    if (message.includes('password')) {
      return 'Password does not meet security requirements'
    }

    return error.message
  }

  return 'An unexpected error occurred'
}
