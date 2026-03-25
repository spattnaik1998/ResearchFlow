import { NextRequest, NextResponse } from 'next/server';
import { summarizeSearchResults } from '@/lib/openai';
import { getUser } from '@/lib/auth-helpers';
import { checkRateLimit } from '@/lib/rate-limit';
import { searchResultsSchema } from '@/lib/validation';

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
    const rateLimitResult = await checkRateLimit(user.id, 'summarize');
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. You have 20 summaries per hour.' },
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

    const { results } = await request.json();

    // Validate structure with Zod — ensures results is an array of expected shape,
    // caps to 20 items, and enforces per-field length limits before LLM call.
    const resultsParse = searchResultsSchema.safeParse(results);
    if (!resultsParse.success) {
      return NextResponse.json(
        { error: resultsParse.error.issues[0]?.message || 'Invalid results' },
        { status: 400 }
      );
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'OpenAI API key not configured' },
        { status: 500 }
      );
    }

    const summary = await summarizeSearchResults(resultsParse.data, apiKey);
    return NextResponse.json(summary);
  } catch (error) {
    console.error('Summarize error:', error);
    return NextResponse.json(
      { error: 'Failed to summarize' },
      { status: 500 }
    );
  }
}
