import type { MathResult, Category } from '../types';
import { solveArithmetic } from './categories/arithmetic';
import { solveAlgebra } from './categories/algebra';
import { solveEquation } from './categories/equations';
import { solveFractions } from './categories/fractions';
import { solvePercentage } from './categories/percentages';

/**
 * Detecta la categoría de un problema y lo resuelve.
 */
export function solveProblem(input: string): MathResult {
  const s = input.trim().toLowerCase();

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
  }
}
