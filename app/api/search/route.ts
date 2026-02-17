import { NextRequest, NextResponse } from 'next/server';
import { searchWithSerper } from '@/lib/serper';
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
