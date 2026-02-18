import { NextResponse } from 'next/server'

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const hasAnonKey = !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  const hasServiceKey = !!process.env.SUPABASE_SERVICE_KEY

  return NextResponse.json({
    configured: !!url && hasAnonKey,
    supabaseUrl: url ? new URL(url).hostname : null,
    hasAnonKey,
    hasServiceKey,
    appUrl: process.env.NEXT_PUBLIC_APP_URL ?? null,
  })
}
