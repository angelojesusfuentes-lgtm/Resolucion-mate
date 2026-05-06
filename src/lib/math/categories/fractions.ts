import type { MathResult } from '../../types';
import { mcd, mcm, simplify, fractionToString } from '../utils';
import type { Fraction } from '../utils';

/**
 * Fracciones: suma, resta, multiplicación, división.
 * Formato: "a/b op c/d"  (ej: "3/4 + 1/2", "2/3 * 3/5", "1/2 - 1/4", "3/4 / 1/2")
 * También soporta enteros: "3 + 1/2", "2 * 1/4"
 */
export function solveFractions(input: string): MathResult {
  const raw = input.trim();
  const steps: string[] = [];
  steps.push(`Expresión: ${raw}`);

  try {
    const norm = raw
      .replace(/\s+/g, ' ')
      .replace(/÷/g, '/')
      .trim();

    // Buscar operador principal: +, -, *, ÷ que no sea parte de las fracciones
    // Parsear: fraccion op fraccion
    const pattern = /^(-?[\d]+(?:\/[\d]+)?)\s*([+\-*\/])\s*(-?[\d]+(?:\/[\d]+)?)$/;
    const m = norm.match(pattern);

    if (!m) {
      // Intentar con más de dos fracciones en cadena (a/b + c/d + e/f)
      return solveFractionChain(raw, norm);
    }

    const f1 = parseFrac(m[1]);
    const op = m[2];
    const f2 = parseFrac(m[3]);

    steps.push(`Fracción 1: ${fractionToString(f1)}`);
    steps.push(`Operador: ${opLabel(op)}`);
    steps.push(`Fracción 2: ${fractionToString(f2)}`);

    let result: Fraction;

    if (op === '+' || op === '-') {
      if (f1.den === f2.den) {
        steps.push(`Mismo denominador (${f1.den}), sumamos/restamos numeradores directamente`);
        const num = op === '+' ? f1.num + f2.num : f1.num - f2.num;
        result = { num, den: f1.den };
      } else {
        const commonDen = mcm(f1.den, f2.den);
        const n1 = f1.num * (commonDen / f1.den);
        const n2 = f2.num * (commonDen / f2.den);
        steps.push(`MCM(${f1.den}, ${f2.den}) = ${commonDen} → denominador común`);
        steps.push(`Convertimos: ${fractionToString(f1)} = ${n1}/${commonDen}`);
        steps.push(`Convertimos: ${fractionToString(f2)} = ${n2}/${commonDen}`);
        const num = op === '+' ? n1 + n2 : n1 - n2;
        result = { num, den: commonDen };
        steps.push(`${n1} ${op} ${n2} = ${num} → resultado antes de simplificar: ${num}/${commonDen}`);
      }
    } else if (op === '*') {
      steps.push(`Multiplicamos numeradores: ${f1.num} × ${f2.num} = ${f1.num * f2.num}`);
      steps.push(`Multiplicamos denominadores: ${f1.den} × ${f2.den} = ${f1.den * f2.den}`);
      result = { num: f1.num * f2.num, den: f1.den * f2.den };
    } else {
      // División: multiplicar por inverso
      if (f2.num === 0) throw new Error('División por cero');
      const inv = { num: f2.den, den: f2.num };
      steps.push(`División = multiplicar por el inverso: ${fractionToString(f1)} × ${fractionToString(inv)}`);
      result = { num: f1.num * inv.num, den: f1.den * inv.den };
    }

    const simplified = simplify(result);
    if (result.num !== simplified.num || result.den !== simplified.den) {
      const g = mcd(Math.abs(result.num), Math.abs(result.den));
      steps.push(`Simplificamos dividiendo por MCD = ${g}: ${fractionToString(simplified)}`);
    }

    const answer = fractionToString(simplified);
    steps.push(`Resultado: ${answer}`);

    return { problemText: raw, category: 'fracciones', difficulty: 'facil', steps, answer, isError: false };
  } catch (e) {
    return {
      problemText: raw, category: 'fracciones', difficulty: 'facil',
      steps: [], answer: '', isError: true,
      errorMessage: `No se pudo resolver: ${(e as Error).message}. Ejemplos: "3/4 + 1/2", "2/3 * 3/4", "1/2 - 1/4", "3/4 / 1/2"`,
    };
  }
}

function solveFractionChain(raw: string, norm: string): MathResult {
  const steps: string[] = [`Expresión: ${raw}`];
  // Partir por + y - manteniendo el operador
  const parts = norm.match(/(-?[\d]+(?:\/[\d]+)?)|([+\-*\/])/g);
  if (!parts || parts.length < 3) throw new Error('Formato no reconocido para cadena de fracciones');

  let acc = parseFrac(parts[0]);
  let i = 1;
  while (i < parts.length - 1) {
    const op = parts[i];
    const next = parseFrac(parts[i + 1]);
    const before = fractionToString(acc);
    let result: Fraction;
    if (op === '+' || op === '-') {
      const commonDen = mcm(acc.den, next.den);
      const n1 = acc.num * (commonDen / acc.den);
      const n2 = next.num * (commonDen / next.den);
      const num = op === '+' ? n1 + n2 : n1 - n2;
      result = simplify({ num, den: commonDen });
    } else if (op === '*') {
      result = simplify({ num: acc.num * next.num, den: acc.den * next.den });
    } else {
      if (next.num === 0) throw new Error('División por cero');
      result = simplify({ num: acc.num * next.den, den: acc.den * next.num });
    }
    steps.push(`${before} ${opLabel(op)} ${fractionToString(next)} = ${fractionToString(result)}`);
    acc = result;
    i += 2;
  }

  const answer = fractionToString(acc);
  steps.push(`Resultado final: ${answer}`);
  return { problemText: raw, category: 'fracciones', difficulty: 'facil', steps, answer, isError: false };
}

function parseFrac(s: string): Fraction {
  if (s.includes('/')) {
    const p = s.split('/');
    return { num: parseInt(p[0]), den: parseInt(p[1]) };
  }
  return { num: parseInt(s), den: 1 };
}

function opLabel(op: string): string {
  const labels: Record<string, string> = { '+': 'suma (+)', '-': 'resta (−)', '*': 'multiplicación (×)', '/': 'división (÷)' };
  return labels[op] ?? op;
}
