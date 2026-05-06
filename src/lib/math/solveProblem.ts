import type { MathResult, Category } from '../types';
import { solveArithmetic } from './categories/arithmetic';
import { solveAlgebra } from './categories/algebra';
import { solveEquation } from './categories/equations';
import { solveFractions } from './categories/fractions';
import { solvePercentage } from './categories/percentages';
import { formatNum } from './utils';

/**
 * Detecta la categoría de un problema y lo resuelve.
 */
export function solveProblem(input: string): MathResult {
  const s = input.trim().toLowerCase();

  if (s.startsWith('trig|')) return solveTrigonometry(input);
  if (s.startsWith('log|')) return solveLogarithms(input);
  if (s.startsWith('limit|')) return solveLimits(input);
  if (s.startsWith('deriv|')) return solveDerivatives(input);
  if (s.startsWith('integ|')) return solveIntegrals(input);
  if (s.startsWith('matrix|')) return solveMatrices(input);

  // Detectar ecuación: contiene "=" y probable x
  if (s.includes('=') && (s.includes('x') || s.match(/\d\s*=\s*\d/))) {
    return solveEquation(input);
  }

  // Detectar porcentaje
  if (s.includes('%') || s.includes('descuento') || s.includes('aumento') || s.includes('incremento') || s.includes('porcentaje')) {
    return solvePercentage(input);
  }

  // Detectar fracción: patrón N/N op N/N
  if (/\d+\/\d+/.test(s)) {
    return solveFractions(input);
  }

  // Detectar álgebra: contiene x con coeficiente o distribución
  if (/[\d]*\s*x/.test(s) && !s.includes('=')) {
    return solveAlgebra(input);
  }

  // Por defecto: aritmética
  return solveArithmetic(input);
}

/**
 * Resuelve sabiendo la categoría (usado por el generador).
 */
export function solveByCategory(input: string, category: Category): MathResult {
  switch (category) {
    case 'aritmetica': return solveArithmetic(input);
    case 'algebra':    return solveAlgebra(input);
    case 'ecuaciones': return solveEquation(input);
    case 'fracciones': return solveFractions(input);
    case 'porcentajes': return solvePercentage(input);
    case 'trigonometria': return solveTrigonometry(input);
    case 'logaritmos': return solveLogarithms(input);
    case 'limites': return solveLimits(input);
    case 'derivadas': return solveDerivatives(input);
    case 'integrales': return solveIntegrals(input);
    case 'matrices': return solveMatrices(input);
  }
}

function ok(category: Category, difficulty: 'facil' | 'medio' | 'dificil', problemText: string, steps: string[], answer: string): MathResult {
  return { category, difficulty, problemText, steps, answer, isError: false };
}

function err(category: Category, problemText: string, errorMessage: string): MathResult {
  return { category, difficulty: 'facil', problemText, steps: [], answer: '', isError: true, errorMessage };
}

function solveTrigonometry(input: string): MathResult {
  try {
    const parts = input.split('|');
    const mode = parts[1];
    if (mode === 'value') {
      const fn = parts[2];
      const deg = Number(parts[3]);
      const difficulty = (parts[4] as 'facil' | 'medio' | 'dificil') ?? 'facil';
      const known: Record<string, Record<number, number>> = {
        sin: { 0: 0, 30: 0.5, 45: Math.SQRT1_2, 60: Math.sqrt(3) / 2, 90: 1 },
        cos: { 0: 1, 30: Math.sqrt(3) / 2, 45: Math.SQRT1_2, 60: 0.5, 90: 0 },
        tan: { 0: 0, 30: 1 / Math.sqrt(3), 45: 1, 60: Math.sqrt(3) },
      };
      const value = known[fn]?.[deg];
      return ok('trigonometria', difficulty, `${fn}(${deg}°)`, [
        `Usamos el valor notable de ${fn} en ${deg}°.`,
        `Consultamos la tabla trigonometrica basica.`,
      ], formatNum(value ?? 0));
    }
    return ok('trigonometria', 'facil', 'sin^2(x) + cos^2(x)', [
      'Aplicamos la identidad trigonometrica fundamental.',
      'sin^2(x) + cos^2(x) = 1.',
    ], '1');
  } catch {
    return err('trigonometria', input, 'No se pudo resolver trigonometria');
  }
}

function solveLogarithms(input: string): MathResult {
  try {
    const parts = input.split('|');
    const mode = parts[1];
    const difficulty = (parts[parts.length - 1] as 'facil' | 'medio' | 'dificil') ?? 'facil';
    if (mode === 'eval') {
      const base = Number(parts[2]);
      const x = Number(parts[3]);
      const value = Math.log(x) / Math.log(base);
      return ok('logaritmos', difficulty, `log_${base}(${x})`, [
        `Aplicamos definicion: log_${base}(${x}) = y si ${base}^y = ${x}.`,
        `Calculamos y = ln(${x}) / ln(${base}).`,
      ], formatNum(value));
    }
    if (mode === 'equation') {
      const base = Number(parts[2]);
      const rhs = Number(parts[3]);
      const ans = Math.pow(base, rhs);
      return ok('logaritmos', difficulty, `log_${base}(x) = ${rhs}`, [
        `Pasamos a forma exponencial: x = ${base}^${rhs}.`,
      ], `x = ${formatNum(ans)}`);
    }
    const a = Number(parts[2]);
    const b = Number(parts[3]);
    return ok('logaritmos', difficulty, `log(${a}) + log(${b})`, [
      'Usamos propiedad: log(a) + log(b) = log(a*b).',
      `log(${a}) + log(${b}) = log(${a * b}).`,
    ], `log(${a * b})`);
  } catch {
    return err('logaritmos', input, 'No se pudo resolver logaritmos');
  }
}

function solveLimits(input: string): MathResult {
  try {
    const parts = input.split('|');
    const kind = parts[1];
    const difficulty = (parts[parts.length - 1] as 'facil' | 'medio' | 'dificil') ?? 'facil';
    if (kind === 'poly') {
      const a = Number(parts[2]);
      const b = Number(parts[3]);
      const c = Number(parts[4]);
      const x0 = Number(parts[5]);
      const val = a * x0 * x0 + b * x0 + c;
      return ok('limites', difficulty, `lim x->${x0} (${a}x^2 + ${b}x + ${c})`, [
        'Es un polinomio, evaluamos por sustitucion directa.',
        `Reemplazamos x por ${x0}.`,
      ], formatNum(val));
    }
    const x0 = Number(parts[2]);
    const val = 2 * x0;
    return ok('limites', difficulty, `lim x->${x0} (x^2 - ${x0 * x0})/(x - ${x0})`, [
      'Factorizamos diferencia de cuadrados: x^2 - a^2 = (x-a)(x+a).',
      'Simplificamos (x-a) y evaluamos x+a en x=a.',
    ], formatNum(val));
  } catch {
    return err('limites', input, 'No se pudo resolver limites');
  }
}

function solveDerivatives(input: string): MathResult {
  try {
    const parts = input.split('|');
    const kind = parts[1];
    const difficulty = (parts[parts.length - 1] as 'facil' | 'medio' | 'dificil') ?? 'facil';
    if (kind === 'power') {
      const n = Number(parts[2]);
      return ok('derivadas', difficulty, `d/dx x^${n}`, [
        'Regla de la potencia: d/dx(x^n) = n*x^(n-1).',
      ], `${n}x^${n - 1}`);
    }
    if (kind === 'product') {
      const a = Number(parts[2]);
      const b = Number(parts[3]);
      return ok('derivadas', difficulty, `d/dx[(x+${a})(x+${b})]`, [
        'Regla del producto: (uv)\' = u\'v + uv\'.',
        `u=x+${a}, v=x+${b}, u'=1, v'=1.`,
      ], `2x+${a + b}`);
    }
    const n = Number(parts[2]);
    return ok('derivadas', difficulty, `d/dx[(x^${n})^2]`, [
      'Regla de la cadena: d/dx f(g(x)) = f\'(g(x))*g\'(x).',
      'Equivale a d/dx x^(2n).',
    ], `${2 * n}x^${2 * n - 1}`);
  } catch {
    return err('derivadas', input, 'No se pudo resolver derivadas');
  }
}

function solveIntegrals(input: string): MathResult {
  try {
    const parts = input.split('|');
    const kind = parts[1];
    const difficulty = (parts[parts.length - 1] as 'facil' | 'medio' | 'dificil') ?? 'facil';
    if (kind === 'power') {
      const n = Number(parts[2]);
      const next = n + 1;
      return ok('integrales', difficulty, `∫ x^${n} dx`, [
        'Regla de potencia: ∫x^n dx = x^(n+1)/(n+1) + C, n != -1.',
      ], `x^${next}/${next} + C`);
    }
    if (kind === 'sin') {
      return ok('integrales', difficulty, '∫ sin(x) dx', [
        'Integral basica trigonometrica.',
      ], '-cos(x) + C');
    }
    return ok('integrales', difficulty, '∫ cos(x) dx', [
      'Integral basica trigonometrica.',
    ], 'sin(x) + C');
  } catch {
    return err('integrales', input, 'No se pudo resolver integrales');
  }
}

function solveMatrices(input: string): MathResult {
  try {
    const parts = input.split('|');
    const kind = parts[1];
    const difficulty = (parts[parts.length - 1] as 'facil' | 'medio' | 'dificil') ?? 'facil';
    if (kind === 'sum') {
      const nums = parts[2].split(',').map(Number);
      const [a, b, c, d, e, f, g, h] = nums;
      return ok('matrices', difficulty, 'A + B (2x2)', [
        'Sumamos elemento a elemento.',
      ], `[[${a + e},${b + f}],[${c + g},${d + h}]]`);
    }
    if (kind === 'mul') {
      const nums = parts[2].split(',').map(Number);
      const [a, b, c, d, e, f, g, h] = nums;
      const r11 = a * e + b * g;
      const r12 = a * f + b * h;
      const r21 = c * e + d * g;
      const r22 = c * f + d * h;
      return ok('matrices', difficulty, 'A x B (2x2)', [
        'Multiplicamos fila por columna.',
      ], `[[${r11},${r12}],[${r21},${r22}]]`);
    }
    const [a, b, c, d] = parts[2].split(',').map(Number);
    return ok('matrices', difficulty, 'det(A) para matriz 2x2', [
      'Para [[a,b],[c,d]], det(A)=ad-bc.',
    ], formatNum(a * d - b * c));
  } catch {
    return err('matrices', input, 'No se pudo resolver matrices');
  }
}
