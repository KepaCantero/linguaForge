/**
 * Tests for Intonation Service
 * Tests para el servicio de entonación
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  intonationService,
  IntonationServiceClass,
} from '@/services/intonationService';
import type { SentenceType, AnalyzedSentence } from '@/types/tts';

describe('IntonationService', () => {
  beforeEach(() => {
    // Reset service state before each test
    intonationService.registerConfig({
      language: 'fr',
      questionWords: ['que', 'qui', 'quel', 'quand', 'où', 'comment', 'pourquoi'],
      imperativeVerbs: ['aller', 'venir', 'prendre', 'écouter', 'regarder'],
      rules: {
        question: {
          sentenceType: 'question',
          intonationProfile: 'rising',
          pitchRange: [0, 6],
          rateModifier: 0.95,
          volumeBoost: 2,
        },
        statement: {
          sentenceType: 'statement',
          intonationProfile: 'falling',
          pitchRange: [-2, 2],
          rateModifier: 1.0,
          volumeBoost: 0,
        },
        exclamation: {
          sentenceType: 'exclamation',
          intonationProfile: 'rise-fall',
          pitchRange: [0, 8],
          rateModifier: 1.1,
          volumeBoost: 5,
        },
        imperative: {
          sentenceType: 'imperative',
          intonationProfile: 'falling',
          pitchRange: [-3, 1],
          rateModifier: 1.05,
          volumeBoost: 3,
        },
      },
    });
  });

  describe('detectSentenceType', () => {
    it('should detect question by ending punctuation', () => {
      const text = 'Comment allez-vous?';
      const type = intonationService.detectSentenceType(text, 'fr');
      expect(type).toBe('question');
    });

    it('should detect exclamation by ending punctuation', () => {
      const text = 'C\'est magnifique!';
      const type = intonationService.detectSentenceType(text, 'fr');
      expect(type).toBe('exclamation');
    });

    it('should detect statement by ending punctuation', () => {
      const text = 'Je vais bien.';
      const type = intonationService.detectSentenceType(text, 'fr');
      expect(type).toBe('statement');
    });

    it('should detect question by question words at beginning', () => {
      const text = 'Que fais-tu?';
      const type = intonationService.detectSentenceType(text, 'fr');
      expect(type).toBe('question');
    });

    it('should detect question with "est-ce que" pattern', () => {
      const text = 'Est-ce que tu viens?';
      const type = intonationService.detectSentenceType(text, 'fr');
      expect(type).toBe('question');
    });

    it('should detect imperative by verb at beginning', () => {
      const text = 'Aller maintenant.';
      const type = intonationService.detectSentenceType(text, 'fr');
      expect(type).toBe('imperative');
    });

    it('should detect imperative with pronoun + verb pattern', () => {
      const text = 'Venir maintenant.';
      const type = intonationService.detectSentenceType(text, 'fr');
      expect(type).toBe('imperative');
    });

    it('should default to statement for unknown patterns', () => {
      const text = 'Le chat dort';
      const type = intonationService.detectSentenceType(text, 'fr');
      expect(type).toBe('statement');
    });

    it('should handle empty text', () => {
      const type = intonationService.detectSentenceType('', 'fr');
      expect(type).toBe('statement');
    });

    it('should handle text with only whitespace', () => {
      const type = intonationService.detectSentenceType('   ', 'fr');
      expect(type).toBe('statement');
    });
  });

  describe('getIntonationRule', () => {
    it('should return question rule for question type', () => {
      const rule = intonationService.getIntonationRule('question', 'fr');
      expect(rule).toBeDefined();
      expect(rule?.sentenceType).toBe('question');
      expect(rule?.intonationProfile).toBe('rising');
      expect(rule?.pitchRange).toEqual([0, 6]);
      expect(rule?.rateModifier).toBe(0.95);
      expect(rule?.volumeBoost).toBe(2);
    });

    it('should return statement rule for statement type', () => {
      const rule = intonationService.getIntonationRule('statement', 'fr');
      expect(rule).toBeDefined();
      expect(rule?.sentenceType).toBe('statement');
      expect(rule?.intonationProfile).toBe('falling');
      expect(rule?.pitchRange).toEqual([-2, 2]);
      expect(rule?.rateModifier).toBe(1.0);
    });

    it('should return exclamation rule for exclamation type', () => {
      const rule = intonationService.getIntonationRule('exclamation', 'fr');
      expect(rule?.sentenceType).toBe('exclamation');
      expect(rule?.intonationProfile).toBe('rise-fall');
      expect(rule?.pitchRange).toEqual([0, 8]);
    });

    it('should return imperative rule for imperative type', () => {
      const rule = intonationService.getIntonationRule('imperative', 'fr');
      expect(rule?.sentenceType).toBe('imperative');
      expect(rule?.intonationProfile).toBe('falling');
      expect(rule?.pitchRange).toEqual([-3, 1]);
    });

    it('should return null for unknown language', () => {
      const rule = intonationService.getIntonationRule('question', 'unknown');
      expect(rule).toBeNull();
    });
  });

  describe('ruleToSSML', () => {
    it('should convert question rule to SSML prosody', () => {
      const rule = intonationService.getIntonationRule('question', 'fr');
      expect(rule).toBeDefined();
      const ssml = intonationService.ruleToSSML(rule!);
      expect(ssml.pitch).toBe('+3st'); // Average of [0, 6]
      expect(ssml.rate).toBe('95%'); // 0.95 * 100
      expect(ssml.volume).toBe('+2dB'); // volumeBoost
    });

    it('should convert statement rule to SSML prosody', () => {
      const rule = intonationService.getIntonationRule('statement', 'fr');
      expect(rule).toBeDefined();
      const ssml = intonationService.ruleToSSML(rule!);
      expect(ssml.pitch).toBe('+0st'); // Average of [-2, 2]
      expect(ssml.rate).toBe('100%'); // 1.0 * 100
      expect(ssml.volume).toBe('medium'); // 0 volumeBoost
    });

    it('should convert exclamation rule to SSML prosody', () => {
      const rule = intonationService.getIntonationRule('exclamation', 'fr');
      expect(rule).toBeDefined();
      const ssml = intonationService.ruleToSSML(rule!);
      expect(ssml.pitch).toBe('+4st'); // Average of [0, 8]
      expect(ssml.rate).toBe('110%'); // 1.1 * 100
      expect(ssml.volume).toBe('+5dB');
    });

    it('should convert imperative rule to SSML prosody', () => {
      const rule = intonationService.getIntonationRule('imperative', 'fr');
      expect(rule).toBeDefined();
      const ssml = intonationService.ruleToSSML(rule!);
      expect(ssml.pitch).toBe('-1st'); // Average of [-3, 1]
      expect(ssml.rate).toBe('105%'); // 1.05 * 100
      expect(ssml.volume).toBe('+3dB');
    });
  });

  describe('splitIntoSentences', () => {
    it('should split simple text into sentences', () => {
      const text = 'Je vais bien. Comment allez-vous?';
      const sentences = intonationService.splitIntoSentences(text);
      expect(sentences).toHaveLength(2);
      expect(sentences[0]).toBe('Je vais bien.');
      expect(sentences[1]).toBe('Comment allez-vous?');
    });

    it('should handle multiple sentences', () => {
      const text = 'Je vais bien. Comment allez-vous? C\'est magnifique!';
      const sentences = intonationService.splitIntoSentences(text);
      expect(sentences).toHaveLength(3);
    });

    it('should handle empty text', () => {
      const sentences = intonationService.splitIntoSentences('');
      expect(sentences).toHaveLength(0);
    });

    it('should handle text with no punctuation', () => {
      const text = 'Je vais bien';
      const sentences = intonationService.splitIntoSentences(text);
      expect(sentences).toHaveLength(1);
      expect(sentences[0]).toBe('Je vais bien');
    });

    it('should trim whitespace', () => {
      const text = '  Je vais bien.  Comment allez-vous?  ';
      const sentences = intonationService.splitIntoSentences(text);
      expect(sentences).toHaveLength(2);
      expect(sentences[0]).toBe('Je vais bien.');
      expect(sentences[1]).toBe('Comment allez-vous?');
    });
  });

  describe('analyzeText', () => {
    it('should analyze text with multiple sentence types', () => {
      const text = 'Je vais bien. Comment allez-vous? C\'est magnifique! Aller maintenant.';
      const analyzed = intonationService.analyzeText(text, 'fr');

      expect(analyzed).toHaveLength(4);
      expect(analyzed[0].type).toBe('statement');
      expect(analyzed[1].type).toBe('question');
      expect(analyzed[2].type).toBe('exclamation');
      expect(analyzed[3].type).toBe('imperative');
    });

    it('should include intonation rules for each sentence', () => {
      const text = 'Je vais bien.';
      const analyzed = intonationService.analyzeText(text, 'fr');

      expect(analyzed).toHaveLength(1);
      expect(analyzed[0].intonation).toBeDefined();
      expect(analyzed[0].intonation.sentenceType).toBe('statement');
    });

    it('should include SSML prosody config', () => {
      const text = 'Comment allez-vous?';
      const analyzed = intonationService.analyzeText(text, 'fr');

      expect(analyzed).toHaveLength(1);
      expect(analyzed[0].ssmlProsody).toBeDefined();
      expect(analyzed[0].ssmlProsody.pitch).toBeTruthy();
      expect(analyzed[0].ssmlProsody.rate).toBeTruthy();
      expect(analyzed[0].ssmlProsody.volume).toBeTruthy();
    });

    it('should track sentence indices', () => {
      const text = 'Je vais bien. Comment allez-vous?';
      const analyzed = intonationService.analyzeText(text, 'fr');

      expect(analyzed).toHaveLength(2);
      expect(analyzed[0].startIndex).toBe(0);
      expect(analyzed[0].endIndex).toBeGreaterThan(0);
      expect(analyzed[1].startIndex).toBeGreaterThan(analyzed[0].endIndex);
    });
  });

  describe('generateSSML', () => {
    it('should generate SSML from analyzed sentences', () => {
      const analyzed: AnalyzedSentence[] = [
        {
          text: 'Je vais bien.',
          type: 'statement',
          startIndex: 0,
          endIndex: 12,
          intonation: intonationService.getIntonationRule('statement', 'fr')!,
          ssmlProsody: intonationService.ruleToSSML(intonationService.getIntonationRule('statement', 'fr')!),
        },
      ];

      const ssml = intonationService.generateSSML(analyzed);
      expect(ssml).toContain('<speak>');
      expect(ssml).toContain('</speak>');
      expect(ssml).toContain('<s>');
      expect(ssml).toContain('</s>');
      expect(ssml).toContain('<prosody');
      expect(ssml).toContain('pitch=');
      expect(ssml).toContain('rate=');
      expect(ssml).toContain('volume=');
      expect(ssml).toContain('Je vais bien.');
    });

    it('should escape XML special characters', () => {
      const analyzed: AnalyzedSentence[] = [
        {
          text: 'Il a dit "Bonjour!".',
          type: 'statement',
          startIndex: 0,
          endIndex: 19,
          intonation: intonationService.getIntonationRule('statement', 'fr')!,
          ssmlProsody: intonationService.ruleToSSML(intonationService.getIntonationRule('statement', 'fr')!),
        },
      ];

      const ssml = intonationService.generateSSML(analyzed);
      expect(ssml).toContain('&quot;');
      expect(ssml).not.toContain('"Bonjour!"');
    });

    it('should handle empty array', () => {
      const ssml = intonationService.generateSSML([]);
      expect(ssml).toBe('');
    });

    it('should generate multiple sentences', () => {
      const analyzed: AnalyzedSentence[] = [
        {
          text: 'Je vais bien.',
          type: 'statement',
          startIndex: 0,
          endIndex: 12,
          intonation: intonationService.getIntonationRule('statement', 'fr')!,
          ssmlProsody: intonationService.ruleToSSML(intonationService.getIntonationRule('statement', 'fr')!),
        },
        {
          text: 'Comment allez-vous?',
          type: 'question',
          startIndex: 13,
          endIndex: 31,
          intonation: intonationService.getIntonationRule('question', 'fr')!,
          ssmlProsody: intonationService.ruleToSSML(intonationService.getIntonationRule('question', 'fr')!),
        },
      ];

      const ssml = intonationService.generateSSML(analyzed);
      const sentenceCount = (ssml.match(/<s>/g) || []).length;
      expect(sentenceCount).toBe(2);
    });
  });

  describe('generateSSMLFromText', () => {
    it('should generate SSML directly from text', () => {
      const text = 'Je vais bien.';
      const ssml = intonationService.generateSSMLFromText(text, 'fr');

      expect(ssml).toContain('<speak>');
      expect(ssml).toContain('</speak>');
      expect(ssml).toContain('Je vais bien.');
    });

    it('should handle multiple sentences', () => {
      const text = 'Je vais bien. Comment allez-vous?';
      const ssml = intonationService.generateSSMLFromText(text, 'fr');

      const sentenceCount = (ssml.match(/<s>/g) || []).length;
      expect(sentenceCount).toBe(2);
    });
  });

  describe('applyIntonation', () => {
    it('should return plain text when intonation is disabled', () => {
      const text = 'Je vais bien.';
      const result = intonationService.applyIntonation(text, false, 'fr');

      expect(result.text).toBe(text);
      expect(result.ssml).toBeUndefined();
      expect(result.analyzed).toHaveLength(1);
    });

    it('should return SSML when intonation is enabled', () => {
      const text = 'Je vais bien.';
      const result = intonationService.applyIntonation(text, true, 'fr');

      expect(result.text).toContain('<speak>');
      expect(result.ssml).toContain('<speak>');
      expect(result.analyzed).toHaveLength(1);
    });

    it('should analyze text in both cases', () => {
      const text = 'Je vais bien.';
      const resultDisabled = intonationService.applyIntonation(text, false, 'fr');
      const resultEnabled = intonationService.applyIntonation(text, true, 'fr');

      expect(resultDisabled.analyzed).toHaveLength(1);
      expect(resultEnabled.analyzed).toHaveLength(1);
    });
  });

  describe('getProfileName', () => {
    it('should return correct profile names', () => {
      expect(intonationService.getProfileName('flat')).toBe('Plano');
      expect(intonationService.getProfileName('rising')).toBe('Ascendente');
      expect(intonationService.getProfileName('falling')).toBe('Descendente');
      expect(intonationService.getProfileName('rise-fall')).toBe('Ascendente-Descendente');
    });
  });

  describe('getSentenceTypeName', () => {
    it('should return correct sentence type names', () => {
      expect(intonationService.getSentenceTypeName('statement')).toBe('Declarativo');
      expect(intonationService.getSentenceTypeName('question')).toBe('Pregunta');
      expect(intonationService.getSentenceTypeName('exclamation')).toBe('Exclamación');
      expect(intonationService.getSentenceTypeName('imperative')).toBe('Imperativo');
    });
  });

  describe('registerConfig', () => {
    it('should allow custom language configuration', () => {
      const customConfig = {
        language: 'es',
        questionWords: ['qué', 'quién', 'cuándo', 'dónde', 'cómo'],
        imperativeVerbs: ['ir', 'venir', 'tomar'],
        rules: {
          question: {
            sentenceType: 'question' as const,
            intonationProfile: 'rising' as const,
            pitchRange: [0, 5] as [number, number],
            rateModifier: 0.9,
            volumeBoost: 1,
          },
          statement: {
            sentenceType: 'statement' as const,
            intonationProfile: 'falling' as const,
            pitchRange: [-1, 1] as [number, number],
            rateModifier: 1.0,
            volumeBoost: 0,
          },
          exclamation: {
            sentenceType: 'exclamation' as const,
            intonationProfile: 'rise-fall' as const,
            pitchRange: [0, 7] as [number, number],
            rateModifier: 1.05,
            volumeBoost: 4,
          },
          imperative: {
            sentenceType: 'imperative' as const,
            intonationProfile: 'falling' as const,
            pitchRange: [-2, 0] as [number, number],
            rateModifier: 1.02,
            volumeBoost: 2,
          },
        },
      };

      intonationService.registerConfig(customConfig);
      const config = intonationService.getConfig('es');

      expect(config).toBeDefined();
      expect(config?.language).toBe('es');
      expect(config?.questionWords).toContain('qué');
    });
  });
});
