import type { HistoryEntry } from './types';

const KEY = 'math-app-history';
const MAX_ENTRIES = 500;

export function getHistory(): HistoryEntry[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    return JSON.parse(raw) as HistoryEntry[];
  } catch {
    return [];
  }
}

export function addEntry(entry: HistoryEntry): void {
  const existing = getHistory();
  const updated = [entry, ...existing].slice(0, MAX_ENTRIES);
  localStorage.setItem(KEY, JSON.stringify(updated));
}

export function addEntries(entries: HistoryEntry[]): void {
  if (entries.length === 0) return;
  const existing = getHistory();
  const updated = [...entries, ...existing].slice(0, MAX_ENTRIES);
  localStorage.setItem(KEY, JSON.stringify(updated));
}

export function clearHistory(): void {
  localStorage.removeItem(KEY);
}
