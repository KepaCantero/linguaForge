import { describe, it, expect, beforeEach, vi } from 'vitest';
import { act } from '@testing-library/react';
import * as zustand from 'zustand';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { SUPPORTED_LANGUAGES, UI_LANGUAGES } from '@/lib/constants';

// Constantes para tests - usar valores de constantes reales
const TEST_APP_LANGUAGE = UI_LANGUAGES[0]; // 'es'
const TEST_TARGET_LANGUAGE = SUPPORTED_LANGUAGES[2]; // 'fr'

// Mock localStorage
const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
});

// ============================================
// TIPOS DE PRUEBA
// ============================================

interface TestState {
  count: number;
  increment: () => void;
  decrement: () => void;
  reset: () => void;
  getCount: () => number;
}

interface UserState {
  name: string;
  age: number;
  setName: (name: string) => void;
  setAge: (age: number) => void;
  reset: () => void;
}

// ============================================
// STORES DE PRUEBA
// ============================================

// Simple store without persistence
const createTestStore = () =>
  create<TestState>((set) => ({
    count: 0,
    increment: () => set((state) => ({ count: state.count + 1 })),
    decrement: () => set((state) => ({ count: state.count - 1 })),
    reset: () => set({ count: 0 }),
    getCount: () => {
      const state = testStore.getState();
      return state.count;
    },
  }));

// Store with persistence
const createPersistedStore = () =>
  create<UserState>()(
    persist(
      (set) => ({
        name: 'John',
        age: 25,
        setName: (name) => set({ name }),
        setAge: (age) => set({ age }),
        reset: () => set({ name: 'John', age: 25 }),
      }),
      {
        name: 'test-storage',
      }
    )
  );

// ============================================
// INSTANCIAS
// ============================================

let testStore: zustand.StoreApi<TestState>;
let persistedStore: zustand.StoreApi<UserState>;

beforeEach(() => {
  // Reset mocks
  vi.clearAllMocks();

  // Reset stores
  testStore = createTestStore();
  persistedStore = createPersistedStore();
});

// ============================================
// TESTS
// ============================================

describe('Zustand Stores - Basic Functionality', () => {
  describe('Simple Store (No Persistence)', () => {
    it('debería inicializar con el estado correcto', () => {
      const { count } = testStore.getState();
      expect(count).toBe(0);
    });

    it('debería incrementar el contador', () => {
      const { increment, getCount } = testStore.getState();

      increment();
      expect(getCount()).toBe(1);

      increment();
      expect(getCount()).toBe(2);
    });

    it('debería decrementar el contador', () => {
      const { decrement, getCount } = testStore.getState();

      decrement();
      expect(getCount()).toBe(-1);

      decrement();
      expect(getCount()).toBe(-2);
    });

    it('debería resetear el estado', () => {
      const { increment, reset, getCount } = testStore.getState();

      increment();
      increment();
      expect(getCount()).toBe(2);

      reset();
      expect(getCount()).toBe(0);
    });

    it('debería mantener estado entre múltiples gets', () => {
      const { increment, getCount } = testStore.getState();

      increment();
      expect(getCount()).toBe(1);

      // Usar getState directamente
      const state = testStore.getState();
      expect(state.count).toBe(1);
    });
  });

  describe('Persisted Store', () => {
    it('debería inicializar con valores por defecto', () => {
      const { name, age } = persistedStore.getState();
      expect(name).toBe('John');
      expect(age).toBe(25);
    });

    it('debería actualizar el nombre', () => {
      const { setName } = persistedStore.getState();

      act(() => {
        setName('Jane');
      });

      const { name } = persistedStore.getState();
      expect(name).toBe('Jane');

      act(() => {
        setName('Bob');
      });

      const { name: newName } = persistedStore.getState();
      expect(newName).toBe('Bob');
    });

    it('debería actualizar la edad', () => {
      const { setAge } = persistedStore.getState();

      act(() => {
        setAge(30);
      });

      const { age } = persistedStore.getState();
      expect(age).toBe(30);

      act(() => {
        setAge(35);
      });

      const { age: newAge } = persistedStore.getState();
      expect(newAge).toBe(35);
    });

    it('debería resetear al estado inicial', () => {
      const { setName, setAge, reset } = persistedStore.getState();

      act(() => {
        setName('Jane');
        setAge(30);
      });

      let { name, age } = persistedStore.getState();
      expect(name).toBe('Jane');
      expect(age).toBe(30);

      act(() => {
        reset();
      });

      ({ name, age } = persistedStore.getState());
      expect(name).toBe('John');
      expect(age).toBe(25);
    });
  });

  describe('State Updates', () => {
    it('debería actualizar estado de forma inmutable', () => {
      const { increment } = testStore.getState();
      const initialState = testStore.getState();

      increment();

      // El estado inicial no debería haber cambiado
      expect(initialState.count).toBe(0);

      // El nuevo estado debería ser correcto
      const newState = testStore.getState();
      expect(newState.count).toBe(1);
    });

    it('debería permitir múltiples actualizaciones', () => {
      const { increment, decrement, getCount } = testStore.getState();

      // Secuencia de incrementos y decrementos
      increment();
      increment();
      decrement();
      increment();

      expect(getCount()).toBe(2);
    });
  });

  describe('Store API', () => {
    it('debería exponer getState', () => {
      const state = testStore.getState();
      expect(state).toBeDefined();
      expect(state.count).toBeDefined();
      expect(typeof state.increment).toBe('function');
    });

    it('debería exponer setState a través de acciones', () => {
      const { increment } = testStore.getState();

      act(() => {
        increment();
      });

      const state = testStore.getState();
      expect(state.count).toBe(1);
    });

    it('debería mantener consistencia en el estado', () => {
      const state = testStore.getState();
      const count1 = state.count;

      act(() => {
        state.increment();
      });

      const state2 = testStore.getState();
      expect(state2.count).toBe(count1 + 1);
    });
  });

  describe('Error Handling', () => {
    it('debería manejar actualizaciones asíncronas correctamente', async () => {
      const { increment, getCount } = testStore.getState();

      // Actualización asíncrona
      setTimeout(() => {
        increment();
      }, 0);

      // Esperar a que la actualización complete
      await new Promise(resolve => setTimeout(resolve, 10));

      expect(getCount()).toBe(1);
    });

    it('debería manejar múltiples actualizaciones rápidas', () => {
      const { increment, getCount } = testStore.getState();

      // Múltiples incrementos rápidos
      for (let i = 0; i < 10; i++) {
        increment();
      }

      expect(getCount()).toBe(10);
    });
  });

  describe('Performance', () => {
    it('debería manejar grandes volúmenes de actualizaciones', () => {
      const { increment, getCount } = testStore.getState();
      const iterations = 1000;

      const start = performance.now();

      for (let i = 0; i < iterations; i++) {
        increment();
      }

      const end = performance.now();
      const duration = end - start;

      expect(getCount()).toBe(iterations);
      expect(duration).toBeLessThan(100); // Debería completarse en menos de 100ms
    });

    it('debería tener acceso rápido al estado', () => {
      const { getState } = testStore;

      const start = performance.now();

      for (let i = 0; i < 1000; i++) {
        getState();
      }

      const end = performance.now();
      const duration = end - start;

      expect(duration).toBeLessThan(50); // Debería completarse en menos de 50ms
    });
  });
});

describe('Zustand Stores - Integration with Real Stores', () => {
  it('debería simular el patrón de useSRSStore', () => {
    // Simular un store simple similar a SRS
    interface MockSRSState {
      cards: Array<{ id: string; phrase: string; reviewed: boolean }>;
      addCard: (card: { id: string; phrase: string }) => void;
      reviewCard: (cardId: string) => void;
      getReviewedCount: () => number;
    }

    const mockSRSStore = create<MockSRSState>()((set, get) => ({
      cards: [],
      addCard: (card) =>
        set((state) => ({
          cards: [...state.cards, { ...card, reviewed: false }],
        })),
      reviewCard: (cardId) =>
        set((state) => ({
          cards: state.cards.map((card: { id: string; phrase: string; reviewed: boolean }) =>
            card.id === cardId ? { ...card, reviewed: true } : card
          ),
        })),
      getReviewedCount: (): number => {
        const state: MockSRSState = get();
        return state.cards.filter((card) => card.reviewed).length;
      },
    }));

    // Test the functionality
    const { addCard, reviewCard, getReviewedCount } = mockSRSStore.getState();

    addCard({ id: '1', phrase: 'Bonjour' });
    addCard({ id: '2', phrase: 'Merci' });

    expect(getReviewedCount()).toBe(0);

    reviewCard('1');
    expect(getReviewedCount()).toBe(1);

    reviewCard('2');
    expect(getReviewedCount()).toBe(2);
  });

  it('debería simular el patrón de useUserStore', () => {
    // Simular un store de usuario similar a useUserStore
    interface MockUserState {
      appLanguage: string;
      mode: 'guided' | 'autonomous';
      hasCompletedOnboarding: boolean;
      setAppLanguage: (lang: string) => void;
      setMode: (mode: 'guided' | 'autonomous') => void;
      completeOnboarding: () => void;
    }

    const mockUserStore = create<MockUserState>()(
      persist(
        (set) => ({
          appLanguage: TEST_APP_LANGUAGE,
          mode: 'guided',
          hasCompletedOnboarding: false,
          setAppLanguage: (lang) => set({ appLanguage: lang }),
          setMode: (mode) => set({ mode }),
          completeOnboarding: () => set({ hasCompletedOnboarding: true }),
        }),
        {
          name: 'mock-user-storage',
        }
      )
    );

    // Test the functionality
    const { setAppLanguage, setMode, completeOnboarding } = mockUserStore.getState();

    setAppLanguage(TEST_TARGET_LANGUAGE as unknown as string); // Cast para compatibilidad con test
    setMode('autonomous');
    completeOnboarding();

    const state = mockUserStore.getState();
    expect(state.appLanguage).toBe(TEST_TARGET_LANGUAGE as unknown as string);
    expect(state.mode).toBe('autonomous');
    expect(state.hasCompletedOnboarding).toBe(true);
  });

  it('debería simular el patrón de useInputStore', () => {
    // Simular un store de input similar a useInputStore
    interface MockInputState {
      stats: Record<string, { wordsRead: number; wordsHeard: number }>;
      incrementWords: (key: string, type: 'read' | 'heard', count: number) => void;
      getStats: (key: string) => { wordsRead: number; wordsHeard: number };
    }

    const mockInputStore = create<MockInputState>()((set, get) => ({
      stats: {},
      incrementWords: (key, type, count) =>
        set((state) => ({
          stats: {
            ...state.stats,
            [key]: {
              wordsRead: (state.stats[key]?.wordsRead || 0) + (type === 'read' ? count : 0),
              wordsHeard: (state.stats[key]?.wordsHeard || 0) + (type === 'heard' ? count : 0),
            },
          },
        })),
      getStats: (key): { wordsRead: number; wordsHeard: number } => {
        const state: MockInputState = get();
        return state.stats[key] || { wordsRead: 0, wordsHeard: 0 };
      },
    }));

    // Test the functionality
    const { incrementWords, getStats } = mockInputStore.getState();

    incrementWords('fr-A1', 'read', 10);
    incrementWords('fr-A1', 'heard', 5);
    incrementWords('fr-A2', 'read', 20);

    const statsA1 = getStats('fr-A1');
    expect(statsA1.wordsRead).toBe(10);
    expect(statsA1.wordsHeard).toBe(5);

    const statsA2 = getStats('fr-A2');
    expect(statsA2.wordsRead).toBe(20);
    expect(statsA2.wordsHeard).toBe(0);
  });
});

describe('Zustand Stores - Edge Cases', () => {
  it('debería manejar estado vacío', () => {
    interface EmptyState {
      isEmpty: boolean;
      checkEmpty: () => boolean;
    }

    const emptyStore = create<EmptyState>()((set, get) => ({
      isEmpty: true,
      checkEmpty: (): boolean => {
        const state: EmptyState = get();
        return state.isEmpty;
      },
    }));

    const { isEmpty, checkEmpty } = emptyStore.getState();
    expect(isEmpty).toBe(true);
    expect(checkEmpty()).toBe(true);
  });

  it('debería manejar objetos complejos en estado', () => {
    interface ComplexState {
      user: { name: string; preferences: { theme: string; notifications: boolean } };
      updateUser: (user: { name: string; preferences: { theme: string; notifications: boolean } }) => void;
    }

    const complexStore = create<ComplexState>()((set) => ({
      user: {
        name: 'Test',
        preferences: {
          theme: 'light',
          notifications: true,
        },
      },
      updateUser: (user) => set({ user }),
    }));

    const { updateUser } = complexStore.getState();

    updateUser({
      name: 'New Name',
      preferences: {
        theme: 'dark',
        notifications: false,
      },
    });

    const state = complexStore.getState();
    expect(state.user.name).toBe('New Name');
    expect(state.user.preferences.theme).toBe('dark');
    expect(state.user.preferences.notifications).toBe(false);
  });

  it('debería manejar arrays en estado', () => {
    interface ArrayState {
      items: string[];
      addItem: (item: string) => void;
      removeItem: (item: string) => void;
      getItems: () => string[];
    }

    const arrayStore = create<ArrayState>()((set, get) => ({
      items: [],
      addItem: (item) =>
        set((state) => ({
          items: [...state.items, item],
        })),
      removeItem: (item) =>
        set((state) => ({
          items: state.items.filter((i) => i !== item),
        })),
      getItems: (): string[] => {
        const state: ArrayState = get();
        return state.items;
      },
    }));

    const { addItem, removeItem, getItems } = arrayStore.getState();

    addItem('apple');
    addItem('banana');
    addItem('orange');

    expect(getItems()).toEqual(['apple', 'banana', 'orange']);

    removeItem('banana');

    expect(getItems()).toEqual(['apple', 'orange']);
  });
});

describe('Zustand Stores - Memory Management', () => {
  it('debería liberar memoria al resetear', () => {
    interface MemoryState {
      largeData: string[];
      data: string;
      reset: () => void;
    }

    const memoryStore = create<MemoryState>()((set) => ({
      largeData: new Array(1000).fill('test'),
      data: 'test-data',
      reset: () => set({ largeData: [], data: '' }),
    }));

    const { reset } = memoryStore.getState();

    // Verificar que los datos existen
    const state = memoryStore.getState();
    expect(state.largeData.length).toBe(1000);
    expect(state.data).toBe('test-data');

    // Resetear
    reset();

    // Verificar que los datos fueron limpiados
    const newState = memoryStore.getState();
    expect(newState.largeData.length).toBe(0);
    expect(newState.data).toBe('');
  });

  it('debería manejar múltiples suscripciones sin memory leaks', () => {
    interface SubscriptionState {
      count: number;
      increment: () => void;
    }

    const subscriptionStore = create<SubscriptionState>()((set) => ({
      count: 0,
      increment: () => set((state) => ({ count: state.count + 1 })),
    }));

    // Simular múltiples suscripciones
    const subscriptions = [];
    for (let i = 0; i < 10; i++) {
      subscriptions.push(() => subscriptionStore.getState());
    }

    // Ejecutar todas las suscripciones
    subscriptions.forEach((sub) => {
      const state = sub();
      expect(typeof state.increment).toBe('function');
    });

    // El store debería seguir funcionando
    const { increment } = subscriptionStore.getState();
    increment();
    expect(subscriptionStore.getState().count).toBe(1);
  });
});