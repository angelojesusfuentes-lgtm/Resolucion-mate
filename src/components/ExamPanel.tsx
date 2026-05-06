import React, { useState, useEffect, useRef, useCallback } from 'react';
import type { Category, Difficulty, GeneratedProblem, HistoryEntry } from '../lib/types';
import { CATEGORY_LABELS, CATEGORY_ICONS, DIFFICULTY_LABELS } from '../lib/types';
import { generateProblem } from '../lib/math/generateProblem';
import SolutionSteps from './SolutionSteps';
import { addEntries } from '../lib/historyStorage';

// ─── Types ────────────────────────────────────────────────────────────────────
type ExamPhase = 'config' | 'running' | 'results';
type DisplayMode = 'one-by-one' | 'all-at-once';

interface ExamAnswer {
  userAnswer: string;
  isCorrect: boolean;
  submitted: boolean;
}

// ─── Constants ────────────────────────────────────────────────────────────────
const CATEGORIES: Category[] = ['aritmetica', 'algebra', 'ecuaciones', 'fracciones', 'porcentajes'];
const DIFFICULTIES: Difficulty[] = ['facil', 'medio', 'dificil'];
const COUNTS = [5, 10, 15, 20] as const;
const TIMER_OPTIONS = [
  { label: 'Sin límite', value: 0 },
  { label: '5 min', value: 300 },
  { label: '10 min', value: 600 },
  { label: '15 min', value: 900 },
  { label: '20 min', value: 1200 },
];
const ANSWER_HINTS: Record<Category, string> = {
  aritmetica: 'Ej: 42',
  algebra: 'Ej: 5x',
  ecuaciones: 'Ej: x = 3',
  fracciones: 'Ej: 3/4',
  porcentajes: 'Ej: 25',
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
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

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

// ─── Component ────────────────────────────────────────────────────────────────
const ExamPanel: React.FC = () => {
  // Config state
  const [phase, setPhase] = useState<ExamPhase>('config');
  const [selectedCats, setSelectedCats] = useState<Category[]>(['aritmetica']);
  const [difficulty, setDifficulty] = useState<Difficulty>('facil');
  const [count, setCount] = useState<number>(10);
  const [timerSecs, setTimerSecs] = useState<number>(0);
  const [displayMode, setDisplayMode] = useState<DisplayMode>('one-by-one');

  // Exam running state
  const [problems, setProblems] = useState<GeneratedProblem[]>([]);
  const [answers, setAnswers] = useState<ExamAnswer[]>([]);
  const [currentIdx, setCurrentIdx] = useState<number>(0);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [timeElapsed, setTimeElapsed] = useState<number>(0);
  const [timerExpired, setTimerExpired] = useState<boolean>(false);

  // Results state
  const [expandedResult, setExpandedResult] = useState<number | null>(null);
  const [finalElapsed, setFinalElapsed] = useState<number>(0);

  // Refs (stable references across renders)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const elapsedRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number>(0);
  const examIdRef = useRef<string>('');
  const answersRef = useRef<ExamAnswer[]>([]);
  const problemsRef = useRef<GeneratedProblem[]>([]);

  // Sync setters
  const setAnswersSync = (a: ExamAnswer[]) => {
    answersRef.current = a;
    setAnswers(a);
  };
  const setProblemsSync = (p: GeneratedProblem[]) => {
    problemsRef.current = p;
    setProblems(p);
  };

  // ── Timers ────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (phase === 'running') {
      startTimeRef.current = Date.now();
      elapsedRef.current = setInterval(() => {
        setTimeElapsed(Math.floor((Date.now() - startTimeRef.current) / 1000));
      }, 1000);
      if (timerSecs > 0) {
        setTimeLeft(timerSecs);
        timerRef.current = setInterval(() => {
          setTimeLeft(prev => {
            if (prev <= 1) { setTimerExpired(true); return 0; }
            return prev - 1;
          });
        }, 1000);
      }
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
      if (elapsedRef.current) clearInterval(elapsedRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (elapsedRef.current) clearInterval(elapsedRef.current);
    };
  }, [phase, timerSecs]);

  // ── Timer expiry handler ─────────────────────────────────────────────────
  const finishExam = useCallback((rawAnswers: ExamAnswer[]) => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (elapsedRef.current) clearInterval(elapsedRef.current);
    const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
    setFinalElapsed(elapsed);

    // Evaluate any unsubmitted answers
    const finalAnswers = rawAnswers.map((ans, i) => {
      if (!ans.submitted) {
        const isCorrect = ans.userAnswer.trim()
          ? checkAnswer(ans.userAnswer, problemsRef.current[i]?.result.answer ?? '')
          : false;
        return { ...ans, isCorrect, submitted: true };
      }
      return ans;
    });

    answersRef.current = finalAnswers;
    setAnswers(finalAnswers);

    // Save to history
    const entries: HistoryEntry[] = problemsRef.current.map((prob, i) => ({
      id: `${examIdRef.current}-${i}`,
      timestamp: Date.now(),
      problem: prob,
      userAnswer: finalAnswers[i]?.userAnswer ?? '',
      isCorrect: finalAnswers[i]?.isCorrect ?? false,
      source: 'exam',
      examId: examIdRef.current,
    }));
    addEntries(entries);
    setPhase('results');
  }, []);

  useEffect(() => {
    if (timerExpired) {
      setTimerExpired(false);
      finishExam(answersRef.current);
    }
  }, [timerExpired, finishExam]);

  // ── Exam start ────────────────────────────────────────────────────────────
  const startExam = () => {
    const generated: GeneratedProblem[] = Array.from({ length: count }, () => {
      const cat = selectedCats[Math.floor(Math.random() * selectedCats.length)];
      return generateProblem(cat, difficulty);
    });
    const initAnswers: ExamAnswer[] = Array.from({ length: count }, () => ({
      userAnswer: '', isCorrect: false, submitted: false,
    }));
    setProblemsSync(generated);
    setAnswersSync(initAnswers);
    setCurrentIdx(0);
    setTimeElapsed(0);
    setFinalElapsed(0);
    setExpandedResult(null);
    setTimerExpired(false);
    examIdRef.current = `exam-${Date.now()}`;
    setPhase('running');
  };

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleAnswerChange = (idx: number, value: string) => {
    const next = [...answersRef.current];
    next[idx] = { ...next[idx], userAnswer: value };
    setAnswersSync(next);
  };

  const submitAnswer = (idx: number): ExamAnswer[] => {
    const ua = answersRef.current[idx]?.userAnswer ?? '';
    const isCorrect = checkAnswer(ua, problems[idx]?.result.answer ?? '');
    const next = [...answersRef.current];
    next[idx] = { userAnswer: ua, isCorrect, submitted: true };
    setAnswersSync(next);
    return next;
  };

  const handleNext = () => {
    const updated = submitAnswer(currentIdx);
    if (currentIdx < problems.length - 1) {
      setCurrentIdx(i => i + 1);
    } else {
      finishExam(updated);
    }
  };

  const handleSkip = () => {
    const next = [...answersRef.current];
    next[currentIdx] = { userAnswer: '', isCorrect: false, submitted: true };
    setAnswersSync(next);
    if (currentIdx < problems.length - 1) {
      setCurrentIdx(i => i + 1);
    } else {
      finishExam(next);
    }
  };

  const handleSubmitAll = () => {
    const final = problemsRef.current.map((prob, i) => {
      const ua = answersRef.current[i]?.userAnswer ?? '';
      return { userAnswer: ua, isCorrect: checkAnswer(ua, prob.result.answer), submitted: true };
    });
    setAnswersSync(final);
    finishExam(final);
  };

  const toggleCategory = (cat: Category) => {
    setSelectedCats(prev =>
      prev.includes(cat)
        ? prev.length > 1 ? prev.filter(c => c !== cat) : prev
        : [...prev, cat]
    );
  };

  // ── Computed ──────────────────────────────────────────────────────────────
  const score = answers.filter(a => a.isCorrect).length;
  const pct = problems.length > 0 ? Math.round((score / problems.length) * 100) : 0;

  // ─────────────────────────────────────────────────────────────────────────
  // CONFIG SCREEN
  // ─────────────────────────────────────────────────────────────────────────
  if (phase === 'config') {
    return (
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        <div className="bg-gradient-to-r from-violet-500 to-indigo-600 px-6 py-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl">📝</span>
            <div>
              <h2 className="text-white font-bold text-lg">Modo Examen</h2>
              <p className="text-white/80 text-sm">Configura tu examen de práctica</p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Categorías */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-3">
              Categorías <span className="text-gray-400 font-normal normal-case">(puedes seleccionar varias)</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  onClick={() => toggleCategory(cat)}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border-2 text-sm font-medium transition-all ${
                    selectedCats.includes(cat)
                      ? 'border-violet-500 bg-violet-50 text-violet-700'
                      : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <span>{CATEGORY_ICONS[cat]}</span>
                  <span className="truncate">{CATEGORY_LABELS[cat]}</span>
                  {selectedCats.includes(cat) && (
                    <span className="ml-auto flex-shrink-0 w-4 h-4 bg-violet-500 rounded-full flex items-center justify-center">
                      <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Dificultad */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-3">Dificultad</label>
            <div className="flex gap-2">
              {DIFFICULTIES.map(diff => (
                <button
                  key={diff}
                  onClick={() => setDifficulty(diff)}
                  className={`flex-1 py-2.5 rounded-xl border-2 text-sm font-semibold transition-all ${
                    difficulty === diff
                      ? 'border-violet-500 bg-violet-50 text-violet-700'
                      : 'border-gray-200 text-gray-600 hover:border-gray-300'
                  }`}
                >
                  {DIFFICULTY_LABELS[diff]}
                </button>
              ))}
            </div>
          </div>

          {/* Cantidad */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-3">
              Cantidad de Problemas
            </label>
            <div className="flex gap-2">
              {COUNTS.map(n => (
                <button
                  key={n}
                  onClick={() => setCount(n)}
                  className={`flex-1 py-2.5 rounded-xl border-2 text-sm font-bold transition-all ${
                    count === n
                      ? 'border-violet-500 bg-violet-50 text-violet-700'
                      : 'border-gray-200 text-gray-600 hover:border-gray-300'
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>

          {/* Timer */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-3">
              Tiempo Límite
            </label>
            <div className="flex flex-wrap gap-2">
              {TIMER_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => setTimerSecs(opt.value)}
                  className={`px-4 py-2 rounded-xl border-2 text-sm font-medium transition-all ${
                    timerSecs === opt.value
                      ? 'border-violet-500 bg-violet-50 text-violet-700'
                      : 'border-gray-200 text-gray-600 hover:border-gray-300'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Modo de presentación */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-3">
              Modo de Presentación
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setDisplayMode('one-by-one')}
                className={`p-3 rounded-xl border-2 text-left transition-all ${
                  displayMode === 'one-by-one' ? 'border-violet-500 bg-violet-50' : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <p className={`text-sm font-semibold ${displayMode === 'one-by-one' ? 'text-violet-700' : 'text-gray-700'}`}>
                  📋 Uno a la vez
                </p>
                <p className="text-xs text-gray-500 mt-0.5">Un problema por pantalla</p>
              </button>
              <button
                onClick={() => setDisplayMode('all-at-once')}
                className={`p-3 rounded-xl border-2 text-left transition-all ${
                  displayMode === 'all-at-once' ? 'border-violet-500 bg-violet-50' : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <p className={`text-sm font-semibold ${displayMode === 'all-at-once' ? 'text-violet-700' : 'text-gray-700'}`}>
                  📄 Todos juntos
                </p>
                <p className="text-xs text-gray-500 mt-0.5">Ver todos los problemas</p>
              </button>
            </div>
          </div>

          <button
            onClick={startExam}
            disabled={selectedCats.length === 0}
            className="w-full bg-gradient-to-r from-violet-500 to-indigo-600 text-white font-bold py-3.5 rounded-xl hover:from-violet-600 hover:to-indigo-700 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-base"
          >
            🚀 Comenzar Examen ({count} problemas)
          </button>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // RUNNING SCREEN
  // ─────────────────────────────────────────────────────────────────────────
  if (phase === 'running') {
    const progressPct = displayMode === 'one-by-one'
      ? ((currentIdx + 1) / problems.length) * 100
      : (answers.filter(a => a.userAnswer.trim()).length / problems.length) * 100;
    const timeWarning = timerSecs > 0 && timeLeft < 60;

    return (
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        {/* Exam header */}
        <div className="bg-gradient-to-r from-violet-500 to-indigo-600 px-6 py-4">
          <div className="flex items-center justify-between">
            <span className="text-white font-bold text-sm">
              {displayMode === 'one-by-one'
                ? `Problema ${currentIdx + 1} / ${problems.length}`
                : `${problems.length} Problemas`}
            </span>
            <div className="flex items-center gap-2">
              {timerSecs > 0 ? (
                <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-bold ${
                  timeWarning ? 'bg-red-500 text-white animate-pulse' : 'bg-white/20 text-white'
                }`}>
                  ⏱️ {formatTime(timeLeft)}
                </div>
              ) : (
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/20 text-white text-sm">
                  ⏱️ {formatTime(timeElapsed)}
                </div>
              )}
              <button
                onClick={() => {
                  if (window.confirm('¿Abandonar el examen? El progreso no se guardará.')) {
                    setPhase('config');
                  }
                }}
                className="text-white/70 hover:text-white text-sm px-2 py-1 rounded transition-colors"
              >
                ✕
              </button>
            </div>
          </div>
          {/* Progress bar */}
          <div className="mt-3 h-1.5 bg-white/30 rounded-full overflow-hidden">
            <div
              className="h-full bg-white rounded-full transition-all duration-300"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>

        <div className="p-6">
          {/* ONE-BY-ONE */}
          {displayMode === 'one-by-one' && problems[currentIdx] && (
            <div className="space-y-5">
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-5 border border-gray-200">
                <p className="text-xs font-semibold text-gray-500 mb-2">
                  {CATEGORY_ICONS[problems[currentIdx].category]} {CATEGORY_LABELS[problems[currentIdx].category]}
                  {' · '}{DIFFICULTY_LABELS[problems[currentIdx].difficulty]}
                </p>
                <p className="text-gray-800 font-semibold text-lg leading-snug">
                  {problems[currentIdx].statement}
                </p>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">
                  Tu respuesta
                </label>
                <input
                  key={currentIdx}
                  type="text"
                  value={answers[currentIdx]?.userAnswer ?? ''}
                  onChange={e => handleAnswerChange(currentIdx, e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') handleNext(); }}
                  placeholder={ANSWER_HINTS[problems[currentIdx].category]}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-gray-800 text-base focus:border-violet-400 focus:outline-none focus:ring-4 focus:ring-violet-100 transition-all"
                  autoFocus
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleSkip}
                  className="flex-1 py-3 px-4 rounded-xl border-2 border-gray-200 text-gray-600 font-semibold text-sm hover:bg-gray-50 transition-all"
                >
                  Saltar →
                </button>
                <button
                  onClick={handleNext}
                  className="flex-1 bg-gradient-to-r from-violet-500 to-indigo-600 text-white font-bold py-3 rounded-xl hover:from-violet-600 hover:to-indigo-700 active:scale-95 transition-all"
                >
                  {currentIdx < problems.length - 1 ? 'Siguiente →' : '✓ Finalizar'}
                </button>
              </div>
            </div>
          )}

          {/* ALL AT ONCE */}
          {displayMode === 'all-at-once' && (
            <div className="space-y-4">
              <div className="max-h-[55vh] overflow-y-auto space-y-3 pr-1">
                {problems.map((prob, i) => (
                  <div key={i} className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="w-6 h-6 bg-violet-500 text-white text-xs rounded-full flex items-center justify-center font-bold flex-shrink-0">
                        {i + 1}
                      </span>
                      <span className="text-xs text-gray-500">
                        {CATEGORY_ICONS[prob.category]} {CATEGORY_LABELS[prob.category]}
                      </span>
                    </div>
                    <p className="text-gray-800 font-semibold text-sm mb-2">{prob.statement}</p>
                    <input
                      type="text"
                      value={answers[i]?.userAnswer ?? ''}
                      onChange={e => handleAnswerChange(i, e.target.value)}
                      placeholder={ANSWER_HINTS[prob.category]}
                      className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg text-sm focus:border-violet-400 focus:outline-none transition-all"
                    />
                  </div>
                ))}
              </div>
              <button
                onClick={handleSubmitAll}
                className="w-full bg-gradient-to-r from-violet-500 to-indigo-600 text-white font-bold py-3.5 rounded-xl hover:from-violet-600 hover:to-indigo-700 active:scale-95 transition-all"
              >
                ✓ Entregar Examen
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // RESULTS SCREEN
  // ─────────────────────────────────────────────────────────────────────────
  const grade =
    pct >= 90 ? { label: 'Excelente', color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200', emoji: '🏆' }
    : pct >= 70 ? { label: 'Muy bien', color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200', emoji: '🎉' }
    : pct >= 50 ? { label: 'Regular', color: 'text-yellow-600', bg: 'bg-yellow-50', border: 'border-yellow-200', emoji: '💪' }
    : { label: 'A mejorar', color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200', emoji: '📖' };

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
      {/* Results header */}
      <div className="bg-gradient-to-r from-violet-500 to-indigo-600 px-6 py-5 text-center">
        <span className="text-4xl block mb-2">{grade.emoji}</span>
        <h2 className="text-white font-bold text-xl">Examen Completado</h2>
        <p className="text-white/80 text-sm mt-1">Tiempo total: {formatTime(finalElapsed)}</p>
      </div>

      <div className="p-6 space-y-5">
        {/* Score grid */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-gray-50 rounded-xl p-3 text-center border border-gray-200">
            <p className="text-2xl font-bold text-gray-800">{score}/{problems.length}</p>
            <p className="text-xs text-gray-500 mt-0.5">Correctas</p>
          </div>
          <div className={`rounded-xl p-3 text-center border ${grade.bg} ${grade.border}`}>
            <p className={`text-2xl font-bold ${grade.color}`}>{pct}%</p>
            <p className={`text-xs mt-0.5 ${grade.color}`}>{grade.label}</p>
          </div>
          <div className="bg-gray-50 rounded-xl p-3 text-center border border-gray-200">
            <p className="text-2xl font-bold text-gray-800">{problems.length - score}</p>
            <p className="text-xs text-gray-500 mt-0.5">Incorrectas</p>
          </div>
        </div>

        {/* Problem review */}
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
            Revisión de problemas
          </p>
          <div className="space-y-2 max-h-[50vh] overflow-y-auto pr-1">
            {problems.map((prob, i) => (
              <div
                key={i}
                className={`rounded-xl border overflow-hidden transition-all ${
                  answers[i]?.isCorrect ? 'border-emerald-200' : 'border-red-200'
                }`}
              >
                <button
                  onClick={() => setExpandedResult(expandedResult === i ? null : i)}
                  className="w-full flex items-center gap-3 p-3 text-left hover:bg-gray-50 transition-colors"
                >
                  <span className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold ${
                    answers[i]?.isCorrect ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-500'
                  }`}>
                    {answers[i]?.isCorrect ? '✓' : '✗'}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-500">
                      {CATEGORY_ICONS[prob.category]} {CATEGORY_LABELS[prob.category]}
                    </p>
                    <p className="text-sm text-gray-800 font-medium truncate">{prob.statement}</p>
                  </div>
                  <div className="flex-shrink-0 text-right mr-1">
                    <p className="text-xs text-gray-500">
                      Tu resp:{' '}
                      <span className={answers[i]?.isCorrect ? 'text-emerald-600 font-semibold' : 'text-red-500 font-semibold'}>
                        {answers[i]?.userAnswer || '—'}
                      </span>
                    </p>
                    {!answers[i]?.isCorrect && (
                      <p className="text-xs text-emerald-600">Correcto: {prob.result.answer}</p>
                    )}
                  </div>
                  <span className="text-gray-400 text-xs">{expandedResult === i ? '▲' : '▼'}</span>
                </button>
                {expandedResult === i && (
                  <div className="px-4 pb-4 border-t border-gray-100">
                    <SolutionSteps result={prob.result} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={() => setPhase('config')}
            className="flex-1 py-3 px-4 rounded-xl border-2 border-gray-200 text-gray-600 font-semibold text-sm hover:bg-gray-50 transition-all"
          >
            ← Nueva Config
          </button>
          <button
            onClick={startExam}
            className="flex-1 bg-gradient-to-r from-violet-500 to-indigo-600 text-white font-bold py-3 rounded-xl hover:from-violet-600 hover:to-indigo-700 active:scale-95 transition-all text-sm"
          >
            🔄 Repetir Examen
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExamPanel;
