import type { MathResult } from '../../types';
import { formatNum } from '../utils';

/**
 * Porcentajes: varios patrones
 *   - "¿Cuánto es el 15% de 200?"  → cálculo directo
 *   - "15% de 200"                  → cálculo directo
 *   - "200 con 15% de descuento"    → descuento
 *   - "200 con 15% de aumento"      → aumento/incremento
 *   - "30 es qué % de 200"          → porcentaje inverso
 *   Formatos numéricos: "15% de 200", "200 * 15%", "30 es X% de 200"
 */
export function solvePercentage(input: string): MathResult {
  const raw = input.trim();
  const steps: string[] = [];
  steps.push(`Problema: ${raw}`);

  try {
    const lower = raw.toLowerCase().replace(/[¿?]/g, '').trim();

    // Patrón: "N es X% de B" o "X es que porcentaje de B"
    const inversePattern = /([\d.]+)\s+es\s+(?:qu[eé]\s+)?(?:porcentaje|%|el)\s+de\s+([\d.]+)/i;
    const invMatch = lower.match(inversePattern);
    if (invMatch) {
      const part = parseFloat(invMatch[1]);
      const total = parseFloat(invMatch[2]);
      steps.push(`Queremos saber: ${part} es X% de ${total}`);
      steps.push(`Fórmula: X% = (parte / total) × 100`);
      steps.push(`X% = (${part} / ${total}) × 100`);
      const pct = (part / total) * 100;
      steps.push(`X% = ${formatNum(pct)}%`);
      const answer = `${formatNum(pct)}%`;
      steps.push(`Resultado: ${answer}`);
      return { problemText: raw, category: 'porcentajes', difficulty: 'medio', steps, answer, isError: false };
    }

    // Patrón: "X es qué % de B" — variante
    const invPat2 = /([\d.]+)\s+(?:de|es)\s+qu[eé]\s+(?:%|porcentaje)\s+(?:de|es)\s+([\d.]+)/i;
    const inv2 = lower.match(invPat2);
    if (inv2) {
      const part = parseFloat(inv2[1]);
      const total = parseFloat(inv2[2]);
      const pct = (part / total) * 100;
      steps.push(`(${part} / ${total}) × 100 = ${formatNum(pct)}%`);
      return { problemText: raw, category: 'porcentajes', difficulty: 'medio', steps, answer: `${formatNum(pct)}%`, isError: false };
    }

    // Patrón: descuento → "N con P% de descuento"
    const discountMatch = lower.match(/([\d.]+)\s+con\s+([\d.]+)\s*%\s+de\s+descuento/i);
    if (discountMatch) {
      const base = parseFloat(discountMatch[1]);
      const pct = parseFloat(discountMatch[2]);
      steps.push(`Base: ${base}`);
      steps.push(`Porcentaje de descuento: ${pct}%`);
      steps.push(`Descuento = ${base} × ${pct} / 100 = ${formatNum(base * pct / 100)}`);
      const result = base - (base * pct / 100);
      steps.push(`Precio final = ${base} - ${formatNum(base * pct / 100)} = ${formatNum(result)}`);
      const answer = formatNum(result);
      steps.push(`Resultado: ${answer}`);
      return { problemText: raw, category: 'porcentajes', difficulty: 'medio', steps, answer, isError: false };
    }

    // Patrón: aumento/incremento → "N con P% de aumento/incremento"
    const increaseMatch = lower.match(/([\d.]+)\s+con\s+([\d.]+)\s*%\s+de\s+(?:aumento|incremento)/i);
    if (increaseMatch) {
      const base = parseFloat(increaseMatch[1]);
      const pct = parseFloat(increaseMatch[2]);
      steps.push(`Base: ${base}`);
      steps.push(`Porcentaje de aumento: ${pct}%`);
      steps.push(`Aumento = ${base} × ${pct} / 100 = ${formatNum(base * pct / 100)}`);
      const result = base + (base * pct / 100);
      steps.push(`Valor final = ${base} + ${formatNum(base * pct / 100)} = ${formatNum(result)}`);
      const answer = formatNum(result);
      steps.push(`Resultado: ${answer}`);
      return { problemText: raw, category: 'porcentajes', difficulty: 'medio', steps, answer, isError: false };
    }

    // Patrón principal: "P% de N" o "el P% de N" o "cuánto es P% de N"
    const directPattern = /([\d.]+)\s*%\s+de\s+([\d.]+)/i;
    const directMatch = lower.match(directPattern);
    if (directMatch) {
      const pct = parseFloat(directMatch[1]);
      const base = parseFloat(directMatch[2]);
      steps.push(`Calcular: ${pct}% de ${base}`);
      steps.push(`Fórmula: (porcentaje / 100) × base`);
      steps.push(`= (${pct} / 100) × ${base}`);
      steps.push(`= ${formatNum(pct / 100)} × ${base}`);
      const result = (pct / 100) * base;
      steps.push(`= ${formatNum(result)}`);
      const answer = formatNum(result);
      steps.push(`Resultado: ${answer}`);
      return { problemText: raw, category: 'porcentajes', difficulty: 'facil', steps, answer, isError: false };
    }

    // Patrón: "N * P%" o "N x P%"
    const multPattern = /([\d.]+)\s*[x*]\s*([\d.]+)\s*%/i;
    const multMatch = lower.match(multPattern);
    if (multMatch) {
      const base = parseFloat(multMatch[1]);
      const pct = parseFloat(multMatch[2]);
      const result = (pct / 100) * base;
      steps.push(`${pct}% de ${base} = ${formatNum(result)}`);
      const answer = formatNum(result);
      steps.push(`Resultado: ${answer}`);
      return { problemText: raw, category: 'porcentajes', difficulty: 'facil', steps, answer, isError: false };
    }

    throw new Error('Formato no reconocido');
  } catch (e) {
    return {
      problemText: raw, category: 'porcentajes', difficulty: 'facil',
      steps: [], answer: '', isError: true,
      errorMessage: `No se pudo resolver: ${(e as Error).message}. Ejemplos válidos: "15% de 200", "200 con 10% de descuento", "200 con 20% de aumento", "30 es qué % de 200"`,
    };
  }
}
