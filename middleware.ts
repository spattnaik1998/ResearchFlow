import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

/**
 * Middleware for route protection and session management
 *
 * Protects:
 * - /app/* - Requires authentication
 * - /auth/* - Redirects to /app if already authenticated
 *
 * Skips:
 * - /_next/* - Next.js internals
 * - /api/auth/* - Auth endpoints (no session check)
 * - Static files (favicon, etc.)
 */
export async function middleware(request: NextRequest) {
  // Get the path
  const { pathname } = request.nextUrl

  // Skip middleware for non-essential paths
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api/auth') ||
    pathname === '/favicon.ico' ||
    pathname.endsWith('.png') ||
    pathname.endsWith('.jpg') ||
    pathname.endsWith('.svg')
  ) {
    return NextResponse.next()
  }

  // If Supabase env vars are not configured, skip auth middleware
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return NextResponse.next()
  }

  // Create a Supabase client
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value)
            response = NextResponse.next({
              request: {
                headers: request.headers,
              },
            })
            response.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  // Check if user is authenticated
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Protect /app/* routes
  if (pathname.startsWith('/app')) {
    if (!user) {
      // Redirect to login with return URL
      const loginUrl = new URL('/auth/login', request.url)
      loginUrl.searchParams.set('next', pathname)
      return NextResponse.redirect(loginUrl)
    }
  }

  // Redirect authenticated users away from auth pages
  if (pathname.startsWith('/auth') && user) {
    return NextResponse.redirect(new URL('/app', request.url))
  }

  return response
}

/**
 * Config for which routes should run middleware
 * Runs on all routes except static assets
 */
export const config = {
  matcher: [
    // Run middleware on all routes except
    '/((?!_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.jpg$|.*\\.svg$).*)',
  ],
}
