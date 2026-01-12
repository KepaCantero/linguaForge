import { motion } from 'framer-motion';
import type { ContentSource } from '@/types/srs';

type FilterType = 'all' | 'new' | 'due' | 'mastered';
type SourceType = ContentSource['type'] | 'all';

interface DecksFiltersProps {
  searchQuery: string;
  sourceFilter: SourceType;
  filter: FilterType;
  onSearchChange: (value: string) => void;
  onSourceFilterChange: (value: SourceType) => void;
  onFilterChange: (value: FilterType) => void;
}

export function DecksFilters({
  searchQuery,
  sourceFilter,
  filter,
  onSearchChange,
  onSourceFilterChange,
  onFilterChange,
}: DecksFiltersProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="flex flex-wrap gap-2"
    >
      <input
        type="text"
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder="Buscar palabras..."
        className="flex-1 min-w-[200px] px-4 py-2.5 rounded-xl bg-glass-surface backdrop-blur-md border border-white/20 text-white placeholder:text-lf-muted focus:ring-2 focus:ring-lf-accent focus:border-transparent"
      />
      <select
        value={sourceFilter}
        onChange={(e) => onSourceFilterChange(e.target.value as SourceType)}
        className="px-4 py-2.5 rounded-xl bg-glass-surface backdrop-blur-md border border-white/20 text-white focus:ring-2 focus:ring-lf-accent focus:border-transparent"
      >
        <option value="all">Todas las fuentes</option>
        <option value="video">Videos</option>
        <option value="audio">Audios</option>
        <option value="text">Textos</option>
      </select>
      <select
        value={filter}
        onChange={(e) => onFilterChange(e.target.value as FilterType)}
        className="px-4 py-2.5 rounded-xl bg-glass-surface backdrop-blur-md border border-white/20 text-white focus:ring-2 focus:ring-lf-accent focus:border-transparent"
      >
        <option value="all">Todas</option>
        <option value="new">Nuevas</option>
        <option value="due">Pendientes</option>
        <option value="mastered">Dominadas</option>
      </select>
    </motion.div>
  );
}
