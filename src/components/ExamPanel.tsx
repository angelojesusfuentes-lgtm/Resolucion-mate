import React, { useState } from 'react';
import type { Category, Difficulty, GeneratedProblem, HistoryEntry } from '../lib/types';
import { CATEGORY_LABELS, CATEGORY_ICONS, DIFFICULTY_LABELS } from '../lib/types';
import { generateProblem } from '../lib/math/generateProblem';
import SolutionSteps from './SolutionSteps';
import { addEntries } from '../lib/historyStorage';

type ExamPhase = 'config' | 'running' | 'results';

interface ExamAnswer {
  userAnswer: string;
  isCorrect: boolean;
  submitted: boolean;
  showSolution: boolean;
}

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

const ExamPanel: React.FC = () => {
  const [phase, setPhase] = useState<ExamPhase>('config');
  const [selectedCats, setSelectedCats] = useState<Category[]>(['aritmetica']);
  const [difficulty, setDifficulty] = useState<Difficulty>('facil');
  const [count, setCount] = useState<number>(5);
  const [problems, setProblems] = useState<GeneratedProblem[]>([]);
  const [answers, setAnswers] = useState<ExamAnswer[]>([]);
  const [examId, setExamId] = useState<string>('');
  const [expandedResult, setExpandedResult] = useState<number | null>(null);

  const toggleCategory = (cat: Category) => {
    setSelectedCats(prev => (prev.includes(cat) ? (prev.length > 1 ? prev.filter(c => c !== cat) : prev) : [...prev, cat]));
  };

  const startExam = () => {
    const generated: GeneratedProblem[] = Array.from({ length: count }, () => {
      const cat = selectedCats[Math.floor(Math.random() * selectedCats.length)];
      return generateProblem(cat, difficulty);
    });
    setProblems(generated);
    setAnswers(Array.from({ length: count }, () => ({ userAnswer: '', isCorrect: false, submitted: false, showSolution: false })));
    setExamId(`exam-${Date.now()}`);
    setExpandedResult(null);
    setPhase('running');
  };

  const verifyAnswer = (idx: number) => {
    const next = [...answers];
    const ua = next[idx]?.userAnswer ?? '';
    const correct = checkAnswer(ua, problems[idx].result.answer);
    next[idx] = { ...next[idx], isCorrect: correct, submitted: true, showSolution: correct };
    setAnswers(next);
  };

  const allowShowSolution = (idx: number) => {
    const next = [...answers];
    next[idx] = { ...next[idx], showSolution: true };
    setAnswers(next);
  };

  const finishExam = () => {
    const final = answers.map((a, i) => {
      if (!a.submitted) {
        const isCorrect = checkAnswer(a.userAnswer, problems[i].result.answer);
        return { ...a, isCorrect, submitted: true };
      }
      return a;
    });
    setAnswers(final);
    const entries: HistoryEntry[] = problems.map((prob, i) => ({
      id: `${examId}-${i}`,
      timestamp: Date.now(),
      problem: prob,
      userAnswer: final[i]?.userAnswer ?? '',
      isCorrect: final[i]?.isCorrect ?? false,
      source: 'exam',
      examId,
    }));
    addEntries(entries);
    setPhase('results');
  };

  const score = answers.filter(a => a.isCorrect).length;

  if (phase === 'config') {
    return (
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        <div className="bg-gradient-to-r from-violet-500 to-indigo-600 px-6 py-4">
          <h2 className="text-white font-bold text-lg">Modo Examen</h2>
          <p className="text-white/80 text-sm">Configura tu examen de practica</p>
        </div>
        <div className="p-6 space-y-6">
          <div>
            <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-3">Categorias</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-72 overflow-y-auto pr-1">
              {CATEGORIES.map(cat => (
                <button key={cat} onClick={() => toggleCategory(cat)} className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border-2 text-sm font-medium transition-all ${selectedCats.includes(cat) ? 'border-violet-500 bg-violet-50 text-violet-700' : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50'}`}>
                  <span>{CATEGORY_ICONS[cat]}</span>
                  <span className="truncate">{CATEGORY_LABELS[cat]}</span>
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-3">Dificultad</label>
            <div className="flex gap-2">
              {DIFFICULTIES.map(diff => (
                <button key={diff} onClick={() => setDifficulty(diff)} className={`flex-1 py-2.5 rounded-xl border-2 text-sm font-semibold transition-all ${difficulty === diff ? 'border-violet-500 bg-violet-50 text-violet-700' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}>
                  {DIFFICULTY_LABELS[diff]}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-3">Cantidad</label>
            <div className="flex gap-2">
              {[5, 10, 15].map(n => (
                <button key={n} onClick={() => setCount(n)} className={`flex-1 py-2.5 rounded-xl border-2 text-sm font-bold transition-all ${count === n ? 'border-violet-500 bg-violet-50 text-violet-700' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}>{n}</button>
              ))}
            </div>
          </div>
          <button onClick={startExam} disabled={selectedCats.length === 0} className="w-full bg-gradient-to-r from-violet-500 to-indigo-600 text-white font-bold py-3.5 rounded-xl hover:from-violet-600 hover:to-indigo-700 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-base">
            Comenzar Examen ({count} problemas)
          </button>
        </div>
      </div>
    );
  }

  if (phase === 'running') {
    return (
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        <div className="bg-gradient-to-r from-violet-500 to-indigo-600 px-6 py-4">
          <span className="text-white font-bold text-sm">{problems.length} problemas</span>
        </div>
        <div className="p-6 space-y-4">
          <div className="max-h-[55vh] overflow-y-auto space-y-3 pr-1">
            {problems.map((prob, i) => (
              <div key={i} className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="w-6 h-6 bg-violet-500 text-white text-xs rounded-full flex items-center justify-center font-bold flex-shrink-0">{i + 1}</span>
                  <span className="text-xs text-gray-500">{CATEGORY_ICONS[prob.category]} {CATEGORY_LABELS[prob.category]}</span>
                </div>
                <p className="text-gray-800 font-semibold text-sm mb-2">{prob.statement}</p>
                <input
                  type="text"
                  value={answers[i]?.userAnswer ?? ''}
                  onChange={e => {
                    const next = [...answers];
                    next[i] = { ...next[i], userAnswer: e.target.value };
                    setAnswers(next);
                  }}
                  placeholder="Tu respuesta"
                  className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg text-sm focus:border-violet-400 focus:outline-none transition-all"
                />
                <div className="mt-2 flex gap-2">
                  <button onClick={() => verifyAnswer(i)} className="px-3 py-2 rounded-lg border-2 border-violet-300 text-violet-700 text-xs font-semibold hover:bg-violet-50">Verificar</button>
                  {!answers[i]?.isCorrect && answers[i]?.submitted && (
                    <button onClick={() => allowShowSolution(i)} className="px-3 py-2 rounded-lg border-2 border-indigo-300 text-indigo-700 text-xs font-semibold hover:bg-indigo-50">Ver solucion</button>
                  )}
                </div>
                {answers[i]?.submitted && (
                  <p className={`mt-2 text-xs font-semibold ${answers[i].isCorrect ? 'text-emerald-600' : 'text-red-500'}`}>
                    {answers[i].isCorrect ? 'Correcto! Se muestran pasos.' : 'Incorrecto. Puedes reintentar o ver solucion.'}
                  </p>
                )}
                {(answers[i]?.showSolution ?? false) && (
                  <div className="mt-2">
                    <SolutionSteps result={prob.result} />
                  </div>
                )}
              </div>
            ))}
          </div>
          <button onClick={finishExam} className="w-full bg-gradient-to-r from-violet-500 to-indigo-600 text-white font-bold py-3.5 rounded-xl hover:from-violet-600 hover:to-indigo-700 active:scale-95 transition-all">Finalizar Examen</button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
      <div className="bg-gradient-to-r from-violet-500 to-indigo-600 px-6 py-5 text-center">
        <h2 className="text-white font-bold text-xl">Examen Completado</h2>
      </div>
      <div className="p-6 space-y-5">
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-gray-50 rounded-xl p-3 text-center border border-gray-200">
            <p className="text-2xl font-bold text-gray-800">{score}/{problems.length}</p>
            <p className="text-xs text-gray-500 mt-0.5">Correctas</p>
          </div>
          <div className="bg-gray-50 rounded-xl p-3 text-center border border-gray-200">
            <p className="text-2xl font-bold text-gray-800">{problems.length - score}</p>
            <p className="text-xs text-gray-500 mt-0.5">Incorrectas</p>
          </div>
          <div className="bg-gray-50 rounded-xl p-3 text-center border border-gray-200">
            <p className="text-2xl font-bold text-gray-800">{Math.round((score / Math.max(1, problems.length)) * 100)}%</p>
            <p className="text-xs text-gray-500 mt-0.5">Puntaje</p>
          </div>
        </div>
        <div className="space-y-2 max-h-[50vh] overflow-y-auto pr-1">
          {problems.map((prob, i) => (
            <div key={i} className={`rounded-xl border overflow-hidden transition-all ${answers[i]?.isCorrect ? 'border-emerald-200' : 'border-red-200'}`}>
              <button onClick={() => setExpandedResult(expandedResult === i ? null : i)} className="w-full flex items-center gap-3 p-3 text-left hover:bg-gray-50 transition-colors">
                <span className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold ${answers[i]?.isCorrect ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-500'}`}>{answers[i]?.isCorrect ? '✓' : '✗'}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-500">{CATEGORY_ICONS[prob.category]} {CATEGORY_LABELS[prob.category]}</p>
                  <p className="text-sm text-gray-800 font-medium truncate">{prob.statement}</p>
                </div>
                <span className="text-gray-400 text-xs">{expandedResult === i ? '▲' : '▼'}</span>
              </button>
              {expandedResult === i && <div className="px-4 pb-4 border-t border-gray-100"><SolutionSteps result={prob.result} /></div>}
            </div>
          ))}
        </div>
        <button onClick={() => setPhase('config')} className="w-full py-3 px-4 rounded-xl border-2 border-gray-200 text-gray-600 font-semibold text-sm hover:bg-gray-50 transition-all">Nueva Configuracion</button>
      </div>
    </div>
  );
};

export default ExamPanel;