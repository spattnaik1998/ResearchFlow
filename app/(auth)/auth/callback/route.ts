import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

/**
 * This route handles OAuth and magic link redirects from Supabase Auth
 * Called by:
 * 1. Magic link email (email=X&token=Y&type=magiclink)
 * 2. Password reset email (email=X&token=Y&type=recovery)
 * 3. OAuth providers (code=X&state=Y)
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type')
  const next = searchParams.get('next') ?? '/app'

  if (code || token_hash) {
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
              // This can be ignored if you have middleware refreshing user sessions.
            }
          },
        },
      }
    )

    let exchangeError = null

    if (code) {
      // PKCE flow (OAuth, magic links, and some recovery emails)
      const { error } = await supabase.auth.exchangeCodeForSession(code)
      exchangeError = error
    } else if (token_hash && type) {
      // Token hash flow (recovery emails with Supabase email templates)
      const { error } = await supabase.auth.verifyOtp({
        token_hash,
        type: type as 'recovery' | 'email' | 'email_change',
      })
      exchangeError = error
    }

    if (!exchangeError) {
      return NextResponse.redirect(new URL(next, request.url))
    }
  }

  // Return to login with error
  return NextResponse.redirect(new URL('/auth/login?error=auth_error', request.url))
}
