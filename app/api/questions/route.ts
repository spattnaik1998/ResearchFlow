import { NextRequest, NextResponse } from 'next/server';
import { getUser } from '@/lib/auth-helpers';

/**
 * Extract JSON from markdown code blocks or raw JSON string
 * Handles both "```json\n{...}\n```" and raw JSON formats
 */
function extractJSON(content: string): string {
  // Try to extract from markdown code block
  const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  if (jsonMatch && jsonMatch[1]) {
    return jsonMatch[1].trim();
  }
  // Return as-is if no code block found
  return content.trim();
}

export async function POST(request: NextRequest) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { query, summary } = await request.json();

    // Validation
    if (!query || !summary) {
      return NextResponse.json(
        { error: 'Query and summary are required' },
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

    // Generate questions using OpenAI
    const model = process.env.OPENAI_MODEL || 'gpt-3.5-turbo';
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: 'system',
            content: 'You are a helpful assistant that generates thoughtful follow-up questions to help users explore topics more deeply. Generate questions that are specific, diverse, and encourage different angles of inquiry.',
          },
          {
            role: 'user',
            content: `Based on this search query: "${query}"\n\nAnd this summary:\n${summary}\n\nGenerate 5-7 related questions that would help someone explore this topic more deeply. Provide diverse questions covering different aspects (definitions, applications, comparisons, implications, etc.).\n\nProvide the response in JSON format with a "questions" array of strings.`,
          },
        ],
        temperature: 0.8,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    const jsonString = extractJSON(content);
    const parsed = JSON.parse(jsonString);

    return NextResponse.json({
      questions: parsed.questions || [],
    });
  } catch (error) {
    console.error('Questions generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate questions', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
