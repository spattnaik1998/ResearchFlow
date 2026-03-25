/**
 * Per-user rate limiting with sliding window
 * Prevents malicious or runaway usage of paid API endpoints
 */

import { createSupabaseServerClient } from './supabase-server'

export type RateLimitAction = 'search' | 'summarize' | 'questions'

export interface RateLimitResult {
  allowed: boolean
  remaining: number
  resetAt: Date
  limit: number
}

// Per-hour limits for each action
const RATE_LIMIT_QUOTAS: Record<RateLimitAction, number> = {
  search: 30, // 30 searches per hour
  summarize: 20, // 20 summaries per hour
  questions: 20, // 20 question generations per hour
}

const WINDOW_SIZE_MS = 60 * 60 * 1000 // 1 hour

export async function checkRateLimit(userId: string, action: RateLimitAction): Promise<RateLimitResult> {
  try {
    const supabase = await createSupabaseServerClient()
    const limit = RATE_LIMIT_QUOTAS[action]

    // Calculate current window start time
    const now = new Date()
    const windowStart = new Date(now.getTime() - WINDOW_SIZE_MS)

    // Get current count in this window
    const { data, error } = await supabase
      .from('rate_limit_buckets')
      .select('count')
      .eq('user_id', userId)
      .eq('action', action)
      .gte('window_start', windowStart.toISOString())
      .single()

    if (error && error.code !== 'PGRST116') {
      // PGRST116 = "no rows" which is expected if no bucket exists
      throw error
    }

    const currentCount = data?.count || 0
    const allowed = currentCount < limit
    const resetAt = new Date(windowStart.getTime() + WINDOW_SIZE_MS)

    if (!allowed) {
      // Rate limit exceeded
      return {
        allowed: false,
        remaining: 0,
        resetAt,
        limit,
      }
    }

    // Increment counter (upsert approach)
    if (currentCount === 0) {
      // Create new bucket
      await supabase.from('rate_limit_buckets').insert({
        user_id: userId,
        action,
        window_start: windowStart.toISOString(),
        count: 1,
      })
    } else {
      // Increment existing bucket
      await supabase
        .from('rate_limit_buckets')
        .update({ count: currentCount + 1 })
        .eq('user_id', userId)
        .eq('action', action)
        .eq('window_start', windowStart.toISOString())
    }

    return {
      allowed: true,
      remaining: Math.max(0, limit - (currentCount + 1)),
      resetAt,
      limit,
    }
  } catch (error) {
    // On error, allow request to proceed (fail open for better UX)
    // but log the error for investigation
    console.error('Rate limit check failed:', error)
    return {
      allowed: true,
      remaining: -1, // Indicates unknown state
      resetAt: new Date(),
      limit: RATE_LIMIT_QUOTAS[action],
    }
  }
}
