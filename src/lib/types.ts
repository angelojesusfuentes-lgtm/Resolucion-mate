export type Category =
  | 'aritmetica'
  | 'algebra'
  | 'ecuaciones'
  | 'fracciones'
  | 'porcentajes'
  | 'trigonometria'
  | 'logaritmos'
  | 'limites'
  | 'derivadas'
  | 'integrales'
  | 'matrices';

export type Difficulty = 'facil' | 'medio' | 'dificil';

export interface MathResult {
  problemText: string;
  category: Category;
  difficulty: Difficulty;
  steps: string[];
  answer: string;
  isError: boolean;
  errorMessage?: string;
}

export interface GeneratedProblem {
  statement: string;
  category: Category;
  difficulty: Difficulty;
  internalExpression: string;
  result: MathResult;
}

export const CATEGORY_LABELS: Record<Category, string> = {
  aritmetica: 'Aritmetica Basica',
  algebra: 'Algebra',
  ecuaciones: 'Ecuaciones',
  fracciones: 'Fracciones',
  porcentajes: 'Porcentajes',
  trigonometria: 'Trigonometria',
  logaritmos: 'Logaritmos',
  limites: 'Limites',
  derivadas: 'Derivadas',
  integrales: 'Integrales',
  matrices: 'Matrices',
};

export const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  facil: 'Facil',
  medio: 'Medio',
  dificil: 'Dificil',
};

export const CATEGORY_COLORS: Record<Category, string> = {
  aritmetica: 'bg-blue-100 text-blue-700 border border-blue-200',
  algebra: 'bg-purple-100 text-purple-700 border border-purple-200',
  ecuaciones: 'bg-orange-100 text-orange-700 border border-orange-200',
  fracciones: 'bg-rose-100 text-rose-700 border border-rose-200',
  porcentajes: 'bg-green-100 text-green-700 border border-green-200',
  trigonometria: 'bg-cyan-100 text-cyan-700 border border-cyan-200',
  logaritmos: 'bg-teal-100 text-teal-700 border border-teal-200',
  limites: 'bg-lime-100 text-lime-700 border border-lime-200',
  derivadas: 'bg-fuchsia-100 text-fuchsia-700 border border-fuchsia-200',
  integrales: 'bg-indigo-100 text-indigo-700 border border-indigo-200',
  matrices: 'bg-slate-100 text-slate-700 border border-slate-200',
};

export const DIFFICULTY_COLORS: Record<Difficulty, string> = {
  facil: 'bg-emerald-100 text-emerald-700 border border-emerald-200',
  medio: 'bg-yellow-100 text-yellow-700 border border-yellow-200',
  dificil: 'bg-red-100 text-red-700 border border-red-200',
};

export const CATEGORY_ICONS: Record<Category, string> = {
  aritmetica: '+',
  algebra: 'x',
  ecuaciones: '=',
  fracciones: '1/2',
  porcentajes: '%',
  trigonometria: 'sin',
  logaritmos: 'log',
  limites: 'lim',
  derivadas: "f'",
  integrales: 'S',
  matrices: '[ ]',
};

export interface HistoryEntry {
  id: string;
  timestamp: number;
  problem: GeneratedProblem;
  userAnswer?: string;
  isCorrect?: boolean;
  source: 'practice' | 'exam';
  examId?: string;
}