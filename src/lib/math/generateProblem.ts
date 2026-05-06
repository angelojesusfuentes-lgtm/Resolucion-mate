import type { Category, Difficulty, GeneratedProblem } from '../types';
import { randInt, pick, fractionToString, simplify } from './utils';
import { solveByCategory } from './solveProblem';

export function generateProblem(category: Category, difficulty: Difficulty): GeneratedProblem {
  const { statement, expression } = generateTemplate(category, difficulty);
  const result = solveByCategory(expression, category);
  result.category = category;
  result.difficulty = difficulty;
  result.problemText = statement;
  return { statement, category, difficulty, internalExpression: expression, result };
}

function generateTemplate(category: Category, difficulty: Difficulty): { statement: string; expression: string } {
  switch (category) {
    case 'aritmetica': return genArithmetic(difficulty);
    case 'algebra': return genAlgebra(difficulty);
    case 'ecuaciones': return genEquation(difficulty);
    case 'fracciones': return genFraction(difficulty);
    case 'porcentajes': return genPercentage(difficulty);
    case 'trigonometria': return genTrigonometry(difficulty);
    case 'logaritmos': return genLogarithms(difficulty);
    case 'limites': return genLimits(difficulty);
    case 'derivadas': return genDerivatives(difficulty);
    case 'integrales': return genIntegrals(difficulty);
    case 'matrices': return genMatrices(difficulty);
  }
}

function genArithmetic(diff: Difficulty): { statement: string; expression: string } {
  if (diff === 'facil') {
    const op = pick(['+', '-', '*', '/']);
    let a: number;
    let b: number;
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
    return { statement: `Calcula: ${a} ${opSymbol(op)} ${b}`, expression: `${a} ${op} ${b}` };
  }
  if (diff === 'medio') {
    const a = randInt(10, 99);
    const b = randInt(1, 20);
    const c = randInt(1, 10);
    const op1 = pick(['+', '-']);
    const op2 = pick(['*', '+']);
    return {
      statement: `Resuelve: ${a} ${opSymbol(op1)} ${b} ${opSymbol(op2)} ${c}`,
      expression: `${a} ${op1} ${b} ${op2} ${c}`,
    };
  }
  const a = randInt(10, 50);
  const b = randInt(2, 12);
  const c = randInt(2, 9);
  const d = randInt(1, 15);
  return { statement: `Calcula: (${a} + ${b}) * ${c} - ${d}`, expression: `(${a} + ${b}) * ${c} - ${d}` };
}

function genAlgebra(diff: Difficulty): { statement: string; expression: string } {
  if (diff === 'facil') {
    const a = randInt(2, 8);
    const b = randInt(1, 5);
    const c = randInt(1, 4);
    return { statement: `Simplifica: ${a}x + ${b}x - ${c}x`, expression: `${a}x + ${b}x - ${c}x` };
  }
  if (diff === 'medio') {
    const a = randInt(2, 6);
    const b = randInt(1, 8);
    const c = randInt(1, 5);
    return { statement: `Simplifica: ${a}(x + ${b}) + ${c}x`, expression: `${a}(x + ${b}) + ${c}x` };
  }
  const a = randInt(2, 5);
  const b = randInt(1, 6);
  const c = randInt(2, 4);
  const d = randInt(1, 5);
  const e = randInt(1, 3);
  return { statement: `Simplifica: ${a}(x + ${b}) - ${c}(x - ${d}) + ${e}x`, expression: `${a}(x + ${b}) + ${-c}(x + ${-d}) + ${e}x` };
}

function genEquation(diff: Difficulty): { statement: string; expression: string } {
  if (diff === 'facil') {
    const b = randInt(1, 10);
    const c = randInt(b + 1, 20);
    return { statement: `Resuelve: x + ${b} = ${c}`, expression: `x + ${b} = ${c}` };
  }
  if (diff === 'medio') {
    const a = randInt(2, 8);
    const b = randInt(1, 10);
    const x = randInt(1, 10);
    const c = a * x + b;
    return { statement: `Resuelve: ${a}x + ${b} = ${c}`, expression: `${a}x + ${b} = ${c}` };
  }
  const a = randInt(2, 5);
  const b = randInt(1, 6);
  const x = randInt(1, 8);
  const c = a * (x + b);
  return { statement: `Resuelve: ${a}(x + ${b}) = ${c}`, expression: `${a}(x + ${b}) = ${c}` };
}

function genFraction(diff: Difficulty): { statement: string; expression: string } {
  if (diff === 'facil') {
    const den = pick([2, 3, 4, 5, 6, 8, 10]);
    const a = randInt(1, den - 1);
    const b = randInt(1, den - 1);
    const op = pick(['+', '-']);
    if (op === '-' && a < b) return genFraction(diff);
    return { statement: `Calcula: ${a}/${den} ${opSymbol(op)} ${b}/${den}`, expression: `${a}/${den} ${op} ${b}/${den}` };
  }
  if (diff === 'medio') {
    const dens = [[2, 3], [3, 4], [4, 6], [2, 5], [3, 5]];
    const [d1, d2] = pick(dens);
    const a = randInt(1, d1);
    const b = randInt(1, d2);
    const op = pick(['+', '-', '*']);
    return { statement: `Calcula: ${a}/${d1} ${opSymbol(op)} ${b}/${d2}`, expression: `${a}/${d1} ${op} ${b}/${d2}` };
  }
  const a = randInt(1, 5);
  const b = randInt(2, 6);
  const c = randInt(1, 4);
  const d = randInt(2, 7);
  const e = randInt(1, 3);
  const f = randInt(2, 5);
  const op1 = pick(['+', '-']);
  const op2 = pick(['*', '/']);
  return { statement: `Calcula: ${a}/${b} ${opSymbol(op1)} ${c}/${d} ${opSymbol(op2)} ${e}/${f}`, expression: `${a}/${b} ${op1} ${c}/${d} ${op2} ${e}/${f}` };
}

function genPercentage(diff: Difficulty): { statement: string; expression: string } {
  const pcts = [5, 10, 15, 20, 25, 30, 40, 50, 75];
  if (diff === 'facil') {
    const pct = pick([10, 20, 25, 50]);
    const base = randInt(1, 20) * 10;
    return { statement: `Cuanto es el ${pct}% de ${base}?`, expression: `${pct}% de ${base}` };
  }
  if (diff === 'medio') {
    const pct = pick(pcts);
    const base = randInt(100, 500);
    const type = pick(['descuento', 'aumento']);
    return { statement: `Un articulo cuesta $${base}. Cuanto cuesta con un ${pct}% de ${type}?`, expression: `${base} con ${pct}% de ${type}` };
  }
  const pct = pick(pcts);
  const base = randInt(10, 200) * 5;
  const part = Math.round(base * pct / 100);
  return { statement: `${part} es que porcentaje de ${base}?`, expression: `${part} es que % de ${base}` };
}

function genTrigonometry(diff: Difficulty): { statement: string; expression: string } {
  if (diff === 'facil') {
    const fn = pick(['sin', 'cos', 'tan']);
    const deg = pick([0, 30, 45, 60, 90]);
    return { statement: `Calcula ${fn}(${deg} grados)`, expression: `trig|value|${fn}|${deg}|${diff}` };
  }
  if (diff === 'medio') {
    const deg = pick([0, 30, 45, 60]);
    return { statement: `Calcula sin(${deg}) + cos(${deg})`, expression: `trig|identity|sum|${deg}|${diff}` };
  }
  return { statement: 'Simplifica sin^2(x) + cos^2(x)', expression: `trig|identity|pythagoras|${diff}` };
}

function genLogarithms(diff: Difficulty): { statement: string; expression: string } {
  if (diff === 'facil') {
    const base = pick([2, 3, 10]);
    const exp = randInt(2, 5);
    const value = Math.pow(base, exp);
    return { statement: `Calcula log_${base}(${value})`, expression: `log|eval|${base}|${value}|${diff}` };
  }
  if (diff === 'medio') {
    const base = pick([2, 3, 5, 10]);
    const rhs = randInt(2, 4);
    return { statement: `Resuelve log_${base}(x) = ${rhs}`, expression: `log|equation|${base}|${rhs}|${diff}` };
  }
  const a = pick([2, 3, 5, 10]);
  const b = pick([2, 4, 5, 8, 10]);
  return { statement: `Simplifica log(${a}) + log(${b})`, expression: `log|property|${a}|${b}|${diff}` };
}

function genLimits(diff: Difficulty): { statement: string; expression: string } {
  if (diff === 'facil') {
    const x0 = randInt(1, 5);
    const a = randInt(1, 3);
    const b = randInt(1, 6);
    const c = randInt(0, 5);
    return { statement: `Calcula lim x->${x0} (${a}x^2 + ${b}x + ${c})`, expression: `limit|poly|${a}|${b}|${c}|${x0}|${diff}` };
  }
  const x0 = randInt(1, 6);
  return { statement: `Calcula lim x->${x0} (x^2 - ${x0 * x0})/(x - ${x0})`, expression: `limit|indet|${x0}|${diff}` };
}

function genDerivatives(diff: Difficulty): { statement: string; expression: string } {
  if (diff === 'facil') {
    const n = randInt(2, 7);
    return { statement: `Deriva x^${n}`, expression: `deriv|power|${n}|${diff}` };
  }
  if (diff === 'medio') {
    const a = randInt(1, 6);
    const b = randInt(1, 6);
    return { statement: `Deriva (x + ${a})(x + ${b})`, expression: `deriv|product|${a}|${b}|${diff}` };
  }
  const n = randInt(2, 5);
  return { statement: `Deriva (x^${n})^2`, expression: `deriv|chain|${n}|${diff}` };
}

function genIntegrals(diff: Difficulty): { statement: string; expression: string } {
  if (diff === 'facil') {
    const n = randInt(1, 5);
    return { statement: `Integra x^${n}`, expression: `integ|power|${n}|${diff}` };
  }
  if (diff === 'medio') return { statement: 'Integra sin(x)', expression: `integ|sin|0|${diff}` };
  return { statement: 'Integra cos(x)', expression: `integ|cos|0|${diff}` };
}

function genMatrices(diff: Difficulty): { statement: string; expression: string } {
  const a = randInt(1, 5); const b = randInt(1, 5); const c = randInt(1, 5); const d = randInt(1, 5);
  const e = randInt(1, 5); const f = randInt(1, 5); const g = randInt(1, 5); const h = randInt(1, 5);
  if (diff === 'facil') return { statement: `Suma A+B con A=[[${a},${b}],[${c},${d}]] y B=[[${e},${f}],[${g},${h}]]`, expression: `matrix|sum|${a},${b},${c},${d},${e},${f},${g},${h}|${diff}` };
  if (diff === 'medio') return { statement: `Multiplica A*B con A=[[${a},${b}],[${c},${d}]] y B=[[${e},${f}],[${g},${h}]]`, expression: `matrix|mul|${a},${b},${c},${d},${e},${f},${g},${h}|${diff}` };
  return { statement: `Calcula det(A) para A=[[${a},${b}],[${c},${d}]]`, expression: `matrix|det|${a},${b},${c},${d}|${diff}` };
}

function opSymbol(op: string): string {
  const map: Record<string, string> = { '+': '+', '-': '-', '*': 'x', '/': '/' };
  return map[op] ?? op;
}

export { fractionToString, simplify };