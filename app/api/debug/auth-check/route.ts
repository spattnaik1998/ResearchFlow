import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getUser } from '@/lib/auth-helpers'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const hasAnonKey = !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  const hasServiceKey = !!process.env.SUPABASE_SERVICE_KEY

  // Try to get authenticated user
  let user = null
  let userError = null
  try {
    user = await getUser()
  } catch (err) {
    userError = err instanceof Error ? err.message : 'Unknown error'
  }

  // Get auth cookies
  const cookieStore = await cookies()
  const authCookies: Record<string, string> = {}
  cookieStore.getAll().forEach((cookie) => {
    if (
      cookie.name.includes('auth') ||
      cookie.name.includes('token') ||
      cookie.name.includes('sb')
    ) {
      authCookies[cookie.name] = '***' + (cookie.value?.slice(-8) || '[empty]')
    }
  })

  return NextResponse.json({
    configured: !!url && hasAnonKey,
    supabaseUrl: url ? new URL(url).hostname : null,
    hasAnonKey,
    hasServiceKey,
    appUrl: process.env.NEXT_PUBLIC_APP_URL ?? null,
    user: user
      ? {
          id: user.id,
          email: user.email,
        }
      : null,
    userFound: !!user,
    userError,
    authCookies,
    cookieCount: Object.keys(authCookies).length,
  })
}
