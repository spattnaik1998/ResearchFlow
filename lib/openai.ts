import { SearchResult } from "@/types";

const OPENAI_API_KEY = process.env.NEXT_PUBLIC_OPENAI_KEY;

if (!OPENAI_API_KEY) {
  console.warn("⚠️ NEXT_PUBLIC_OPENAI_KEY is not configured");
}

export async function summarizeSearchResults(
  results: SearchResult[],
  query: string
): Promise<string> {
  if (!OPENAI_API_KEY) {
    throw new Error("OpenAI API key is required");
  }

  const resultsText = results
    .slice(0, 5)
    .map((r, i) => `${i + 1}. ${r.title}\n   ${r.description}`)
    .join("\n\n");

  const prompt = `You are an expert researcher and writer. Based on the following search results about "${query}", create a clear, concise, and informative summary (200-300 words) that:
1. Directly answers the user's query
2. Highlights the most important information
3. Uses simple, accessible language
4. Is suitable for audio narration (no special formatting, clear sentences)

Search Results:
${resultsText}

Provide ONLY the summary text, no additional formatting or labels.`;

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4-turbo",
        messages: [
          {
            role: "system",
            content:
              "You are a helpful assistant that creates clear, concise summaries for audio narration.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`OpenAI API error: ${error.error?.message || response.statusText}`);
    }

    const data = await response.json();
    const summary = data.choices?.[0]?.message?.content || "";

    if (!summary) {
      throw new Error("No summary generated");
    }

    return summary.trim();
  } catch (error) {
    console.error("OpenAI summarization error:", error);
    throw error;
  }
}
