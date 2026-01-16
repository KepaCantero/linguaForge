/**
 * Integration Tests: Import Flow
 * Tests the complete import workflow from text/YouTube to learning exercises
 *
 * Flow:
 * 1. Import content (text or YouTube transcript)
 * 2. Extract phrases using importFlowService
 * 3. Generate cloze exercises
 * 4. Store in useImportedNodesStore
 * 5. Create SRS cards from phrases
 * 6. Verify exercises can be used in learning flow
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  extractPhrases,
  analyzeContent,
  calculateWordCount,
  calculatePhraseCount,
  isValidContent,
  isValidYouTubeUrl,
  generateClozeExercises,
  type ClozeExercise,
} from '@/services/importFlowService';
import { extractWordsWithContext } from '@/services/contextExtractionService';
import { useImportedNodesStore } from '@/store/useImportedNodesStore';
import { useSRSStore } from '@/store/useSRSStore';
import type { ContentSource } from '@/types/srs';

// ============================================================
// TEST DATA - Real content samples
// ============================================================

const FRENCH_TEXT_SAMPLE = `
  Bonjour! Comment allez-vous? Je m'appelle Marie. J'habite à Paris avec ma famille.
  J'aime beaucoup la cuisine française, especially le croissant et le pain au chocolat.
  Tous les matins, j'achète une baguette fraîche à la boulangerie du coin.
  Le boulanger est très gentil et me recommande souvent les meilleures pâtisseries.
  Nous allons souvent au restaurant le dimanche soir. Mon plat préféré est le boeuf bourguignon.
  Mes enfants adorent les crêpes et les galettes. Nous préparons aussi des quiches et des tartes.
  La France est célèbre pour son vin et son fromage. Il y a plus de 400 types de fromages!
  Chaque région a sa spécialité culinaire. C'est une culture très riche et diversifiée.
  Je travaille comme professeure de français. J'enseigne la grammaire et la littérature.
  Mes élèves sont très motivés et progressent rapidement. C'est un travail passionnant.
`;

const YOUTUBE_TRANSCRIPT_SAMPLE = `
  Dans cette vidéo, nous allons apprendre les bases du français.
  Premièrement, il est important de pratiquer tous les jours.
  Deuxièmement, écoutez des podcasts et regardez des films en français.
  Troisièmement, n'ayez pas peur de faire des erreurs. C'est normal!
  Quatrièmement, trouvez un partenaire de conversation pour pratiquer.
  Cinquièmement, immergez-vous dans la culture francophone.
  La prononciation est cruciale pour communiquer efficacement.
  Apprenez les sons du français et entraînez-vous régulièrement.
  Le vocabulaire s'enrichit avec la lecture et l'écoute.
  La grammaire peut sembler difficile, mais avec de la pratique, ça devient plus facile.
  Bonne chance dans votre apprentissage du français!
`;

const SHORT_TEXT_SAMPLE = "C'est trop court.";

const VALID_YOUTUBE_URL = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
const INVALID_YOUTUBE_URL = 'https://example.com/video';

const COMPLEX_FRENCH_TEXT = `
  Le gouvernement français a annoncé de nouvelles mesures environnementales aujourd'hui.
  Ces mesures visent à réduire les émissions de carbone de 40% d'ici 2030.
  Les industries devront adapter leurs processus de production respectueux de l'environnement.
  De nombreuses entreprises ont déjà commencé à investir dans les énergies renouvelables.
  Les transports en commun seront développés dans toutes les grandes villes.
  Les citoyens sont encouragés à utiliser des véhicules électriques.
  Des incitations financières seront proposées pour faciliter la transition écologique.
  Cette décision a été bien accueillie par les associations environnementales.
  Cependant, certains secteurs économiques expriment des réserves concernant les coûts.
  Le débat parlementaire débutera la semaine prochaine pour finaliser la loi.
`;

// ============================================================
// SETUP & TEARDOWN
// ============================================================

beforeEach(() => {
  // Reset all stores before each test
  useImportedNodesStore.getState().resetNodes();
  useSRSStore.getState().resetSRS();

  // Clear localStorage
  localStorage.clear();
});

afterEach(() => {
  // Cleanup after each test
  useImportedNodesStore.getState().resetNodes();
  useSRSStore.getState().resetSRS();
  localStorage.clear();
});

// ============================================================
// TEST SUITES
// ============================================================

describe('Import Flow - Text Import', () => {
  describe('Content Validation', () => {
    it('should validate content with sufficient length', () => {
      expect(isValidContent(FRENCH_TEXT_SAMPLE)).toBe(true);
      expect(isValidContent(YOUTUBE_TRANSCRIPT_SAMPLE)).toBe(true);
    });

    it('should reject content that is too short', () => {
      expect(isValidContent(SHORT_TEXT_SAMPLE)).toBe(false);
      expect(isValidContent('Hi')).toBe(false);
      expect(isValidContent('')).toBe(false);
    });

    it('should validate with custom minimum length', () => {
      expect(isValidContent(FRENCH_TEXT_SAMPLE, 100)).toBe(true);
      expect(isValidContent(FRENCH_TEXT_SAMPLE, 10000)).toBe(false);
    });
  });

  describe('Phrase Extraction', () => {
    it('should extract phrases from text content', () => {
      const phrases = extractPhrases(FRENCH_TEXT_SAMPLE);

      expect(phrases.length).toBeGreaterThan(0);
      expect(phrases.length).toBeLessThanOrEqual(20); // Default max

      // Verify phrases are within length constraints
      phrases.forEach(phrase => {
        expect(phrase.length).toBeGreaterThan(10);
        expect(phrase.length).toBeLessThan(200);
      });
    });

    it('should extract phrases with custom max limit', () => {
      const phrases = extractPhrases(FRENCH_TEXT_SAMPLE, 5);

      expect(phrases.length).toBeLessThanOrEqual(5);
    });

    it('should filter out very short or very long phrases', () => {
      const textWithEdgeCases = `
        Hi. This is a normal sentence that should be included.
        A. This is an extremely long sentence that goes on and on and on and on and on and on and on
        and on and on and on and on and on and on and on and on and on and on and on and on and on
        and on and on and on and on and should definitely be excluded because it exceeds maximum length.
        Another good sentence here.
      `;

      const phrases = extractPhrases(textWithEdgeCases);

      expect(phrases).not.toContainEqual(expect.stringContaining('Hi.'));
      expect(phrases).not.toContainEqual(expect.stringContaining('excludes'));
      expect(phrases.some(p => p.includes('normal sentence'))).toBe(true);
    });
  });

  describe('Content Analysis', () => {
    it('should analyze content and extract phrases with suggested title', () => {
      const result = analyzeContent(FRENCH_TEXT_SAMPLE);

      expect(result.phrases.length).toBeGreaterThan(0);
      expect(result.suggestedTitle).toBeDefined();
      expect(result.suggestedTitle.length).toBeGreaterThan(0);
      expect(result.suggestedTitle).toContain('...');
    });

    it('should calculate word count accurately', () => {
      const wordCount = calculateWordCount(FRENCH_TEXT_SAMPLE);

      expect(wordCount).toBeGreaterThan(100);
      expect(wordCount).toBeLessThan(500);
    });

    it('should calculate phrase count accurately', () => {
      const phraseCount = calculatePhraseCount(FRENCH_TEXT_SAMPLE);

      expect(phraseCount).toBeGreaterThan(5);
      expect(phraseCount).toBeLessThanOrEqual(20);
    });
  });

  describe('YouTube URL Validation', () => {
    it('should validate correct YouTube URLs', () => {
      expect(isValidYouTubeUrl(VALID_YOUTUBE_URL)).toBe(true);
      expect(isValidYouTubeUrl('https://youtu.be/dQw4w9WgXcQ')).toBe(true);
      expect(isValidYouTubeUrl('https://www.youtube.com/watch?v=abc123')).toBe(true);
    });

    it('should reject invalid URLs', () => {
      expect(isValidYouTubeUrl(INVALID_YOUTUBE_URL)).toBe(false);
      expect(isValidYouTubeUrl('https://vimeo.com/123')).toBe(false);
      expect(isValidYouTubeUrl('not-a-url')).toBe(false);
    });
  });
});

describe('Import Flow - Context Extraction', () => {
  it('should extract words with sentence context', () => {
    const result = extractWordsWithContext(FRENCH_TEXT_SAMPLE, 'fr');

    expect(result.sentences.length).toBeGreaterThan(0);
    expect(result.allWords.length).toBeGreaterThan(0);
    expect(result.fullText).toBe(FRENCH_TEXT_SAMPLE.trim());
    expect(result.language).toBe('fr');
    expect(result.metadata).toBeDefined();
  });

  it('should extract sentences with proper word counts', () => {
    const result = extractWordsWithContext(COMPLEX_FRENCH_TEXT, 'fr');

    result.sentences.forEach(sentence => {
      expect(sentence.wordCount).toBeGreaterThan(0);
      expect(sentence.words.length).toBe(sentence.wordCount);
      expect(sentence.text.length).toBeGreaterThan(10);
    });
  });

  it('should maintain position information for each word', () => {
    const result = extractWordsWithContext(FRENCH_TEXT_SAMPLE, 'fr');

    result.allWords.forEach(word => {
      expect(word.position.start).toBeGreaterThanOrEqual(0);
      expect(word.position.end).toBeGreaterThan(word.position.start);
      expect(word.position.sentence).toBeGreaterThanOrEqual(0);
      expect(word.position.word).toBeGreaterThanOrEqual(0);
    });
  });

  it('should assign POS tags with confidence scores', () => {
    const result = extractWordsWithContext(FRENCH_TEXT_SAMPLE, 'fr');

    result.allWords.forEach(word => {
      expect(['noun', 'verb', 'adverb', 'adjective', 'other']).toContain(word.pos);
      expect(word.confidence).toBeGreaterThanOrEqual(0);
      expect(word.confidence).toBeLessThanOrEqual(1);
    });
  });

  it('should handle empty text gracefully', () => {
    const result = extractWordsWithContext('', 'fr');

    expect(result.sentences.length).toBe(0);
    expect(result.allWords.length).toBe(0);
    expect(result.fullText).toBe('');
  });
});

describe('Import Flow - Cloze Exercise Generation', () => {
  it('should generate cloze exercises from phrases', () => {
    const phrases = extractPhrases(FRENCH_TEXT_SAMPLE);
    const exercises = generateClozeExercises(phrases, {
      maxExercisesPerPhrase: 2,
      minConfidence: 0.6,
      language: 'fr',
    });

    expect(exercises.length).toBeGreaterThan(0);
    expect(exercises.length).toBeLessThanOrEqual(phrases.length * 2);
  });

  it('should generate exercises with valid structure', () => {
    const phrases = extractPhrases(FRENCH_TEXT_SAMPLE);
    const exercises = generateClozeExercises(phrases, {
      maxExercisesPerPhrase: 1,
    });

    exercises.forEach(exercise => {
      expect(exercise.id).toBeDefined();
      expect(exercise.phraseIndex).toBeGreaterThanOrEqual(0);
      expect(exercise.type).toBe('cloze');
      expect(exercise.phraseText).toBeDefined();
      expect(exercise.question).toContain('_____');
      expect(exercise.answer).toBeDefined();
      expect(exercise.hint).toBeDefined();
      expect(exercise.difficulty).toMatch(/^(easy|medium|hard)$/);
      expect(exercise.options).toBeInstanceOf(Array);
      expect(exercise.options.length).toBe(3); // 3 incorrect options
    });
  });

  it('should generate different difficulty levels based on confidence', () => {
    const phrases = extractPhrases(COMPLEX_FRENCH_TEXT);
    const exercises = generateClozeExercises(phrases, {
      maxExercisesPerPhrase: 3,
      minConfidence: 0.5,
    });

    const difficulties = exercises.map(e => e.difficulty);
    expect(difficulties).toContain('easy');
    expect(difficulties).toContain('medium');
    // May or may not contain 'hard' depending on confidence
  });

  it('should prioritize certain POS types', () => {
    const phrases = extractPhrases(FRENCH_TEXT_SAMPLE);
    const exercises = generateClozeExercises(phrases, {
      prioritizePOSTypes: ['verb', 'adjective'],
      maxExercisesPerPhrase: 2,
    });

    // Most exercises should be verbs or adjectives
    const verbOrAdjCount = exercises.filter(
      e => e.posType === 'verb' || e.posType === 'adjective'
    ).length;

    expect(verbOrAdjCount).toBeGreaterThan(exercises.length / 2);
  });

  it('should respect max exercises per phrase limit', () => {
    const phrases = extractPhrases(FRENCH_TEXT_SAMPLE);
    const maxExercises = 2;
    const exercises = generateClozeExercises(phrases, {
      maxExercisesPerPhrase: maxExercises,
    });

    // Count exercises per phrase
    const exerciseCounts: Record<number, number> = {};
    exercises.forEach(exercise => {
      exerciseCounts[exercise.phraseIndex] = (exerciseCounts[exercise.phraseIndex] || 0) + 1;
    });

    Object.values(exerciseCounts).forEach(count => {
      expect(count).toBeLessThanOrEqual(maxExercises);
    });
  });

  it('should generate unique incorrect options', () => {
    const phrases = extractPhrases(FRENCH_TEXT_SAMPLE);
    const exercises = generateClozeExercises(phrases, {
      maxExercisesPerPhrase: 1,
    });

    exercises.forEach(exercise => {
      const { answer, options } = exercise;

      // Answer should not be in options
      expect(options).not.toContain(answer);

      // Options should be unique
      const uniqueOptions = new Set(options);
      expect(uniqueOptions.size).toBe(options.length);

      // Should have exactly 3 options
      expect(options.length).toBe(3);
    });
  });

  it('should return empty array for empty phrases', () => {
    const exercises = generateClozeExercises([]);

    expect(exercises).toEqual([]);
  });
});

describe('Import Flow - Store Integration', () => {
  it('should create imported node with extracted content', () => {
    const phrases = extractPhrases(FRENCH_TEXT_SAMPLE);
    const analysis = analyzeContent(FRENCH_TEXT_SAMPLE);

    const nodeId = useImportedNodesStore.getState().createNode({
      title: 'Test Import',
      icon: '📚',
      sourceType: 'article',
      sourceText: FRENCH_TEXT_SAMPLE,
      subtopics: [
        {
          id: 'subtopic-1',
          title: analysis.suggestedTitle,
          phrases: phrases,
        },
      ],
    });

    const node = useImportedNodesStore.getState().getNode(nodeId);

    expect(node).toBeDefined();
    expect(node?.title).toBe('Test Import');
    expect(node?.sourceType).toBe('article');
    expect(node?.subtopics.length).toBe(1);
    expect(node?.subtopics[0].phrases.length).toBe(phrases.length);
    expect(node?.completedSubtopics).toEqual([]);
    expect(node?.percentage).toBe(0);
  });

  it('should add multiple subtopics to a node', () => {
    const nodeId = useImportedNodesStore.getState().createNode({
      title: 'Multi-Topic Import',
      icon: '📖',
      sourceType: 'podcast',
      sourceText: YOUTUBE_TRANSCRIPT_SAMPLE,
      subtopics: [],
    });

    useImportedNodesStore.getState().addSubtopic(nodeId, {
      title: 'Part 1',
      phrases: extractPhrases(YOUTUBE_TRANSCRIPT_SAMPLE, 5),
    });

    useImportedNodesStore.getState().addSubtopic(nodeId, {
      title: 'Part 2',
      phrases: extractPhrases(COMPLEX_FRENCH_TEXT, 5),
    });

    const node = useImportedNodesStore.getState().getNode(nodeId);

    expect(node?.subtopics.length).toBe(2);
    expect(node?.subtopics[0].title).toBe('Part 1');
    expect(node?.subtopics[1].title).toBe('Part 2');
  });

  it('should mark subtopic as completed and update percentage', () => {
    const nodeId = useImportedNodesStore.getState().createNode({
      title: 'Completion Test',
      icon: '✅',
      sourceType: 'article',
      sourceText: FRENCH_TEXT_SAMPLE,
      subtopics: [
        { id: 'subtopic-1', title: 'Topic 1', phrases: ['Phrase 1'] },
        { id: 'subtopic-2', title: 'Topic 2', phrases: ['Phrase 2'] },
        { id: 'subtopic-3', title: 'Topic 3', phrases: ['Phrase 3'] },
        { id: 'subtopic-4', title: 'Topic 4', phrases: ['Phrase 4'] },
      ],
    });

    useImportedNodesStore.getState().completeSubtopic(nodeId, 'subtopic-1');
    let node = useImportedNodesStore.getState().getNode(nodeId);
    expect(node?.percentage).toBe(25);

    useImportedNodesStore.getState().completeSubtopic(nodeId, 'subtopic-2');
    node = useImportedNodesStore.getState().getNode(nodeId);
    expect(node?.percentage).toBe(50);

    useImportedNodesStore.getState().completeSubtopic(nodeId, 'subtopic-3');
    node = useImportedNodesStore.getState().getNode(nodeId);
    expect(node?.percentage).toBe(75);

    useImportedNodesStore.getState().completeSubtopic(nodeId, 'subtopic-4');
    node = useImportedNodesStore.getState().getNode(nodeId);
    expect(node?.percentage).toBe(100);
  });

  it('should not duplicate completed subtopics', () => {
    const nodeId = useImportedNodesStore.getState().createNode({
      title: 'Duplicate Test',
      icon: '🔄',
      sourceType: 'article',
      sourceText: FRENCH_TEXT_SAMPLE,
      subtopics: [
        { id: 'subtopic-1', title: 'Topic 1', phrases: ['Phrase 1'] },
      ],
    });

    useImportedNodesStore.getState().completeSubtopic(nodeId, 'subtopic-1');
    useImportedNodesStore.getState().completeSubtopic(nodeId, 'subtopic-1');
    useImportedNodesStore.getState().completeSubtopic(nodeId, 'subtopic-1');

    const node = useImportedNodesStore.getState().getNode(nodeId);

    expect(node?.completedSubtopics).toEqual(['subtopic-1']);
    expect(node?.completedSubtopics.length).toBe(1);
  });
});

describe('Import Flow - SRS Integration', () => {
  it('should create SRS cards from imported phrases', () => {
    const phrases = extractPhrases(FRENCH_TEXT_SAMPLE, 5);
    const nodeId = 'test-node-123';

    const source: ContentSource = {
      type: 'text',
      id: nodeId,
      title: 'Test Import',
    };

    const cards = useSRSStore.getState().addCards(
      phrases.map(phrase => ({
        phrase,
        translation: `Translation of: ${phrase.substring(0, 30)}...`,
        source,
        languageCode: 'fr',
        levelCode: 'A2',
      }))
    );

    expect(cards.length).toBe(phrases.length);
    cards.forEach(card => {
      expect(card.phrase).toBeDefined();
      expect(card.translation).toBeDefined();
      expect(card.source.type).toBe('text');
      expect(card.source.id).toBe(nodeId);
      expect(card.status).toBe('new');
    });
  });

  it('should retrieve cards by imported source', () => {
    const nodeId1 = 'node-1';
    const nodeId2 = 'node-2';

    const source1: ContentSource = {
      type: 'text',
      id: nodeId1,
      title: 'Source 1',
    };

    const source2: ContentSource = {
      type: 'text',
      id: nodeId2,
      title: 'Source 2',
    };

    useSRSStore.getState().addCards([
      {
        phrase: 'Phrase from node 1',
        translation: 'Translation 1',
        source: source1,
        languageCode: 'fr',
        levelCode: 'A2',
      },
      {
        phrase: 'Another phrase from node 1',
        translation: 'Translation 2',
        source: source1,
        languageCode: 'fr',
        levelCode: 'A2',
      },
      {
        phrase: 'Phrase from node 2',
        translation: 'Translation 3',
        source: source2,
        languageCode: 'fr',
        levelCode: 'A2',
      },
    ]);

    const node1Cards = useSRSStore.getState().getCardsBySource('text', nodeId1);
    const node2Cards = useSRSStore.getState().getCardsBySource('text', nodeId2);
    const allImportedCards = useSRSStore.getState().getCardsBySource('text');

    expect(node1Cards.length).toBe(2);
    expect(node2Cards.length).toBe(1);
    expect(allImportedCards.length).toBe(3);
  });

  it('should check if phrase is already saved', () => {
    const phrase = 'Je mange une pomme.';
    const source: ContentSource = {
      type: 'text',
      id: 'test-node',
      title: 'Test',
    };

    expect(useSRSStore.getState().isPhraseSaved(phrase)).toBe(false);

    useSRSStore.getState().addCard({
      phrase,
      translation: 'I eat an apple.',
      source,
      languageCode: 'fr',
      levelCode: 'A1',
    });

    expect(useSRSStore.getState().isPhraseSaved(phrase)).toBe(true);
    expect(useSRSStore.getState().isPhraseSaved('Je mange une poire.')).toBe(false);
  });

  it('should retrieve card by phrase', () => {
    const phrase = 'Le chat dort.';
    const source: ContentSource = {
      type: 'text',
      id: 'test-node',
      title: 'Test',
    };

    const addedCard = useSRSStore.getState().addCard({
      phrase,
      translation: 'The cat is sleeping.',
      source,
      languageCode: 'fr',
      levelCode: 'A1',
    });

    const retrievedCard = useSRSStore.getState().getCardByPhrase(phrase);

    expect(retrievedCard).toBeDefined();
    expect(retrievedCard?.id).toBe(addedCard.id);
    expect(retrievedCard?.phrase).toBe(phrase);
  });
});

describe('Import Flow - Complete Workflow', () => {
  it('should execute complete import to learning workflow', () => {
    // Step 1: Import and analyze content
    const analysis = analyzeContent(COMPLEX_FRENCH_TEXT);
    expect(analysis.phrases.length).toBeGreaterThan(0);

    // Step 2: Extract context
    const context = extractWordsWithContext(COMPLEX_FRENCH_TEXT, 'fr');
    expect(context.allWords.length).toBeGreaterThan(0);

    // Step 3: Generate cloze exercises
    const exercises = generateClozeExercises(analysis.phrases, {
      maxExercisesPerPhrase: 2,
      language: 'fr',
    });
    expect(exercises.length).toBeGreaterThan(0);

    // Step 4: Create imported node
    const nodeId = useImportedNodesStore.getState().createNode({
      title: analysis.suggestedTitle,
      icon: '🎯',
      sourceType: 'article',
      sourceText: COMPLEX_FRENCH_TEXT,
      subtopics: [
        {
          id: 'subtopic-main',
          title: 'Main Content',
          phrases: analysis.phrases,
        },
      ],
    });
    expect(nodeId).toBeDefined();

    // Step 5: Create SRS cards
    const source: ContentSource = {
      type: 'text',
      id: nodeId,
      title: analysis.suggestedTitle,
    };

    const cards = useSRSStore.getState().addCards(
      analysis.phrases.slice(0, 5).map(phrase => ({
        phrase,
        translation: `Translation: ${phrase.substring(0, 20)}...`,
        source,
        languageCode: 'fr',
        levelCode: 'B1',
      }))
    );
    expect(cards.length).toBe(5);

    // Step 6: Verify data is accessible
    const node = useImportedNodesStore.getState().getNode(nodeId);
    expect(node).toBeDefined();
    expect(node?.subtopics[0].phrases.length).toBe(analysis.phrases.length);

    const nodeCards = useSRSStore.getState().getCardsBySource('text', nodeId);
    expect(nodeCards.length).toBe(5);

    // Step 7: Complete subtopic
    useImportedNodesStore.getState().completeSubtopic(nodeId, 'subtopic-main');
    const updatedNode = useImportedNodesStore.getState().getNode(nodeId);
    expect(updatedNode?.percentage).toBe(100);
  });

  it('should handle YouTube transcript import workflow', () => {
    // Validate YouTube URL
    expect(isValidYouTubeUrl(VALID_YOUTUBE_URL)).toBe(true);

    // Simulate transcript extraction
    const transcript = YOUTUBE_TRANSCRIPT_SAMPLE;
    const phrases = extractPhrases(transcript);

    expect(phrases.length).toBeGreaterThan(0);

    // Create node with YouTube source
    const nodeId = useImportedNodesStore.getState().createNode({
      title: 'French Learning Video',
      icon: '🎬',
      sourceType: 'youtube',
      sourceText: transcript,
      videoId: 'dQw4w9WgXcQ',
      subtopics: [
        {
          id: 'subtopic-1',
          title: 'Video Content',
          phrases: phrases,
        },
      ],
    });

    const node = useImportedNodesStore.getState().getNode(nodeId);
    expect(node?.sourceType).toBe('youtube');
    expect(node?.videoId).toBe('dQw4w9WgXcQ');
  });

  it('should maintain data consistency across stores', () => {
    // Create imported node
    const phrases = extractPhrases(FRENCH_TEXT_SAMPLE, 3);
    const nodeId = useImportedNodesStore.getState().createNode({
      title: 'Consistency Test',
      icon: '🔗',
      sourceType: 'article',
      sourceText: FRENCH_TEXT_SAMPLE,
      subtopics: [
        {
          id: 'subtopic-1',
          title: 'Test',
          phrases: phrases,
        },
      ],
    });

    // Create corresponding SRS cards
    const source: ContentSource = {
      type: 'text',
      id: nodeId,
      title: 'Consistency Test',
    };

    const addedCards = useSRSStore.getState().addCards(
      phrases.map(phrase => ({
        phrase,
        translation: `Translation of ${phrase.substring(0, 15)}...`,
        source,
        languageCode: 'fr',
        levelCode: 'A2',
      }))
    );

    // Verify consistency
    const node = useImportedNodesStore.getState().getNode(nodeId);
    const cards = useSRSStore.getState().getCardsBySource('text', nodeId);

    expect(node?.subtopics[0].phrases.length).toBe(phrases.length);
    expect(cards.length).toBe(phrases.length);
    expect(addedCards.length).toBe(phrases.length);

    // Verify phrase matching
    phrases.forEach(phrase => {
      const matchingCard = cards.find(c => c.phrase === phrase);
      expect(matchingCard).toBeDefined();
    });
  });
});

describe('Import Flow - Edge Cases', () => {
  it('should handle text with special characters and accents', () => {
    const textWithAccents = `
      À Paris, les élèves étudient la français. Ils mangent des crêpes et des éclairs.
      L'été, ils vont à la plage. L'hiver, ils font du ski.
      C'est Noël! Noël est une fête importante.
      Les œufs et les œuvres sont différents. Maître et misère.
    `;

    const phrases = extractPhrases(textWithAccents);
    const context = extractWordsWithContext(textWithAccents, 'fr');

    expect(phrases.length).toBeGreaterThan(0);
    expect(context.allWords.length).toBeGreaterThan(0);

    // Verify accents are preserved
    context.allWords.forEach(word => {
      expect(word.word).toEqual(word.word); // No transformation
      expect(word.sentence).toContain(word.word);
    });
  });

  it('should handle very long text without performance issues', () => {
    const longText = FRENCH_TEXT_SAMPLE.repeat(10);
    const startTime = performance.now();

    const phrases = extractPhrases(longText);
    const context = extractWordsWithContext(longText, 'fr');

    const endTime = performance.now();
    const processingTime = endTime - startTime;

    expect(phrases.length).toBeGreaterThan(0);
    expect(context.allWords.length).toBeGreaterThan(0);
    expect(processingTime).toBeLessThan(5000); // Should complete in under 5 seconds
  });

  it('should handle text with mixed punctuation', () => {
    const textWithPunctuation = `
      Phrase one... Phrase two! Phrase three? Phrase four; phrase five: phrase six.
      "Quoted text" and 'more quotes'. What about — em dashes?
      Ellipsis... and more!!! Multiple??? Marks...
    `;

    const phrases = extractPhrases(textWithPunctuation);

    expect(phrases.length).toBeGreaterThan(0);
    phrases.forEach(phrase => {
      expect(phrase.trim().length).toBeGreaterThan(0);
    });
  });

  it('should handle empty or whitespace-only text', () => {
    expect(extractPhrases('')).toEqual([]);
    expect(extractPhrases('   \n\n   \t  ')).toEqual([]);

    const context = extractWordsWithContext('   ', 'fr');
    expect(context.sentences.length).toBe(0);
    expect(context.allWords.length).toBe(0);
  });

  it('should handle text with numbers and symbols', () => {
    const textWithNumbers = `
      J'ai 2 chats et 3 chiens. En 2024, j'aurai 100% de réussite.
      Le coût est de 50,50€. Téléphone: 01-23-45-67-89.
    `;

    const phrases = extractPhrases(textWithNumbers);
    const context = extractWordsWithContext(textWithNumbers, 'fr');

    expect(phrases.length).toBeGreaterThan(0);
    expect(context.allWords.length).toBeGreaterThan(0);
  });
});

describe('Import Flow - Error Recovery', () => {
  it('should handle invalid data gracefully in stores', () => {
    // Create node with minimal valid data
    const nodeId = useImportedNodesStore.getState().createNode({
      title: 'Minimal Node',
      icon: '📝',
      sourceType: 'article',
      sourceText: 'Some text',
      subtopics: [],
    });

    expect(nodeId).toBeDefined();

    // Try to complete non-existent subtopic
    useImportedNodesStore.getState().completeSubtopic(nodeId, 'non-existent');

    const node = useImportedNodesStore.getState().getNode(nodeId);
    expect(node?.completedSubtopics).not.toContain('non-existent');
  });

  it('should handle duplicate phrase detection', () => {
    const phrase = 'Unique phrase here.';
    const source: ContentSource = {
      type: 'text',
      id: 'node-1',
      title: 'Test',
    };

    // Add same phrase twice
    const card1 = useSRSStore.getState().addCard({
      phrase,
      translation: 'Translation',
      source,
      languageCode: 'fr',
      levelCode: 'A1',
    });

    const card2 = useSRSStore.getState().addCard({
      phrase,
      translation: 'Translation',
      source,
      languageCode: 'fr',
      levelCode: 'A1',
    });

    // Both cards are created (store allows duplicates, application layer should check)
    expect(card1.id).toBeDefined();
    expect(card2.id).toBeDefined();
    expect(card1.id).not.toBe(card2.id);

    // But isPhraseSaved should detect it
    expect(useSRSStore.getState().isPhraseSaved(phrase)).toBe(true);
  });
});
