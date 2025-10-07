
// src/lib/ingestionGuard.ts
export const INGESTION_STATUS_KEY = 'ingestion-status-v1'
export const DATASET_CACHE_KEY = 'dataset-cache-v1'

export type IngestionStatus = {
  datasets: Record<string, boolean>
  allLoaded: boolean
  verifiedAt?: string
}

export const REQUIRED_DATASETS = [
  'ProductPerformance.csv',
  'PriceValue.csv',
  'ConsumerUnderstanding.csv',
  'ConsumerSupport.csv',
] as const

export function readIngestionStatus(): IngestionStatus {
  try {
    const raw = localStorage.getItem(INGESTION_STATUS_KEY)
    if (!raw) return { datasets: {}, allLoaded: false }
    const obj = JSON.parse(raw)
    return {
      datasets: obj.datasets || {},
      allLoaded: !!obj.allLoaded,
      verifiedAt: obj.verifiedAt,
    }
  } catch {
    return { datasets: {}, allLoaded: false }
  }
}

export function writeIngestionStatus(s: IngestionStatus) {
  localStorage.setItem(INGESTION_STATUS_KEY, JSON.stringify(s))
  window.dispatchEvent(new Event('ingestion-status-updated'))
}

export function markDataset(name: string, ok: boolean) {
  const st = readIngestionStatus()
  st.datasets[name] = ok
  st.allLoaded = REQUIRED_DATASETS.every(f => st.datasets[f])
  if (st.allLoaded) st.verifiedAt = new Date().toISOString()
  writeIngestionStatus(st)
}

export function resetIngestion() {
  writeIngestionStatus({ datasets: {}, allLoaded: false })
}

// ---- Cache helpers ----
function readCache(): Record<string, any[]> {
  try { return JSON.parse(localStorage.getItem(DATASET_CACHE_KEY) || '{}') } catch { return {} }
}
function writeCache(obj: Record<string, any[]>) {
  localStorage.setItem(DATASET_CACHE_KEY, JSON.stringify(obj))
}
export function setCachedDataset(name: string, rows: any[]) {
  const cache = readCache(); cache[name] = rows || []; writeCache(cache)
  markDataset(name, Array.isArray(rows))
}
export function getCachedDataset(name: string): any[] | null {
  const cache = readCache(); return cache[name] || null
}
export function clearDatasetCache() { writeCache({}) }
