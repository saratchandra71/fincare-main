
// src/lib/promptRules.ts
import { KEY_PROMPT_LIBRARY, KEY_THRESHOLDS, readJSON } from '@/lib/storage'

export type Source = 'prompt-library' | 'structured' | 'default'

export type PSRules = { earlyClosureRateThreshold: number; complaintCountThreshold: number; vulnerableProportionThreshold: number; source: Source }
export type PVRules = { overpricedDeltaPct: number; feeExcessAbs: number; loyaltyPenaltyDeltaPct: number; responseLagDays: number; source: Source }
export type CURules = { readabilityMin: number; requireComplianceOnMiscomm: boolean; source: Source }
export type CSRRules = { waitMinutesHigh: number; csatPoorMax: number; slaBreachHours: number; source: Source }

const DEFAULT_PS: PSRules = { earlyClosureRateThreshold: 10, complaintCountThreshold: 5, vulnerableProportionThreshold: 10, source: 'default' }
const DEFAULT_PV: PVRules = { overpricedDeltaPct: 0.3, feeExcessAbs: 50, loyaltyPenaltyDeltaPct: 0.1, responseLagDays: 90, source: 'default' }
const DEFAULT_CU: CURules = { readabilityMin: 55, requireComplianceOnMiscomm: true, source: 'default' }
const DEFAULT_CS: CSRRules = { waitMinutesHigh: 8, csatPoorMax: 2, slaBreachHours: 72, source: 'default' }

function readPrompts() { return readJSON<any[]>(KEY_PROMPT_LIBRARY, []) }
function latestByCategory(includesText: string) {
  const arr = readPrompts()
  const cands = arr.filter((p: any)=> typeof p?.category==='string' && p.category.toLowerCase().includes(includesText))
  if (!cands.length) return null
  cands.sort((a: any,b: any)=> new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime())
  return cands[0]
}
function num(s?: string | number | null) { if (s==null) return undefined; if (typeof s==='number') return s; const n=parseFloat(String(s).replace(/[%£$,]/g,'').trim()); return Number.isFinite(n)?n:undefined }

function readStructured() {
  return readJSON(KEY_THRESHOLDS, {}) as { ps?: Partial<PSRules>, pv?: Partial<PVRules>, cu?: Partial<CURules>, cs?: Partial<CSRRules> }
}

export function getPSRulesFromPromptLibrary(): PSRules {
  // 1) structured overrides
  const s = readStructured().ps
  if (s && (s.earlyClosureRateThreshold!=null || s.complaintCountThreshold!=null || s.vulnerableProportionThreshold!=null)) {
    return { ...DEFAULT_PS, ...s, source: 'structured' }
  }
  // 2) parse from prompt text
  const p = latestByCategory('products & services'); if (!p) return DEFAULT_PS
  const text: string = p.text || ''
  const early = text.match(/early[ _-]?closure[ _-]?rate[^\d]*(\d+(?:\.\d+)?)%/i)
  const comp = text.match(/complaint[ _-]?count[^\d]*(\d+)/i)
  const vuln = text.match(/vulnerable[ _-]?customer[ _-]?proportion[^\d]*(\d+(?:\.\d+)?)%/i)
  return { earlyClosureRateThreshold: num(early?.[1]) ?? DEFAULT_PS.earlyClosureRateThreshold, complaintCountThreshold: num(comp?.[1]) ?? DEFAULT_PS.complaintCountThreshold, vulnerableProportionThreshold: num(vuln?.[1]) ?? DEFAULT_PS.vulnerableProportionThreshold, source: 'prompt-library' }
}

export function getPVRulesFromPromptLibrary(): PVRules {
  const s = readStructured().pv
  if (s && (s.overpricedDeltaPct!=null || s.feeExcessAbs!=null || s.loyaltyPenaltyDeltaPct!=null || s.responseLagDays!=null)) {
    return { ...DEFAULT_PV, ...s, source: 'structured' }
  }
  const p = latestByCategory('price & value') || latestByCategory('price & value analysis'); if (!p) return DEFAULT_PV
  const text: string = p.text || ''
  const over = text.match(/exceed[s]?\s+market\s+rates?\s+by\s+more\s+than\s+(\d+(?:\.\d+)?)%/i)
  const fee  = text.match(/fee[s]?[^\d]*(\£?\$?\d+(?:\.\d+)?)/i)
  const loyalty = text.match(/legacy[^\d]*(\d+(?:\.\d+)?)%|loyalty[^\d]*(\d+(?:\.\d+)?)%/i)
  const lag = text.match(/(lag|delayed|delay|response)[^\d]*(\d+)\s*day/i)
  return { overpricedDeltaPct: num(over?.[1]) ?? DEFAULT_PV.overpricedDeltaPct, feeExcessAbs: num(fee?.[1]) ?? DEFAULT_PV.feeExcessAbs, loyaltyPenaltyDeltaPct: num(loyalty?.[1] || loyalty?.[2]) ?? DEFAULT_PV.loyaltyPenaltyDeltaPct, responseLagDays: num(lag?.[2]) ?? DEFAULT_PV.responseLagDays, source: 'prompt-library' }
}

export function getCURulesFromPromptLibrary(): CURules {
  const s = readStructured().cu
  if (s && (s.readabilityMin!=null || s.requireComplianceOnMiscomm!=null)) {
    return { ...DEFAULT_CU, ...s, source: 'structured' }
  }
  const p = latestByCategory('consumer understanding'); if (!p) return DEFAULT_CU
  const text: string = p.text || ''
  const read = text.match(/readability[^\d]*(\d+(?:\.\d+)?)/i)
  const req  = /miscommunication[\s\S]*?reviewed?\s+by\s+compliance/i.test(text) || /compliance\s+review/i.test(text)
  return { readabilityMin: num(read?.[1]) ?? DEFAULT_CU.readabilityMin, requireComplianceOnMiscomm: req || DEFAULT_CU.requireComplianceOnMiscomm, source: 'prompt-library' }
}

export function getCSRRulesFromPromptLibrary(): CSRRules {
  const s = readStructured().cs
  if (s && (s.waitMinutesHigh!=null || s.csatPoorMax!=null || s.slaBreachHours!=null)) {
    return { ...DEFAULT_CS, ...s, source: 'structured' }
  }
  const p = latestByCategory('consumer support'); if (!p) return DEFAULT_CS
  const text: string = p.text || ''
  const wait = text.match(/wait[^\d]*(\d+)\s*min/i)
  const csat = text.match(/csat[^\d]*(\d+(?:\.\d+)?)/i)
  const sla  = text.match(/resolution[^\d]*(\d+)\s*hour/i) || text.match(/sla[^\d]*(\d+)\s*hour/i)
  return { waitMinutesHigh: num(wait?.[1]) ?? DEFAULT_CS.waitMinutesHigh, csatPoorMax: num(csat?.[1]) ?? DEFAULT_CS.csatPoorMax, slaBreachHours: num(sla?.[1]) ?? DEFAULT_CS.slaBreachHours, source: 'prompt-library' }
}

export const formatPS = (r: PSRules) => `Early closure > ${r.earlyClosureRateThreshold}% · Complaints > ${r.complaintCountThreshold} · Vulnerable > ${r.vulnerableProportionThreshold}% (${r.source})`
export const formatPV = (r: PVRules) => `Overpriced Δ > ${r.overpricedDeltaPct}% · Excess fee > £${r.feeExcessAbs} · Loyalty Δ > ${r.loyaltyPenaltyDeltaPct}% · Lag > ${r.responseLagDays}d (${r.source})`
export const formatCU = (r: CURules) => `Readability < ${r.readabilityMin} · Compliance review on miscommunication: ${r.requireComplianceOnMiscomm ? 'Yes' : 'No'} (${r.source})`
export const formatCS = (r: CSRRules) => `Wait > ${r.waitMinutesHigh}m · CSAT ≤ ${r.csatPoorMax} · SLA breach > ${r.slaBreachHours}h (${r.source})`
