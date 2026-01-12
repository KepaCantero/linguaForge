/**
 * Analytics Service
 *
 * Privacy-compliant, local-first analytics system.
 * Tracks user behavior without external services or PII.
 */

import {
  AnalyticsEvent,
  type AnalyticsConfig,
  type AnalyticsData,
  type BaseEventProperties,
  type StoredEvent,
  type EventProperties,
} from '@/types/analytics';
import { DEFAULT_ANALYTICS_CONFIG } from '@/types/analytics';

// ============================================
// STORAGE KEYS
// ============================================

const STORAGE_KEY = 'linguaforge_analytics';
const SESSION_KEY = 'lf_session_id';

// ============================================
// STATE
// ============================================

let sessionId: string | null = null;
let eventQueue: StoredEvent[] = [];
let flushTimer: ReturnType<typeof setInterval> | null = null;
let config: AnalyticsConfig = { ...DEFAULT_ANALYTICS_CONFIG };

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Generate a simple UUID-like identifier
 * Format: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
 */
function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.trunc(Math.random() * 16);
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Generate unique session ID
 */
function generateSessionId(): string {
  return generateUUID();
}

/**
 * Get or create session ID
 */
function getSessionId(): string {
  if (!sessionId) {
    const existing = localStorage.getItem(SESSION_KEY);
    if (existing) {
      sessionId = existing;
    } else {
      sessionId = generateSessionId();
      localStorage.setItem(SESSION_KEY, sessionId);
    }
  }
  return sessionId;
}

/**
 * Load analytics data from localStorage
 */
function loadAnalyticsData(): AnalyticsData | null {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) {
      return JSON.parse(data) as AnalyticsData;
    }
  } catch {
    // Corrupted data, start fresh
  }
  return null;
}

/**
 * Save analytics data to localStorage
 */
function saveAnalyticsData(data: AnalyticsData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // Storage full or disabled, silently fail
  }
}

/**
 * Get base event properties
 */
function getBaseProperties(): BaseEventProperties {
  return {
    timestamp: Date.now(),
    sessionId: getSessionId(),
  };
}

/**
 * Check if event should be sampled (for rate limiting)
 */
function shouldSample(): boolean {
  return Math.random() < config.samplingRate;
}

// ============================================
// CORE FUNCTIONS
// ============================================

/**
 * Initialize analytics system
 */
export function initAnalytics(customConfig?: Partial<AnalyticsConfig>): void {
  config = { ...DEFAULT_ANALYTICS_CONFIG, ...customConfig };

  if (!config.enabled) {
    return;
  }

  // Load existing data or create new
  const data = loadAnalyticsData();
  if (data) {
    sessionId = data.sessionId;
    eventQueue = data.events;
    config = { ...config, ...data.config };
  } else {
    // New analytics session
    sessionId = generateSessionId();
    localStorage.setItem(SESSION_KEY, sessionId);

    const newData: AnalyticsData = {
      sessionId,
      events: [],
      config,
      firstSession: Date.now(),
      lastSession: Date.now(),
      totalSessions: 1,
    };
    saveAnalyticsData(newData);
  }

  // Start periodic flush
  if (flushTimer) {
    clearInterval(flushTimer);
  }
  flushTimer = setInterval(flushEvents, config.flushInterval);

  // Track session start
  trackEvent(AnalyticsEvent.SESSION_START, {
    ...getBaseProperties(),
    screen_width: window.innerWidth,
    screen_height: window.innerHeight,
    user_agent: navigator.userAgent,
    referrer: document.referrer,
  });
}

/**
 * Track an analytics event
 */
export function trackEvent(
  event: AnalyticsEvent,
  properties: Partial<EventProperties>
): void {
  if (!config.enabled || !shouldSample()) {
    return;
  }

  const storedEvent: StoredEvent = {
    id: generateUUID(),
    event,
    properties: { ...getBaseProperties(), ...properties },
    timestamp: Date.now(),
  };

  eventQueue.push(storedEvent);

  // Auto-flush if batch size reached
  if (eventQueue.length >= config.batchSize) {
    flushEvents();
  }

  // Prevent queue from growing indefinitely
  if (eventQueue.length > config.maxQueueSize) {
    flushEvents();
  }
}

/**
 * Flush queued events to storage
 */
export function flushEvents(): void {
  if (eventQueue.length === 0) {
    return;
  }

  const data = loadAnalyticsData();
  if (data) {
    // Merge queued events with stored events
    const allEvents = [...data.events, ...eventQueue];

    // Keep only last 1000 events to prevent storage overflow
    const trimmedEvents = allEvents.slice(-1000);

    const updatedData: AnalyticsData = {
      ...data,
      events: trimmedEvents,
      lastSession: Date.now(),
      totalSessions: data.totalSessions + 1,
    };

    saveAnalyticsData(updatedData);
  }

  eventQueue = [];
}

/**
 * Get analytics summary
 */
export function getAnalyticsSummary(): {
  totalEvents: number;
  totalSessions: number;
  firstSession: number | null;
  lastSession: number | null;
  eventCounts: Record<string, number>;
} {
  const data = loadAnalyticsData();

  if (!data) {
    return {
      totalEvents: 0,
      totalSessions: 0,
      firstSession: null,
      lastSession: null,
      eventCounts: {},
    };
  }

  const eventCounts: Record<string, number> = {};
  for (const event of data.events) {
    eventCounts[event.event] = (eventCounts[event.event] || 0) + 1;
  }

  return {
    totalEvents: data.events.length,
    totalSessions: data.totalSessions,
    firstSession: data.firstSession,
    lastSession: data.lastSession,
    eventCounts,
  };
}

/**
 * Get events by type
 */
export function getEventsByType(eventType: AnalyticsEvent): StoredEvent[] {
  const data = loadAnalyticsData();
  if (!data) {
    return [];
  }

  return data.events.filter((e) => e.event === eventType);
}

/**
 * Get recent events
 */
export function getRecentEvents(limit = 50): StoredEvent[] {
  const data = loadAnalyticsData();
  if (!data) {
    return [];
  }

  return data.events.slice(-limit).reverse();
}

/**
 * Clear all analytics data
 */
export function clearAnalytics(): void {
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(SESSION_KEY);
  sessionId = null;
  eventQueue = [];

  if (flushTimer) {
    clearInterval(flushTimer);
    flushTimer = null;
  }
}

/**
 * Enable/disable analytics
 */
export function setAnalyticsEnabled(enabled: boolean): void {
  config.enabled = enabled;

  const data = loadAnalyticsData();
  if (data) {
    data.config.enabled = enabled;
    saveAnalyticsData(data);
  }
}

/**
 * Check if analytics is enabled
 */
export function isAnalyticsEnabled(): boolean {
  return config.enabled;
}

/**
 * Cleanup on page unload
 */
export function cleanupAnalytics(): void {
  trackEvent(AnalyticsEvent.SESSION_END, getBaseProperties());
  flushEvents();

  if (flushTimer) {
    clearInterval(flushTimer);
    flushTimer = null;
  }
}

// Auto-cleanup on page unload
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', cleanupAnalytics);
}
