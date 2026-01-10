/**
 * Página de FAQ y Ayuda
 *
 * Proporciona respuestas a preguntas comunes sobre LinguaForge
 */

'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { trackEvent } from '@/lib/analytics';
import { AnalyticsEvent } from '@/types/analytics';

// ============================================
// FAQ DATA
// ============================================

const FAQ_CATEGORIES = [
  {
    id: 'getting-started',
    title: 'Empezando',
    icon: '🚀',
    questions: [
      {
        id: 'how-it-works',
        q: '¿Cómo funciona LinguaForge?',
        a: 'LinguaForge usa ciencia cognitiva avanzada para enseñarte francés de forma natural. Combinamos Input Comprensible (contenido que entiendes), Repetición Espaciada (FSRS v6) para optimizar tu retención, y ejercicios cognitivos que mantienen tu mente en "zona óptima" de aprendizaje.',
      },
      {
        id: 'first-steps',
        q: '¿Por dónde empiezo?',
        a: 'Te recomendamos empezar en el "Mapa de Aprendizaje". Los orbes representan temas organizados por nivel (A0 = básico, A1 = principiante, etc.). Comienza con los primeros orbes del Área 0 - Base Absoluta para aprender frases esenciales como saludos y números.',
      },
      {
        id: 'daily-practice',
        q: '¿Cuánto tiempo debo practicar?',
        a: 'Recomendamos 15-30 minutos diarios para obtener mejores resultados. La clave es la consistencia: practicar un poco cada día es más efectivo que sesiones largas ocasionales. El sistema de repaso espaciado optimizará automáticamente tus tarjetas para que las estudies en el momento justo.',
      },
    ],
  },
  {
    id: 'srs-system',
    title: 'Sistema de Repaso',
    icon: '🧠',
    questions: [
      {
        id: 'what-is-srs',
        q: '¿Qué es el Repaso Espaciado?',
        a: 'Es una técnica basada en investigación que muestra que repetir información en intervalos crecientes mejora significativamente la retención a largo plazo. LinguaForge usa FSRS v6, un algoritmo moderno que es ~15% más eficiente que el SM-2 original.',
      },
      {
        id: 'when-to-review',
        q: '¿Cuándo debo repasar las tarjetas?',
        a: 'No necesitas decidirlo. El sistema calcula automáticamente el momento óptimo para cada tarjeta basándose en qué tan bien la recordaste la última vez. Solo ve a "Repaso" cuando el sistema te indique que hay tarjetas pendientes.',
      },
      {
        id: 'rating-meaning',
        q: '¿Qué significan los botones de repaso?',
        a: '• "Otra vez" (⌨️1): Olvidaste completamente. Se reprogramará pronto.\n• "Difícil" (⌨️2): Costó trabajo pero lo recordaste.\n• "Bien" (⌨️3): Lo recordaste sin problemas.\n• "Fácil" (⌨️4): Fue instantáneo, muy fácil.',
      },
    ],
  },
  {
    id: 'exercises',
    title: 'Ejercicios',
    icon: '✏️',
    questions: [
      {
        id: 'exercise-types',
        q: '¿Qué tipos de ejercicios hay?',
        a: 'Tenemos 19 tipos diferentes incluyendo: Selección Múltiple, Completar Espacios, Ordenar Palabras, Dictado, Escucha, Construcción 3D, y más. Esto mantiene el aprendizaje variado y entretenido.',
      },
      {
        id: 'difficulty',
        q: '¿Cómo se ajusta la dificultad?',
        a: 'El sistema CLT (Cognitive Load Theory) monitorea tu carga cognitiva en tiempo real. Si estás concentrado y respondiendo bien, aumenta gradualmente la dificultad. Si cometes errores, reduce la complejidad para mantenerte en la "zona óptima" de aprendizaje.',
      },
      {
        id: 'skip-exercise',
        q: '¿Puedo saltar un ejercicio?',
        a: 'Sí, puedes saltar cualquier ejercicio si lo consideras muy difícil o irrelevante. Solo haz clic en el botón "Saltar" y pasaremos al siguiente. Tu feedback nos ayuda a mejorar el sistema.',
      },
    ],
  },
  {
    id: 'progression',
    title: 'Progresión',
    icon: '📈',
    questions: [
      {
        id: 'levels',
        q: '¿Cómo funcionan los niveles?',
        a: 'Hay 10 niveles de maestría (0-9). Ganas XP completando ejercicios y manteniendo rachas. Cada nivel requiere más XP y desbloquea nuevos contenidos. Los niveles 4-6 corresponden aproximadamente a A1, A2 y B1 del MCER.',
      },
      {
        id: 'streaks',
        q: '¿Qué son las rachas (streaks)?',
        a: 'Una racha es el número de días consecutivos que practicas. Mantener la racha multiplicará tu XP ganado. Las rachas de 7+ días desbloquean logros especiales y muestran tu compromiso con el aprendizaje.',
      },
      {
        id: 'xp-meaning',
        q: '¿Para qué sirve el XP?',
        a: 'El XP (Puntos de Experiencia) mide tu progreso general y desbloquea nuevos contenidos. Ganas XP completando ejercicios, repasando tarjetas, y manteniendo rachas. Es una medida global de tu aprendizaje.',
      },
    ],
  },
  {
    id: 'import',
    title: 'Importar Contenido',
    icon: '📥',
    questions: [
      {
        id: 'what-can-i-import',
        q: '¿Qué puedo importar?',
        a: 'Puedes importar texto, audio (mp3, wav), o video de YouTube que contenga francés. El sistema procesará automáticamente el contenido y extraerá frases únicas para crear tarjetas de estudio.',
      },
      {
        id: 'youtube-import',
        q: '¿Cómo importo de YouTube?',
        a: 'Copia la URL del video de YouTube y pégala en la sección "Importar". El sistema descargará el audio, generará una transcripción en francés, y extraerá las frases más útiles para tu nivel.',
      },
      {
        id: 'import-limits',
        q: '¿Hay límites de importación?',
        a: 'Para mantener la calidad, recomendamos importar contenido de hasta 10 minutos por sesión. El contenido más largo se procesará pero podría omitir algunas frases. Prioriza contenido que te interese y sea de tu nivel.',
      },
    ],
  },
  {
    id: 'account',
    title: 'Cuenta y Datos',
    icon: '👤',
    questions: [
      {
        id: 'data-saved',
        q: '¿Dónde se guardan mis datos?',
        a: 'Todo se guarda localmente en tu dispositivo. No almacenamos tus datos en servidores externos. Esto significa que tienes privacidad total y tus datos de aprendizaje nunca salen de tu dispositivo.',
      },
      {
        id: 'backup',
        q: '¿Cómo hago backup de mi progreso?',
        a: 'Actualmente tus datos se guardan en el navegador. Si cambias de dispositivo o borras la caché, perderás el progreso. Estamos trabajando en una función de exportar/importar tus datos en futuras actualizaciones.',
      },
      {
        id: 'reset',
        q: '¿Puedo reiniciar mi progreso?',
        a: 'Sí, puedes reiniciar desde la configuración de tu perfil. Ten en cuenta que esto borrará todo tu progreso, tarjetas creadas y estadísticas. Es una acción irreversible.',
      },
    ],
  },
  {
    id: 'technical',
    title: 'Técnico',
    icon: '⚙️',
    questions: [
      {
        id: 'offline',
        q: '¿Funciona sin internet?',
        a: 'Sí, LinguaForge es una PWA (Progressive Web App). Una vez que cargues la app por primera vez, funcionará completamente offline. Ideal para practicar en el metro, avión, o cualquier lugar sin conexión.',
      },
      {
        id: 'browsers',
        q: '¿Qué navegadores soportan?',
        a: 'Soportamos Chrome, Safari, Firefox y Edge (versiones recientes). Recomendamos Chrome o Safari para la mejor experiencia. Las versiones muy antiguas de navegadores pueden no funcionar correctamente.',
      },
      {
        id: 'languages',
        q: '¿Habrá otros idiomas?',
        a: 'Sí, planeamos expandir a otros idiomas (inglés, alemán, italiano) en el futuro. El sistema está diseñado para ser multilingüe desde su arquitectura. Síguenos para actualizaciones.',
      },
    ],
  },
];

// ============================================
// COMPONENT
// ============================================

export default function FAQPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [openCategories, setOpenCategories] = useState<Set<string>>(new Set());
  const [openQuestions, setOpenQuestions] = useState<Set<string>>(new Set());

  // Filtrar preguntas por búsqueda
  const filteredCategories = FAQ_CATEGORIES.map((category) => ({
    ...category,
    questions: category.questions.filter((q) => {
      const query = searchQuery.toLowerCase();
      return (
        q.q.toLowerCase().includes(query) ||
        q.a.toLowerCase().includes(query)
      );
    }),
  })).filter((category) => category.questions.length > 0);

  const toggleCategory = (categoryId: string) => {
    const newOpen = new Set(openCategories);
    const isOpening = !newOpen.has(categoryId);

    if (newOpen.has(categoryId)) {
      newOpen.delete(categoryId);
    } else {
      newOpen.add(categoryId);
    }
    setOpenCategories(newOpen);

    // Track category open event
    if (isOpening) {
      trackEvent(AnalyticsEvent.FAQ_CATEGORY_OPEN, {
        categoryId,
        timestamp: Date.now(),
        sessionId: '',
      });
    }
  };

  const toggleQuestion = (questionId: string) => {
    const newOpen = new Set(openQuestions);
    if (newOpen.has(questionId)) {
      newOpen.delete(questionId);
    } else {
      newOpen.add(questionId);
    }
    setOpenQuestions(newOpen);
  };

  return (
    <div className="min-h-screen p-4 pb-20 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-white mb-2">
          Ayuda y Preguntas Frecuentes
        </h1>
        <p className="text-gray-400">
          Encuentra respuestas sobre cómo usar LinguaForge
        </p>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Buscar en las preguntas..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              // Track search if query is meaningful
              if (e.target.value.length >= 3) {
                trackEvent(AnalyticsEvent.FAQ_SEARCH, {
                  searchQuery: e.target.value,
                  timestamp: Date.now(),
                  sessionId: '',
                });
              }
            }}
            className="w-full pl-10 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-lf-accent"
          />
        </div>
      </div>

      {/* FAQ Categories */}
      <div className="space-y-4">
        {filteredCategories.map((category) => {
          const isCategoryOpen = openCategories.has(category.id);

          return (
            <div
              key={category.id}
              className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden"
            >
              {/* Category Header */}
              <button
                onClick={() => toggleCategory(category.id)}
                className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-slate-700 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{category.icon}</span>
                  <span className="font-semibold text-white">{category.title}</span>
                  <span className="text-sm text-gray-500">
                    ({category.questions.length})
                  </span>
                </div>
                {isCategoryOpen ? (
                  <ChevronUp className="text-gray-400 w-5 h-5" />
                ) : (
                  <ChevronDown className="text-gray-400 w-5 h-5" />
                )}
              </button>

              {/* Questions */}
              <AnimatePresence>
                {isCategoryOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="p-4 pt-0 space-y-3">
                      {category.questions.map((question) => {
                        const isQuestionOpen = openQuestions.has(question.id);

                        return (
                          <div
                            key={question.id}
                            className="border-b border-slate-700 last:border-0 pb-3 last:pb-0"
                          >
                            <button
                              onClick={() => toggleQuestion(question.id)}
                              className="w-full text-left"
                            >
                              <div className="flex items-start justify-between gap-2">
                                <span className="text-white font-medium">
                                  {question.q}
                                </span>
                                {isQuestionOpen ? (
                                  <ChevronUp className="text-lf-accent w-4 h-4 flex-shrink-0 mt-1" />
                                ) : (
                                  <ChevronDown className="text-gray-500 w-4 h-4 flex-shrink-0 mt-1" />
                                )}
                              </div>
                            </button>

                            <AnimatePresence>
                              {isQuestionOpen && (
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: 'auto', opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  transition={{ duration: 0.2 }}
                                  className="overflow-hidden"
                                >
                                  <p className="text-gray-400 text-sm leading-relaxed whitespace-pre-line mt-2">
                                    {question.a}
                                  </p>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      {/* No Results */}
      {filteredCategories.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">
            No se encontraron preguntas que coincidan con &quot;{searchQuery}&quot;
          </p>
        </div>
      )}

      {/* Contact Support */}
      <div className="mt-12 text-center">
        <p className="text-gray-400 mb-4">
          ¿No encuentras tu respuesta?
        </p>
        <a
          href="mailto:soporte@linguaforge.app"
          className="inline-flex items-center gap-2 px-6 py-3 bg-lf-primary text-white font-medium rounded-xl hover:bg-lf-primary-dark transition-colors"
        >
          <span>📧</span>
          Contactar Soporte
        </a>
      </div>
    </div>
  );
}
