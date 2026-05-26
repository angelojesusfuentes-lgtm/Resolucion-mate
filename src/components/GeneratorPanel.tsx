import React, { useState, type FC } from 'react';
import type { Category, Difficulty, GeneratedProblem } from '../lib/types';
import { CATEGORY_LABELS, DIFFICULTY_LABELS, CATEGORY_ICONS } from '../lib/types';
import { generateProblem } from '../lib/math/generateProblem';
import SolutionSteps from './SolutionSteps';
import { addEntry } from '../lib/historyStorage';

const CATEGORIES: Category[] = [
  'aritmetica',
  'algebra',
  'ecuaciones',
  'fracciones',
  'porcentajes',
  'trigonometria',
  'logaritmos',
  'limites',
  'derivadas',
  'integrales',
];

const DIFFICULTIES: Difficulty[] = ['facil', 'medio', 'dificil'];

// ✅ Validación mejorada pero simple
function checkAnswer(userInput: string, correctAnswer: string): boolean {
  if (!userInput.trim()) return false;

  const clean = (s: string) =>
    s.trim().toLowerCase().replace(/\s+/g, '');

  const ua = clean(userInput);
  const ca = clean(correctAnswer);

  if (ua === ca) return true;

  const toNum = (s: string): number | null => {
    const xm = s.match(/x=(-?[\d.]+)/);
    if (xm) return parseFloat(xm[1]);

    const fm = s.match(/^(-?[\d]+)\/([\d]+)$/);
    if (fm) return parseInt(fm[1]) / parseInt(fm[2]);

    const n = parseFloat(s);
    return isNaN(n) ? null : n;
  };

  const uaN = toNum(ua);
  const caN = toNum(ca);

  if (uaN !== null && caN !== null) {
    return Math.abs(uaN - caN) < 0.01;
  }

  return false;
}

const GeneratorPanel: React.FC = () => {
  const [category, setCategory] = useState<Category>('aritmetica');
  const [difficulty, setDifficulty] = useState<Difficulty>('facil');
  const [problem, setProblem] = useState<GeneratedProblem | null>(null);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<GeneratedProblem[]>([]);
  const [userAnswer, setUserAnswer] = useState('');
  const [checked, setChecked] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [showSolution, setShowSolution] = useState(false);
  const [feedback, setFeedback] = useState('');

  // ✅ sin setTimeout innecesario
  const handleGenerate = () => {
    setLoading(true);

    const gen = generateProblem(category, difficulty);

    setProblem(gen);
    setHistory(prev => [gen, ...prev].slice(0, 5));
    setUserAnswer('');
    setChecked(false);
    setIsCorrect(false);
    setShowSolution(false);
    setFeedback('');

    setLoading(false);
  };

  const handleVerify = () => {
  if (!problem) return;

  const correct = checkAnswer(userAnswer, problem.result.answer);

  setChecked(true);
  setIsCorrect(correct);
  setShowSolution(false);

  setFeedback(
    correct
      ? '✅ Correcto'
      : '❌ Incorrecto, intenta de nuevo o revisa la solución'
  );

  addEntry({
    id: `practice-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    timestamp: Date.now(),
    problem,
    userAnswer,
    isCorrect: correct,
    source: 'practice',
  });
  };

return (
  <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
    
    {/* Header */}
    <div className="bg-gradient-to-r from-emerald-500 to-teal-600 px-6 py-4">
      <div className="flex items-center gap-3">
        <span className="text-2xl">🎲</span>
        <div>
          <h2 className="text-white font-bold text-lg">
            Generador de Problemas
          </h2>
          <p className="text-white/80 text-sm">
            Practica con problemas aleatorios
          </p>
        </div>
      </div>
    </div>

    {/* CONTENIDO */}
    <div className="p-6">

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        
        {/* Categorías */}
        <div>
          <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">
            Categoría
          </label>

          <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-xl border-2 text-sm ${
                  category === cat
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                    : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <span className="text-base">{CATEGORY_ICONS[cat]}</span>
                {CATEGORY_LABELS[cat]}
              </button>
            ))}
          </div>
        </div>

        {/* Dificultad */}
        <div>
          <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">
            Dificultad
          </label>

          <div className="space-y-2">
            {DIFFICULTIES.map((diff) => (
              <button
                key={diff}
                onClick={() => setDifficulty(diff)}
                className={`w-full px-3 py-2 rounded-xl border-2 ${
                  difficulty === diff
                    ? 'border-emerald-500 bg-emerald-50'
                    : 'border-gray-200'
                }`}
              >
                {DIFFICULTY_LABELS[diff]}
              </button>
            ))}
          </div>
        </div>

      </div>

      {/* Botón generar */}
      <button
        onClick={handleGenerate}
        className="w-full mb-4 py-2 rounded-xl bg-emerald-500 text-white font-semibold hover:bg-emerald-600"
      >
        🎲 Generar Problema
      </button>

      {/* Problema */}
      {problem && (
        <div className="space-y-4">

          <div className="p-4 border rounded-xl">
            {problem.statement}
          </div>

          <input
            value={userAnswer}
            onChange={(e) => setUserAnswer(e.target.value)}
            className="w-full border p-2 rounded"
            placeholder="Tu respuesta"
          />

          <button
            onClick={handleVerify}
            className="px-4 py-2 bg-emerald-500 text-white rounded"
          >
            Verificar
          </button>

          {checked && <p>{feedback}</p>}

          {checked && !isCorrect && (
            <button
              onClick={() => setShowSolution(true)}
              className="px-4 py-2 bg-indigo-500 text-white rounded"
            >
              Ver solución
            </button>
          )}

          {showSolution && (
            <SolutionSteps result={problem.result} />
          )}

        </div>
      )}

    </div>
  </div>
  
);
};

export default GeneratorPanel;
