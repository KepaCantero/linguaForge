import es from './es.json';
import en from './en.json';

export type AppLanguage = 'es' | 'en';

export type TranslationKeys = typeof es;

const translations: Record<AppLanguage, TranslationKeys> = {
  es,
  en,
};

export function getTranslations(lang: AppLanguage): TranslationKeys {
  return translations[lang] || translations.es;
}

// Helper para acceder a traducciones anidadas
export function t(translations: TranslationKeys, path: string): string {
  const keys = path.split('.');
  let result: unknown = translations;

  for (const key of keys) {
    if (result && typeof result === 'object' && key in result) {
      result = (result as Record<string, unknown>)[key];
    } else {
      return path; // Fallback al path si no existe
    }
  }

  return typeof result === 'string' ? result : path;
}

export { es, en };
