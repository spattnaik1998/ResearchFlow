export interface SummaryResult {
  summary: string;
  keyPoints: string[];
  wordCount: number;
}

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

export async function summarizeSearchResults(
  results: Array<{ title: string; description: string; url: string }>,
  apiKey: string
): Promise<SummaryResult> {
  try {
    // Prepare context from search results
    const context = results
      .map((r) => `${r.title}: ${r.description}`)
      .join('\n\n');

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
            content:
              'You are a helpful assistant that summarizes search results. Provide a comprehensive summary of 150-200 words and extract 3-5 key points.',
          },
          {
            role: 'user',
            content: `Please summarize the following search results:\n\n${context}\n\nProvide the response in JSON format with "summary" (string), "keyPoints" (array of strings).`,
          },
        ],
        temperature: 0.7,
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      throw new Error(
        `OpenAI API error: ${response.statusText} - ${await response.text()}`
      );
    }

    const data = await response.json();
    const content = data.choices[0].message.content;

    // Extract JSON from markdown code blocks and parse
    const jsonString = extractJSON(content);
    const parsed = JSON.parse(jsonString);

    return {
      summary: parsed.summary || '',
      keyPoints: parsed.keyPoints || [],
      wordCount: parsed.summary?.split(/\s+/).length || 0,
    };
  } catch (error) {
    console.error('OpenAI summarize error:', error);
    throw error;
  }
}
