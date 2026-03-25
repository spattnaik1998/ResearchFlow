import { NextRequest, NextResponse } from 'next/server';
import { searchWithSerper } from '@/lib/serper';
import { getUser } from '@/lib/auth-helpers';
import { checkRateLimit } from '@/lib/rate-limit';

export async function POST(request: NextRequest) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check rate limit before processing
    const rateLimitResult = await checkRateLimit(user.id, 'search');
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. You have 30 searches per hour.' },
        {
          status: 429,
          headers: { 'Retry-After': Math.ceil((rateLimitResult.resetAt.getTime() - Date.now()) / 1000).toString() },
        }
      );
    }

    const { query } = await request.json();

    if (!query || query.trim().length === 0) {
      return NextResponse.json(
        { error: 'Query is required' },
        { status: 400 }
      );
    }

    const apiKey = process.env.SERPER_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'SERPER_API_KEY not configured' },
        { status: 500 }
      );
    }

    const results = await searchWithSerper(query, apiKey);
    return NextResponse.json({
      results,
      query,
    });
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json(
      { error: 'Failed to search' },
      { status: 500 }
    );
  }
}
