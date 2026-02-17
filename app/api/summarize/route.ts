import { NextRequest, NextResponse } from 'next/server';
import { summarizeSearchResults } from '@/lib/openai';
import { getUser } from '@/lib/auth-helpers';

export async function POST(request: NextRequest) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
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
