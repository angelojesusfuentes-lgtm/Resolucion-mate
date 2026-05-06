import type { MathResult } from '../../types';
import { formatNum } from '../utils';

/**
 * Ecuaciones lineales de una variable.
 * Patrones soportados:
 *   - ax + b = c       (ej: 3x + 2 = 11)
 *   - ax - b = c       (ej: 5x - 4 = 16)
 *   - ax = c           (ej: 4x = 20)
 *   - x + b = c        (ej: x + 7 = 10)
 *   - a(x + b) = c     (ej: 2(x + 3) = 14)
 *   - ax + b = cx + d  (ej: 3x + 1 = x + 9)
 */
export function solveEquation(input: string): MathResult {
  const raw = input.trim();
  const steps: string[] = [];
  steps.push(`Ecuación: ${raw}`);

  try {
    // Dividir por el signo =
    const eqParts = raw.split('=');
    if (eqParts.length !== 2) throw new Error('La ecuación debe tener exactamente un signo "="');

    let lhs = eqParts[0].trim();
    let rhs = eqParts[1].trim();

    // Expandir distribución tipo a(x + b) o a(x - b)
    const expandDist = (s: string): string => {
      return s.replace(/(-?[\d.]*)\s*\(\s*([+-]?[\d.]*)\s*x\s*([+-])\s*([\d.]+)\s*\)/g,
        (_, a, coef, sign, b) => {
          const aVal = a === '' || a === '+' ? 1 : a === '-' ? -1 : parseFloat(a);
          const cVal = coef === '' || coef === '+' ? 1 : coef === '-' ? -1 : parseFloat(coef);
          const bVal = parseFloat(b);
          const termX = aVal * cVal;
          const termC = sign === '+' ? aVal * bVal : -(aVal * bVal);
          return `${formatNum(termX)}x ${termC >= 0 ? '+' : '-'} ${formatNum(Math.abs(termC))}`;
        });
    };

    const lhsExp = expandDist(lhs);
    const rhsExp = expandDist(rhs);
    if (lhsExp !== lhs || rhsExp !== rhs) {
      steps.push(`Expandimos: ${lhsExp} = ${rhsExp}`);
      lhs = lhsExp;
      rhs = rhsExp;
    }

    // Parsear cada lado: extraer coeficiente de x y constante
    const { xCoef: lx, constant: lc } = parseSide(lhs);
    const { xCoef: rx, constant: rc } = parseSide(rhs);

    // Pasar x al lado izquierdo, constantes al derecho
    const netX = lx - rx;
    const netC = rc - lc;

    if (netX === 0) {
      if (netC === 0) {
        steps.push('La ecuación es una identidad (infinitas soluciones)');
        return { problemText: raw, category: 'ecuaciones', difficulty: 'facil', steps, answer: 'Infinitas soluciones', isError: false };
      }
      steps.push('No hay solución (ecuación inconsistente)');
      return { problemText: raw, category: 'ecuaciones', difficulty: 'facil', steps, answer: 'Sin solución', isError: false };
    }

    if (lx !== 0) steps.push(`Identificamos: lado izquierdo tiene ${formatNum(lx)}x ${lc >= 0 ? '+' : '-'} ${formatNum(Math.abs(lc))}`);
    if (rx !== 0) steps.push(`Lado derecho tiene ${formatNum(rx)}x ${rc >= 0 ? '+' : '-'} ${formatNum(Math.abs(rc))}`);

    if (rx !== 0) {
      steps.push(`Pasamos ${formatNum(rx)}x al lado izquierdo: ${formatNum(lx)}x - ${formatNum(rx)}x = ${formatNum(netX)}x`);
    }
    if (lc !== 0) {
      steps.push(`Pasamos ${formatNum(lc)} al lado derecho: ${formatNum(rc)} - (${formatNum(lc)}) = ${formatNum(netC)}`);
    }

    steps.push(`${formatNum(netX)}x = ${formatNum(netC)}`);
    steps.push(`Dividimos ambos lados entre ${formatNum(netX)}: x = ${formatNum(netC)} ÷ ${formatNum(netX)}`);

    const x = netC / netX;
    const answer = `x = ${formatNum(x)}`;
    steps.push(`Solución: ${answer}`);

    // Verificación
    const lhsVal = lx * x + lc;
    const rhsVal = rx * x + rc;
    steps.push(`Verificación: ${formatNum(lhsVal)} = ${formatNum(rhsVal)} ✓`);

    return { problemText: raw, category: 'ecuaciones', difficulty: 'facil', steps, answer, isError: false };
  } catch (e) {
    return {
      problemText: raw, category: 'ecuaciones', difficulty: 'facil',
      steps: [], answer: '', isError: true,
      errorMessage: `No se pudo resolver: ${(e as Error).message}. Ejemplos válidos: "3x + 2 = 11", "2(x - 1) = 8", "5x = 25"`,
    };
  }
}

interface Side { xCoef: number; constant: number; }

function parseSide(s: string): Side {
  let xCoef = 0;
  let constant = 0;

  // Asegurar signo inicial
  let expr = s.trim();
  if (!expr.startsWith('-')) expr = '+' + expr;

  // Términos con x
  const xPattern = /([+-])\s*([\d.]*)\s*x/g;
  let m: RegExpExecArray | null;
  while ((m = xPattern.exec(expr)) !== null) {
    const sign = m[1] === '-' ? -1 : 1;
    const coef = m[2] === '' ? 1 : parseFloat(m[2]);
    xCoef += sign * coef;
  }

  // Quitar los términos con x para parsear constantes
  const noX = expr.replace(/[+-]\s*[\d.]*\s*x/g, '');
  const cPattern = /([+-])\s*([\d.]+)/g;
  while ((m = cPattern.exec(noX)) !== null) {
    const sign = m[1] === '-' ? -1 : 1;
    constant += sign * parseFloat(m[2]);
  }

  return { xCoef, constant };
}
