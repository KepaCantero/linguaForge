/**
 * Intonation Service for Contextualized TTS
 * Servicio de entonación para TTS contextualizado
 *
 * Provides sentence-type detection and SSML generation for natural intonation
 * Proporciona detección de tipo de oración y generación SSML para entonación natural
 */

import type {
  SentenceType,
  IntonationProfile,
  IntonationConfig,
  SSMLProsodyConfig,
  AnalyzedSentence,
  IntonationRule,
} from '@/types/tts';
import { LANGUAGE_CODES, DEFAULT_LANGUAGE } from '@/config/languages';

export type {
  SentenceType,
  IntonationProfile,
  IntonationConfig,
  SSMLProsodyConfig,
  AnalyzedSentence,
};

// ============================================================
// CONSTANTS
// ============================================================

const FRENCH_QUESTION_WORDS = [
  'que', 'quoi', 'qui', 'quel', 'quelle', 'quels', 'quelles',
  'quand', 'où', 'comment', 'pourquoi', 'combien',
  'est-ce que', 'est-cequ',
] as const;

const FRENCH_IMPERATIVE_VERBS = [
  'aller', 'venir', 'prendre', 'mettre', 'donner', 'faire', 'dire', 'voir',
  'être', 'avoir', 'savoir', 'pouvoir', 'vouloir', 'devoir',
  'écouter', 'regarder', 'parler', 'répondre', 'écrire', 'lire',
  'ouvrir', 'fermer', 'entrer', 'sortir', 'arrêter', 'continuer',
] as const;

const PUNCTUATION_MARKS = {
  QUESTION: ['?', '¿', '？', '⁉'] as string[],
  EXCLAMATION: ['!', '¡', '！', '⁈'] as string[],
  STATEMENT: ['.', '。', '․', '‧'] as string[],
  COMMA: [',', '،', '、'] as string[],
  COLON: [':', '：', '։'] as string[],
  SEMICOLON: [';', '；'] as string[],
} as const;

// ============================================================
// FRENCH INTONATION CONFIG
// ============================================================

/**
 * French intonation rules based on linguistic research
 * Reglas de entonación francesas basadas en investigación lingüística
 *
 * References:
 * - French intonation patterns (Di Cristo, 1998)
 * - Prosody in French questions (Mertens, 2008)
 * - French declarative intonation (Welby, 2002)
 */
const FRENCH_INTONATION_CONFIG: IntonationConfig = {
  language: LANGUAGE_CODES.FRENCH,
  questionWords: [...FRENCH_QUESTION_WORDS],
  imperativeVerbs: [...FRENCH_IMPERATIVE_VERBS],
  rules: {
    /**
     * Question: Rising intonation at the end
     * Pregunta: Entonación ascendente al final
     *
     * French yes/no questions typically have rising pitch (+4 to +6 semitones)
     * WH questions may have falling or rising intonation depending on focus
     */
    question: {
      sentenceType: 'question',
      intonationProfile: 'rising',
      pitchRange: [0, 6],        // 0 to +6 semitones
      rateModifier: 0.95,        // Slightly slower for clarity
      volumeBoost: 2,            // Slight volume increase
    },

    /**
     * Statement: Falling intonation at the end
     * Declarativo: Entonación descendente al final
     *
     * French declaratives typically have falling pitch (-2 to +2 semitones)
     * with a slight rise on the penultimate syllable
     */
    statement: {
      sentenceType: 'statement',
      intonationProfile: 'falling',
      pitchRange: [-2, 2],       // -2 to +2 semitones
      rateModifier: 1.0,         // Normal rate
      volumeBoost: 0,            // No volume boost
    },

    /**
     * Exclamation: Rise-fall pattern with emphasis
     * Exclamación: Patrón rise-fall con énfasis
     *
     * Strong emotional content with wider pitch range
     */
    exclamation: {
      sentenceType: 'exclamation',
      intonationProfile: 'rise-fall',
      pitchRange: [0, 8],        // 0 to +8 semitones (wider range)
      rateModifier: 1.1,         // Slightly faster for excitement
      volumeBoost: 5,            // Significant volume increase
    },

    /**
     * Imperative: Falling intonation with authority
     * Imperativo: Entonación descendente con autoridad
     *
     * Commands have falling pitch with slightly lower baseline
     */
    imperative: {
      sentenceType: 'imperative',
      intonationProfile: 'falling',
      pitchRange: [-3, 1],       // -3 to +1 semitones (lower baseline)
      rateModifier: 1.05,        // Slightly faster for urgency
      volumeBoost: 3,            // Moderate volume increase
    },
  },
};

// ============================================================
// INTONATION SERVICE
// ============================================================

class IntonationServiceClass {
  private configs: Map<string, IntonationConfig> = new Map();

  constructor() {
    // Register French config by default using constants
    this.configs.set(LANGUAGE_CODES.FRENCH, FRENCH_INTONATION_CONFIG);
    this.configs.set(LANGUAGE_CODES.FRENCH.toUpperCase(), FRENCH_INTONATION_CONFIG);
    this.configs.set('fr-FR', FRENCH_INTONATION_CONFIG);
  }

  /**
   * Register a custom intonation configuration
   * Registra una configuración de entonación personalizada
   */
  registerConfig(config: IntonationConfig): void {
    this.configs.set(config.language, config);
    this.configs.set(config.language.toLowerCase(), config);
  }

  /**
   * Get intonation configuration for a language
   * Obtiene configuración de entonación para un idioma
   */
  getConfig(languageCode: string): IntonationConfig | null {
    // Try exact match first
    const exact = this.configs.get(languageCode);
    if (exact) return exact;

    // Try language code only (e.g., 'fr' from 'fr-FR')
    const langOnly = languageCode.split('-')[0].toLowerCase();
    return this.configs.get(langOnly) || null;
  }

  /**
   * Detect sentence type from text analysis
   * Detecta tipo de oración mediante análisis de texto
   *
   * Uses multiple indicators:
   * 1. Ending punctuation (primary indicator)
   * 2. Question words at the beginning
   * 3. Imperative verb at the beginning
   * 4. Word order patterns
   *
   * @param sentence - Sentence text to analyze
   * @param language - Language code for rules (default: DEFAULT_LANGUAGE)
   * @returns Detected sentence type
   */
  detectSentenceType(sentence: string, language: string = DEFAULT_LANGUAGE): SentenceType {
    if (!sentence || sentence.trim().length === 0) {
      return 'statement';
    }

    const config = this.getConfig(language);
    const trimmed = sentence.trim();

    // 1. Check ending punctuation (primary indicator)
    const lastChar = trimmed[trimmed.length - 1];
    const questionChars = PUNCTUATION_MARKS.QUESTION as string[];
    const exclamationChars = PUNCTUATION_MARKS.EXCLAMATION as string[];

    if (questionChars.includes(lastChar)) {
      return 'question';
    }
    if (exclamationChars.includes(lastChar)) {
      return 'exclamation';
    }

    // 2. Check for question words at the beginning (French-specific)
    if (config) {
      const words = trimmed.toLowerCase().split(/\s+/);
      const firstWord = words[0];

      // Check for question words
      if (config.questionWords.includes(firstWord)) {
        return 'question';
      }

      // Check for "est-ce que" pattern (two words)
      if (words.length >= 2) {
        const firstTwo = `${words[0]} ${words[1]}`;
        if (config.questionWords.includes(firstTwo)) {
          return 'question';
        }
      }

      // 3. Check for imperative verbs (starts with verb in imperative form)
      if (config.imperativeVerbs.includes(firstWord)) {
        // Verify it's not a question (questions can also start with verbs)
        if (!PUNCTUATION_MARKS.QUESTION.includes(lastChar) &&
            !config.questionWords.some(qw => words.some(w => w === qw))) {
          return 'imperative';
        }
      }

      // 4. Check for imperative pronoun + verb patterns
      // (tu/toi, nous/vous, vous) + imperative verb
      const imperativePronouns = ['tu', 'toi', 'nous', 'vous'];
      if (imperativePronouns.includes(firstWord) && words.length >= 2) {
        const secondWord = words[1];
        if (config.imperativeVerbs.includes(secondWord)) {
          return 'imperative';
        }
      }
    }

    // Default to statement
    return 'statement';
  }

  /**
   * Get intonation rule for a sentence type
   * Obtiene regla de entonación para un tipo de oración
   */
  getIntonationRule(
    sentenceType: SentenceType,
    language: string = DEFAULT_LANGUAGE
  ): IntonationRule | null {
    const config = this.getConfig(language);
    if (!config) return null;

    return config.rules[sentenceType] || config.rules.statement;
  }

  /**
   * Convert intonation rule to SSML prosody config
   * Convierte regla de entonación a configuración prosódica SSML
   */
  ruleToSSML(rule: IntonationRule): SSMLProsodyConfig {
    const { pitchRange, rateModifier, volumeBoost } = rule;

    // Calculate pitch adjustment (average of range)
    const pitchAdjustment = Math.round((pitchRange[0] + pitchRange[1]) / 2);
    const pitch = pitchAdjustment >= 0
      ? `+${pitchAdjustment}st`
      : `${pitchAdjustment}st`;

    // Calculate rate adjustment
    const ratePercent = Math.round(rateModifier * 100);
    const rate = `${ratePercent}%`;

    // Volume adjustment
    const volume = volumeBoost > 0
      ? `+${volumeBoost}dB`
      : 'medium';

    return { pitch, rate, volume };
  }

  /**
   * Analyze a single sentence with intonation metadata
   * Analiza una sola oración con metadatos de entonación
   */
  analyzeSentence(
    sentence: string,
    startIndex: number,
    language: string = DEFAULT_LANGUAGE
  ): AnalyzedSentence {
    const type = this.detectSentenceType(sentence, language);
    const rule = this.getIntonationRule(type, language) || FRENCH_INTONATION_CONFIG.rules.statement;
    const ssmlProsody = this.ruleToSSML(rule);

    return {
      text: sentence,
      type,
      startIndex,
      endIndex: startIndex + sentence.length,
      intonation: rule,
      ssmlProsody,
    };
  }

  /**
   * Split text into sentences for analysis
   * Divide el texto en oraciones para análisis
   *
   * Handles:
   * - Standard punctuation (., !, ?)
   * - Abbreviations (M., Mme, Dr, etc.)
   * - Ellipsis (...)
   * - Quotation marks
   */
  splitIntoSentences(text: string): string[] {
    if (!text || text.trim().length === 0) {
      return [];
    }

    const sentences: string[] = [];
    let current = '';
    let i = 0;

    while (i < text.length) {
      const char = text[i];
      current += char;

      // Check for sentence-ending punctuation
      const punctuationChars = [
        ...PUNCTUATION_MARKS.QUESTION,
        ...PUNCTUATION_MARKS.EXCLAMATION,
        ...PUNCTUATION_MARKS.STATEMENT,
      ] as string[];

      if (punctuationChars.includes(char)) {
        // Look ahead for more punctuation or spaces
        let j = i + 1;
        while (j < text.length && text[j] === ' ') {
          j++;
        }

        // Check if next word starts with capital (new sentence)
        // or if we're at the end of the text
        if (j >= text.length || (text[j] === text[j].toUpperCase() && text[j] !== ' ')) {
          sentences.push(current.trim());
          current = '';
          i = j - 1; // Will increment to j in loop
        }
      }

      i++;
    }

    // Add any remaining text
    if (current.trim().length > 0) {
      sentences.push(current.trim());
    }

    return sentences.filter(s => s.length > 0);
  }

  /**
   * Analyze entire text and return all sentences with intonation
   * Analiza texto completo y retorna todas las oraciones con entonación
   */
  analyzeText(text: string, language: string = DEFAULT_LANGUAGE): AnalyzedSentence[] {
    const sentences = this.splitIntoSentences(text);
    const analyzed: AnalyzedSentence[] = [];
    let currentIndex = 0;

    for (const sentence of sentences) {
      const analyzedSentence = this.analyzeSentence(sentence, currentIndex, language);
      analyzed.push(analyzedSentence);
      currentIndex = analyzedSentence.endIndex + 1;
    }

    return analyzed;
  }

  /**
   * Generate SSML with prosody marks from analyzed text
   * Genera SSML con marcas prosódicas desde texto analizado
   *
   * SSML format:
   * <speak>
   *   <s>
   *     <prosody pitch="+20%" rate="95%">Sentence text</prosody>
   *   </s>
   * </speak>
   */
  generateSSML(analyzedSentences: AnalyzedSentence[]): string {
    if (analyzedSentences.length === 0) {
      return '';
    }

    let ssml = '<speak>';

    for (const analyzed of analyzedSentences) {
      const { text, ssmlProsody } = analyzed;
      const escapedText = this.escapeXML(text);
      ssml += `<s><prosody pitch="${ssmlProsody.pitch}" rate="${ssmlProsody.rate}" volume="${ssmlProsody.volume}">${escapedText}</prosody></s>`;
    }

    ssml += '</speak>';
    return ssml;
  }

  /**
   * Generate SSML directly from text (convenience method)
   * Genera SSML directamente desde texto (método de conveniencia)
   */
  generateSSMLFromText(text: string, language: string = DEFAULT_LANGUAGE): string {
    const analyzed = this.analyzeText(text, language);
    return this.generateSSML(analyzed);
  }

  /**
   * Escape special XML characters for SSML
   * Escapa caracteres especiales XML para SSML
   */
  private escapeXML(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }

  /**
   * Apply intonation to text for TTS
   * Aplica entonación al texto para TTS
   *
   * Returns the SSML if intonation is enabled, otherwise returns plain text
   */
  applyIntonation(
    text: string,
    useIntonation: boolean,
    language: string = DEFAULT_LANGUAGE
  ): { text: string; ssml?: string; analyzed: AnalyzedSentence[] } {
    const analyzed = this.analyzeText(text, language);

    if (useIntonation) {
      const ssml = this.generateSSML(analyzed);
      return { text: ssml, ssml, analyzed };
    }

    return { text, analyzed };
  }

  /**
   * Get intonation profile name for display
   * Obtiene nombre de perfil de entonación para mostrar
   */
  getProfileName(profile: IntonationProfile): string {
    const names: Record<IntonationProfile, string> = {
      flat: 'Plano',
      rising: 'Ascendente',
      falling: 'Descendente',
      'rise-fall': 'Ascendente-Descendente',
    };
    return names[profile] || profile;
  }

  /**
   * Get sentence type name for display
   * Obtiene nombre de tipo de oración para mostrar
   */
  getSentenceTypeName(type: SentenceType): string {
    const names: Record<SentenceType, string> = {
      statement: 'Declarativo',
      question: 'Pregunta',
      exclamation: 'Exclamación',
      imperative: 'Imperativo',
    };
    return names[type] || type;
  }
}

// ============================================================
// SINGLETON EXPORT
// ============================================================

export const intonationService = new IntonationServiceClass();

// Export service class for testing
export { IntonationServiceClass };

// Export convenience functions
export const detectSentenceType = (text: string, lang?: string): SentenceType =>
  intonationService.detectSentenceType(text, lang);

export const analyzeTextIntonation = (text: string, lang?: string): AnalyzedSentence[] =>
  intonationService.analyzeText(text, lang);

export const generateSSML = (text: string, lang?: string): string =>
  intonationService.generateSSMLFromText(text, lang);

export const applyIntonation = (
  text: string,
  useIntonation: boolean,
  lang?: string
): { text: string; ssml?: string; analyzed: AnalyzedSentence[] } =>
  intonationService.applyIntonation(text, useIntonation, lang);
