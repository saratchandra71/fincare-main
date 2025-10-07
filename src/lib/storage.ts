
// src/lib/storage.ts
export const KEY_PROMPT_LIBRARY = 'prompt-library-data'
export const KEY_THRESHOLDS = 'prompt-thresholds-v1'

export function readJSON<T=any>(key: string, fallback: T): T {
  try { const raw = localStorage.getItem(key); return raw ? JSON.parse(raw) : fallback } catch { return fallback }
}
export function writeJSON(key: string, value: any) {
  localStorage.setItem(key, JSON.stringify(value))
}
