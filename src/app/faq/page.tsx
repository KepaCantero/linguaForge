/**
 * Página de FAQ y Ayuda
 *
 * Proporciona respuestas a preguntas comunes sobre LinguaForge
 */

'use client';

import { Search } from 'lucide-react';
import { FAQList } from './components/FAQList';
import { useFAQFilters } from './hooks/useFAQFilters';

export default function FAQPage() {
  const {
    searchQuery,
    filteredCategories,
    openCategories,
    openQuestions,
    toggleCategory,
    toggleQuestion,
    handleSearchChange,
  } = useFAQFilters();

  return (
    <div className="min-h-screen p-4 pb-20 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-calm-text-primary mb-2">Ayuda y Preguntas Frecuentes</h1>
        <p className="text-calm-text-muted">Encuentra respuestas sobre cómo usar LinguaForge</p>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-calm-text-muted w-5 h-5" />
          <input
            type="text"
            placeholder="Buscar en las preguntas..."
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-calm-bg-elevated border border-calm-warm-100 rounded-xl text-calm-text-primary placeholder-calm-text-muted focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>
      </div>

      {/* FAQ Categories */}
      <FAQList
        categories={filteredCategories}
        openCategories={openCategories}
        openQuestions={openQuestions}
        onToggleCategory={toggleCategory}
        onToggleQuestion={toggleQuestion}
      />

      {/* No Results */}
      {filteredCategories.length === 0 && (
        <div className="text-center py-12">
          <p className="text-calm-text-muted">No se encontraron preguntas que coincidan con &quot;{searchQuery}&quot;</p>
        </div>
      )}

      {/* Contact Support */}
      <div className="mt-12 text-center">
        <p className="text-calm-text-muted mb-4">¿No encuentras tu respuesta?</p>
        <a
          href="mailto:soporte@linguaforge.app"
          className="inline-flex items-center gap-2 px-6 py-3 bg-accent-500 text-calm-text-primary font-medium rounded-xl hover:bg-accent-500-dark transition-colors"
        >
          <span>📧</span> Contactar Soporte
        </a>
      </div>
    </div>
  );
}
