interface JanusHeaderProps {
  phrasesCreated: number;
}

export function JanusHeader({ phrasesCreated }: JanusHeaderProps) {
  return (
    <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-aaa-xl p-4 mb-4 text-white">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold">🧩 Janus Composer</h3>
          <p className="text-xs text-white/80 mt-0.5">
            Construye frases seleccionando opciones
          </p>
        </div>
        {phrasesCreated > 0 && (
          <span className="text-sm bg-white/20 px-3 py-1 rounded-full">
            {phrasesCreated} frases
          </span>
        )}
      </div>
    </div>
  );
}
