import { NextRequest, NextResponse } from 'next/server';
import { searchWithSerper } from '@/lib/serper';
import { getUser } from '@/lib/auth-helpers';
import { checkRateLimit } from '@/lib/rate-limit';
import { searchQuerySchema } from '@/lib/validation';

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
          headers: {
            'Retry-After': Math.ceil(
              (rateLimitResult.resetAt.getTime() - Date.now()) / 1000
            ).toString(),
          },
        }
      );
    }

    const { query } = await request.json();

    // Validate with Zod — enforces min 2, max 500 chars, trims whitespace
    const queryParse = searchQuerySchema.safeParse(query);
    if (!queryParse.success) {
      return NextResponse.json(
        { error: queryParse.error.issues[0]?.message || 'Invalid query' },
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

    // Use the validated (trimmed, length-capped) query
    const validatedQuery = queryParse.data;
    const results = await searchWithSerper(validatedQuery, apiKey);
    return NextResponse.json({
      results,
      query: validatedQuery,
    });
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json(
      { error: 'Failed to search' },
      { status: 500 }
    );
  }
}
