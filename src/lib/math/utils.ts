/** Máximo común divisor */
export function mcd(a: number, b: number): number {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b !== 0) {
    const t = b;
    b = a % b;
    a = t;
  }
  return a;
}

/** Mínimo común múltiplo */
export function mcm(a: number, b: number): number {
  return Math.abs(a * b) / mcd(a, b);
}

export interface Fraction {
  num: number;
  den: number;
}

/** Simplifica una fracción */
export function simplify(f: Fraction): Fraction {
  if (f.den === 0) throw new Error('Denominador cero');
  const g = mcd(Math.abs(f.num), Math.abs(f.den));
  let num = f.num / g;
  let den = f.den / g;
  if (den < 0) { num = -num; den = -den; }
  return { num, den };
}

/** Convierte fracción a string legible */
export function fractionToString(f: Fraction): string {
  const s = simplify(f);
  if (s.den === 1) return String(s.num);
  return `${s.num}/${s.den}`;
}

/** Formatea un número: si es entero lo muestra sin decimales, si no con 4 decimales */
export function formatNum(n: number): string {
  if (Number.isInteger(n)) return String(n);
  return parseFloat(n.toFixed(4)).toString();
}

/** Número aleatorio entero en [min, max] */
export function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/** Elige un elemento aleatorio de un arreglo */
export function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

/** Normaliza expresión: reemplaza símbolos alternativos */
export function normalizeExpr(expr: string): string {
  return expr
    .replace(/×/g, '*')
    .replace(/÷/g, '/')
    .replace(/\^/g, '**')
    .replace(/,/g, '.')
    .trim();
}

/** Evalúa expresión aritmética simple de forma segura */
export function safeEval(expr: string): number {
  const normalized = normalizeExpr(expr);
  // Sólo permite dígitos, operadores, paréntesis, punto y espacios
  if (!/^[\d\s+\-*/().%**]+$/.test(normalized)) {
    throw new Error('Expresión no válida');
  }
  // eslint-disable-next-line no-new-func
  const result = Function(`"use strict"; return (${normalized})`)();
  if (typeof result !== 'number' || !isFinite(result)) {
    throw new Error('Resultado no finito');
  }
  return result;
}
