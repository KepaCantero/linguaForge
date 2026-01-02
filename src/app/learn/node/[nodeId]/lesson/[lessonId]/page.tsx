'use client';

import { useParams, useRouter } from 'next/navigation';
import { useCallback, useMemo } from 'react';
import { LessonPlayer, Lesson } from '@/components/learn/LessonPlayer';
import type { Phrase } from '@/types';

// Mock lessons por nodo - después se cargará de contenido real
const MOCK_LESSONS: Record<string, Lesson[]> = {
  'node-1': [
    {
      id: 'lesson-1-1',
      title: 'Saludos básicos',
      nodeId: 'node-1',
      exercises: [
        {
          id: 'ex-1',
          type: 'cloze',
          data: {
            id: 'phrase-1',
            text: 'Bonjour, je voudrais réserver une chambre.',
            translation: 'Hola, me gustaría reservar una habitación.',
            clozeWord: 'chambre',
            clozeOptions: [
              { id: 'opt-1', text: 'chambre', isCorrect: true },
              { id: 'opt-2', text: 'table', isCorrect: false },
              { id: 'opt-3', text: 'voiture', isCorrect: false },
              { id: 'opt-4', text: 'maison', isCorrect: false },
            ],
            variations: [],
          } as Phrase,
        },
        {
          id: 'ex-2',
          type: 'cloze',
          data: {
            id: 'phrase-2',
            text: "J'ai une réservation au nom de Martin.",
            translation: 'Tengo una reservación a nombre de Martin.',
            clozeWord: 'réservation',
            clozeOptions: [
              { id: 'opt-1', text: 'réservation', isCorrect: true },
              { id: 'opt-2', text: 'question', isCorrect: false },
              { id: 'opt-3', text: 'solution', isCorrect: false },
              { id: 'opt-4', text: 'situation', isCorrect: false },
            ],
            variations: [],
          } as Phrase,
        },
        {
          id: 'ex-3',
          type: 'cloze',
          data: {
            id: 'phrase-3',
            text: 'Pour combien de nuits?',
            translation: '¿Por cuántas noches?',
            clozeWord: 'nuits',
            clozeOptions: [
              { id: 'opt-1', text: 'nuits', isCorrect: true },
              { id: 'opt-2', text: 'jours', isCorrect: false },
              { id: 'opt-3', text: 'heures', isCorrect: false },
              { id: 'opt-4', text: 'semaines', isCorrect: false },
            ],
            variations: [],
          } as Phrase,
        },
      ],
    },
    {
      id: 'lesson-1-2',
      title: 'En la recepción',
      nodeId: 'node-1',
      exercises: [
        {
          id: 'ex-1',
          type: 'cloze',
          data: {
            id: 'phrase-1',
            text: "Voici votre clé, c'est la chambre 302.",
            translation: 'Aquí está su llave, es la habitación 302.',
            clozeWord: 'clé',
            clozeOptions: [
              { id: 'opt-1', text: 'clé', isCorrect: true },
              { id: 'opt-2', text: 'carte', isCorrect: false },
              { id: 'opt-3', text: 'porte', isCorrect: false },
              { id: 'opt-4', text: 'valise', isCorrect: false },
            ],
            variations: [],
          } as Phrase,
        },
        {
          id: 'ex-2',
          type: 'cloze',
          data: {
            id: 'phrase-2',
            text: "Le petit-déjeuner est servi de 7h à 10h.",
            translation: 'El desayuno se sirve de 7 a 10.',
            clozeWord: 'petit-déjeuner',
            clozeOptions: [
              { id: 'opt-1', text: 'petit-déjeuner', isCorrect: true },
              { id: 'opt-2', text: 'déjeuner', isCorrect: false },
              { id: 'opt-3', text: 'dîner', isCorrect: false },
              { id: 'opt-4', text: 'repas', isCorrect: false },
            ],
            variations: [],
          } as Phrase,
        },
      ],
    },
    {
      id: 'lesson-1-3',
      title: 'Problemas comunes',
      nodeId: 'node-1',
      exercises: [
        {
          id: 'ex-1',
          type: 'cloze',
          data: {
            id: 'phrase-1',
            text: "Il n'y a pas d'eau chaude.",
            translation: 'No hay agua caliente.',
            clozeWord: 'chaude',
            clozeOptions: [
              { id: 'opt-1', text: 'chaude', isCorrect: true },
              { id: 'opt-2', text: 'froide', isCorrect: false },
              { id: 'opt-3', text: 'propre', isCorrect: false },
              { id: 'opt-4', text: 'sale', isCorrect: false },
            ],
            variations: [],
          } as Phrase,
        },
        {
          id: 'ex-2',
          type: 'cloze',
          data: {
            id: 'phrase-2',
            text: 'La climatisation ne fonctionne pas.',
            translation: 'El aire acondicionado no funciona.',
            clozeWord: 'fonctionne',
            clozeOptions: [
              { id: 'opt-1', text: 'fonctionne', isCorrect: true },
              { id: 'opt-2', text: 'marche', isCorrect: false },
              { id: 'opt-3', text: 'travaille', isCorrect: false },
              { id: 'opt-4', text: 'existe', isCorrect: false },
            ],
            variations: [],
          } as Phrase,
        },
      ],
    },
    {
      id: 'lesson-1-4',
      title: 'Check-out',
      nodeId: 'node-1',
      exercises: [
        {
          id: 'ex-1',
          type: 'cloze',
          data: {
            id: 'phrase-1',
            text: "Je voudrais régler ma note, s'il vous plaît.",
            translation: 'Me gustaría pagar mi cuenta, por favor.',
            clozeWord: 'note',
            clozeOptions: [
              { id: 'opt-1', text: 'note', isCorrect: true },
              { id: 'opt-2', text: 'facture', isCorrect: false },
              { id: 'opt-3', text: 'addition', isCorrect: false },
              { id: 'opt-4', text: 'carte', isCorrect: false },
            ],
            variations: [],
          } as Phrase,
        },
        {
          id: 'ex-2',
          type: 'cloze',
          data: {
            id: 'phrase-2',
            text: 'Puis-je laisser mes bagages ici?',
            translation: '¿Puedo dejar mi equipaje aquí?',
            clozeWord: 'bagages',
            clozeOptions: [
              { id: 'opt-1', text: 'bagages', isCorrect: true },
              { id: 'opt-2', text: 'valises', isCorrect: false },
              { id: 'opt-3', text: 'affaires', isCorrect: false },
              { id: 'opt-4', text: 'clés', isCorrect: false },
            ],
            variations: [],
          } as Phrase,
        },
      ],
    },
  ],
  'node-2': [
    {
      id: 'lesson-2-1',
      title: 'En el restaurante',
      nodeId: 'node-2',
      exercises: [
        {
          id: 'ex-1',
          type: 'cloze',
          data: {
            id: 'phrase-1',
            text: "Une table pour deux personnes, s'il vous plaît.",
            translation: 'Una mesa para dos personas, por favor.',
            clozeWord: 'table',
            clozeOptions: [
              { id: 'opt-1', text: 'table', isCorrect: true },
              { id: 'opt-2', text: 'chaise', isCorrect: false },
              { id: 'opt-3', text: 'place', isCorrect: false },
              { id: 'opt-4', text: 'menu', isCorrect: false },
            ],
            variations: [],
          } as Phrase,
        },
      ],
    },
  ],
};

// Generar lecciones mock para nodos sin contenido
function getMockLessonsForNode(nodeId: string): Lesson[] {
  if (MOCK_LESSONS[nodeId]) {
    return MOCK_LESSONS[nodeId];
  }

  // Generar 4 lecciones mock básicas
  return [1, 2, 3, 4].map((i) => ({
    id: `${nodeId}-lesson-${i}`,
    title: `Lección ${i}`,
    nodeId,
    exercises: [
      {
        id: `${nodeId}-ex-${i}-1`,
        type: 'cloze' as const,
        data: {
          id: `phrase-${i}`,
          text: 'Bonjour, comment allez-vous?',
          translation: 'Hola, ¿cómo está usted?',
          clozeWord: 'allez',
          clozeOptions: [
            { id: 'opt-1', text: 'allez', isCorrect: true },
            { id: 'opt-2', text: 'êtes', isCorrect: false },
            { id: 'opt-3', text: 'avez', isCorrect: false },
            { id: 'opt-4', text: 'faites', isCorrect: false },
          ],
          variations: [],
        } as Phrase,
      },
    ],
  }));
}

export default function LessonPage() {
  const params = useParams();
  const router = useRouter();
  const nodeId = params.nodeId as string;
  const lessonId = params.lessonId as string;

  const lessons = useMemo(() => getMockLessonsForNode(nodeId), [nodeId]);
  const lesson = useMemo(
    () => lessons.find((l) => l.id === lessonId),
    [lessons, lessonId]
  );

  const handleComplete = useCallback(() => {
    // Volver a la página del nodo
    router.push(`/learn/node/${nodeId}`);
  }, [router, nodeId]);

  if (!lesson) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600 dark:text-gray-400">Lección no encontrada</p>
      </div>
    );
  }

  return <LessonPlayer lesson={lesson} onComplete={handleComplete} />;
}
