'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useMemo } from 'react';
import { useUserStore } from '@/store/useUserStore';
import { useNodeProgress, useNodeProgressStore } from '@/store/useNodeProgressStore';
import { getTranslations } from '@/i18n';
import { GUIDED_NODES } from '@/components/learn/CourseMap';

// Definición de lecciones por nodo
// Los IDs deben coincidir con los archivos en public/content/fr/A0/base-absoluta/
interface LessonDef {
  id: string;
  title: string;
  titleFr?: string;
}

const NODE_LESSONS: Record<string, LessonDef[]> = {
  // ÁREA 0 - Base Absoluta (contenido real de A0)
  'node-1': [
    { id: 'nodo-0-1-saludos', title: 'Saludos y Despedidas', titleFr: 'Salutations et adieux' },
    { id: 'nodo-0-2-numeros-tiempo', title: 'Números y Tiempo', titleFr: 'Nombres et temps' },
  ],
  'node-2': [
    { id: 'nodo-0-3-verbos-clave', title: 'Verbos Clave', titleFr: 'Verbes clés' },
    { id: 'nodo-0-4-supervivencia-inmediata', title: 'Supervivencia Inmediata', titleFr: 'Survie immédiate' },
  ],
  'node-3': [
    { id: 'nodo-0-5-objetos-cotidianos', title: 'Objetos Cotidianos', titleFr: 'Objets quotidiens' },
  ],
  'node-4': [
    { id: 'nodo-0-6-recuperacion', title: 'Estrategias de Recuperación', titleFr: 'Stratégies de récupération' },
  ],
  'node-5': [
    { id: 'nodo-0-7-digital', title: 'Interacción Digital', titleFr: 'Interaction numérique' },
  ],
};

export default function NodePage() {
  const params = useParams();
  const router = useRouter();
  const nodeId = params.nodeId as string;
  const { appLanguage } = useUserStore();
  const { initGuidedNodes, isNodeUnlocked } = useNodeProgressStore();
  const nodeProgress = useNodeProgress(nodeId);
  const t = getTranslations(appLanguage);

  // Inicializar progreso al cargar
  useEffect(() => {
    initGuidedNodes(GUIDED_NODES.map((n) => n.id));
  }, [initGuidedNodes]);

  // Encontrar el nodo
  const node = GUIDED_NODES.find((n) => n.id === nodeId);

  // Verificar acceso
  const hasAccess = isNodeUnlocked(nodeId);

  // Obtener lecciones del nodo
  const lessons = useMemo(() => {
    return NODE_LESSONS[nodeId] || [
      { id: `${nodeId}-lesson-1`, title: 'Lección 1' },
      { id: `${nodeId}-lesson-2`, title: 'Lección 2' },
      { id: `${nodeId}-lesson-3`, title: 'Lección 3' },
      { id: `${nodeId}-lesson-4`, title: 'Lección 4' },
    ];
  }, [nodeId]);

  // Encontrar la primera lección no completada
  const nextLessonId = useMemo(() => {
    const completedLessons = nodeProgress?.completedLessons ?? [];
    for (const lesson of lessons) {
      if (!completedLessons.includes(lesson.id)) {
        return lesson.id;
      }
    }
    // Si todas están completadas, ir a la primera
    return lessons[0]?.id;
  }, [lessons, nodeProgress?.completedLessons]);

  // Redirigir automáticamente a la primera lección disponible
  useEffect(() => {
    if (!node) {
      // Nodo no encontrado, volver al mapa
      router.replace('/learn');
      return;
    }

    if (!hasAccess) {
      // Nodo bloqueado, mostrar mensaje de bloqueo
      return;
    }

    if (nextLessonId) {
      // Redirigir directamente a la lección
      router.replace(`/learn/node/${nodeId}/lesson/${nextLessonId}`);
    }
  }, [node, hasAccess, nextLessonId, nodeId, router]);

  // Mostrar mensaje de nodo bloqueado si no hay acceso
  if (!hasAccess) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6">
        <div className="text-6xl mb-4">🔒</div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
          Nodo bloqueado
        </h2>
        <p className="text-gray-600 dark:text-gray-400 text-center mb-6">
          Completa el nodo anterior para desbloquear este.
        </p>
        <a
          href="/learn"
          className="px-6 py-3 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700 transition-colors"
        >
          ← {t.common.back}
        </a>
      </div>
    );
  }

  // Mientras redirige, mostrar loading
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 rounded-full border-4 border-indigo-600 border-t-transparent animate-spin mx-auto mb-4" />
        <p className="text-gray-600 dark:text-gray-400">Cargando lección...</p>
      </div>
    </div>
  );
}
