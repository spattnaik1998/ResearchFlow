import { NextRequest, NextResponse } from "next/server";
import { searchWithSerper } from "@/lib/serper";
import { SearchResponse } from "@/types";

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const { query } = await request.json();

    if (!query || typeof query !== "string" || query.trim().length === 0) {
      return NextResponse.json(
        {
          error: "Invalid request",
          details: "Query must be a non-empty string",
        },
        { status: 400 }
      );
    }

    const results = await searchWithSerper(query.trim());

    const response: SearchResponse = {
      results,
      query,
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error("Search API error:", error);

    const message = error instanceof Error ? error.message : "Search failed";
    const statusCode =
      message.includes("SERPER_API_KEY") ||
      message.includes("not configured")
        ? 500
        : 500;

    return NextResponse.json(
      {
        error: "Search failed",
        details: message,
      },
      { status: statusCode }
    );
  }
}
