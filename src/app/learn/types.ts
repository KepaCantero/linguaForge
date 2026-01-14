/**
 * Types for Learn Page
 * Extracted to avoid circular dependencies
 */

import { BRANCH_COLORS, APP_COLORS } from '@/lib/constants';

export interface UnifiedTopic {
  id: string;
  type: 'a0-course' | 'imported' | 'coming-soon';
  title: string;
  description?: string;
  icon: string;
  category: string;
  subcategory?: string;
  level: string;
  progress: number;
  isLocked: boolean;
  isCompleted: boolean;
  totalExercises?: number;
  completedExercises?: number;
  color: string;
  gradient: string;
  href: string;
  metadata?: {
    phrases?: number;
    subtopics?: number;
    source?: string;
  };
}

// Category definitions with colors - usando BRANCH_COLORS y APP_COLORS
export const CATEGORIES = [
  {
    id: 'basics',
    name: 'Fundamentos',
    icon: '🎯',
    color: BRANCH_COLORS[1], // #6366F1 - Identidad
    gradient: `linear-gradient(135deg, ${BRANCH_COLORS[1]}, ${APP_COLORS.primaryDark})`
  },
  {
    id: 'communication',
    name: 'Comunicación',
    icon: '💬',
    color: BRANCH_COLORS[2], // #3B82F6 - Tiempo
    gradient: `linear-gradient(135deg, ${BRANCH_COLORS[2]}, ${APP_COLORS.info})`
  },
  {
    id: 'food',
    name: 'Comida',
    icon: '🍽️',
    color: BRANCH_COLORS[7], // #F59E0B - Personas
    gradient: `linear-gradient(135deg, ${BRANCH_COLORS[7]}, ${APP_COLORS.warningDark})`
  },
  {
    id: 'travel',
    name: 'Viajes',
    icon: '✈️',
    color: BRANCH_COLORS[5], // #10B981 - Comida
    gradient: `linear-gradient(135deg, ${BRANCH_COLORS[5]}, ${APP_COLORS.successDark})`
  },
  {
    id: 'health',
    name: 'Salud',
    icon: '🏥',
    color: BRANCH_COLORS[8], // #EF4444 - Trabajo
    gradient: `linear-gradient(135deg, ${BRANCH_COLORS[8]}, ${APP_COLORS.errorDark})`
  },
  {
    id: 'imported',
    name: 'Importado',
    icon: '📁',
    color: BRANCH_COLORS[10], // #8B5CF6 - Pasado/Futuro
    gradient: `linear-gradient(135deg, ${BRANCH_COLORS[10]}, #7C3AED)`
  },
] as const;

// A0 Course nodes (structured content from the app)
export const A0_COURSES = [
  { id: 'node-1', icon: '🏠', category: 'accommodation', title: 'Alojamiento', titleFr: 'Logement', description: 'Hoteles, Airbnb, reservas' },
  { id: 'node-2', icon: '🍽️', category: 'food', title: 'Restaurantes', titleFr: 'Restaurants', description: 'Pedir comida, menús, quejas' },
  { id: 'node-3', icon: '🚇', category: 'transport', title: 'Transporte', titleFr: 'Transport', description: 'Metro, taxi, direcciones' },
  { id: 'node-4', icon: '🏥', category: 'health', title: 'Salud', titleFr: 'Santé', description: 'Farmacia, doctor, emergencias' },
  { id: 'node-5', icon: '🆘', category: 'recovery', title: 'Recuperación', titleFr: 'Récupération', description: 'Perdido, policía, ayuda' },
] as const;

// Coming soon placeholders
export const COMING_SOON_COURSES = [
  { id: 'coming-1', icon: '👋', category: 'basics', title: 'Saludos y Presentaciones', description: 'Aprender a presentarte y saludar' },
  { id: 'coming-2', icon: '🔢', category: 'basics', title: 'Números y Contar', description: 'Números del 0 al 1000+' },
  { id: 'coming-3', icon: '⏰', category: 'basics', title: 'Hora y Fechas', description: 'Decir la hora y las fechas' },
  { id: 'coming-4', icon: '👨‍👩‍👧‍👦', category: 'communication', title: 'Familia y Amigos', description: 'Describir a tu familia' },
  { id: 'coming-5', icon: '🛍️', category: 'basics', title: 'Compras', description: 'Tiendas, precios, pagar' },
];
