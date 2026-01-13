interface CardTagsProps {
  tags: string[];
}

const TAG_CONFIG = {
  verb: { label: 'Verbo', className: 'bg-sky-100 dark:bg-sky-900/30 text-sky-700 dark:text-sky-300' },
  noun: { label: 'Sustantivo', className: 'bg-accent-100 dark:bg-accent-900/30 text-accent-700 dark:text-accent-300' },
  adverb: { label: 'Adverbio', className: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300' },
  adjective: { label: 'Adjetivo', className: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300' },
} as const;

export function CardTags({ tags }: CardTagsProps) {
  return (
    <>
      {tags.map(tag => {
        const config = TAG_CONFIG[tag as keyof typeof TAG_CONFIG];
        if (!config) return null;
        return (
          <span key={tag} className={`px-2 py-1 ${config.className} text-xs rounded`}>
            {config.label}
          </span>
        );
      })}
    </>
  );
}
