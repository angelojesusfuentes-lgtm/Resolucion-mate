import type { MathResult } from '../../types';
import { formatNum } from '../utils';

/**
 * Álgebra: combinación de términos semejantes y distribución simple.
 * Patrones soportados:
 *   - "2x + 3x - x"             → combinación de términos
 *   - "3(x + 2)"                → distribución
 *   - "2(x + 3) + 4x"          → distribución + combinación
 */
export function solveAlgebra(input: string): MathResult {
  const raw = input.trim();
  const steps: string[] = [];
  steps.push(`Expresión original: ${raw}`);

  try {
    // Normalizar
    let expr = raw
      .replace(/\s+/g, ' ')
      .replace(/([0-9])\s*\(/g, '$1*(')   // 3( → 3*(
      .replace(/\)\s*([0-9])/g, ')*$1');   // )3 → )*3

    // Paso 1: expandir distribuciones del tipo a*(x + b) o a*(x - b)
    const distPattern = /(-?[\d.]+)\s*\*\s*\(\s*(-?[\d.]*)\s*x\s*([+-])\s*([\d.]+)\s*\)/g;
    let match: RegExpExecArray | null;
    while ((match = distPattern.exec(expr)) !== null) {
      const a = parseFloat(match[1]);
      const coef = match[2] === '' ? 1 : parseFloat(match[2]);
      const sign = match[3];
      const b = parseFloat(match[4]);
      const termX = a * coef;
      const termConst = sign === '+' ? a * b : -(a * b);
      const replacement = `${formatNum(termX)}x ${termConst >= 0 ? '+' : '-'} ${formatNum(Math.abs(termConst))}`;
      steps.push(`Distribución: ${match[0].replace('*(', '(').replace(/\*/g, '·')} = ${replacement}`);
      expr = expr.replace(match[0], `(${replacement})`);
      distPattern.lastIndex = 0;
    }

    // Paso 2: recolectar términos con x y constantes
    const terms = parseAlgebraTerms(expr);
    if (terms === null) throw new Error('Formato no reconocido');

    let xCoef = 0;
    let constant = 0;
    const xTerms: string[] = [];
    const cTerms: string[] = [];

    for (const t of terms) {
      if (t.isX) { xCoef += t.value; xTerms.push(`(${formatNum(t.value)}x)`); }
      else { constant += t.value; cTerms.push(`(${formatNum(t.value)})`); }
    }

    if (xTerms.length > 1) {
      steps.push(`Sumamos términos con x: ${xTerms.join(' + ')} = ${formatNum(xCoef)}x`);
    }
    if (cTerms.length > 1) {
      steps.push(`Sumamos constantes: ${cTerms.join(' + ')} = ${formatNum(constant)}`);
    }

    let answer: string;
    if (xCoef !== 0 && constant !== 0) {
      answer = `${formatNum(xCoef)}x ${constant >= 0 ? '+' : '-'} ${formatNum(Math.abs(constant))}`;
    } else if (xCoef !== 0) {
      answer = `${formatNum(xCoef)}x`;
    } else {
      answer = formatNum(constant);
    }

    steps.push(`Resultado simplificado: ${answer}`);

    return { problemText: raw, category: 'algebra', difficulty: 'facil', steps, answer, isError: false };
  } catch (e) {
    return {
      problemText: raw, category: 'algebra', difficulty: 'facil',
      steps: [], answer: '', isError: true,
      errorMessage: `No se pudo resolver: ${(e as Error).message}. Ejemplos válidos: "2x + 3x - x", "3(x + 2)", "2(x + 3) + 4x"`,
    };
  }
}

interface AlgTerm {
  value: number;
  isX: boolean;
}

/** Extrae términos algebraicos lineales */
function parseAlgebraTerms(expr: string): AlgTerm[] | null {
  // Quitar paréntesis externos residuales simples
  let e = expr.replace(/^\(|\)$/g, '').replace(/\(([^()]+)\)/g, '$1');

  // Asegurarse de que haya signo al inicio
  if (!e.startsWith('-')) e = '+' + e;

  // Tokenizar: cada término es +/-  coef? x?
  const pattern = /([+-])?\s*([\d.]*)\s*x|([+-])\s*([\d.]+)/g;
  const terms: AlgTerm[] = [];
  let pm: RegExpExecArray | null;

  while ((pm = pattern.exec(e)) !== null) {
    if (pm[2] !== undefined && pm[0].includes('x')) {
      // Término con x
      const sign = (pm[1] === '-') ? -1 : 1;
      const coef = pm[2] === '' ? 1 : parseFloat(pm[2]);
      terms.push({ value: sign * coef, isX: true });
    } else if (pm[3] !== undefined && pm[4] !== undefined) {
      // Constante
      const sign = pm[3] === '-' ? -1 : 1;
      terms.push({ value: sign * parseFloat(pm[4]), isX: false });
    }
  }

  return terms.length > 0 ? terms : null;
}
