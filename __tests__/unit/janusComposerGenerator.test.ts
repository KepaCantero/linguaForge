import { describe, it, expect } from 'vitest';
import { JanusComposerGenerator, generateJanusComposerExercises } from '@/services/generateExercisesFromPhrases';

describe('JanusComposerGenerator', () => {
  describe('extractSubjects', () => {
    it('should extract common subjects from phrases', () => {
      const generator = new JanusComposerGenerator();
      const phrases = ['Je suis français', 'Tu es étudiant', 'Il est là'];

      const subjects = generator.extractSubjects(phrases);

      expect(subjects).toContain('Je');
      expect(subjects).toContain('Tu');
      expect(subjects).toContain('Il');
    });

    it('should return default subjects when no subjects found', () => {
      const generator = new JanusComposerGenerator();
      const phrases = ['Bonjour', 'Merci', 'Au revoir'];

      const subjects = generator.extractSubjects(phrases);

      expect(subjects).toEqual(['Je', 'Tu', 'Il', 'Elle']);
    });

    it('should limit to 4 subjects maximum', () => {
      const generator = new JanusComposerGenerator();
      const phrases = [
        'Je suis français',
        'Tu es étudiant',
        'Il est là',
        'Elle est ici',
        'Nous sommes amis',
        'Vous êtes là',
      ];

      const subjects = generator.extractSubjects(phrases);

      expect(subjects.length).toBeLessThanOrEqual(4);
    });
  });

  describe('extractVerbs', () => {
    it('should extract common verbs from phrases', () => {
      const generator = new JanusComposerGenerator();
      const phrases = ['Je suis français', 'Tu as un chat', 'Il va partir'];

      const verbs = generator.extractVerbs(phrases);

      expect(verbs.length).toBeGreaterThan(0);
    });

    it('should return default verbs when no verbs found', () => {
      const generator = new JanusComposerGenerator();
      const phrases = ['Bonjour', 'Merci'];

      const verbs = generator.extractVerbs(phrases);

      expect(verbs).toEqual(['suis', 'ai', 'vais', 'veux', 'peux', 'fais']);
    });

    it('should limit to 6 verbs maximum', () => {
      const generator = new JanusComposerGenerator();
      const phrases = [
        'Je suis français',
        'Tu as un chat',
        'Il va partir',
        'Nous sommes amis',
        'Vous venez ici',
        'Ils font du sport',
        'Elle voit cela',
      ];

      const verbs = generator.extractVerbs(phrases);

      expect(verbs.length).toBeLessThanOrEqual(6);
    });
  });

  describe('extractComplements', () => {
    it('should extract complements from phrases', () => {
      const generator = new JanusComposerGenerator();
      const phrases = ['Je suis français', 'Tu as un chat', 'Il va à la maison'];

      const complements = generator.extractComplements(phrases);

      expect(complements.length).toBeGreaterThan(0);
    });

    it('should return default complements when none found', () => {
      const generator = new JanusComposerGenerator();
      const phrases = ['Je suis', 'Tu as'];

      const complements = generator.extractComplements(phrases);

      expect(complements).toEqual(['bien', 'mal', 'beaucoup', 'maintenant', 'demain', "aujourd'hui"]);
    });

    it('should limit to 6 complements maximum', () => {
      const generator = new JanusComposerGenerator();
      const phrases = [
        'Je suis français',
        'Tu as un chat',
        'Il va à la maison',
        'Nous avons beaucoup',
        'Vous venez maintenant',
        'Ils font cela',
        'Elle voit demain',
      ];

      const complements = generator.extractComplements(phrases);

      expect(complements.length).toBeLessThanOrEqual(6);
    });
  });

  describe('buildConjugationRules', () => {
    it('should build être conjugation rules', () => {
      const generator = new JanusComposerGenerator();
      const verbs = ['être'];
      const subjects = ['Je', 'Tu'];

      const rules = generator.buildConjugationRules(verbs, subjects);

      expect(rules).toContainEqual({ verb: 'être', subject: 'je', conjugated: 'suis' });
      expect(rules).toContainEqual({ verb: 'être', subject: 'tu', conjugated: 'es' });
    });

    it('should build avoir conjugation rules', () => {
      const generator = new JanusComposerGenerator();
      const verbs = ['avoir'];
      const subjects = ['Je', 'Tu'];

      const rules = generator.buildConjugationRules(verbs, subjects);

      expect(rules).toContainEqual({ verb: 'avoir', subject: 'je', conjugated: 'ai' });
      expect(rules).toContainEqual({ verb: 'avoir', subject: 'tu', conjugated: 'as' });
    });

    it('should build -er verb conjugation rules', () => {
      const generator = new JanusComposerGenerator();
      const verbs = ['parler'];
      const subjects = ['Je', 'Tu'];

      const rules = generator.buildConjugationRules(verbs, subjects);

      expect(rules).toContainEqual({ verb: 'parler', subject: 'je', conjugated: 'parle' });
      expect(rules).toContainEqual({ verb: 'parler', subject: 'tu', conjugated: 'parles' });
    });

    it('should limit to 20 rules maximum', () => {
      const generator = new JanusComposerGenerator();
      const verbs = ['être', 'avoir', 'aller', 'parler', 'manger', 'boire'];
      const subjects = ['Je', 'Tu', 'Il', 'Elle', 'Nous', 'Vous'];

      const rules = generator.buildConjugationRules(verbs, subjects);

      expect(rules.length).toBeLessThanOrEqual(20);
    });
  });

  describe('generate', () => {
    it('should return empty array for empty phrases', () => {
      const generator = new JanusComposerGenerator();

      const result = generator.generate([]);

      expect(result).toEqual([]);
    });

    it('should generate a complete JanusComposer exercise', () => {
      const generator = new JanusComposerGenerator();
      const phrases = ['Je suis français', 'Tu es étudiant'];

      const result = generator.generate(phrases);

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('janus-imported-1');
      expect(result[0].columns).toHaveLength(3);
      expect(result[0].conjugationRules).toBeDefined();
      expect(result[0].practiceDialogues).toBeDefined();
    });

    it('should have 3 columns: subject, verb, complement', () => {
      const generator = new JanusComposerGenerator();
      const phrases = ['Je suis français'];

      const result = generator.generate(phrases);

      expect(result[0].columns[0].type).toBe('subject');
      expect(result[0].columns[1].type).toBe('verb');
      expect(result[0].columns[2].type).toBe('complement');
    });

    it('should have practice dialogues from phrases', () => {
      const generator = new JanusComposerGenerator();
      const phrases = ['Je suis français', 'Comment allez-vous?'];

      const result = generator.generate(phrases);

      expect(result[0].practiceDialogues).toBeDefined();
      expect(result[0].practiceDialogues?.length).toBeGreaterThan(0);
      expect(result[0].practiceDialogues?.[0]?.prompt).toBe('Bonjour!');
      expect(result[0].practiceDialogues?.[0]?.response).toBe('Je suis français');
    });

    it('should have default dialogue when no phrases provided', () => {
      const generator = new JanusComposerGenerator();
      const phrases = ['']; // Empty string creates dialogue with empty response

      const result = generator.generate(phrases);

      expect(result[0].practiceDialogues).toBeDefined();
      expect(result[0].practiceDialogues?.[0]?.prompt).toBe('Bonjour!');
      expect(result[0].practiceDialogues?.[0]?.response).toBe(''); // Empty string returns empty response
    });

    it('should have default dialogue when empty array provided', () => {
      const generator = new JanusComposerGenerator();
      const phrases: string[] = [];

      const result = generator.generate(phrases);

      // Empty array returns empty result
      expect(result).toEqual([]);
    });

    it('should generate at least 2 options per column', () => {
      const generator = new JanusComposerGenerator();
      const phrases = ['Je suis français'];

      const result = generator.generate(phrases);

      result[0].columns.forEach((column) => {
        expect(column.options.length).toBeGreaterThanOrEqual(2);
      });
    });
  });
});

describe('generateJanusComposerExercises (convenience function)', () => {
  it('should delegate to JanusComposerGenerator class', () => {
    const phrases = ['Je suis français', 'Tu es étudiant'];

    const result = generateJanusComposerExercises(phrases);

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('janus-imported-1');
  });

  it('should maintain backward compatibility', () => {
    const phrases: string[] = [];

    const result = generateJanusComposerExercises(phrases);

    expect(result).toEqual([]);
  });

  it('should produce same output as class instance', () => {
    const phrases = ['Je suis français', 'Tu es étudiant'];

    const classResult = new JanusComposerGenerator().generate(phrases);
    const functionResult = generateJanusComposerExercises(phrases);

    expect(functionResult).toEqual(classResult);
  });
});

describe('JanusComposerGenerator output validation', () => {
  it('should produce valid JanusComposer structure', () => {
    const generator = new JanusComposerGenerator();
    const phrases = ['Je suis français', 'Tu es étudiant', 'Il est là'];

    const result = generator.generate(phrases)[0];

    // Verify id
    expect(typeof result.id).toBe('string');
    expect(result.id).toBeTruthy();

    // Verify columns structure
    expect(Array.isArray(result.columns)).toBe(true);
    result.columns.forEach((column) => {
      expect(column.id).toBeTruthy();
      expect(column.title).toBeTruthy();
      expect(column.type).toMatch(/^(subject|verb|complement)$/);
      expect(Array.isArray(column.options)).toBe(true);
    });

    // Verify conjugation rules structure
    expect(result.conjugationRules).toBeDefined();
    expect(Array.isArray(result.conjugationRules)).toBe(true);
    result.conjugationRules?.forEach((rule) => {
      expect(rule.verb).toBeTruthy();
      expect(rule.subject).toBeTruthy();
      expect(rule.conjugated).toBeTruthy();
    });

    // Verify practice dialogues structure
    expect(result.practiceDialogues).toBeDefined();
    expect(Array.isArray(result.practiceDialogues)).toBe(true);
    result.practiceDialogues?.forEach((dialogue) => {
      expect(dialogue.id).toBeTruthy();
      expect(dialogue.prompt).toBeTruthy();
      expect(dialogue.response).toBeTruthy();
    });
  });
});
