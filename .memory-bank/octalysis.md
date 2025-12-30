# Octalysis — Sistema de Gamificación

> Marco de Yu-kai Chou para diseño motivacional

## Los 8 Core Drives

```
                    WHITE HAT (Positivo)
                          ▲
         ┌────────────────┼────────────────┐
         │                │                │
    CD1  │   Significado  │    Logro   CD2 │
         │     Épico      │  Desarrollo    │
         │                │                │
    ─────┼────────────────┼────────────────┼─────
         │                │                │
    CD8  │   Pérdida &    │  Propiedad CD4 │
         │   Evitación    │  & Posesión    │
         │                │                │
         └────────────────┼────────────────┘
                          ▼
                    BLACK HAT (Urgente)
```

## Implementación v1 (Simplificada)

Solo implementamos **4 drives** en v1:

| Drive | Nombre | Mecánica en App | Prioridad |
|-------|--------|-----------------|-----------|
| CD2 | Logro | XP, Niveles, Barras de progreso | ALTA |
| CD4 | Propiedad | Monedas, Personalización futura | ALTA |
| CD5 | Social | Desactivado en v1 | BAJA |
| CD8 | Evitación | Streaks diarios | ALTA |

---

## Sistema de XP (Core Drive 2)

### Reglas FIJAS

```typescript
const XP_RULES = {
  // Ejercicios
  clozeCorrect: 10,
  clozeIncorrect: 2,
  shadowingComplete: 15,
  variationRead: 5,
  miniTaskComplete: 50,

  // Janulus
  janusCombination: 5,
  janusMatrixComplete: 100,
  intoningCycleComplete: 20,

  // Input
  inputAudioComplete: 25,
  inputVideoComplete: 30,
  inputTextComplete: 20,
  comprehensionPass: 15,

  // Bonuses
  perfectMatrix: 50,        // 0 errores en matriz
  streakBonus: (days: number) => days * 5,
} as const;
```

### Niveles de Usuario

```typescript
const LEVEL_THRESHOLDS = [
  { level: 1, xpRequired: 0, title: "Débutant" },
  { level: 2, xpRequired: 100, title: "Curieux" },
  { level: 3, xpRequired: 300, title: "Apprenti" },
  { level: 4, xpRequired: 600, title: "Explorateur" },
  { level: 5, xpRequired: 1000, title: "Voyageur" },
  { level: 6, xpRequired: 1500, title: "Aventurier" },
  { level: 7, xpRequired: 2200, title: "Francophile" },
  { level: 8, xpRequired: 3000, title: "Parisien" },
  { level: 9, xpRequired: 4000, title: "Expert" },
  { level: 10, xpRequired: 5500, title: "Maître" },
] as const;
```

---

## Sistema de Monedas (Core Drive 4)

### Reglas FIJAS

```typescript
const COIN_RULES = {
  // Ganancia
  inputComplete: 10,
  dailyLogin: 5,
  streakMilestone: (days: number) => {
    if (days === 7) return 50;
    if (days === 30) return 200;
    if (days === 100) return 500;
    return 0;
  },

  // Gasto (futuro)
  // unlockTheme: 100,
  // skipExercise: 50,
} as const;
```

---

## Sistema de Gemas (Comprensión)

```typescript
const GEM_RULES = {
  comprehensionPass: 5,
  perfectComprehension: 10, // 100% correcto
} as const;
```

---

## Sistema de Streaks (Core Drive 8)

### Reglas FIJAS

```typescript
interface StreakConfig {
  // Una "actividad" cuenta si:
  minimumActions: 1;          // Al menos 1 ejercicio completado
  resetHour: 4;               // 4:00 AM hora local = nuevo día
  graceWindowHours: 0;        // Sin ventana de gracia en v1

  // Milestones
  milestones: [7, 14, 30, 60, 100, 365];
}
```

### Lógica de Streak

```typescript
function calculateStreak(lastActiveDate: string | null, now: Date): {
  currentStreak: number;
  isActive: boolean;
  willLoseStreak: boolean;
} {
  if (!lastActiveDate) {
    return { currentStreak: 0, isActive: false, willLoseStreak: false };
  }

  const last = new Date(lastActiveDate);
  const diffDays = Math.floor((now.getTime() - last.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    // Mismo día
    return { currentStreak: streak, isActive: true, willLoseStreak: false };
  } else if (diffDays === 1) {
    // Ayer - streak continúa si hace actividad hoy
    return { currentStreak: streak, isActive: false, willLoseStreak: true };
  } else {
    // Más de 1 día - streak perdido
    return { currentStreak: 0, isActive: false, willLoseStreak: false };
  }
}
```

---

## UI de Gamificación

### Header Stats

```
┌────────────────────────────────────────────────────────┐
│  ⭐ 1,250 XP   💰 340   💎 45   🔥 12 días            │
│  [████████░░] Nivel 5: Voyageur                       │
└────────────────────────────────────────────────────────┘
```

### Animaciones de Reward

```typescript
interface RewardAnimation {
  type: 'xp' | 'coins' | 'gems' | 'levelUp' | 'streak';
  amount: number;
  duration: 1500; // ms

  // Framer Motion config
  initial: { scale: 0, y: 20 };
  animate: { scale: 1, y: 0 };
  exit: { scale: 0, y: -20, opacity: 0 };
}
```

### Streak Warning

```
┌────────────────────────────────────────┐
│  ⚠️ ¡Tu racha está en peligro!        │
│                                        │
│  🔥 12 días consecutivos               │
│                                        │
│  Completa 1 ejercicio para mantenerla  │
│                                        │
│       [Practicar Ahora →]              │
└────────────────────────────────────────┘
```

---

## Store Structure (Zustand)

```typescript
interface GamificationStore {
  // Estado
  xp: number;
  level: number;
  coins: number;
  gems: number;
  streak: number;
  lastActiveDate: string | null;

  // Acciones
  addXP: (amount: number, source: string) => void;
  addCoins: (amount: number) => void;
  addGems: (amount: number) => void;
  updateStreak: () => void;

  // Computed
  xpToNextLevel: () => number;
  levelProgress: () => number; // 0-100
}
```

---

## Eventos de Gamificación

```typescript
type GamificationEvent =
  | { type: 'XP_EARNED'; amount: number; source: string }
  | { type: 'LEVEL_UP'; newLevel: number; title: string }
  | { type: 'COINS_EARNED'; amount: number }
  | { type: 'GEMS_EARNED'; amount: number }
  | { type: 'STREAK_CONTINUED'; days: number }
  | { type: 'STREAK_LOST'; previousDays: number }
  | { type: 'MILESTONE_REACHED'; milestone: string };
```

---

## Lo que NO está en v1

- ❌ Tablas de clasificación (CD5 Social)
- ❌ Gremios/Equipos
- ❌ Desafíos por tiempo limitado (CD6 Escasez)
- ❌ Cofres aleatorios (CD7 Imprevisibilidad)
- ❌ Tienda de personalización
- ❌ Referidos

Estos se implementarán en v2+ según feedback de usuarios.
