
const DATA_SOURCE = import.meta.env.VITE_DATA_SOURCE ?? 'static' // 'api' | 'static'
const API_BASE = import.meta.env.VITE_API_BASE ?? '/api'

export function resolveDataUrl(filename: string) {
  if (DATA_SOURCE === 'api') {
    return `${API_BASE}/data/${filename}`
  }
  return `/data/${filename}`
}
