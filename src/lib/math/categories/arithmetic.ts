import type { MathResult } from '../../types';
import { normalizeExpr, formatNum, safeEval } from '../utils';

/**
 * Resuelve operaciones aritméticas básicas paso a paso.
 * Soporta: a op b op c, con +, -, *, /
 * También soporta paréntesis simples.
 */
export function solveArithmetic(input: string): MathResult {
  const expr = normalizeExpr(input);
  const steps: string[] = [];

  try {
    steps.push(`Expresión original: ${input.trim()}`);

    // Detectar operaciones con paréntesis
    const parenMatch = expr.match(/\(([^()]+)\)/);
    if (parenMatch) {
      const inner = parenMatch[1];
      const innerVal = safeEval(inner);
      const simplified = expr.replace(parenMatch[0], formatNum(innerVal));
      steps.push(`Resolvemos el paréntesis primero: (${inner}) = ${formatNum(innerVal)}`);
      steps.push(`Expresión simplificada: ${simplified}`);
      const final = safeEval(simplified);
      steps.push(`Resultado final: ${formatNum(final)}`);
      return { problemText: input.trim(), category: 'aritmetica', difficulty: 'facil', steps, answer: formatNum(final), isError: false };
    }

    // Expresión sin paréntesis: desglose paso a paso
    // Respeta jerarquía: primero * y /, luego + y -
    const tokens = tokenize(expr);
    if (tokens.length === 0) throw new Error('No se pudo parsear la expresión');

    if (tokens.length === 1) {
      steps.push(`El resultado es directamente: ${tokens[0]}`);
      return { problemText: input.trim(), category: 'aritmetica', difficulty: 'facil', steps, answer: tokens[0], isError: false };
    }

    // Paso 1: multiplicaciones y divisiones
    let working = [...tokens];
    let changed = true;
    while (changed) {
      changed = false;
      for (let i = 1; i < working.length - 1; i += 2) {
        const op = working[i];
        if (op === '*' || op === '/') {
          const a = parseFloat(working[i - 1]);
          const b = parseFloat(working[i + 1]);
          let res: number;
          let opName: string;
          if (op === '*') { res = a * b; opName = '×'; }
          else {
            if (b === 0) throw new Error('División por cero');
            res = a / b; opName = '÷';
          }
          steps.push(`${formatNum(a)} ${opName} ${formatNum(b)} = ${formatNum(res)}`);
          working.splice(i - 1, 3, formatNum(res));
          changed = true;
          break;
        }
      }
    }

    // Paso 2: sumas y restas
    changed = true;
    while (changed && working.length > 1) {
      changed = false;
      for (let i = 1; i < working.length - 1; i += 2) {
        const op = working[i];
        if (op === '+' || op === '-') {
          const a = parseFloat(working[i - 1]);
          const b = parseFloat(working[i + 1]);
          const res = op === '+' ? a + b : a - b;
          const opName = op === '+' ? '+' : '−';
          steps.push(`${formatNum(a)} ${opName} ${formatNum(b)} = ${formatNum(res)}`);
          working.splice(i - 1, 3, formatNum(res));
          changed = true;
          break;
        }
      }
    }

    const answer = working[0];
    steps.push(`Resultado final: ${answer}`);
    return { problemText: input.trim(), category: 'aritmetica', difficulty: 'facil', steps, answer, isError: false };
  } catch (e) {
    return {
      problemText: input.trim(), category: 'aritmetica', difficulty: 'facil',
      steps: [], answer: '', isError: true,
      errorMessage: `No se pudo resolver: ${(e as Error).message}. Ejemplos válidos: "15 + 27", "8 * 6 - 4", "(3 + 5) * 2"`,
    };
  }
}

/** Tokeniza una expresión en números y operadores */
function tokenize(expr: string): string[] {
  const tokens: string[] = [];
  let num = '';
  for (let i = 0; i < expr.length; i++) {
    const ch = expr[i];
    if (ch === ' ') continue;
    if ('0123456789.'.includes(ch)) {
      num += ch;
    } else if ('+-*/'.includes(ch)) {
      // Manejo de signo negativo al inicio o después de operador
      if (ch === '-' && (tokens.length === 0 || '+-*/'.includes(tokens[tokens.length - 1])) && num === '') {
        num = '-';
      } else {
        if (num !== '') { tokens.push(num); num = ''; }
        tokens.push(ch);
      }
    }
  }
  if (num !== '') tokens.push(num);
  return tokens;
}
