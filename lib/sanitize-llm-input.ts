/**
 * LLM Input Sanitization
 *
 * Defence-in-depth protection against prompt injection.
 * LLMs interpret raw text — untrusted input injected directly into prompts
 * can override system instructions ("jailbreak"). We apply three layers:
 *
 *  1. Strip null bytes and control characters (common jailbreak vectors)
 *  2. Enforce max length so context windows can't be flooded
 *  3. Wrap every piece of untrusted content in XML-style delimiters so the
 *     model can clearly distinguish instruction from data
 *
 * Important: these measures significantly raise the bar but are not a
 * complete guarantee against a determined adversary. The system prompt
 * also explicitly tells the model to ignore embedded override attempts.
 */

/** Maximum characters allowed for a user search query after trim */
export const MAX_QUERY_LENGTH = 500

/** Maximum characters allowed for a summary passed back into a prompt */
export const MAX_SUMMARY_LENGTH = 4000

/** Maximum characters per individual search-result snippet */
export const MAX_SNIPPET_LENGTH = 1000

/**
 * Strip characters that are common prompt injection / jailbreak vectors:
 * - Null bytes (\x00)
 * - Control characters (\x01–\x1F, excluding \n, \r, \t which are legitimate)
 * - Private-use Unicode blocks (U+E000–U+F8FF)
 *
 * Then collapse runs of blank lines so the LLM isn't flooded with whitespace.
 */
export function stripControlCharacters(input: string): string {
  return input
    .replace(/[\x00\x01-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '') // control chars except \n \r \t
    .replace(/[\uE000-\uF8FF]/g, '') // private-use Unicode
    .replace(/\n{3,}/g, '\n\n') // collapse triple+ blank lines
    .trim()
}

/**
 * Sanitize a piece of user-supplied text for safe interpolation into an LLM prompt.
 * Applies control-character stripping and hard length truncation.
 */
export function sanitizeForLLM(input: string, maxLength: number = MAX_QUERY_LENGTH): string {
  if (typeof input !== 'string') return ''
  return stripControlCharacters(input).slice(0, maxLength)
}

/**
 * Wrap untrusted content in XML-style delimiters so the model can
 * distinguish between instruction text and data it should process.
 *
 * Example:
 *   wrapWithDelimiters('Ignore previous…', 'query')
 *   → '<user_query>Ignore previous…</user_query>'
 *
 * The system prompt must instruct the model that content inside these
 * tags is external data, not instructions.
 */
export function wrapWithDelimiters(content: string, tag: string): string {
  return `<${tag}>${content}</${tag}>`
}

/**
 * Full pipeline: sanitize then wrap.
 * Use this for any string that originates from user input before
 * placing it inside a prompt string.
 */
export function prepareUserInputForPrompt(
  input: string,
  tag: string,
  maxLength: number = MAX_QUERY_LENGTH
): string {
  const sanitized = sanitizeForLLM(input, maxLength)
  return wrapWithDelimiters(sanitized, tag)
}

/**
 * Sanitize an array of search result objects.
 * Each field is individually stripped and length-capped.
 */
export function sanitizeSearchResults(
  results: Array<{ title?: string; description?: string; url?: string }>
): Array<{ title: string; description: string; url: string }> {
  return results.slice(0, 20).map((r) => ({
    title: sanitizeForLLM(r.title ?? '', 300),
    description: sanitizeForLLM(r.description ?? '', MAX_SNIPPET_LENGTH),
    url: sanitizeForLLM(r.url ?? '', 300),
  }))
}
