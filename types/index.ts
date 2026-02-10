export interface SearchResult {
  title: string;
  description: string;
  url: string;
  snippet?: string;
}

export interface SearchResponse {
  results: SearchResult[];
  query: string;
}

export interface SummaryResponse {
  summary: string;
  keyPoints: string[];
  wordCount: number;
}

export interface TTSResponse {
  audioUrl: string;
  duration: number;
}

export interface SearchEntry {
  id: string;
  query: string;
  summary: string;
  audioUrl: string;
  createdAt: string;
  userId: string;
}

export interface ApiError {
  error: string;
  details?: string;
  statusCode: number;
}
