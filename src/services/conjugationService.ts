// ============================================
// SERVICIO DE CONJUGACIÓN FRANCESA
// ============================================
// Conjugación automática para verbos A1/A2

// ============================================
// TIPOS
// ============================================

export type Subject = 'je' | 'tu' | 'il' | 'elle' | 'on' | 'nous' | 'vous' | 'ils' | 'elles';
export type Tense = 'present' | 'passe_compose' | 'futur_proche' | 'imparfait';

interface ConjugationTable {
  je: string;
  tu: string;
  'il/elle/on': string;
  nous: string;
  vous: string;
  'ils/elles': string;
}

interface VerbData {
  infinitive: string;
  group: 1 | 2 | 3; // Grupo verbal
  auxiliary: 'avoir' | 'être'; // Auxiliar para passé composé
  participle: string; // Participio pasado
  conjugations: {
    present: ConjugationTable;
    imparfait?: ConjugationTable;
  };
}

// ============================================
// BASE DE DATOS DE VERBOS A1/A2
// ============================================

const VERB_DATABASE: Record<string, VerbData> = {
  // ÊTRE y AVOIR (fundamentales)
  être: {
    infinitive: 'être',
    group: 3,
    auxiliary: 'avoir',
    participle: 'été',
    conjugations: {
      present: {
        je: 'suis',
        tu: 'es',
        'il/elle/on': 'est',
        nous: 'sommes',
        vous: 'êtes',
        'ils/elles': 'sont',
      },
      imparfait: {
        je: 'étais',
        tu: 'étais',
        'il/elle/on': 'était',
        nous: 'étions',
        vous: 'étiez',
        'ils/elles': 'étaient',
      },
    },
  },
  avoir: {
    infinitive: 'avoir',
    group: 3,
    auxiliary: 'avoir',
    participle: 'eu',
    conjugations: {
      present: {
        je: 'ai',
        tu: 'as',
        'il/elle/on': 'a',
        nous: 'avons',
        vous: 'avez',
        'ils/elles': 'ont',
      },
      imparfait: {
        je: 'avais',
        tu: 'avais',
        'il/elle/on': 'avait',
        nous: 'avions',
        vous: 'aviez',
        'ils/elles': 'avaient',
      },
    },
  },

  // VERBOS DE MOVIMIENTO (usan être)
  aller: {
    infinitive: 'aller',
    group: 3,
    auxiliary: 'être',
    participle: 'allé',
    conjugations: {
      present: {
        je: 'vais',
        tu: 'vas',
        'il/elle/on': 'va',
        nous: 'allons',
        vous: 'allez',
        'ils/elles': 'vont',
      },
    },
  },
  venir: {
    infinitive: 'venir',
    group: 3,
    auxiliary: 'être',
    participle: 'venu',
    conjugations: {
      present: {
        je: 'viens',
        tu: 'viens',
        'il/elle/on': 'vient',
        nous: 'venons',
        vous: 'venez',
        'ils/elles': 'viennent',
      },
    },
  },
  partir: {
    infinitive: 'partir',
    group: 3,
    auxiliary: 'être',
    participle: 'parti',
    conjugations: {
      present: {
        je: 'pars',
        tu: 'pars',
        'il/elle/on': 'part',
        nous: 'partons',
        vous: 'partez',
        'ils/elles': 'partent',
      },
    },
  },
  arriver: {
    infinitive: 'arriver',
    group: 1,
    auxiliary: 'être',
    participle: 'arrivé',
    conjugations: {
      present: {
        je: 'arrive',
        tu: 'arrives',
        'il/elle/on': 'arrive',
        nous: 'arrivons',
        vous: 'arrivez',
        'ils/elles': 'arrivent',
      },
    },
  },
  sortir: {
    infinitive: 'sortir',
    group: 3,
    auxiliary: 'être',
    participle: 'sorti',
    conjugations: {
      present: {
        je: 'sors',
        tu: 'sors',
        'il/elle/on': 'sort',
        nous: 'sortons',
        vous: 'sortez',
        'ils/elles': 'sortent',
      },
    },
  },
  entrer: {
    infinitive: 'entrer',
    group: 1,
    auxiliary: 'être',
    participle: 'entré',
    conjugations: {
      present: {
        je: 'entre',
        tu: 'entres',
        'il/elle/on': 'entre',
        nous: 'entrons',
        vous: 'entrez',
        'ils/elles': 'entrent',
      },
    },
  },
  rester: {
    infinitive: 'rester',
    group: 1,
    auxiliary: 'être',
    participle: 'resté',
    conjugations: {
      present: {
        je: 'reste',
        tu: 'restes',
        'il/elle/on': 'reste',
        nous: 'restons',
        vous: 'restez',
        'ils/elles': 'restent',
      },
    },
  },

  // VERBOS MODALES
  pouvoir: {
    infinitive: 'pouvoir',
    group: 3,
    auxiliary: 'avoir',
    participle: 'pu',
    conjugations: {
      present: {
        je: 'peux',
        tu: 'peux',
        'il/elle/on': 'peut',
        nous: 'pouvons',
        vous: 'pouvez',
        'ils/elles': 'peuvent',
      },
    },
  },
  vouloir: {
    infinitive: 'vouloir',
    group: 3,
    auxiliary: 'avoir',
    participle: 'voulu',
    conjugations: {
      present: {
        je: 'veux',
        tu: 'veux',
        'il/elle/on': 'veut',
        nous: 'voulons',
        vous: 'voulez',
        'ils/elles': 'veulent',
      },
    },
  },
  devoir: {
    infinitive: 'devoir',
    group: 3,
    auxiliary: 'avoir',
    participle: 'dû',
    conjugations: {
      present: {
        je: 'dois',
        tu: 'dois',
        'il/elle/on': 'doit',
        nous: 'devons',
        vous: 'devez',
        'ils/elles': 'doivent',
      },
    },
  },
  savoir: {
    infinitive: 'savoir',
    group: 3,
    auxiliary: 'avoir',
    participle: 'su',
    conjugations: {
      present: {
        je: 'sais',
        tu: 'sais',
        'il/elle/on': 'sait',
        nous: 'savons',
        vous: 'savez',
        'ils/elles': 'savent',
      },
    },
  },

  // VERBOS COMUNES
  faire: {
    infinitive: 'faire',
    group: 3,
    auxiliary: 'avoir',
    participle: 'fait',
    conjugations: {
      present: {
        je: 'fais',
        tu: 'fais',
        'il/elle/on': 'fait',
        nous: 'faisons',
        vous: 'faites',
        'ils/elles': 'font',
      },
    },
  },
  prendre: {
    infinitive: 'prendre',
    group: 3,
    auxiliary: 'avoir',
    participle: 'pris',
    conjugations: {
      present: {
        je: 'prends',
        tu: 'prends',
        'il/elle/on': 'prend',
        nous: 'prenons',
        vous: 'prenez',
        'ils/elles': 'prennent',
      },
    },
  },
  manger: {
    infinitive: 'manger',
    group: 1,
    auxiliary: 'avoir',
    participle: 'mangé',
    conjugations: {
      present: {
        je: 'mange',
        tu: 'manges',
        'il/elle/on': 'mange',
        nous: 'mangeons',
        vous: 'mangez',
        'ils/elles': 'mangent',
      },
    },
  },
  boire: {
    infinitive: 'boire',
    group: 3,
    auxiliary: 'avoir',
    participle: 'bu',
    conjugations: {
      present: {
        je: 'bois',
        tu: 'bois',
        'il/elle/on': 'boit',
        nous: 'buvons',
        vous: 'buvez',
        'ils/elles': 'boivent',
      },
    },
  },
  parler: {
    infinitive: 'parler',
    group: 1,
    auxiliary: 'avoir',
    participle: 'parlé',
    conjugations: {
      present: {
        je: 'parle',
        tu: 'parles',
        'il/elle/on': 'parle',
        nous: 'parlons',
        vous: 'parlez',
        'ils/elles': 'parlent',
      },
    },
  },
  comprendre: {
    infinitive: 'comprendre',
    group: 3,
    auxiliary: 'avoir',
    participle: 'compris',
    conjugations: {
      present: {
        je: 'comprends',
        tu: 'comprends',
        'il/elle/on': 'comprend',
        nous: 'comprenons',
        vous: 'comprenez',
        'ils/elles': 'comprennent',
      },
    },
  },
  attendre: {
    infinitive: 'attendre',
    group: 3,
    auxiliary: 'avoir',
    participle: 'attendu',
    conjugations: {
      present: {
        je: 'attends',
        tu: 'attends',
        'il/elle/on': 'attend',
        nous: 'attendons',
        vous: 'attendez',
        'ils/elles': 'attendent',
      },
    },
  },
  chercher: {
    infinitive: 'chercher',
    group: 1,
    auxiliary: 'avoir',
    participle: 'cherché',
    conjugations: {
      present: {
        je: 'cherche',
        tu: 'cherches',
        'il/elle/on': 'cherche',
        nous: 'cherchons',
        vous: 'cherchez',
        'ils/elles': 'cherchent',
      },
    },
  },
  trouver: {
    infinitive: 'trouver',
    group: 1,
    auxiliary: 'avoir',
    participle: 'trouvé',
    conjugations: {
      present: {
        je: 'trouve',
        tu: 'trouves',
        'il/elle/on': 'trouve',
        nous: 'trouvons',
        vous: 'trouvez',
        'ils/elles': 'trouvent',
      },
    },
  },
  aimer: {
    infinitive: 'aimer',
    group: 1,
    auxiliary: 'avoir',
    participle: 'aimé',
    conjugations: {
      present: {
        je: 'aime',
        tu: 'aimes',
        'il/elle/on': 'aime',
        nous: 'aimons',
        vous: 'aimez',
        'ils/elles': 'aiment',
      },
    },
  },
  demander: {
    infinitive: 'demander',
    group: 1,
    auxiliary: 'avoir',
    participle: 'demandé',
    conjugations: {
      present: {
        je: 'demande',
        tu: 'demandes',
        'il/elle/on': 'demande',
        nous: 'demandons',
        vous: 'demandez',
        'ils/elles': 'demandent',
      },
    },
  },
  répondre: {
    infinitive: 'répondre',
    group: 3,
    auxiliary: 'avoir',
    participle: 'répondu',
    conjugations: {
      present: {
        je: 'réponds',
        tu: 'réponds',
        'il/elle/on': 'répond',
        nous: 'répondons',
        vous: 'répondez',
        'ils/elles': 'répondent',
      },
    },
  },
  appeler: {
    infinitive: 'appeler',
    group: 1,
    auxiliary: 'avoir',
    participle: 'appelé',
    conjugations: {
      present: {
        je: 'appelle',
        tu: 'appelles',
        'il/elle/on': 'appelle',
        nous: 'appelons',
        vous: 'appelez',
        'ils/elles': 'appellent',
      },
    },
  },
  finir: {
    infinitive: 'finir',
    group: 2,
    auxiliary: 'avoir',
    participle: 'fini',
    conjugations: {
      present: {
        je: 'finis',
        tu: 'finis',
        'il/elle/on': 'finit',
        nous: 'finissons',
        vous: 'finissez',
        'ils/elles': 'finissent',
      },
    },
  },
  choisir: {
    infinitive: 'choisir',
    group: 2,
    auxiliary: 'avoir',
    participle: 'choisi',
    conjugations: {
      present: {
        je: 'choisis',
        tu: 'choisis',
        'il/elle/on': 'choisit',
        nous: 'choisissons',
        vous: 'choisissez',
        'ils/elles': 'choisissent',
      },
    },
  },
  dormir: {
    infinitive: 'dormir',
    group: 3,
    auxiliary: 'avoir',
    participle: 'dormi',
    conjugations: {
      present: {
        je: 'dors',
        tu: 'dors',
        'il/elle/on': 'dort',
        nous: 'dormons',
        vous: 'dormez',
        'ils/elles': 'dorment',
      },
    },
  },
  voir: {
    infinitive: 'voir',
    group: 3,
    auxiliary: 'avoir',
    participle: 'vu',
    conjugations: {
      present: {
        je: 'vois',
        tu: 'vois',
        'il/elle/on': 'voit',
        nous: 'voyons',
        vous: 'voyez',
        'ils/elles': 'voient',
      },
    },
  },
  dire: {
    infinitive: 'dire',
    group: 3,
    auxiliary: 'avoir',
    participle: 'dit',
    conjugations: {
      present: {
        je: 'dis',
        tu: 'dis',
        'il/elle/on': 'dit',
        nous: 'disons',
        vous: 'dites',
        'ils/elles': 'disent',
      },
    },
  },
  écrire: {
    infinitive: 'écrire',
    group: 3,
    auxiliary: 'avoir',
    participle: 'écrit',
    conjugations: {
      present: {
        je: 'écris',
        tu: 'écris',
        'il/elle/on': 'écrit',
        nous: 'écrivons',
        vous: 'écrivez',
        'ils/elles': 'écrivent',
      },
    },
  },
  lire: {
    infinitive: 'lire',
    group: 3,
    auxiliary: 'avoir',
    participle: 'lu',
    conjugations: {
      present: {
        je: 'lis',
        tu: 'lis',
        'il/elle/on': 'lit',
        nous: 'lisons',
        vous: 'lisez',
        'ils/elles': 'lisent',
      },
    },
  },
  mettre: {
    infinitive: 'mettre',
    group: 3,
    auxiliary: 'avoir',
    participle: 'mis',
    conjugations: {
      present: {
        je: 'mets',
        tu: 'mets',
        'il/elle/on': 'met',
        nous: 'mettons',
        vous: 'mettez',
        'ils/elles': 'mettent',
      },
    },
  },
  ouvrir: {
    infinitive: 'ouvrir',
    group: 3,
    auxiliary: 'avoir',
    participle: 'ouvert',
    conjugations: {
      present: {
        je: 'ouvre',
        tu: 'ouvres',
        'il/elle/on': 'ouvre',
        nous: 'ouvrons',
        vous: 'ouvrez',
        'ils/elles': 'ouvrent',
      },
    },
  },
  connaître: {
    infinitive: 'connaître',
    group: 3,
    auxiliary: 'avoir',
    participle: 'connu',
    conjugations: {
      present: {
        je: 'connais',
        tu: 'connais',
        'il/elle/on': 'connaît',
        nous: 'connaissons',
        vous: 'connaissez',
        'ils/elles': 'connaissent',
      },
    },
  },
};

// ============================================
// FUNCIONES DE CONJUGACIÓN
// ============================================

/**
 * Normaliza el sujeto para buscar en la tabla de conjugación
 */
function normalizeSubject(subject: Subject): keyof ConjugationTable {
  const subjectMap: Record<Subject, keyof ConjugationTable> = {
    je: 'je',
    tu: 'tu',
    il: 'il/elle/on',
    elle: 'il/elle/on',
    on: 'il/elle/on',
    nous: 'nous',
    vous: 'vous',
    ils: 'ils/elles',
    elles: 'ils/elles',
  };
  return subjectMap[subject];
}

/**
 * Obtiene la forma conjugada de un verbo
 */
export function conjugate(
  verb: string,
  subject: Subject,
  tense: Tense = 'present'
): string {
  const verbLower = verb.toLowerCase().trim();
  const verbData = VERB_DATABASE[verbLower];

  // Si no está en la base de datos, intentar conjugación regular
  if (!verbData) {
    return conjugateRegular(verbLower, subject, tense);
  }

  const subjectKey = normalizeSubject(subject);

  // Presente
  if (tense === 'present') {
    return verbData.conjugations.present[subjectKey];
  }

  // Futur proche: aller + infinitif
  if (tense === 'futur_proche') {
    const allerConjugated = VERB_DATABASE.aller.conjugations.present[subjectKey];
    return `${allerConjugated} ${verbData.infinitive}`;
  }

  // Passé composé: auxiliar + participio
  if (tense === 'passe_compose') {
    const auxVerb = verbData.auxiliary === 'être' ? 'être' : 'avoir';
    const auxConjugated = VERB_DATABASE[auxVerb].conjugations.present[subjectKey];
    let participle = verbData.participle;

    // Acordar participio con être
    if (verbData.auxiliary === 'être') {
      participle = agreeParticiple(participle, subject);
    }

    return `${auxConjugated} ${participle}`;
  }

  // Imparfait
  if (tense === 'imparfait' && verbData.conjugations.imparfait) {
    return verbData.conjugations.imparfait[subjectKey];
  }

  // Fallback
  return verbData.conjugations.present[subjectKey];
}

/**
 * Conjugación regular para verbos no en la base de datos
 */
function conjugateRegular(
  verb: string,
  subject: Subject,
  tense: Tense
): string {
  // Solo soportamos presente para verbos regulares
  if (tense !== 'present') {
    return verb; // Retornar infinitivo si no podemos conjugar
  }

  // Detectar grupo por terminación
  if (verb.endsWith('er')) {
    return conjugateFirstGroup(verb, subject);
  } else if (verb.endsWith('ir')) {
    return conjugateSecondGroup(verb, subject);
  }

  // Si no podemos determinar, retornar infinitivo
  return verb;
}

/**
 * Conjugar verbos del primer grupo (-er)
 */
function conjugateFirstGroup(verb: string, subject: Subject): string {
  const stem = verb.slice(0, -2);
  const endings: Record<keyof ConjugationTable, string> = {
    je: 'e',
    tu: 'es',
    'il/elle/on': 'e',
    nous: 'ons',
    vous: 'ez',
    'ils/elles': 'ent',
  };

  const subjectKey = normalizeSubject(subject);
  return stem + endings[subjectKey];
}

/**
 * Conjugar verbos del segundo grupo (-ir)
 */
function conjugateSecondGroup(verb: string, subject: Subject): string {
  const stem = verb.slice(0, -2);
  const endings: Record<keyof ConjugationTable, string> = {
    je: 'is',
    tu: 'is',
    'il/elle/on': 'it',
    nous: 'issons',
    vous: 'issez',
    'ils/elles': 'issent',
  };

  const subjectKey = normalizeSubject(subject);
  return stem + endings[subjectKey];
}

/**
 * Acordar participio con género/número (para verbos con être)
 */
function agreeParticiple(participle: string, subject: Subject): string {
  // Femenino singular
  if (subject === 'elle') {
    return participle + 'e';
  }
  // Femenino plural
  if (subject === 'elles') {
    return participle + 'es';
  }
  // Masculino plural
  if (subject === 'ils') {
    return participle + 's';
  }
  // Nous/vous depende del contexto (simplificamos)
  return participle;
}

// ============================================
// UTILIDADES PARA JANUS COMPOSER
// ============================================

/**
 * Genera una frase conjugada a partir de selecciones de columnas
 */
export function generateConjugatedPhrase(
  selections: {
    subject?: string;
    verb?: string;
    complement?: string;
    time?: string;
  }
): string {
  const { subject, verb, complement, time } = selections;

  if (!subject || !verb) {
    return '';
  }

  // Detectar sujeto
  const subjectLower = subject.toLowerCase().trim();
  let detectedSubject: Subject = 'je';

  const subjectPatterns: [RegExp, Subject][] = [
    [/^je$/i, 'je'],
    [/^j'/i, 'je'],
    [/^tu$/i, 'tu'],
    [/^il$/i, 'il'],
    [/^elle$/i, 'elle'],
    [/^on$/i, 'on'],
    [/^nous$/i, 'nous'],
    [/^vous$/i, 'vous'],
    [/^ils$/i, 'ils'],
    [/^elles$/i, 'elles'],
  ];

  for (const [pattern, subj] of subjectPatterns) {
    if (pattern.test(subjectLower)) {
      detectedSubject = subj;
      break;
    }
  }

  // Conjugar verbo
  const conjugatedVerb = conjugate(verb, detectedSubject, 'present');

  // Construir frase
  const parts = [subject, conjugatedVerb];
  if (complement) parts.push(complement);
  if (time) parts.push(time);

  // Manejar elisión (je + vocal)
  let phrase = parts.join(' ');
  phrase = phrase.replace(/je (a|e|i|o|u|h)/gi, "j'$1");

  return phrase;
}

/**
 * Verifica si un verbo está en la base de datos
 */
export function hasVerb(verb: string): boolean {
  return verb.toLowerCase().trim() in VERB_DATABASE;
}

/**
 * Obtiene información de un verbo
 */
export function getVerbInfo(verb: string): VerbData | null {
  return VERB_DATABASE[verb.toLowerCase().trim()] || null;
}

/**
 * Lista todos los verbos disponibles
 */
export function getAvailableVerbs(): string[] {
  return Object.keys(VERB_DATABASE);
}

// ============================================
// TODO: Completar exportación de funciones auxiliares
// Issue: #44 - Exportar funciones de conjugación auxiliares
// ============================================

export {
  VERB_DATABASE,
  type VerbData,
  type ConjugationTable,
};
