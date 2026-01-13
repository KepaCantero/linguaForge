'use client';

import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface InputStats {
  wordsRead: number;
  wordsHeard: number;
  wordsSpoken: number;
  minutesListened: number;
  minutesRead: number;
}

interface KrashenChartsProps {
  stats: InputStats;
  thresholds: {
    read: number;
    heard: number;
    spoken: number;
  };
  languageCode: string;
  levelCode: string;
}

/**
 * Componente de gráficos Recharts para Dashboard Krashen
 * Visualiza métricas de input comprensible
 */
export function KrashenCharts({
  stats,
  thresholds,
  languageCode,
  levelCode,
}: KrashenChartsProps) {
  // Datos para gráfico de barras (palabras)
  const wordsData = [
    {
      name: 'Leídas',
      actual: stats.wordsRead,
      objetivo: thresholds.read,
      fill: 'var(--sky-600)',
    },
    {
      name: 'Escuchadas',
      actual: stats.wordsHeard,
      objetivo: thresholds.heard,
      fill: 'var(--accent-500)',
    },
    {
      name: 'Habladas',
      actual: stats.wordsSpoken,
      objetivo: thresholds.spoken,
      fill: '#F59E0B',
    },
  ];

  // Datos para gráfico de área (progreso semanal)
  const weeklyData = [
    { day: 'Lun', words: stats.wordsRead * 0.1, audio: stats.wordsHeard * 0.1 },
    { day: 'Mar', words: stats.wordsRead * 0.15, audio: stats.wordsHeard * 0.15 },
    { day: 'Mié', words: stats.wordsRead * 0.2, audio: stats.wordsHeard * 0.2 },
    { day: 'Jue', words: stats.wordsRead * 0.25, audio: stats.wordsHeard * 0.25 },
    { day: 'Vie', words: stats.wordsRead * 0.15, audio: stats.wordsHeard * 0.15 },
    { day: 'Sáb', words: stats.wordsRead * 0.1, audio: stats.wordsHeard * 0.1 },
    { day: 'Dom', words: stats.wordsRead * 0.05, audio: stats.wordsHeard * 0.05 },
  ];

  const progressRead = Math.min((stats.wordsRead / thresholds.read) * 100, 100);
  const progressHeard = Math.min((stats.wordsHeard / thresholds.heard) * 100, 100);
  const progressSpoken = Math.min((stats.wordsSpoken / thresholds.spoken) * 100, 100);

  return (
    <div className="space-y-6">
      {/* Título */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-calm-text-primary dark:text-white mb-2">
          Input Comprensible - {languageCode.toUpperCase()} {levelCode}
        </h2>
        <p className="text-sm text-calm-text-muted dark:text-calm-text-muted">
          Métricas Krashen: Palabras leídas, escuchadas y habladas
        </p>
      </div>

      {/* Gráfico de barras - Progreso vs Objetivo */}
      <div className="bg-white dark:bg-calm-bg-elevated rounded-xl p-6">
        <h3 className="text-lg font-semibold text-calm-text-primary dark:text-white mb-4">
          Progreso vs Objetivo
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={wordsData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis dataKey="name" stroke="#6B7280" />
            <YAxis stroke="#6B7280" />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1F2937',
                border: '1px solid #374151',
                borderRadius: '8px',
              }}
            />
            <Legend />
            <Bar dataKey="actual" fill="var(--sky-600)" name="Actual" radius={[8, 8, 0, 0]} />
            <Bar dataKey="objetivo" fill="#9CA3AF" name="Objetivo" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Gráfico de área - Progreso semanal */}
      <div className="bg-white dark:bg-calm-bg-elevated rounded-xl p-6">
        <h3 className="text-lg font-semibold text-calm-text-primary dark:text-white mb-4">
          Actividad Semanal
        </h3>
        <ResponsiveContainer width="100%" height={250}>
          <AreaChart data={weeklyData}>
            <defs>
              <linearGradient id="colorWords" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--sky-600)" stopOpacity={0.8} />
                <stop offset="95%" stopColor="var(--sky-600)" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorAudio" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--accent-500)" stopOpacity={0.8} />
                <stop offset="95%" stopColor="var(--accent-500)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis dataKey="day" stroke="#6B7280" />
            <YAxis stroke="#6B7280" />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1F2937',
                border: '1px solid #374151',
                borderRadius: '8px',
              }}
            />
            <Legend />
            <Area
              type="monotone"
              dataKey="words"
              stroke="var(--sky-600)"
              fillOpacity={1}
              fill="url(#colorWords)"
              name="Palabras leídas"
            />
            <Area
              type="monotone"
              dataKey="audio"
              stroke="var(--accent-500)"
              fillOpacity={1}
              fill="url(#colorAudio)"
              name="Palabras escuchadas"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Indicadores de progreso */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white dark:bg-calm-bg-elevated rounded-xl p-4">
          <div className="text-sm text-calm-text-secondary dark:text-calm-text-muted mb-2">📖 Leídas</div>
          <div className="text-2xl font-bold text-accent-600 dark:text-accent-400 mb-2">
            {Math.round(progressRead)}%
          </div>
          <div className="w-full h-2 bg-calm-bg-tertiary dark:bg-calm-bg-tertiary rounded-full overflow-hidden">
            <div
              className="h-full bg-accent-500 rounded-full transition-all duration-500"
              style={{ width: `${progressRead}%` }}
            />
          </div>
        </div>
        <div className="bg-white dark:bg-calm-bg-elevated rounded-xl p-4">
          <div className="text-sm text-calm-text-secondary dark:text-calm-text-muted mb-2">🎧 Escuchadas</div>
          <div className="text-2xl font-bold text-accent-600 dark:text-accent-400 mb-2">
            {Math.round(progressHeard)}%
          </div>
          <div className="w-full h-2 bg-calm-bg-tertiary dark:bg-calm-bg-tertiary rounded-full overflow-hidden">
            <div
              className="h-full bg-accent-500 rounded-full transition-all duration-500"
              style={{ width: `${progressHeard}%` }}
            />
          </div>
        </div>
        <div className="bg-white dark:bg-calm-bg-elevated rounded-xl p-4">
          <div className="text-sm text-calm-text-secondary dark:text-calm-text-muted mb-2">🗣 Habladas</div>
          <div className="text-2xl font-bold text-amber-600 dark:text-amber-400 mb-2">
            {Math.round(progressSpoken)}%
          </div>
          <div className="w-full h-2 bg-calm-bg-tertiary dark:bg-calm-bg-tertiary rounded-full overflow-hidden">
            <div
              className="h-full bg-amber-500 rounded-full transition-all duration-500"
              style={{ width: `${progressSpoken}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

