/**
 * Rate Limiting for TTS Download API
 * Shared rate limit map for both the route and tests
 */

export const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

export const RATE_LIMIT_REQUESTS = 10;
export const RATE_LIMIT_WINDOW = 60000; // 1 minute

export function checkRateLimit(identifier: string): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(identifier);

  if (!record || now > record.resetTime) {
    rateLimitMap.set(identifier, {
      count: 1,
      resetTime: now + RATE_LIMIT_WINDOW,
    });
    return true;
  }

  if (record.count >= RATE_LIMIT_REQUESTS) {
    return false;
  }

  record.count++;
  return true;
}
