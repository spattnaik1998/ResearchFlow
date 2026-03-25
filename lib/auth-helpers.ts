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
 * Validate that a user owns a workspace (defense-in-depth check)
 * RLS handles this, but we add application-level validation
 */
export async function validateWorkspaceOwnership(
  supabase: ReturnType<typeof createServerClient>,
  workspaceId: string | null | undefined,
  userId: string | null | undefined
): Promise<boolean> {
  if (!workspaceId || !userId) {
    return false
  }

  try {
    const { data, error } = await supabase
      .from('user_workspaces')
      .select('id')
      .eq('id', workspaceId)
      .eq('user_id', userId)
      .single()

    return !error && !!data
  } catch {
    return false
  }
}

// getAuthErrorMessage moved to lib/auth-errors.ts for client-side usage
// createSupabaseClient is in lib/supabase.ts for client-side usage
