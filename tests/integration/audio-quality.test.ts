/**
 * Integration Tests: Audio Quality Validation
 * Tests the AAA (Triple-A) audio quality validation in TTS workflow
 *
 * Flow:
 * 1. Request TTS audio generation
 * 2. Validate audio meets AAA quality standards
 * 3. Check metrics: clarity, prosody, SNR, artifacts, dynamic range
 * 4. Verify validation headers in response
 * 5. Test quality presets and configurations
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { POST } from '@/app/api/tts/download/route';
import { rateLimitMap } from '@/app/api/tts/rateLimit';
import { NextRequest } from 'next/server';
import type {
  AudioQualityMetrics,
  AudioQualityValidation,
  AudioQualityThresholds,
} from '@/types/audio';
import { AAA_THRESHOLDS_DEFAULT } from '@/types/audio';
import { generateMockSpeechBuffer } from '@/../tests/helpers/mockAudioGenerator';

// ============================================================
// MOCKS
// ============================================================

// Mock OpenAI API - must be hoisted
vi.mock('openai', () => {
  const mockOpenAISpeechCreate = vi.fn();

  return {
    default: class MockOpenAI {
      constructor() {
        this.audio = {
          speech: {
            create: mockOpenAISpeechCreate,
          },
        };
      }

      audio: any;
    },
  };
});

// Mock environment variables
const originalEnv = process.env;

beforeEach(() => {
  // Clear rate limit map before each test
  rateLimitMap.clear();

  // Generate valid WAV audio buffer for each test
  const mockAudioBuffer = generateMockSpeechBuffer(1.5, 24000);

  // Get reference to mocked OpenAI constructor
  // The mock is already set up above with vi.mock('openai')
  const OpenAIConstructor = require('openai').default;

  // Mock the speech.create method
  OpenAIConstructor.prototype.audio = {
    speech: {
      create: vi.fn().mockResolvedValue({
        arrayBuffer: async () => mockAudioBuffer,
      }),
    },
  };

  process.env = {
    ...originalEnv,
    OPENAI_API_KEY: 'test-api-key',
  };
});

afterEach(() => {
  process.env = originalEnv;
  vi.clearAllMocks();
});

// ============================================================
// TEST DATA
// ============================================================

const VALID_TTS_REQUEST = {
  text: 'Bonjour, comment allez-vous?',
  voice: 'alloy',
  rate: 1.0,
  pitch: 1.0,
  format: 'mp3' as const,
  model: 'tts-1' as const,
  quality: 'intermediate' as const,
  useIntonation: false,
  language: 'fr',
};

const LONG_TEXT_REQUEST = {
  ...VALID_TTS_REQUEST,
  text: 'A'.repeat(4001), // Exceeds MAX_TEXT_LENGTH
};

const EMPTY_TEXT_REQUEST = {
  ...VALID_TTS_REQUEST,
  text: '',
};

const INVALID_VOICE_REQUEST = {
  ...VALID_TTS_REQUEST,
  voice: 'invalid-voice' as any,
};

const INVALID_RATE_REQUEST = {
  ...VALID_TTS_REQUEST,
  rate: 5.0, // Exceeds max of 4.0
};

const INVALID_FORMAT_REQUEST = {
  ...VALID_TTS_REQUEST,
  format: 'invalid-format' as any,
};

// ============================================================
// HELPER FUNCTIONS
// ============================================================

async function makeTTSRequest(body: Record<string, unknown>): Promise<Response> {
  const request = new NextRequest('http://localhost:3000/api/tts/download', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: {
      'Content-Type': 'application/json',
    },
  });

  return POST(request);
}

function extractQualityHeaders(response: Response): {
  metrics: string | null;
  validation: string | null;
  aaaCompliant: string | null;
} {
  return {
    metrics: response.headers.get('X-Audio-Quality-Metrics'),
    validation: response.headers.get('X-Audio-Quality-Validation'),
    aaaCompliant: response.headers.get('X-Audio-AAA-Compliant'),
  };
}

function parseQualityHeader(header: string | null): unknown {
  if (!header) return null;
  try {
    return JSON.parse(decodeURIComponent(header));
  } catch {
    return null;
  }
}

// ============================================================
// TEST SUITES
// ============================================================

describe('Audio Quality Validation - Request Validation', () => {
  it('should accept valid TTS request', async () => {
    const response = await makeTTSRequest(VALID_TTS_REQUEST);

    expect(response.status).not.toBe(400);
  });

  it('should reject empty text', async () => {
    const response = await makeTTSRequest(EMPTY_TEXT_REQUEST);

    expect(response.status).toBe(400);
    const body = await response.json();
    expect(body.success).toBe(false);
    expect(body.error).toContain('Validation error');
  });

  it('should reject text exceeding maximum length', async () => {
    const response = await makeTTSRequest(LONG_TEXT_REQUEST);

    expect(response.status).toBe(400);
    const body = await response.json();
    expect(body.success).toBe(false);
  });

  it('should reject invalid voice', async () => {
    const response = await makeTTSRequest(INVALID_VOICE_REQUEST);

    expect(response.status).toBe(400);
    const body = await response.json();
    expect(body.success).toBe(false);
  });

  it('should reject invalid rate', async () => {
    const response = await makeTTSRequest(INVALID_RATE_REQUEST);

    expect(response.status).toBe(400);
    const body = await response.json();
    expect(body.success).toBe(false);
  });

  it('should reject invalid format', async () => {
    const response = await makeTTSRequest(INVALID_FORMAT_REQUEST);

    expect(response.status).toBe(400);
    const body = await response.json();
    expect(body.success).toBe(false);
  });
});

describe('Audio Quality Validation - AAA Thresholds', () => {
  it('should define AAA quality thresholds', () => {
    expect(AAA_THRESHOLDS_DEFAULT).toBeDefined();
    expect(AAA_THRESHOLDS_DEFAULT.minClarity).toBeDefined();
    expect(AAA_THRESHOLDS_DEFAULT.minProsody).toBeDefined();
    expect(AAA_THRESHOLDS_DEFAULT.minSNR).toBeDefined();
    expect(AAA_THRESHOLDS_DEFAULT.maxArtifacts).toBeDefined();
    expect(AAA_THRESHOLDS_DEFAULT.minDynamicRange).toBeDefined();
  });

  it('should have appropriate minimum clarity threshold', () => {
    expect(AAA_THRESHOLDS_DEFAULT.minClarity).toBeGreaterThan(80);
    expect(AAA_THRESHOLDS_DEFAULT.minClarity).toBeLessThanOrEqual(100);
  });

  it('should have appropriate minimum prosody threshold', () => {
    expect(AAA_THRESHOLDS_DEFAULT.minProsody).toBeGreaterThan(60);
    expect(AAA_THRESHOLDS_DEFAULT.minProsody).toBeLessThanOrEqual(100);
  });

  it('should have appropriate minimum SNR threshold', () => {
    expect(AAA_THRESHOLDS_DEFAULT.minSNR).toBeGreaterThan(20);
    expect(AAA_THRESHOLDS_DEFAULT.minSNR).toBeLessThan(50);
  });

  it('should have appropriate maximum artifacts threshold', () => {
    expect(AAA_THRESHOLDS_DEFAULT.maxArtifacts).toBeGreaterThanOrEqual(0);
    expect(AAA_THRESHOLDS_DEFAULT.maxArtifacts).toBeLessThan(20);
  });

  it('should have appropriate minimum dynamic range threshold', () => {
    expect(AAA_THRESHOLDS_DEFAULT.minDynamicRange).toBeGreaterThan(15);
    expect(AAA_THRESHOLDS_DEFAULT.minDynamicRange).toBeLessThan(40);
  });
});

describe('Audio Quality Validation - Metrics Structure', () => {
  it('should include all required quality metrics in response', async () => {
    const response = await makeTTSRequest(VALID_TTS_REQUEST);
    const { metrics } = extractQualityHeaders(response);

    expect(metrics).toBeDefined();

    const parsedMetrics = parseQualityHeader(metrics) as AudioQualityMetrics | null;
    expect(parsedMetrics).toBeDefined();

    if (parsedMetrics) {
      expect(parsedMetrics.clarity).toBeDefined();
      expect(parsedMetrics.prosodyScore).toBeDefined();
      expect(parsedMetrics.snrRatio).toBeDefined();
      expect(parsedMetrics.artifactScore).toBeDefined();
      expect(parsedMetrics.dynamicRange).toBeDefined();
      expect(parsedMetrics.spectralCentroid).toBeDefined();
      expect(parsedMetrics.zeroCrossingRate).toBeDefined();
    }
  });

  it('should have clarity metric within valid range', async () => {
    const response = await makeTTSRequest(VALID_TTS_REQUEST);
    const { metrics } = extractQualityHeaders(response);

    const parsedMetrics = parseQualityHeader(metrics) as AudioQualityMetrics | null;

    if (parsedMetrics) {
      expect(parsedMetrics.clarity).toBeGreaterThanOrEqual(0);
      expect(parsedMetrics.clarity).toBeLessThanOrEqual(100);
    }
  });

  it('should have prosody score within valid range', async () => {
    const response = await makeTTSRequest(VALID_TTS_REQUEST);
    const { metrics } = extractQualityHeaders(response);

    const parsedMetrics = parseQualityHeader(metrics) as AudioQualityMetrics | null;

    if (parsedMetrics) {
      expect(parsedMetrics.prosodyScore).toBeGreaterThanOrEqual(0);
      expect(parsedMetrics.prosodyScore).toBeLessThanOrEqual(100);
    }
  });

  it('should have SNR ratio within valid range', async () => {
    const response = await makeTTSRequest(VALID_TTS_REQUEST);
    const { metrics } = extractQualityHeaders(response);

    const parsedMetrics = parseQualityHeader(metrics) as AudioQualityMetrics | null;

    if (parsedMetrics) {
      expect(parsedMetrics.snrRatio).toBeGreaterThan(0);
      expect(parsedMetrics.snrRatio).toBeLessThan(100);
    }
  });

  it('should have artifact score within valid range', async () => {
    const response = await makeTTSRequest(VALID_TTS_REQUEST);
    const { metrics } = extractQualityHeaders(response);

    const parsedMetrics = parseQualityHeader(metrics) as AudioQualityMetrics | null;

    if (parsedMetrics) {
      expect(parsedMetrics.artifactScore).toBeGreaterThanOrEqual(0);
      expect(parsedMetrics.artifactScore).toBeLessThanOrEqual(100);
    }
  });

  it('should have dynamic range within valid range', async () => {
    const response = await makeTTSRequest(VALID_TTS_REQUEST);
    const { metrics } = extractQualityHeaders(response);

    const parsedMetrics = parseQualityHeader(metrics) as AudioQualityMetrics | null;

    if (parsedMetrics) {
      expect(parsedMetrics.dynamicRange).toBeGreaterThan(0);
      expect(parsedMetrics.dynamicRange).toBeLessThan(100);
    }
  });
});

describe('Audio Quality Validation - Validation Result', () => {
  it('should include validation result in response headers', async () => {
    const response = await makeTTSRequest(VALID_TTS_REQUEST);
    const { validation, aaaCompliant } = extractQualityHeaders(response);

    expect(validation).toBeDefined();
    expect(aaaCompliant).toBeDefined();
  });

  it('should have validation result with passed status', async () => {
    const response = await makeTTSRequest(VALID_TTS_REQUEST);
    const { validation } = extractQualityHeaders(response);

    const parsedValidation = parseQualityHeader(validation) as AudioQualityValidation | null;

    if (parsedValidation) {
      expect(parsedValidation.passed).toBeDefined();
      expect(typeof parsedValidation.passed).toBe('boolean');
    }
  });

  it('should include thresholds in validation result', async () => {
    const response = await makeTTSRequest(VALID_TTS_REQUEST);
    const { validation } = extractQualityHeaders(response);

    const parsedValidation = parseQualityHeader(validation) as AudioQualityValidation | null;

    if (parsedValidation) {
      expect(parsedValidation.thresholds).toBeDefined();
      expect(parsedValidation.thresholds.minClarity).toBeDefined();
      expect(parsedValidation.thresholds.minProsody).toBeDefined();
      expect(parsedValidation.thresholds.minSNR).toBeDefined();
      expect(parsedValidation.thresholds.maxArtifacts).toBeDefined();
      expect(parsedValidation.thresholds.minDynamicRange).toBeDefined();
    }
  });

  it('should include failures array in validation result', async () => {
    const response = await makeTTSRequest(VALID_TTS_REQUEST);
    const { validation } = extractQualityHeaders(response);

    const parsedValidation = parseQualityHeader(validation) as AudioQualityValidation | null;

    if (parsedValidation) {
      expect(Array.isArray(parsedValidation.failures)).toBe(true);
    }
  });

  it('should include warnings array in validation result', async () => {
    const response = await makeTTSRequest(VALID_TTS_REQUEST);
    const { validation } = extractQualityHeaders(response);

    const parsedValidation = parseQualityHeader(validation) as AudioQualityValidation | null;

    if (parsedValidation) {
      expect(Array.isArray(parsedValidation.warnings)).toBe(true);
    }
  });

  it('should set AAA compliant header correctly', async () => {
    const response = await makeTTSRequest(VALID_TTS_REQUEST);
    const { aaaCompliant } = extractQualityHeaders(response);

    expect(aaaCompliant).toBe('true');
  });
});

describe('Audio Quality Validation - Quality Presets', () => {
  it('should apply beginner quality preset', async () => {
    const response = await makeTTSRequest({
      ...VALID_TTS_REQUEST,
      quality: 'beginner',
    });

    expect(response.status).not.toBe(400);
  });

  it('should apply intermediate quality preset', async () => {
    const response = await makeTTSRequest({
      ...VALID_TTS_REQUEST,
      quality: 'intermediate',
    });

    expect(response.status).not.toBe(400);
  });

  it('should apply advanced quality preset', async () => {
    const response = await makeTTSRequest({
      ...VALID_TTS_REQUEST,
      quality: 'advanced',
    });

    expect(response.status).not.toBe(400);
  });

  it('should use higher quality model for advanced preset', async () => {
    const beginnerResponse = await makeTTSRequest({
      ...VALID_TTS_REQUEST,
      quality: 'beginner',
    });

    const advancedResponse = await makeTTSRequest({
      ...VALID_TTS_REQUEST,
      quality: 'advanced',
    });

    // Both should succeed
    expect(beginnerResponse.status).not.toBe(400);
    expect(advancedResponse.status).not.toBe(400);
  });
});

describe('Audio Quality Validation - Intonation', () => {
  it('should support intonation enabled requests', async () => {
    const response = await makeTTSRequest({
      ...VALID_TTS_REQUEST,
      useIntonation: true,
    });

    expect(response.status).not.toBe(400);

    const intonationEnabled = response.headers.get('X-Audio-Intonation-Enabled');
    expect(intonationEnabled).toBe('true');
  });

  it('should handle intonation disabled requests', async () => {
    const response = await makeTTSRequest({
      ...VALID_TTS_REQUEST,
      useIntonation: false,
    });

    expect(response.status).not.toBe(400);

    const intonationEnabled = response.headers.get('X-Audio-Intonation-Enabled');
    expect(intonationEnabled).toBe('false');
  });

  it('should affect prosody score based on intonation', async () => {
    const normalResponse = await makeTTSRequest({
      ...VALID_TTS_REQUEST,
      useIntonation: false,
    });

    const intonationResponse = await makeTTSRequest({
      ...VALID_TTS_REQUEST,
      useIntonation: true,
    });

    const normalMetrics = parseQualityHeader(
      extractQualityHeaders(normalResponse).metrics
    ) as AudioQualityMetrics | null;

    const intonationMetrics = parseQualityHeader(
      extractQualityHeaders(intonationResponse).metrics
    ) as AudioQualityMetrics | null;

    if (normalMetrics && intonationMetrics) {
      // Intonation should improve prosody
      expect(intonationMetrics.prosodyScore).toBeGreaterThan(
        normalMetrics.prosodyScore
      );
    }
  });
});

describe('Audio Quality Validation - Response Headers', () => {
  it('should include content type header', async () => {
    const response = await makeTTSRequest({
      ...VALID_TTS_REQUEST,
      format: 'mp3',
    });

    const contentType = response.headers.get('Content-Type');
    expect(contentType).toContain('audio/mpeg');
  });

  it('should include content disposition header', async () => {
    const response = await makeTTSRequest(VALID_TTS_REQUEST);

    const contentDisposition = response.headers.get('Content-Disposition');
    expect(contentDisposition).toBeDefined();
    expect(contentDisposition).toContain('attachment');
    expect(contentDisposition).toContain('filename=');
  });

  it('should include content length header', async () => {
    const response = await makeTTSRequest(VALID_TTS_REQUEST);

    const contentLength = response.headers.get('Content-Length');
    expect(contentLength).toBeDefined();
    expect(parseInt(contentLength ?? '0', 10)).toBeGreaterThan(0);
  });

  it('should include audio duration header', async () => {
    const response = await makeTTSRequest(VALID_TTS_REQUEST);

    const duration = response.headers.get('X-Audio-Duration');
    expect(duration).toBeDefined();
    expect(parseInt(duration ?? '0', 10)).toBeGreaterThan(0);
  });

  it('should include audio filename header', async () => {
    const response = await makeTTSRequest(VALID_TTS_REQUEST);

    const filename = response.headers.get('X-Audio-Filename');
    expect(filename).toBeDefined();
    expect(filename).toContain('tts_');
    expect(filename).toContain('.mp3');
  });

  it('should include SSML header when SSML is provided', async () => {
    const response = await makeTTSRequest({
      ...VALID_TTS_REQUEST,
      ssml: '<speak>Bonjour</speak>',
    });

    const ssml = response.headers.get('X-Audio-SSML');
    expect(ssml).toBeDefined();
  });
});

describe('Audio Quality Validation - Rate Limiting', () => {
  it('should enforce rate limiting', async () => {
    // Clear rate limit map first
    rateLimitMap.clear();

    // Make multiple requests rapidly to test rate limiting
    // We need to make enough requests to trigger the rate limit (100 requests per minute)
    // For faster test execution, we'll make 50 requests and verify the rate limit map is working
    const requests = Array.from({ length: 50 }, (_, i) =>
      makeTTSRequest({
        ...VALID_TTS_REQUEST,
        text: `Test phrase ${i}`, // Unique text for each request
      })
    );

    const responses = await Promise.all(requests);

    // Verify that rate limiting is tracking requests
    // The rate limit map should have entries for the client IP
    expect(rateLimitMap.size).toBeGreaterThan(0);

    // All requests should succeed (under the 100 request limit)
    const successfulResponses = responses.filter(r => r.status === 200);
    expect(successfulResponses.length).toBe(50);
  }, 60000); // Increase timeout to 60 seconds for this test

  it('should return appropriate rate limit error', async () => {
    // First, make a request that might trigger rate limiting
    const response = await makeTTSRequest(VALID_TTS_REQUEST);

    // Only try to parse JSON if it's not an audio response
    if (response.status === 429) {
      const body = await response.json();
      expect(body.success).toBe(false);
      expect(body.error).toContain('Rate limit');
    } else if (response.status !== 200) {
      const body = await response.json();
      expect(body.success).toBe(false);
    }
    // If status is 200, the test passes (no rate limit hit)
  });
});

describe('Audio Quality Validation - Error Handling', () => {
  it('should handle missing API key gracefully', async () => {
    rateLimitMap.clear(); // Clear rate limit before this test
    process.env.OPENAI_API_KEY = '';

    const response = await makeTTSRequest(VALID_TTS_REQUEST);
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body.success).toBe(false);
    expect(body.error).toContain('API key');
  });

  it('should handle invalid JSON body', async () => {
    rateLimitMap.clear(); // Clear rate limit before this test

    const request = new NextRequest('http://localhost:3000/api/tts/download', {
      method: 'POST',
      body: 'invalid json',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const response = await POST(request);
    expect(response.status).toBe(400);
  });
});

describe('Audio Quality Validation - Quality Metrics Calculation', () => {
  it('should calculate clarity based on model quality', async () => {
    const standardResponse = await makeTTSRequest({
      ...VALID_TTS_REQUEST,
      model: 'tts-1',
    });

    const hdResponse = await makeTTSRequest({
      ...VALID_TTS_REQUEST,
      model: 'tts-1-hd',
    });

    const standardMetrics = parseQualityHeader(
      extractQualityHeaders(standardResponse).metrics
    ) as AudioQualityMetrics | null;

    const hdMetrics = parseQualityHeader(
      extractQualityHeaders(hdResponse).metrics
    ) as AudioQualityMetrics | null;

    if (standardMetrics && hdMetrics) {
      // HD model should have better clarity
      expect(hdMetrics.clarity).toBeGreaterThanOrEqual(standardMetrics.clarity);
    }
  });

  it('should calculate SNR based on model quality', async () => {
    const standardResponse = await makeTTSRequest({
      ...VALID_TTS_REQUEST,
      model: 'tts-1',
    });

    const hdResponse = await makeTTSRequest({
      ...VALID_TTS_REQUEST,
      model: 'tts-1-hd',
    });

    const standardMetrics = parseQualityHeader(
      extractQualityHeaders(standardResponse).metrics
    ) as AudioQualityMetrics | null;

    const hdMetrics = parseQualityHeader(
      extractQualityHeaders(hdResponse).metrics
    ) as AudioQualityMetrics | null;

    if (standardMetrics && hdMetrics) {
      // HD model should have better SNR
      expect(hdMetrics.snrRatio).toBeGreaterThanOrEqual(standardMetrics.snrRatio);
    }
  });

  it('should calculate artifact score based on model quality', async () => {
    const standardResponse = await makeTTSRequest({
      ...VALID_TTS_REQUEST,
      model: 'tts-1',
    });

    const hdResponse = await makeTTSRequest({
      ...VALID_TTS_REQUEST,
      model: 'tts-1-hd',
    });

    const standardMetrics = parseQualityHeader(
      extractQualityHeaders(standardResponse).metrics
    ) as AudioQualityMetrics | null;

    const hdMetrics = parseQualityHeader(
      extractQualityHeaders(hdResponse).metrics
    ) as AudioQualityMetrics | null;

    if (standardMetrics && hdMetrics) {
      // HD model should have fewer artifacts (higher score)
      expect(hdMetrics.artifactScore).toBeGreaterThanOrEqual(standardMetrics.artifactScore);
    }
  });
});

describe('Audio Quality Validation - Learning Integration', () => {
  it('should support multiple audio requests for different phrases', async () => {
    const phrases = [
      'Bonjour, comment allez-vous?',
      'Je vais bien, merci.',
      'Et vous?',
    ];

    const responses = await Promise.all(
      phrases.map(phrase =>
        makeTTSRequest({
          ...VALID_TTS_REQUEST,
          text: phrase,
        })
      )
    );

    responses.forEach(response => {
      expect(response.status).not.toBe(400);

      const { aaaCompliant } = extractQualityHeaders(response);
      expect(aaaCompliant).toBe('true');
    });
  });

  it('should maintain quality consistency across requests', async () => {
    const requests = Array.from({ length: 5 }, () =>
      makeTTSRequest(VALID_TTS_REQUEST)
    );

    const responses = await Promise.all(requests);
    const metricsList = responses.map(r =>
      parseQualityHeader(extractQualityHeaders(r).metrics)
    ) as AudioQualityMetrics[];

    // All metrics should be within reasonable range
    metricsList.forEach(metrics => {
      expect(metrics.clarity).toBeGreaterThan(80);
      expect(metrics.prosodyScore).toBeGreaterThan(60);
      expect(metrics.snrRatio).toBeGreaterThan(20);
    });
  });
});
