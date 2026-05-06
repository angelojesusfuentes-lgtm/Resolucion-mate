import React, { useState, useEffect, useCallback } from 'react';
import type { Category, HistoryEntry } from '../lib/types';
import { CATEGORY_LABELS, CATEGORY_ICONS, DIFFICULTY_LABELS, CATEGORY_COLORS, DIFFICULTY_COLORS } from '../lib/types';
import { getHistory, clearHistory } from '../lib/historyStorage';
import SolutionSteps from './SolutionSteps';

// ─── Types ────────────────────────────────────────────────────────────────────
type DateFilter = 'all' | 'today' | 'week' | 'month';
type SourceFilter = 'all' | 'practice' | 'exam';
type CorrectFilter = 'all' | 'correct' | 'incorrect';

// ─── Constants ────────────────────────────────────────────────────────────────
const CATEGORIES: Category[] = ['aritmetica', 'algebra', 'ecuaciones', 'fracciones', 'porcentajes', 'trigonometria', 'logaritmos', 'limites', 'derivadas', 'integrales', 'matrices'];
const PAGE_SIZE = 20;

// ─── Helpers ──────────────────────────────────────────────────────────────────
function formatDate(ts: number): string {
  return new Date(ts).toLocaleString('es-ES', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

function inDateRange(ts: number, filter: DateFilter): boolean {
  const now = Date.now();
  if (filter === 'all') return true;
  if (filter === 'today') {
    const d = new Date(ts);
    const t = new Date();
    return d.getDate() === t.getDate() && d.getMonth() === t.getMonth() && d.getFullYear() === t.getFullYear();
  }
  if (filter === 'week') return now - ts < 7 * 24 * 60 * 60 * 1000;
  return now - ts < 30 * 24 * 60 * 60 * 1000;
}

// ─── Component ────────────────────────────────────────────────────────────────
const HistoryPanel: React.FC = () => {
  const [entries, setEntries] = useState<HistoryEntry[]>([]);
  const [catFilter, setCatFilter] = useState<Category | 'all'>('all');
  const [dateFilter, setDateFilter] = useState<DateFilter>('all');
  const [sourceFilter, setSourceFilter] = useState<SourceFilter>('all');
  const [correctFilter, setCorrectFilter] = useState<CorrectFilter>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [page, setPage] = useState<number>(1);

  const loadHistory = useCallback(() => {
    setEntries(getHistory());
  }, []);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  const handleClear = () => {
    if (window.confirm('¿Limpiar todo el historial? Esta acción no se puede deshacer.')) {
      clearHistory();
      setEntries([]);
    }
  };

  const resetFilters = () => {
    setCatFilter('all');
    setDateFilter('all');
    setSourceFilter('all');
    setCorrectFilter('all');
    setPage(1);
  };

  // ── Filter logic ──────────────────────────────────────────────────────────
  const filtered = entries.filter(e => {
    if (catFilter !== 'all' && e.problem.category !== catFilter) return false;
    if (!inDateRange(e.timestamp, dateFilter)) return false;
    if (sourceFilter === 'practice' && e.source !== 'practice') return false;
    if (sourceFilter === 'exam' && e.source !== 'exam') return false;
    if (correctFilter === 'correct' && !e.isCorrect) return false;
    if (correctFilter === 'incorrect' && e.isCorrect !== false) return false;
    return true;
  });

  const paginated = filtered.slice(0, page * PAGE_SIZE);
  const hasMore = paginated.length < filtered.length;

  // ── Filter button helper ──────────────────────────────────────────────────
  const filterBtn = (active: boolean, onClick: () => void, label: string) => (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${
        active
          ? 'border-amber-400 bg-amber-50 text-amber-700'
          : 'border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50'
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-500 to-orange-500 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">📚</span>
            <div>
              <h2 className="text-white font-bold text-lg">Historial</h2>
              <p className="text-white/80 text-sm">
                {entries.length} problema{entries.length !== 1 ? 's' : ''} guardado{entries.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={loadHistory}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white/20 hover:bg-white/30 text-white rounded-lg text-xs font-semibold transition-colors"
            >
              🔄 Actualizar
            </button>
            {entries.length > 0 && (
              <button
                onClick={handleClear}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white/20 hover:bg-red-500/50 text-white rounded-lg text-xs font-semibold transition-colors"
              >
                🗑️ Limpiar
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="p-6">
        {entries.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <span className="text-5xl block mb-3">📭</span>
            <p className="text-sm font-medium text-gray-500">Aún no hay historial</p>
            <p className="text-xs mt-1">Los problemas aparecerán aquí cuando practiques o hagas exámenes</p>
          </div>
        ) : (
          <>
            {/* Filters */}
            <div className="space-y-3 mb-5 pb-5 border-b border-gray-100">
              {/* Category */}
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Categoría</p>
                <div className="flex flex-wrap gap-1.5">
                  {filterBtn(catFilter === 'all', () => { setCatFilter('all'); setPage(1); }, 'Todas')}
                  {CATEGORIES.map(cat =>
                    filterBtn(
                      catFilter === cat,
                      () => { setCatFilter(cat); setPage(1); },
                      `${CATEGORY_ICONS[cat]} ${CATEGORY_LABELS[cat]}`
                    )
                  )}
                </div>
              </div>

              <div className="flex flex-wrap gap-5">
                {/* Date */}
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Fecha</p>
                  <div className="flex flex-wrap gap-1.5">
                    {([
                      { label: 'Todos', value: 'all' as DateFilter },
                      { label: 'Hoy', value: 'today' as DateFilter },
                      { label: '7 días', value: 'week' as DateFilter },
                      { label: '30 días', value: 'month' as DateFilter },
                    ] as const).map(opt =>
                      filterBtn(dateFilter === opt.value, () => { setDateFilter(opt.value); setPage(1); }, opt.label)
                    )}
                  </div>
                </div>

                {/* Source */}
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Fuente</p>
                  <div className="flex gap-1.5">
                    {filterBtn(sourceFilter === 'all', () => { setSourceFilter('all'); setPage(1); }, 'Todos')}
                    {filterBtn(sourceFilter === 'practice', () => { setSourceFilter('practice'); setPage(1); }, '🎲 Práctica')}
                    {filterBtn(sourceFilter === 'exam', () => { setSourceFilter('exam'); setPage(1); }, '📝 Examen')}
                  </div>
                </div>

                {/* Correct/Incorrect */}
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Resultado</p>
                  <div className="flex gap-1.5">
                    {filterBtn(correctFilter === 'all', () => { setCorrectFilter('all'); setPage(1); }, 'Todos')}
                    {filterBtn(correctFilter === 'correct', () => { setCorrectFilter('correct'); setPage(1); }, '✓ Correcto')}
                    {filterBtn(correctFilter === 'incorrect', () => { setCorrectFilter('incorrect'); setPage(1); }, '✗ Incorrecto')}
                  </div>
                </div>
              </div>

              {/* Results count + reset */}
              <div className="flex items-center justify-between">
                <p className="text-xs text-gray-500">
                  {filtered.length} resultado{filtered.length !== 1 ? 's' : ''}
                  {filtered.length !== entries.length && ` de ${entries.length}`}
                </p>
                {(catFilter !== 'all' || dateFilter !== 'all' || sourceFilter !== 'all' || correctFilter !== 'all') && (
                  <button
                    onClick={resetFilters}
                    className="text-xs text-amber-600 hover:text-amber-700 font-medium"
                  >
                    Limpiar filtros ×
                  </button>
                )}
              </div>
            </div>

            {/* Entry list */}
            {filtered.length === 0 ? (
              <div className="text-center py-10 text-gray-400">
                <span className="text-3xl block mb-2">🔍</span>
                <p className="text-sm">No hay resultados con los filtros seleccionados</p>
              </div>
            ) : (
              <div className="space-y-2">
                {paginated.map(entry => (
                  <div
                    key={entry.id}
                    className={`rounded-xl border overflow-hidden transition-all ${
                      entry.isCorrect === true
                        ? 'border-emerald-200'
                        : entry.isCorrect === false
                          ? 'border-red-200'
                          : 'border-gray-200'
                    }`}
                  >
                    <button
                      onClick={() => setExpandedId(expandedId === entry.id ? null : entry.id)}
                      className="w-full flex items-center gap-3 p-3 text-left hover:bg-gray-50 transition-colors"
                    >
                      {/* Indicator */}
                      <span className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold ${
                        entry.isCorrect === true
                          ? 'bg-emerald-100 text-emerald-600'
                          : entry.isCorrect === false
                            ? 'bg-red-100 text-red-500'
                            : 'bg-gray-100 text-gray-400'
                      }`}>
                        {entry.isCorrect === true ? '✓' : entry.isCorrect === false ? '✗' : '—'}
                      </span>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 mb-0.5 flex-wrap">
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${CATEGORY_COLORS[entry.problem.category]}`}>
                            {CATEGORY_ICONS[entry.problem.category]} {CATEGORY_LABELS[entry.problem.category]}
                          </span>
                          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${DIFFICULTY_COLORS[entry.problem.difficulty]}`}>
                            {DIFFICULTY_LABELS[entry.problem.difficulty]}
                          </span>
                          <span className="text-xs text-gray-400">
                            {entry.source === 'exam' ? '📝 Examen' : '🎲 Práctica'}
                          </span>
                        </div>
                        <p className="text-sm text-gray-800 font-medium truncate">{entry.problem.statement}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{formatDate(entry.timestamp)}</p>
                      </div>

                      <span className="text-gray-400 text-xs flex-shrink-0 ml-1">
                        {expandedId === entry.id ? '▲' : '▼'}
                      </span>
                    </button>

                    {expandedId === entry.id && (
                      <div className="px-4 pb-4 border-t border-gray-100">
                        {entry.userAnswer && (
                          <div className="mt-3 flex items-center gap-2 text-sm">
                            <span className="text-gray-500 text-xs">Tu respuesta:</span>
                            <span className={`font-semibold ${entry.isCorrect ? 'text-emerald-600' : 'text-red-500'}`}>
                              {entry.userAnswer}
                            </span>
                          </div>
                        )}
                        <SolutionSteps result={entry.problem.result} />
                      </div>
                    )}
                  </div>
                ))}

                {hasMore && (
                  <button
                    onClick={() => setPage(p => p + 1)}
                    className="w-full py-2.5 text-sm text-amber-600 font-semibold border-2 border-amber-200 rounded-xl hover:bg-amber-50 transition-colors"
                  >
                    Ver más ({filtered.length - paginated.length} restantes)
                  </button>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default HistoryPanel;
