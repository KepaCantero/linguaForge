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
        <h1 className="text-3xl font-bold text-white mb-2">Ayuda y Preguntas Frecuentes</h1>
        <p className="text-gray-400">Encuentra respuestas sobre cómo usar LinguaForge</p>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Buscar en las preguntas..."
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-lf-accent"
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
          <p className="text-gray-500">No se encontraron preguntas que coincidan con &quot;{searchQuery}&quot;</p>
        </div>
      )}

      {/* Contact Support */}
      <div className="mt-12 text-center">
        <p className="text-gray-400 mb-4">¿No encuentras tu respuesta?</p>
        <a
          href="mailto:soporte@linguaforge.app"
          className="inline-flex items-center gap-2 px-6 py-3 bg-lf-primary text-white font-medium rounded-xl hover:bg-lf-primary-dark transition-colors"
        >
          <span>📧</span> Contactar Soporte
        </a>
      </div>
    </div>
  );
}
