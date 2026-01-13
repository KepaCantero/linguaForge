
type TabId = 'build' | 'inventory' | 'gallery' | 'milestones';

interface TabConfig {
  id: TabId;
  label: string;
  icon: string;
}

const TABS: TabConfig[] = [
  { id: 'build', label: 'Construir', icon: '🏗️' },
  { id: 'inventory', label: 'Inventario', icon: '📦' },
  { id: 'gallery', label: 'Galería', icon: '🎨' },
  { id: 'milestones', label: 'Hitos', icon: '🏆' },
];

interface ConstructionHeaderProps {
  activeTab: TabId;
  totalBuilds: number;
  masteryLevel: number;
  constructionStreak: number;
  onTabChange: (tab: TabId) => void;
}

export function ConstructionHeader({
  activeTab,
  totalBuilds,
  masteryLevel,
  constructionStreak,
  onTabChange,
}: ConstructionHeaderProps) {
  return (
    <header className="sticky top-0 z-20 bg-gray-900/90 backdrop-blur-md border-b border-amber-500/20">
      <div className="max-w-6xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-3">
              <span className="text-3xl">🏰</span>
              Tu Palacio del Conocimiento
            </h1>
            <p className="text-sm text-gray-400 mt-1">
              Construye mientras aprendes francés
            </p>
          </div>

          {/* Quick stats */}
          <div className="hidden md:flex items-center gap-4">
            <div className="text-center px-3 py-1 bg-amber-500/10 rounded-lg border border-amber-500/20">
              <div className="text-amber-400 font-bold">{totalBuilds}</div>
              <div className="text-xs text-gray-400">Construido</div>
            </div>
            <div className="text-center px-3 py-1 bg-purple-500/10 rounded-lg border border-purple-500/20">
              <div className="text-purple-400 font-bold">{masteryLevel}</div>
              <div className="text-xs text-gray-400">Maestría</div>
            </div>
            <div className="text-center px-3 py-1 bg-orange-500/10 rounded-lg border border-orange-500/20">
              <div className="text-orange-400 font-bold">{constructionStreak}🔥</div>
              <div className="text-xs text-gray-400">Racha</div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`
                flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-sm
                transition-all duration-200 whitespace-nowrap
                ${activeTab === tab.id
                  ? 'bg-amber-500 text-gray-900'
                  : 'bg-gray-800/50 text-gray-300 hover:bg-gray-700/50'
                }
              `}
            >
              <span>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>
      </div>
    </header>
  );
}
