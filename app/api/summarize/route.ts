import { NextRequest, NextResponse } from "next/server";
import { summarizeSearchResults } from "@/lib/openai";
import { SearchResult, SummaryResponse } from "@/types";

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const { results, query } = await request.json();

    if (!Array.isArray(results) || results.length === 0) {
      return NextResponse.json(
        {
          error: "Invalid request",
          details: "Results must be a non-empty array",
        },
        { status: 400 }
      );
    }

    if (!query || typeof query !== "string" || query.trim().length === 0) {
      return NextResponse.json(
        {
          error: "Invalid request",
          details: "Query must be a non-empty string",
        },
        { status: 400 }
      );
    }

    const validatedResults: SearchResult[] = results.filter(
      (r: any) =>
        r.title &&
        typeof r.title === "string" &&
        r.description &&
        typeof r.description === "string" &&
        r.url &&
        typeof r.url === "string"
    );

    if (validatedResults.length === 0) {
      return NextResponse.json(
        {
          error: "Invalid request",
          details:
            "Results must contain valid SearchResult objects with title, description, and url",
        },
        { status: 400 }
      );
    }

    const summary = await summarizeSearchResults(validatedResults, query.trim());

    const sentences = summary
      .split(/[.!?]+/)
      .map((s) => s.trim())
      .filter((s) => s.length > 10)
      .slice(0, 3);

    const response: SummaryResponse = {
      summary,
      keyPoints: sentences,
      wordCount: summary.split(/\s+/).length,
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error("Summarize API error:", error);

    const message = error instanceof Error ? error.message : "Summarization failed";

    return NextResponse.json(
      {
        error: "Summarization failed",
        details: message,
      },
      { status: 500 }
    );
  }
}
