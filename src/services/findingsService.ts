
// src/services/findingsService.ts
const ANALYSIS_SYNC = import.meta.env.VITE_ANALYSIS_SYNC === 'true'
const API_BASE = import.meta.env.VITE_API_BASE ?? '/api'

export type FindingPayload = {
  pillar: 'products-services'|'price-value'|'consumer-understanding'|'consumer-support'
  generatedAt: string
  rulesSummary: string
  findings: any[]
}

export async function syncFindings(payload: FindingPayload) {
  if (!ANALYSIS_SYNC) return { skipped: true }
  const res = await fetch(`${API_BASE}/analysis/findings`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
  })
  if (!res.ok) throw new Error(`Failed to sync findings: ${res.status}`)
  return await res.json().catch(() => ({ ok: true }))
}
