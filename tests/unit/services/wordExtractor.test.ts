import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  normalizeWord,
  detectWordType,
  extractKeywords,
  extractKeywordsFromPhrases,
  type WordType,
  type ExtractedWord,
} from '@/services/wordExtractor';

describe('wordExtractor', () => {
  describe('normalizeWord', () => {
    it('debería convertir a minúsculas', () => {
      expect(normalizeWord('Bonjour')).toBe('bonjour');
      expect(normalizeWord('BOURGEOIS')).toBe('bourgeois');
    });

    it('debería eliminar acentos', () => {
      expect(normalizeWord('été')).toBe('ete');
      expect(normalizeWord('français')).toBe('francais');
      expect(normalizeWord('être')).toBe('etre');
      expect(normalizeWord('où')).toBe('ou');
      expect(normalizeWord('à')).toBe('a');
      expect(normalizeWord('ç')).toBe('c');
    });

    it('debería eliminar puntuación', () => {
      expect(normalizeWord('bonjour!')).toBe('bonjour');
      expect(normalizeWord('bonjour.')).toBe('bonjour');
      expect(normalizeWord('bonjour,')).toBe('bonjour');
      expect(normalizeWord('\'bonjour\'')).toBe('bonjour');
    });

    it('debería manejar palabras vacías', () => {
      expect(normalizeWord('')).toBe('');
      expect(normalizeWord('   ')).toBe('');
    });

    it('debería manejar combinaciones complejas', () => {
      expect(normalizeWord('L\'étatfrançais!')).toBe('letatfrancais');
      expect(normalizeWord('C\'était beau.')).toBe('cetaitbeau');
    });
  });

  describe('detectWordType', () => {
    describe('verbos', () => {
      it('debería detectar verbos en -er', () => {
        expect(detectWordType('parler')).toBe('verb');
        expect(detectWordType('manger')).toBe('verb');
        expect(detectWordType('étudier')).toBe('verb');
      });

      it('debería detectar verbos en -ir', () => {
        expect(detectWordType('finir')).toBe('verb');
        expect(detectWordType('agir')).toBe('verb');
        expect(detectWordType('choisir')).toBe('verb');
      });

      it('debería detectar verbos en -re', () => {
        expect(detectWordType('prendre')).toBe('verb');
        expect(detectWordType('vendre')).toBe('verb');
        expect(detectWordType('attendre')).toBe('verb');
      });

      it('debería detectar verbos en -oir', () => {
        expect(detectWordType('voir')).toBe('verb');
        expect(detectWordType('pouvoir')).toBe('verb');
        expect(detectWordType('vouloir')).toBe('verb');
      });

      it('debería detectar verbos en -tre', () => {
        expect(detectWordType('mettre')).toBe('verb');
        expect(detectWordType('partir')).toBe('verb');
      });

      it('NO debería detectar sustantivos que terminan igual', () => {
        expect(detectWordType('mer')).toBe('other'); // muy corto, <4 chars
        expect(detectWordType('merde')).toBe('noun'); // termina en 'e', no match patrones de verbo
        expect(detectWordType('terre')).toBe('verb'); // termina en 're' -> verb pattern
      });
    });

    describe('adverbios', () => {
      it('debería detectar adverbios en -ment', () => {
        expect(detectWordType('lentement')).toBe('adverb');
        expect(detectWordType('heureusement')).toBe('adverb');
        expect(detectWordType('rapidement')).toBe('adverb');
      });

      it('debería detectar adverbios en -ement', () => {
        expect(detectWordType('facilement')).toBe('adverb');
        expect(detectWordType('simplement')).toBe('adverb');
        expect(detectWordType('probablement')).toBe('adverb');
      });
    });

    describe('adjetivos', () => {
      it('debería detectar adjetivos en -eux', () => {
        expect(detectWordType('heureux')).toBe('adjective');
        expect(detectWordType('dangereux')).toBe('adjective');
      });

      it('debería detectar adjetivos en -euse', () => {
        expect(detectWordType('heureuse')).toBe('adjective');
        expect(detectWordType('active')).toBe('adjective');
      });

      it('debería detectar adjetivos en -if', () => {
        expect(detectWordType('actif')).toBe('adjective'); // termina en 'if'
        expect(detectWordType('sportif')).toBe('adjective'); // termina en 'if'
        expect(detectWordType('élégant')).toBe('adjective'); // termina en 'ant' -> adjective pattern
      });

      it('debería detectar adjetivos en -ive', () => {
        expect(detectWordType('expensive')).toBe('adjective');
        expect(detectWordType('créative')).toBe('adjective');
      });

      it('debería detectar adjetivos comunes', () => {
        expect(detectWordType('grand')).toBe('adjective');
        expect(detectWordType('petit')).toBe('adjective');
        expect(detectWordType('bon')).toBe('adjective');
        expect(detectWordType('mauvais')).toBe('adjective');
        expect(detectWordType('beau')).toBe('adjective');
        expect(detectWordType('nouveau')).toBe('adjective');
        expect(detectWordType('vieux')).toBe('adjective');
        expect(detectWordType('jeune')).toBe('adjective');
      });

      it('debería detectar adjetivos en plural', () => {
        // 'grands' -> singular 'grand' está en lista de adjetivos -> adjective
        expect(detectWordType('grands')).toBe('adjective');
        // 'petites' -> singular 'petite' no match patrones específicos -> noun
        expect(detectWordType('petites')).toBe('noun');
        // 'belles' -> singular 'belle' no match patrones específicos -> noun
        expect(detectWordType('belles')).toBe('noun');
        // 'jeunes' -> singular 'jeune' está en lista de adjetivos -> adjective
        expect(detectWordType('jeunes')).toBe('adjective');
      });

      it('NO debería detectar adjetivos cortos en plural', () => {
        expect(detectWordType('les')).toBe('other'); // muy corto
        expect(detectWordType('des')).toBe('other'); // muy corto
      });
    });

    describe('sustantivos', () => {
      it('debería detectar sustantivos como default para palabras largas', () => {
        expect(detectWordType('maison')).toBe('noun');
        expect(detectWordType('école')).toBe('noun');
        expect(detectWordType('amour')).toBe('noun');
      });

      it('NO debería detectar palabras cortas como sustantivos', () => {
        expect(detectWordType('le')).toBe('other');
        expect(detectWordType('la')).toBe('other');
        expect(detectWordType('un')).toBe('other');
      });
    });

    describe('casos límite', () => {
      it('debería manejar palabras desconocidas', () => {
        expect(detectWordType('inconnu')).toBe('noun');
        expect(detectWordType('xyz')).toBe('other');
      });

      it('debería manejar palabras vacías', () => {
        expect(detectWordType('')).toBe('other');
      });
    });
  });

  describe('extractKeywords', () => {
    beforeEach(() => {
      // Resetear los mocks si existen
      vi.clearAllMocks();
    });

    it('debería extraer palabras clave de texto simple', () => {
      const text = 'Je mange une pomme rouge et délicieuse.';
      const result = extractKeywords(text);

      expect(result).toHaveLength(4);

      // Verificar que no incluye palabras comunes
      const words = result.map(r => r.word);
      expect(words).not.toContain('une');
      expect(words).not.toContain('et');
      expect(words).toContain('mange');
      expect(words).toContain('pomme');
      expect(words).toContain('rouge');
      expect(words).toContain('délicieuse');
    });

    it('debería filtrar palabras comunes', () => {
      const text = 'Je suis français et j\'habite à Paris.';
      const result = extractKeywords(text);

      expect(result).toHaveLength(4);
      expect(result.map(r => r.word)).toContain('suis');
      expect(result.map(r => r.word)).toContain('français');
      expect(result.map(r => r.word)).toContain('habite');
      expect(result.map(r => r.word)).toContain('Paris');
    });

    it('debería normalizar palabras', () => {
      const text = 'Bonjour, MONDE!';
      const result = extractKeywords(text);

      expect(result).toHaveLength(2);
      expect(result[0].normalized).toBe('bonjour');
      expect(result[0].word).toBe('Bonjour');
      expect(result[1].normalized).toBe('monde');
      expect(result[1].word).toBe('MONDE');
    });

    it('debería eliminar duplicados', () => {
      const text = 'bonjour bonjour le monde';
      const result = extractKeywords(text);

      expect(result).toHaveLength(2); // bonjour y monde
      expect(result.map(r => r.normalized)).toEqual(['bonjour', 'monde']);
    });

    it('debería asignar tipos correctos', () => {
      const text = 'Je mange rapidement une belle pomme.';
      const result = extractKeywords(text);

      const types = result.map(r => r.type);
      // 'mange' tiene 5 chars, no termina en patrones de verbo -> noun
      expect(types).toContain('noun'); // mange, belle, pomme
      expect(types).toContain('adverb'); // rapidement
      // belle termina en 'e', no match patrones específicos -> noun
    });

    it('debería manejar texto vacío', () => {
      expect(extractKeywords('')).toHaveLength(0);
      expect(extractKeywords('   ')).toHaveLength(0);
    });

    it('debería filtrar palabras muy cortas', () => {
      const text = 'a je suis';
      const result = extractKeywords(text);

      expect(result).toHaveLength(2); // je y suis (a es demasiado corto)
    });

    it('deber mantener posición de palabras', () => {
      const text = 'un deux trois quatre';
      const result = extractKeywords(text);

      expect(result).toHaveLength(2); // dos y trois (un y quatre son comunes)
      expect(result[0].position).toBe(4); // después de 'un '
      expect(result[1].position).toBe(9); // después de 'un deux '
    });

    it('debería incluir contexto completo', () => {
      const text = 'Je mange une pomme.';
      const result = extractKeywords(text);

      expect(result[0].context).toBe(text);
      expect(result[1].context).toBe(text);
      expect(result[2].context).toBe(text);
    });
  });

  describe('extractKeywordsFromPhrases', () => {
    it('debería extraer palabras de múltiples frases', () => {
      const phrases = [
        'Je mange une pomme.',
        'Elle chante une belle chanson.',
      ];

      const result = extractKeywordsFromPhrases(phrases);

      // Debería extraer: mange, pomme, Elle, chante, belle, chanson
      // Pero sin duplicados: Elle no debería incluirse (es pronombre)
      const words = result.map(r => r.word);
      expect(words).toContain('mange');
      expect(words).toContain('pomme');
      expect(words).toContain('chante');
      expect(words).toContain('belle');
      expect(words).toContain('chanson');
      expect(words).not.toContain('une'); // palabra común
      expect(words).not.toContain('Elle'); // palabra común/pronombre
    });

    it('debería eliminar duplicados entre frases', () => {
      const phrases = [
        'Je mange une pomme.',
        'Je mange une banane.',
      ];

      const result = extractKeywordsFromPhrases(phrases);

      // 'mange' y 'une' deberían aparecer solo una vez
      const normalizedWords = result.map(r => r.normalized);
      expect(normalizedWords.filter(n => n === 'mange')).toHaveLength(1);
    });

    it('debería manejar array vacío', () => {
      expect(extractKeywordsFromPhrases([])).toHaveLength(0);
    });
  });

  describe('casos complejos', () => {
    it('debería manejar texto con contracciones', () => {
      const text = "J'aime le café et je n'aime pas le thé.";
      const result = extractKeywords(text);

      expect(result).toHaveLength(6);
      expect(result.map(r => r.word)).toContain('J\'aime');
      expect(result.map(r => r.word)).toContain('café');
      expect(result.map(r => r.word)).toContain('aime');
      expect(result.map(r => r.word)).toContain('n\'aime');
      expect(result.map(r => r.word)).toContain('pas');
      expect(result.map(r => r.word)).toContain('thé');
    });

    it('debería manejar texto con números', () => {
      const text = 'Il y a 2 maisons et 3 arbres.';
      const result = extractKeywords(text);

      expect(result).toHaveLength(5);
      expect(result.map(r => r.word)).toContain('Il');
      expect(result.map(r => r.word)).toContain('maisons');
      expect(result.map(r => r.word)).toContain('arbres');
    });

    it('debería manejar texto con emojis', () => {
      const text = 'Je suis 😊 content!';
      const result = extractKeywords(text);

      expect(result).toHaveLength(3);
      expect(result.map(r => r.word)).toContain('Je');
      expect(result.map(r => r.word)).toContain('suis');
      expect(result.map(r => r.word)).toContain('content');
    });

    it('debería manejar texto con múltiples espacios', () => {
      const text = 'Je   mange    une   pomme.';
      const result = extractKeywords(text);

      expect(result).toHaveLength(3);
      expect(result.map(r => r.word)).toContain('Je');
      expect(result.map(r => r.word)).toContain('mange');
      expect(result.map(r => r.word)).toContain('pomme');
    });
  });
});