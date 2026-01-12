/**
 * Import Flow Service
 * Business logic for the import workflow
 * Isolates phrase extraction and validation logic from UI components
 */

export interface ExtractedPhrasesResult {
  phrases: string[];
  suggestedTitle: string;
}

/**
 * Extract phrases from text content
 * Splits by sentence delimiters and filters by length
 *
 * @param text - The text content to extract phrases from
 * @param maxPhrases - Maximum number of phrases to extract (default: 20)
 * @returns Array of extracted phrases
 */
export function extractPhrases(text: string, maxPhrases: number = 20): string[] {
  return text
    .split(/[.!?]+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 10 && s.length < 200)
    .slice(0, maxPhrases);
}

/**
 * Analyze content and extract phrases with suggested title
 *
 * @param content - The content to analyze
 * @returns Extracted phrases result with phrases and suggested title
 */
export function analyzeContent(content: string): ExtractedPhrasesResult {
  const phrases = extractPhrases(content);
  const suggestedTitle = generateSuggestedTitle(content);
  return { phrases, suggestedTitle };
}

/**
 * Generate a suggested title from content
 * Uses the first few words of the content
 *
 * @param content - The content to generate title from
 * @returns Suggested title
 */
export function generateSuggestedTitle(content: string): string {
  const suggestedTitle = content.substring(0, 50).split(' ').slice(0, 5).join(' ');
  return suggestedTitle + '...';
}

/**
 * Calculate word count from text
 *
 * @param text - The text to count words in
 * @returns Number of words
 */
export function calculateWordCount(text: string): number {
  return text.split(/\s+/).filter(Boolean).length;
}

/**
 * Calculate phrase count from text
 *
 * @param text - The text to count phrases in
 * @returns Number of detected phrases
 */
export function calculatePhraseCount(text: string): number {
  return extractPhrases(text).length;
}

/**
 * Validate if content is sufficient for analysis
 *
 * @param content - The content to validate
 * @param minLength - Minimum content length (default: 20)
 * @returns True if content is valid for analysis
 */
export function isValidContent(content: string, minLength: number = 20): boolean {
  return content.trim().length >= minLength;
}

/**
 * Validate YouTube URL format
 *
 * @param url - The URL to validate
 * @returns True if URL appears to be a valid YouTube URL
 */
export function isValidYouTubeUrl(url: string): boolean {
  return url.includes('youtube.com') || url.includes('youtu.be');
}
