import { NextRequest, NextResponse } from 'next/server';
import { summarizeSearchResults } from '@/lib/openai';
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
    const rateLimitResult = await checkRateLimit(user.id, 'summarize');
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. You have 20 summaries per hour.' },
        {
          status: 429,
          headers: { 'Retry-After': Math.ceil((rateLimitResult.resetAt.getTime() - Date.now()) / 1000).toString() },
        }
      );
    }

    const { results } = await request.json();

    if (!results || !Array.isArray(results)) {
      return NextResponse.json(
        { error: 'Results array is required' },
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

    const summary = await summarizeSearchResults(results, apiKey);
    return NextResponse.json(summary);
  } catch (error) {
    console.error('Summarize error:', error);
    return NextResponse.json(
      { error: 'Failed to summarize' },
      { status: 500 }
    );
  }
}
