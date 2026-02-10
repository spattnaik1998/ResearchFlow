import { SearchResult } from "@/types";

const SERPER_API_KEY = process.env.SERPER_API_KEY;

if (!SERPER_API_KEY) {
  console.warn("⚠️ SERPER_API_KEY is not configured");
}

export async function searchWithSerper(
  query: string
): Promise<SearchResult[]> {
  if (!SERPER_API_KEY) {
    throw new Error("SERPER_API_KEY is required");
  }

  try {
    const response = await fetch("https://google.serper.dev/search", {
      method: "POST",
      headers: {
        "X-API-KEY": SERPER_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        q: query,
        num: 10,
        type: "search",
      }),
    });

    if (!response.ok) {
      throw new Error(`Serper API error: ${response.status}`);
    }

    const data = await response.json();

    const results = (data.organic || []).map(
      (result: any): SearchResult => ({
        title: result.title || "",
        description: result.snippet || "",
        url: result.link || "",
      })
    );

    return results.slice(0, 10);
  } catch (error) {
    console.error("Serper search error:", error);
    throw error;
  }
}
