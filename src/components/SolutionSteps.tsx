import React from 'react';
import type { MathResult } from '../lib/types';
import { CATEGORY_LABELS, DIFFICULTY_LABELS, CATEGORY_COLORS, DIFFICULTY_COLORS, CATEGORY_ICONS } from '../lib/types';

interface SolutionStepsProps {
  result: MathResult;
  title?: string;
}

const SolutionSteps: React.FC<SolutionStepsProps> = ({ result, title }) => {
  if (result.isError) {
    return (
      <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl">
        <div className="flex items-start gap-3">
          <span className="text-red-500 text-lg mt-0.5">⚠️</span>
          <div>
            <p className="font-semibold text-red-700 text-sm">No se pudo resolver</p>
            <p className="text-red-600 text-sm mt-1">{result.errorMessage}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-4 space-y-4">
      {title && (
        <h3 className="font-semibold text-gray-700 text-sm uppercase tracking-wide">{title}</h3>
      )}

      {/* Tags de categoría y dificultad */}
      <div className="flex flex-wrap gap-2">
        <span className={`tag text-xs font-semibold px-2.5 py-1 rounded-full ${CATEGORY_COLORS[result.category]}`}>
          {CATEGORY_ICONS[result.category]} {CATEGORY_LABELS[result.category]}
        </span>
        <span className={`tag text-xs font-semibold px-2.5 py-1 rounded-full ${DIFFICULTY_COLORS[result.difficulty]}`}>
          {DIFFICULTY_LABELS[result.difficulty]}
        </span>
      </div>

      {/* Respuesta destacada */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl p-4 text-white">
        <p className="text-xs font-semibold uppercase tracking-wide text-white/70 mb-1">Respuesta</p>
        <p className="text-2xl font-bold">{result.answer}</p>
      </div>

      {/* Pasos */}
      {result.steps.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
            Resolución paso a paso ({result.steps.length} pasos)
          </p>
          <div className="space-y-2">
            {result.steps.map((step, i) => (
              <div
                key={i}
                className="step-item flex items-start gap-3 p-3 rounded-xl bg-gray-50 border-l-4 border-indigo-400"
                style={{ animationDelay: `${i * 50}ms` }}
              >
                <span className="flex-shrink-0 w-6 h-6 bg-indigo-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                  {i + 1}
                </span>
                <p className="text-gray-700 text-sm leading-relaxed">{step}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SolutionSteps;
