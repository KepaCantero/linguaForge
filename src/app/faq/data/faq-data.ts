export interface FAQQuestion {
  id: string;
  q: string;
  a: string;
}

export interface FAQCategory {
  id: string;
  title: string;
  icon: string;
  questions: FAQQuestion[];
}

export const FAQ_CATEGORIES: FAQCategory[] = [
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
