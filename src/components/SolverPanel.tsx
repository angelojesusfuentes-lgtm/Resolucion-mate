import React, { useState } from 'react';
import type { MathResult } from '../lib/types';
import { solveProblem } from '../lib/math/solveProblem';
import SolutionSteps from './SolutionSteps';

const EXAMPLES = [
  { label: 'Aritmética', text: '(15 + 7) * 3 - 8' },
  { label: 'Álgebra', text: '3(x + 4) + 2x' },
  { label: 'Ecuación', text: '2x + 5 = 17' },
  { label: 'Fracción', text: '3/4 + 1/2' },
  { label: 'Porcentaje', text: '15% de 200' },
];

const SolverPanel: React.FC = () => {
  const [input, setInput] = useState('');
  const [result, setResult] = useState<MathResult | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSolve = () => {
    if (!input.trim()) return;
    setLoading(true);
    // Pequeño timeout para mostrar el efecto de carga
    setTimeout(() => {
      const res = solveProblem(input);
      setResult(res);
      setLoading(false);
    }, 150);
  };

  const handleExample = (text: string) => {
    setInput(text);
    setResult(null);
    setTimeout(() => {
      const res = solveProblem(text);
      setResult(res);
    }, 200);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSolve();
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
      {/* Header panel */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-4">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🔍</span>
          <div>
            <h2 className="text-white font-bold text-lg">Resolver Problema</h2>
            <p className="text-white/80 text-sm">Ingresa cualquier problema matemático</p>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Ejemplos rápidos */}
        <div className="mb-4">
          <p className="text-xs text-gray-500 font-medium mb-2">Ejemplos rápidos:</p>
          <div className="flex flex-wrap gap-2">
            {EXAMPLES.map((ex) => (
              <button
                key={ex.label}
                onClick={() => handleExample(ex.text)}
                className="text-xs px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg border border-indigo-200 transition-colors font-medium"
              >
                {ex.label}
              </button>
            ))}
          </div>
        </div>

        {/* Input */}
        <div className="relative">
          <textarea
            value={input}
            onChange={(e) => { setInput(e.target.value); setResult(null); }}
            onKeyDown={handleKeyDown}
            placeholder="Escribe aquí tu problema...&#10;Ej: 3x + 5 = 20  |  3/4 + 1/2  |  15% de 200"
            rows={3}
            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-indigo-400 focus:outline-none text-gray-800 resize-none text-sm transition-colors"
          />
          <p className="text-xs text-gray-400 mt-1">Presiona Enter o el botón para resolver</p>
        </div>

        {/* Botón resolver */}
        <button
          onClick={handleSolve}
          disabled={!input.trim() || loading}
          className="btn-primary mt-4 w-full"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Resolviendo...
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              ✨ Resolver paso a paso
            </span>
          )}
        </button>

        {/* Resultado */}
        {result && <SolutionSteps result={result} />}
      </div>
    </div>
  );
};

export default SolverPanel;
