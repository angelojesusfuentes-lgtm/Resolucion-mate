import type { Category, Difficulty, GeneratedProblem } from '../types';
import { randInt, pick, fractionToString, simplify } from './utils';
import { solveByCategory } from './solveProblem';

export function generateProblem(category: Category, difficulty: Difficulty): GeneratedProblem {
  const { statement, expression } = generateTemplate(category, difficulty);
  const result = solveByCategory(expression, category);
  // Aseguramos que la dificultad y categoría sean correctas en el resultado
  result.category = category;
  result.difficulty = difficulty;
  result.problemText = statement;
  return { statement, category, difficulty, internalExpression: expression, result };
}

// ──────────────────────────────────────────────
// Generadores por categoría
// ──────────────────────────────────────────────

function generateTemplate(category: Category, difficulty: Difficulty): { statement: string; expression: string } {
  switch (category) {
    case 'aritmetica': return genArithmetic(difficulty);
    case 'algebra':    return genAlgebra(difficulty);
    case 'ecuaciones': return genEquation(difficulty);
    case 'fracciones': return genFraction(difficulty);
    case 'porcentajes': return genPercentage(difficulty);
  }
}

// ── Aritmética ──────────────────────────────

function genArithmetic(diff: Difficulty): { statement: string; expression: string } {
  if (diff === 'facil') {
    const ops = ['+', '-', '*', '/'];
    const op = pick(ops);
    let a: number, b: number;
    if (op === '/') {
      b = randInt(1, 9);
      a = b * randInt(1, 9);
    } else if (op === '-') {
      a = randInt(10, 50);
      b = randInt(1, a);
    } else {
      a = randInt(1, 20);
      b = randInt(1, 20);
    }
    const opStr = opSymbol(op);
    return { statement: `Calcula: ${a} ${opStr} ${b}`, expression: `${a} ${op} ${b}` };
  }

  if (diff === 'medio') {
    const a = randInt(10, 99);
    const b = randInt(1, 20);
    const c = randInt(1, 10);
    const ops = ['+', '-'];
    const op1 = pick(ops);
    const op2 = pick(['*', '+']);
    return {
      statement: `Resuelve: ${a} ${opSymbol(op1)} ${b} ${opSymbol(op2)} ${c}`,
      expression: `${a} ${op1} ${b} ${op2} ${c}`,
    };
  }

  // difícil
  const a = randInt(10, 50);
  const b = randInt(2, 12);
  const c = randInt(2, 9);
  const d = randInt(1, 15);
  return {
    statement: `Calcula: (${a} + ${b}) * ${c} - ${d}`,
    expression: `(${a} + ${b}) * ${c} - ${d}`,
  };
}

// ── Álgebra ──────────────────────────────────

function genAlgebra(diff: Difficulty): { statement: string; expression: string } {
  if (diff === 'facil') {
    const a = randInt(2, 8);
    const b = randInt(1, 5);
    const c = randInt(1, 4);
    return {
      statement: `Simplifica: ${a}x + ${b}x - ${c}x`,
      expression: `${a}x + ${b}x - ${c}x`,
    };
  }
  if (diff === 'medio') {
    const a = randInt(2, 6);
    const b = randInt(1, 8);
    const c = randInt(1, 5);
    return {
      statement: `Simplifica: ${a}(x + ${b}) + ${c}x`,
      expression: `${a}(x + ${b}) + ${c}x`,
    };
  }
  // difícil
  const a = randInt(2, 5);
  const b = randInt(1, 6);
  const c = randInt(2, 4);
  const d = randInt(1, 5);
  const e = randInt(1, 3);
  return {
    statement: `Simplifica: ${a}(x + ${b}) - ${c}(x - ${d}) + ${e}x`,
    expression: `${a}(x + ${b}) + ${-c}(x + ${-d}) + ${e}x`,
  };
}

// ── Ecuaciones ───────────────────────────────

function genEquation(diff: Difficulty): { statement: string; expression: string } {
  if (diff === 'facil') {
    const b = randInt(1, 10);
    const c = randInt(b + 1, 20);
    return {
      statement: `Resuelve: x + ${b} = ${c}`,
      expression: `x + ${b} = ${c}`,
    };
  }
  if (diff === 'medio') {
    const a = randInt(2, 8);
    const b = randInt(1, 10);
    const x = randInt(1, 10);
    const c = a * x + b;
    return {
      statement: `Resuelve: ${a}x + ${b} = ${c}`,
      expression: `${a}x + ${b} = ${c}`,
    };
  }
  // difícil
  const a = randInt(2, 5);
  const b = randInt(1, 6);
  const x = randInt(1, 8);
  const c = a * (x + b);
  return {
    statement: `Resuelve: ${a}(x + ${b}) = ${c}`,
    expression: `${a}(x + ${b}) = ${c}`,
  };
}

// ── Fracciones ───────────────────────────────

function genFraction(diff: Difficulty): { statement: string; expression: string } {
  if (diff === 'facil') {
    // Mismo denominador
    const den = pick([2, 3, 4, 5, 6, 8, 10]);
    const a = randInt(1, den - 1);
    const b = randInt(1, den - 1);
    const op = pick(['+', '-']);
    if (op === '-' && a < b) {
      return genFraction(diff); // reintentar para resultado positivo
    }
    return {
      statement: `Calcula: ${a}/${den} ${opSymbol(op)} ${b}/${den}`,
      expression: `${a}/${den} ${op} ${b}/${den}`,
    };
  }
  if (diff === 'medio') {
    // Distinto denominador
    const dens = [[2, 3], [3, 4], [4, 6], [2, 5], [3, 5]];
    const [d1, d2] = pick(dens);
    const a = randInt(1, d1);
    const b = randInt(1, d2);
    const op = pick(['+', '-', '*']);
    return {
      statement: `Calcula: ${a}/${d1} ${opSymbol(op)} ${b}/${d2}`,
      expression: `${a}/${d1} ${op} ${b}/${d2}`,
    };
  }
  // difícil
  const a = randInt(1, 5);
  const b = randInt(2, 6);
  const c = randInt(1, 4);
  const d = randInt(2, 7);
  const e = randInt(1, 3);
  const f = randInt(2, 5);
  const op1 = pick(['+', '-']);
  const op2 = pick(['*', '/']);
  return {
    statement: `Calcula: ${a}/${b} ${opSymbol(op1)} ${c}/${d} ${opSymbol(op2)} ${e}/${f}`,
    expression: `${a}/${b} ${op1} ${c}/${d} ${op2} ${e}/${f}`,
  };
}

// ── Porcentajes ──────────────────────────────

function genPercentage(diff: Difficulty): { statement: string; expression: string } {
  const pcts = [5, 10, 15, 20, 25, 30, 40, 50, 75];
  if (diff === 'facil') {
    const pct = pick([10, 20, 25, 50]);
    const base = randInt(1, 20) * 10;
    return {
      statement: `¿Cuánto es el ${pct}% de ${base}?`,
      expression: `${pct}% de ${base}`,
    };
  }
  if (diff === 'medio') {
    const pct = pick(pcts);
    const base = randInt(100, 500);
    const type = pick(['descuento', 'aumento']);
    return {
      statement: `Un artículo cuesta $${base}. ¿Cuánto cuesta con un ${pct}% de ${type}?`,
      expression: `${base} con ${pct}% de ${type}`,
    };
  }
  // difícil
  const pct = pick(pcts);
  const base = randInt(10, 200) * 5;
  const part = Math.round(base * pct / 100);
  return {
    statement: `${part} es ¿qué porcentaje de ${base}?`,
    expression: `${part} es qué % de ${base}`,
  };
}

function opSymbol(op: string): string {
  const map: Record<string, string> = { '+': '+', '-': '−', '*': '×', '/': '÷' };
  return map[op] ?? op;
}

// Re-exportar fractionToString y simplify para uso externo si se necesita
export { fractionToString, simplify };
