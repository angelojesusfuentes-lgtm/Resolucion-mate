export type Category =
  | 'aritmetica'
  | 'algebra'
  | 'ecuaciones'
  | 'fracciones'
  | 'porcentajes';

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
  aritmetica: 'Aritmética Básica',
  algebra: 'Álgebra',
  ecuaciones: 'Ecuaciones',
  fracciones: 'Fracciones',
  porcentajes: 'Porcentajes',
};

export const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  facil: 'Fácil',
  medio: 'Medio',
  dificil: 'Difícil',
};

export const CATEGORY_COLORS: Record<Category, string> = {
  aritmetica: 'bg-blue-100 text-blue-700 border border-blue-200',
  algebra: 'bg-purple-100 text-purple-700 border border-purple-200',
  ecuaciones: 'bg-orange-100 text-orange-700 border border-orange-200',
  fracciones: 'bg-rose-100 text-rose-700 border border-rose-200',
  porcentajes: 'bg-green-100 text-green-700 border border-green-200',
};

export const DIFFICULTY_COLORS: Record<Difficulty, string> = {
  facil: 'bg-emerald-100 text-emerald-700 border border-emerald-200',
  medio: 'bg-yellow-100 text-yellow-700 border border-yellow-200',
  dificil: 'bg-red-100 text-red-700 border border-red-200',
};

export const CATEGORY_ICONS: Record<Category, string> = {
  aritmetica: '➕',
  algebra: '🔤',
  ecuaciones: '⚖️',
  fracciones: '½',
  porcentajes: '%',
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
