/**
 * URL State Management for ResearchFlow
 * Enables shareable URLs and deep linking
 */

interface SearchState {
  query: string;
}

/**
 * Encode search state to URL-safe string
 * Uses base64 encoding for simplicity
 */
export const encodeSearchState = (state: SearchState): string => {
  try {
    const json = JSON.stringify(state);
    // Use base64 encoding for URL safety
    return typeof window !== 'undefined'
      ? btoa(unescape(encodeURIComponent(json)))
      : Buffer.from(json).toString('base64');
  } catch (error) {
    console.error('Failed to encode search state:', error);
    return '';
  }
};

/**
 * Decode search state from URL string
 * Returns null if decoding fails
 */
export const decodeSearchState = (encoded: string): SearchState | null => {
  try {
    const json = typeof window !== 'undefined'
      ? decodeURIComponent(escape(atob(encoded)))
      : Buffer.from(encoded, 'base64').toString('utf-8');
    const state = JSON.parse(json);

    // Validate the state has required fields
    if (state.query && typeof state.query === 'string') {
      return state;
    }
    return null;
  } catch (error) {
    console.error('Failed to decode search state:', error);
    return null;
  }
};

/**
 * Get search state from current URL
 */
export const getSearchStateFromUrl = (): SearchState | null => {
  if (typeof window === 'undefined') return null;

  try {
    const params = new URLSearchParams(window.location.search);
    const stateParam = params.get('state');
    return stateParam ? decodeSearchState(stateParam) : null;
  } catch (error) {
    console.error('Failed to get search state from URL:', error);
    return null;
  }
};

/**
 * Update URL with search state (uses replaceState for browser history)
 */
export const updateUrlWithSearchState = (state: SearchState): void => {
  if (typeof window === 'undefined') return;

  try {
    const encoded = encodeSearchState(state);
    const url = new URL(window.location.href);
    url.searchParams.set('state', encoded);
    window.history.replaceState({}, '', url.toString());
  } catch (error) {
    console.error('Failed to update URL with search state:', error);
  }
};

/**
 * Generate shareable URL
 */
export const generateShareUrl = (state: SearchState): string => {
  if (typeof window === 'undefined') return '';

  try {
    const encoded = encodeSearchState(state);
    const url = new URL(window.location.href);
    url.searchParams.set('state', encoded);
    return url.toString();
  } catch (error) {
    console.error('Failed to generate share URL:', error);
    return window.location.href;
  }
};

/**
 * Copy URL to clipboard (returns boolean for feedback)
 */
export const copyUrlToClipboard = async (url: string): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(url);
    return true;
  } catch (error) {
    console.error('Failed to copy URL to clipboard:', error);
    return false;
  }
};
