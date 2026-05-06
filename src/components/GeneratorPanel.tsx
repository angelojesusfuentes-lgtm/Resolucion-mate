import React, { useState } from 'react';
import type { Category, Difficulty, GeneratedProblem } from '../lib/types';
import { CATEGORY_LABELS, DIFFICULTY_LABELS, CATEGORY_ICONS } from '../lib/types';
import { generateProblem } from '../lib/math/generateProblem';
import SolutionSteps from './SolutionSteps';
import { addEntry } from '../lib/historyStorage';

const CATEGORIES: Category[] = ['aritmetica', 'algebra', 'ecuaciones', 'fracciones', 'porcentajes', 'trigonometria', 'logaritmos', 'limites', 'derivadas', 'integrales', 'matrices'];
const DIFFICULTIES: Difficulty[] = ['facil', 'medio', 'dificil'];

function checkAnswer(userInput: string, correctAnswer: string): boolean {
  if (!userInput.trim()) return false;
  const clean = (s: string) => s.trim().toLowerCase().replace(/\s/g, '');
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
  if (uaN !== null && caN !== null) return Math.abs(uaN - caN) < 0.01;
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

  const handleGenerate = () => {
    setLoading(true);
    setTimeout(() => {
      const gen = generateProblem(category, difficulty);
      setProblem(gen);
      setHistory(prev => [gen, ...prev].slice(0, 5));
      setUserAnswer('');
      setChecked(false);
      setIsCorrect(false);
      setShowSolution(false);
      setFeedback('');
      setLoading(false);
    }, 150);
  };

  const handleVerify = () => {
    if (!problem) return;
    const correct = checkAnswer(userAnswer, problem.result.answer);
    setChecked(true);
    setIsCorrect(correct);
    setShowSolution(correct);
    setFeedback(correct ? 'Correcto! Muy bien.' : 'Incorrecto. Puedes reintentar o ver la solucion.');
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
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">Categoria</label>
            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {CATEGORIES.map((cat) => (
                <button key={cat} onClick={() => setCategory(cat)} className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-xl border-2 text-sm font-medium transition-all ${category === cat ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50'}`}>
                  <span className="text-base">{CATEGORY_ICONS[cat]}</span>
                  {CATEGORY_LABELS[cat]}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">Nivel de Dificultad</label>
            <div className="space-y-2">
              {DIFFICULTIES.map((diff) => (
                <button key={diff} onClick={() => setDifficulty(diff)} className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-xl border-2 text-sm font-medium transition-all ${difficulty === diff ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50'}`}>
                  {DIFFICULTY_LABELS[diff]}
                </button>
              ))}
            </div>
            {history.length > 0 && (
              <div className="mt-4">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Recientes</p>
                <div className="space-y-1">
                  {history.slice(0, 4).map((h, i) => (
                    <div key={i} className="text-xs text-gray-500 truncate px-2 py-1 bg-gray-50 rounded-lg">{h.statement}</div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
        <button onClick={handleGenerate} disabled={loading} className="btn-secondary w-full">
          {loading ? 'Generando...' : '🎲 Generar Problema'}
        </button>
        {problem && (
          <div className="mt-6 space-y-4">
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-5 border border-gray-200">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Problema</p>
              <p className="text-gray-800 font-semibold text-lg leading-snug">{problem.statement}</p>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">Tu respuesta</label>
              <input value={userAnswer} onChange={(e) => setUserAnswer(e.target.value)} className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-gray-800 text-base focus:border-emerald-400 focus:outline-none focus:ring-4 focus:ring-emerald-100 transition-all" placeholder="Escribe tu respuesta" />
            </div>
            <div className="flex gap-3">
              <button onClick={handleVerify} className="flex-1 py-3 px-4 rounded-xl border-2 border-emerald-300 bg-white text-emerald-700 font-semibold text-sm hover:bg-emerald-50 transition-all">Verificar</button>
              {!isCorrect && checked && (
                <button onClick={() => setShowSolution(true)} className="flex-1 py-3 px-4 rounded-xl border-2 border-indigo-300 bg-white text-indigo-600 font-semibold text-sm hover:bg-indigo-50 transition-all">Ver solucion</button>
              )}
            </div>
            {checked && (
              <div className={`p-3 rounded-xl text-sm font-medium ${isCorrect ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                {feedback}
              </div>
            )}
            {showSolution && <SolutionSteps result={problem.result} />}
          </div>
        )}
      </div>
    </div>
  );
};

export default GeneratorPanel;