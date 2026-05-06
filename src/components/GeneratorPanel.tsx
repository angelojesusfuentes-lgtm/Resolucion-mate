import React, { useState } from 'react';
import type { Category, Difficulty, GeneratedProblem } from '../lib/types';
import { CATEGORY_LABELS, DIFFICULTY_LABELS, CATEGORY_ICONS } from '../lib/types';
import { generateProblem } from '../lib/math/generateProblem';
import SolutionSteps from './SolutionSteps';
import { addEntry } from '../lib/historyStorage';

const CATEGORIES: Category[] = ['aritmetica', 'algebra', 'ecuaciones', 'fracciones', 'porcentajes'];
const DIFFICULTIES: Difficulty[] = ['facil', 'medio', 'dificil'];

const DIFF_COLORS: Record<Difficulty, string> = {
  facil: 'bg-emerald-500',
  medio: 'bg-yellow-500',
  dificil: 'bg-red-500',
};

const GeneratorPanel: React.FC = () => {
  const [category, setCategory] = useState<Category>('aritmetica');
  const [difficulty, setDifficulty] = useState<Difficulty>('facil');
  const [problem, setProblem] = useState<GeneratedProblem | null>(null);
  const [showSolution, setShowSolution] = useState(false);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<GeneratedProblem[]>([]);

  const handleGenerate = () => {
    setLoading(true);
    setShowSolution(false);
    setTimeout(() => {
      const gen = generateProblem(category, difficulty);
      setProblem(gen);
      setHistory(prev => [gen, ...prev].slice(0, 5));
      addEntry({
        id: `practice-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        timestamp: Date.now(),
        problem: gen,
        source: 'practice',
      });
      setLoading(false);
    }, 150);
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
      {/* Header panel */}
      <div className="bg-gradient-to-r from-emerald-500 to-teal-600 px-6 py-4">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🎲</span>
          <div>
            <h2 className="text-white font-bold text-lg">Generador de Problemas</h2>
            <p className="text-white/80 text-sm">Practica con problemas aleatorios</p>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Selectores */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          {/* Categoría */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">
              Categoría
            </label>
            <div className="space-y-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-xl border-2 text-sm font-medium transition-all ${
                    category === cat
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                      : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <span className="text-base">{CATEGORY_ICONS[cat]}</span>
                  {CATEGORY_LABELS[cat]}
                  {category === cat && (
                    <span className="ml-auto">
                      <svg className="w-4 h-4 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Dificultad */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">
              Nivel de Dificultad
            </label>
            <div className="space-y-2">
              {DIFFICULTIES.map((diff) => (
                <button
                  key={diff}
                  onClick={() => setDifficulty(diff)}
                  className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-xl border-2 text-sm font-medium transition-all ${
                    difficulty === diff
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                      : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <span className={`w-3 h-3 rounded-full ${DIFF_COLORS[diff]}`}></span>
                  {DIFFICULTY_LABELS[diff]}
                  {difficulty === diff && (
                    <span className="ml-auto">
                      <svg className="w-4 h-4 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Historial */}
            {history.length > 0 && (
              <div className="mt-4">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Recientes</p>
                <div className="space-y-1">
                  {history.slice(0, 4).map((h, i) => (
                    <div key={i} className="text-xs text-gray-500 truncate px-2 py-1 bg-gray-50 rounded-lg">
                      {h.statement}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Botón generar */}
        <button
          onClick={handleGenerate}
          disabled={loading}
          className="btn-secondary w-full"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Generando...
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              🎲 Generar Problema
            </span>
          )}
        </button>

        {/* Problema generado */}
        {problem && (
          <div className="mt-6 space-y-4">
            {/* Enunciado del problema */}
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-5 border border-gray-200">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">📝 Problema</p>
              <p className="text-gray-800 font-semibold text-lg leading-snug">{problem.statement}</p>
            </div>

            {/* Botón ver/ocultar solución */}
            <button
              onClick={() => setShowSolution(!showSolution)}
              className={`w-full py-3 px-4 rounded-xl border-2 font-semibold text-sm transition-all ${
                showSolution
                  ? 'border-indigo-400 bg-indigo-50 text-indigo-700 hover:bg-indigo-100'
                  : 'border-indigo-300 bg-white text-indigo-600 hover:bg-indigo-50 hover:border-indigo-400'
              }`}
            >
              {showSolution ? '🙈 Ocultar solución' : '👁️ Ver solución paso a paso'}
            </button>

            {/* Solución */}
            {showSolution && <SolutionSteps result={problem.result} />}
          </div>
        )}

        {!problem && (
          <div className="mt-6 text-center py-10 text-gray-400">
            <span className="text-5xl block mb-3">🎓</span>
            <p className="text-sm">Selecciona una categoría y dificultad,<br />luego genera tu primer problema</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default GeneratorPanel;
