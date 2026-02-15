'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { SearchInput } from '@/components/SearchInput';
import { SearchResults } from '@/components/SearchResults';
import { SummaryCard } from '@/components/SummaryCard';
import { RelatedQuestions } from '@/components/RelatedQuestions';
import { TabNavigation } from '@/components/TabNavigation';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { ErrorMessage } from '@/components/ErrorMessage';
import { Button } from '@/components/Button';
import { SearchHistory } from '@/components/SearchHistory';
import { ShareButton } from '@/components/ShareButton';
import { ThemeToggle } from '@/components/ThemeToggle';
import { WorkspaceSwitcher } from '@/components/WorkspaceSwitcher';
import { NotificationCenter } from '@/components/NotificationCenter';
import { SettingsPanel } from '@/components/SettingsPanel';
import { KeyboardShortcutsModal } from '@/components/KeyboardShortcutsModal';
import { NotesLibrary } from '@/components/knowledge/NotesLibrary';
import { useWorkspaceStore } from '@/stores/workspaceStore';
import { useToast, logSearchEvent, logSummarizeEvent, logQuestionEvent, logNoteCreationEvent } from '@/lib/hooks';
import type { SearchResult, SummaryResponse, QuestionsResponse, SearchHistoryEntry } from '@/types';
import { saveSearchToHistoryDebounced } from '@/lib/storage-optimized';
import { getSearchStateFromUrl, updateUrlWithSearchState } from '@/lib/url-state';
import { knowledgeDB } from '@/lib/knowledge-db';

export default function Home() {
  const [activeTab, setActiveTab] = useState<'results' | 'summary' | 'questions'>('results');
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[] | null>(null);
  const [summary, setSummary] = useState<SummaryResponse | null>(null);
  const [questions, setQuestions] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [isQuestionsLoading, setIsQuestionsLoading] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const [knowledgeOpen, setKnowledgeOpen] = useState(false);
  const [isSavingToKnowledge, setIsSavingToKnowledge] = useState(false);

  const router = useRouter();
  const { activeWorkspaceId, incrementSearchCount, workspaces } = useWorkspaceStore();
  const { success, error: showError } = useToast();
  const isFirstRender = useRef(true);

  // Handle keyboard shortcuts for opening modals
  useEffect(() => {
    const handleShowShortcuts = () => {
      setShortcutsOpen(true);
    };
    const handleOpenHistory = () => {
      setHistoryOpen(true);
    };
    const handleOpenSettings = () => {
      setSettingsOpen(true);
    };
    const handleOpenNotifications = () => {
      setNotificationsOpen(true);
    };
    const handleOpenKnowledge = () => {
      setKnowledgeOpen(true);
    };

    window.addEventListener('show-shortcuts-modal', handleShowShortcuts);
    window.addEventListener('open-history', handleOpenHistory);
    window.addEventListener('open-settings', handleOpenSettings);
    window.addEventListener('open-notifications', handleOpenNotifications);
    window.addEventListener('open-knowledge', handleOpenKnowledge);

    return () => {
      window.removeEventListener('show-shortcuts-modal', handleShowShortcuts);
      window.removeEventListener('open-history', handleOpenHistory);
      window.removeEventListener('open-settings', handleOpenSettings);
      window.removeEventListener('open-notifications', handleOpenNotifications);
      window.removeEventListener('open-knowledge', handleOpenKnowledge);
    };
  }, []);

  // Load search from URL on mount (for shared links)
  useEffect(() => {
    const savedState = getSearchStateFromUrl();
    if (savedState && savedState.query) {
      handleSearch(savedState.query);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Reset search state when workspace changes
  useEffect(() => {
    // Skip on initial mount
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    // Clear all search state
    handleReset();

    // Show confirmation toast
    const workspace = workspaces.find(ws => ws.id === activeWorkspaceId);
    if (workspace) {
      success(`Switched to ${workspace.name}`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeWorkspaceId]); // Only runs when workspace ID changes

  // Save to history and update URL when search completes
  useEffect(() => {
    if (searchResults && summary && questions.length > 0) {
      const entry: SearchHistoryEntry = {
        id: Date.now().toString(),
        query,
        timestamp: Date.now(),
        results: searchResults,
        summary,
        questions,
        workspaceId: activeWorkspaceId || 'default',
      };

      saveSearchToHistoryDebounced(entry, activeWorkspaceId || 'default');
      incrementSearchCount(activeWorkspaceId || 'default');
      success(`Search saved to ${activeWorkspaceId === 'default' ? 'Personal' : 'workspace'}`);
      updateUrlWithSearchState({ query });
    }
  }, [searchResults, summary, questions, query, activeWorkspaceId, incrementSearchCount, success]);

  const handleSearch = async (searchQuery: string) => {
    setError(null);
    setIsSearching(true);
    setQuery(searchQuery);
    setActiveTab('results');

    try {
      const response = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: searchQuery }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Search failed');
      }

      const data = await response.json();
      setSearchResults(data.results);

      // Log search event (fire-and-forget)
      logSearchEvent(activeWorkspaceId || 'default', searchQuery, data.results?.length || 0, 0);

      // Auto-summarize (pass searchQuery since state updates are async)
      await handleSummarize(data.results, searchQuery);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to perform search'
      );
    } finally {
      setIsSearching(false);
    }
  };

  const handleSummarize = async (results: SearchResult[], searchQuery: string) => {
    setIsSummarizing(true);

    try {
      const response = await fetch('/api/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ results }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Summarization failed');
      }

      const data = await response.json();
      setSummary(data);

      // Log summarization event
      logSummarizeEvent(activeWorkspaceId || 'default', searchQuery, data.summary?.length || 0, 0);

      // Auto-generate questions (pass searchQuery since state updates are async)
      await handleGenerateQuestions(searchQuery, data.summary);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to summarize results'
      );
    } finally {
      setIsSummarizing(false);
    }
  };

  const handleGenerateQuestions = async (searchQuery: string, summaryText: string) => {
    setIsQuestionsLoading(true);

    try {
      const response = await fetch('/api/questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: searchQuery, summary: summaryText }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Questions generation failed');
      }

      const data: QuestionsResponse = await response.json();
      setQuestions(data.questions || []);

      // Log question generation event
      logQuestionEvent(activeWorkspaceId || 'default', searchQuery, data.questions?.length || 0, 0);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to generate questions'
      );
    } finally {
      setIsQuestionsLoading(false);
    }
  };

  const handleQuestionClick = (question: string) => {
    // Reset state and start new search with question as query
    setSearchResults(null);
    setSummary(null);
    setQuestions([]);

    // Trigger new search
    handleSearch(question);
  };

  const generateNoteContent = (): string => {
    if (!summary) return '';

    const keyPointsSection = summary.keyPoints
      ? `## Key Points\n${summary.keyPoints.map((point) => `- ${point}`).join('\n')}`
      : '';

    const questionsSection = questions.length > 0
      ? `## Explore More\n${questions.map((q, i) => `${i + 1}. ${q}`).join('\n')}`
      : '';

    return `# ${query}

## Summary
${summary.summary}

${keyPointsSection}

${questionsSection}

---
*Generated from search on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}*`;
  };

  const handleSaveToKnowledge = async () => {
    if (!summary) {
      showError('Please complete the search first');
      return;
    }

    setIsSavingToKnowledge(true);

    try {
      const noteContent = generateNoteContent();

      const newNote = await knowledgeDB.createNote({
        workspace_id: activeWorkspaceId || 'default',
        title: query,
        content: noteContent,
        search_query: query,
        source_searches: searchResults?.map((_, i) => `result-${i}`) || [],
        metadata: {
          originalSummary: summary.summary,
          keyPoints: summary.keyPoints,
          questions,
        },
      });

      success(`✨ Note saved to Knowledge Base`);

      // Log note creation event
      const tagCount = (query.includes('react') ? 1 : 0) + (query.includes('typescript') ? 1 : 0);
      logNoteCreationEvent(activeWorkspaceId || 'default', newNote.id, query, tagCount);

      // Optionally add tags based on content
      if (query.includes('react')) await knowledgeDB.addTag(newNote.id, 'react');
      if (query.includes('typescript')) await knowledgeDB.addTag(newNote.id, 'typescript');
    } catch (err) {
      showError(
        err instanceof Error ? err.message : 'Failed to save note to Knowledge Base'
      );
    } finally {
      setIsSavingToKnowledge(false);
    }
  };

  const handleReset = () => {
    setQuery('');
    setSearchResults(null);
    setSummary(null);
    setQuestions([]);
    setError(null);
    setActiveTab('results');

    // Clear URL query parameters
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.delete('state');
      window.history.replaceState({}, '', url.toString());
    }
  };

  const handleSelectHistoryEntry = (entry: SearchHistoryEntry) => {
    setQuery(entry.query);
    setSearchResults(entry.results);
    setSummary(entry.summary);
    setQuestions(entry.questions);
    setActiveTab('results');
    updateUrlWithSearchState({ query: entry.query });
  };


  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-teal-50 dark:from-slate-900 dark:via-slate-800 dark:to-teal-900 transition-colors duration-300">
      {/* Search History Sidebar */}
      <SearchHistory
        isOpen={historyOpen}
        onClose={() => setHistoryOpen(false)}
        onSelectEntry={handleSelectHistoryEntry}
        currentQuery={query}
      />

      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-10 w-72 h-72 bg-teal-200 dark:bg-teal-500 rounded-full mix-blend-multiply filter blur-3xl opacity-15 dark:opacity-10 animate-blob" />
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-teal-100 dark:bg-teal-500 rounded-full mix-blend-multiply filter blur-3xl opacity-15 dark:opacity-10 animate-blob animation-delay-2000" />
        <div className="absolute top-1/2 left-1/2 w-72 h-72 bg-amber-100 dark:bg-amber-600 rounded-full mix-blend-multiply filter blur-3xl opacity-10 dark:opacity-5 animate-blob animation-delay-4000" />
      </div>

      <div className="relative container mx-auto px-4 py-12 max-w-3xl">
        {/* Header with Controls */}
        <div className="flex items-start justify-between mb-12 pt-8 gap-4">
          {/* Left: Workspace Switcher */}
          <div>
            <WorkspaceSwitcher />
          </div>

          {/* Title (center) */}
          <div className="text-center flex-1 mx-4">
            <h1 className="text-5xl md:text-6xl font-bold text-slate-900 dark:text-white mb-3 transition-colors duration-300">
              ResearchFlow
            </h1>
            <p className="text-lg text-slate-600 dark:text-slate-300 max-w-xl mx-auto transition-colors duration-300">
              Explore any topic with AI-powered research, summaries, and intelligent follow-up questions
            </p>
          </div>

          {/* Right Controls */}
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setKnowledgeOpen(true)}
              className="transition-all duration-200"
              aria-label="Open knowledge base"
              title="Knowledge Base (Cmd+B)"
            >
              📚
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => router.push('/dashboard')}
              className="transition-all duration-200"
              aria-label="View analytics dashboard"
              title="Analytics Dashboard"
            >
              📊
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setHistoryOpen(true)}
              className="transition-all duration-200"
              aria-label="Open search history"
              title="Search history (Cmd+H)"
            >
              📜
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setNotificationsOpen(true)}
              className="transition-all duration-200 relative"
              aria-label="Open notifications"
              title="Notifications (Cmd+N)"
            >
              🔔
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setSettingsOpen(true)}
              className="transition-all duration-200"
              aria-label="Open settings"
              title="Settings (Cmd+,)"
            >
              ⚙️
            </Button>
            <ThemeToggle />
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-8 animate-in fade-in slide-in-from-top-2 duration-300">
            <ErrorMessage
              title="Something went wrong"
              message={error}
              onRetry={() => setError(null)}
              dismissible
            />
          </div>
        )}

        {/* Search Input or Tab Navigation */}
        {!searchResults ? (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
            <SearchInput onSubmit={handleSearch} isLoading={isSearching} />
          </div>
        ) : (
          <>
            {/* Tab Navigation with Action Buttons */}
            <div className="flex items-center justify-between gap-4 mb-6">
              <div className="flex-1">
                <TabNavigation
                  activeTab={activeTab}
                  onTabChange={setActiveTab}
                  hasResults={searchResults.length > 0}
                  hasSummary={!!summary}
                  hasQuestions={questions.length > 0}
                  resultCount={searchResults.length}
                  questionCount={questions.length}
                />
              </div>
              {searchResults && (
                <div className="flex items-center gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={handleSaveToKnowledge}
                    isLoading={isSavingToKnowledge}
                    disabled={!summary}
                    title="Save to Knowledge Base"
                    className="transition-all duration-200"
                  >
                    💡
                  </Button>
                  <ShareButton query={query} />
                </div>
              )}
            </div>

            {/* Tab Content */}
            <div className="tab-content">
              {/* Results Tab */}
              {activeTab === 'results' && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
                  <div>
                    <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4 transition-colors duration-300">
                      Search Results for &quot;{query}&quot;
                    </h2>
                    <SearchResults results={searchResults} isLoading={false} />
                  </div>
                  {isSummarizing && (
                    <div className="flex justify-center py-12">
                      <LoadingSpinner message="Creating summary..." />
                    </div>
                  )}
                </div>
              )}

              {/* Summary Tab */}
              {activeTab === 'summary' && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
                  {isQuestionsLoading ? (
                    <div className="flex justify-center py-12">
                      <LoadingSpinner message="Generating related questions..." />
                    </div>
                  ) : summary ? (
                    <SummaryCard summary={summary} />
                  ) : null}
                </div>
              )}

              {/* Questions Tab */}
              {activeTab === 'questions' && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
                  <RelatedQuestions
                    questions={questions}
                    onQuestionClick={handleQuestionClick}
                    isLoading={isQuestionsLoading}
                  />
                </div>
              )}
            </div>

            {/* Reset Button */}
            <div className="flex justify-center mt-12">
              <Button variant="ghost" size="md" onClick={handleReset}>
                ← New Search
              </Button>
            </div>
          </>
        )}
      </div>

      {/* Modals */}
      <NotesLibrary
        isOpen={knowledgeOpen}
        onClose={() => setKnowledgeOpen(false)}
      />
      <NotificationCenter
        isOpen={notificationsOpen}
        onClose={() => setNotificationsOpen(false)}
      />
      <SettingsPanel
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
      />
      <KeyboardShortcutsModal
        isOpen={shortcutsOpen}
        onClose={() => setShortcutsOpen(false)}
      />

      <style jsx>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }

        .animate-blob {
          animation: blob 7s infinite;
        }

        .animation-delay-2000 {
          animation-delay: 2s;
        }

        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </main>
  );
}
