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

export interface QuestionsResponse {
  questions: string[];
}

export interface QuestionsRequest {
  query: string;
  summary: string;
}

export interface SearchHistoryEntry {
  id: string;
  query: string;
  timestamp: number;
  results: SearchResult[];
  summary: SummaryResponse | null;
  questions: string[];
  workspaceId?: string;
}

export interface Workspace {
  id: string;
  name: string;
  icon: string;
  color: 'teal' | 'purple' | 'blue' | 'green';
  createdAt: number;
  isFavorite: boolean;
  isArchived: boolean;
  searchCount: number;
}

export interface Command {
  id: string;
  label: string;
  category: 'search' | 'workspace' | 'action' | 'setting' | 'history' | 'knowledge';
  icon: string;
  shortcut?: string;
  action: () => void | Promise<void>;
  metadata?: Record<string, unknown>;
}

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message?: string;
  timestamp: number;
  isRead: boolean;
  actionUrl?: string;
}

// Knowledge Management System Types
export interface KnowledgeNote {
  id: string;
  workspace_id: string;
  user_id?: string;
  title: string;
  content: string;
  search_query?: string;
  source_searches?: string[];
  created_at: string;
  updated_at: string;
  last_reviewed_at?: string;
  metadata?: {
    originalSummary?: string;
    keyPoints?: string[];
    questions?: string[];
  };
}

export interface NoteTag {
  id: string;
  note_id: string;
  tag: string;
  created_at: string;
}

export interface NoteLink {
  id: string;
  from_note_id: string;
  to_note_id: string;
  link_type: 'wikilink' | 'reference' | 'related';
  created_at: string;
}

export interface Collection {
  id: string;
  workspace_id: string;
  name: string;
  description?: string;
  icon?: string;
  created_at: string;
  updated_at: string;
}

export interface CollectionNote {
  collection_id: string;
  note_id: string;
  position: number;
  added_at: string;
}
