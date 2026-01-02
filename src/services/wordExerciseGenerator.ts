/**
 * Servicio para generar ejercicios Cloze y Detection desde cards de palabras individuales
 */

import { SRSCard } from '@/types/srs';
import { Phrase, ClozeOption } from '@/types';

/**
 * Genera un ejercicio Cloze para una palabra individual
 * La palabra aparece en el contexto de la frase original
 */
export function generateClozeExerciseFromWord(card: SRSCard): Phrase {
  const word = card.phrase;
  const context = card.source.context || card.notes || '';
  
  // Extraer frase de ejemplo del contexto si está disponible
  let examplePhrase = context;
  if (context.includes('Ejemplo: "')) {
    const match = context.match(/Ejemplo: "([^"]+)"/);
    if (match) {
      examplePhrase = match[1];
    }
  }
  
  // Si no hay frase de ejemplo, crear una simple
  if (!examplePhrase || examplePhrase.length < 10) {
    examplePhrase = `Je dois ${word} demain.`; // Ejemplo genérico
  }
  
  // Crear opciones para el Cloze
  // La palabra correcta + 3 distractores
  const correctOption: ClozeOption = {
    id: 'correct',
    text: word,
    isCorrect: true,
  };
  
  // Generar distractores (palabras similares o comunes)
  const distractors = generateDistractors(word, card.tags);
  
  const clozeOptions: ClozeOption[] = [
    correctOption,
    ...distractors.map((text, idx) => ({
      id: `distractor-${idx}`,
      text,
      isCorrect: false,
    })),
  ].slice(0, 4); // Asegurar exactamente 4 opciones
  
  // Mezclar opciones
  const shuffledOptions = [...clozeOptions].sort(() => Math.random() - 0.5);
  
  return {
    id: `cloze-${card.id}`,
    text: examplePhrase.replace(new RegExp(`\\b${word}\\b`, 'gi'), '______'),
    translation: card.translation,
    audioUrl: card.audioUrl,
    clozeWord: word,
    clozeOptions: shuffledOptions,
    variations: [], // Las variaciones se pueden generar después si es necesario
  };
}

/**
 * Genera distractores para ejercicios Cloze
 */
function generateDistractors(word: string, tags: string[]): string[] {
  const distractors: string[] = [];
  
  // Distractores comunes según el tipo de palabra
  if (tags.includes('verb')) {
    // Verbos similares o comunes
    distractors.push('faire', 'aller', 'venir', 'pouvoir', 'vouloir');
  } else if (tags.includes('noun')) {
    // Sustantivos comunes
    distractors.push('chose', 'personne', 'moment', 'jour', 'maison');
  } else if (tags.includes('adverb')) {
    // Adverbios comunes
    distractors.push('très', 'beaucoup', 'bien', 'mal', 'toujours');
  } else if (tags.includes('adjective')) {
    // Adjetivos comunes
    distractors.push('bon', 'mauvais', 'grand', 'petit', 'nouveau');
  }
  
  // Filtrar la palabra correcta y devolver 3 distractores únicos
  return distractors
    .filter(d => d.toLowerCase() !== word.toLowerCase())
    .slice(0, 3);
}

/**
 * Genera un ejercicio Detection para una palabra individual
 * El usuario debe detectar la palabra en un audio
 */
export function generateDetectionExerciseFromWord(card: SRSCard) {
  const word = card.phrase;
  const context = card.source.context || card.notes || '';
  
  // Extraer frase de ejemplo
  let examplePhrase = context;
  if (context.includes('Ejemplo: "')) {
    const match = context.match(/Ejemplo: "([^"]+)"/);
    if (match) {
      examplePhrase = match[1];
    }
  }
  
  if (!examplePhrase || examplePhrase.length < 10) {
    examplePhrase = `Je dois ${word} demain.`;
  }
  
  return {
    id: `detection-${card.id}`,
    targetWord: word,
    audioText: examplePhrase,
    translation: card.translation,
    audioUrl: card.audioUrl,
    context: examplePhrase,
  };
}

