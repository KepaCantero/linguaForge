interface CardTagsProps {
  tags: string[];
}

const TAG_CONFIG = {
  verb: { label: 'Verbo', className: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' },
  noun: { label: 'Sustantivo', className: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' },
  adverb: { label: 'Adverbio', className: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300' },
  adjective: { label: 'Adjetivo', className: 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300' },
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
