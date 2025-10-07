
// src/lib/consumerUnderstandingEngine.ts
import type { CURules } from './promptRules'

type Row = Record<string, any>

function get(row: Row, keys: string[]): any { for (const k of keys) if (row[k] !== undefined) return row[k]; return undefined }
function toNum(v: any): number { if (typeof v === 'number') return v; if (v == null) return 0; const n = parseFloat(String(v).replace(/%/g,'').trim()); return isFinite(n)?n:0 }

export type CUFinding = {
  communicationId: string
  productId: string
  channel: string
  readability: number
  items: { severity: 'HIGH'|'MEDIUM', code: 'compliance_review'|'readability', title: string, detail: string }[]
  theme?: string
  complaints?: number
  exampleComplaint?: string
}

export function analyzeConsumerUnderstanding(rows: Row[], rules: CURules): CUFinding[] {
  const out: CUFinding[] = []
  for (const row of rows) {
    const id = String(get(row, ['communication_ID','Communication_ID','ID']) ?? '')
    const productId = String(get(row, ['Product_ID','Product Id','ProductID','PID']) ?? '')
    const channel = String(get(row, ['Channel']) ?? 'Unknown')
    const readability = toNum(get(row, ['Readability_Score','Readability Score']))
    const mis = String(get(row, ['Miscommunication_Flag','Miscommunication Flag']) ?? 'No').toLowerCase() === 'yes'
    const reviewed = String(get(row, ['Reviewed_By_Compliance','Reviewed By Compliance']) ?? 'No').toLowerCase() === 'yes'
    const theme = String(get(row, ['Theme','Complaint_Theme']) ?? '')
    const complaints = toNum(get(row, ['Complaint_Count_Per_Theme','Complaint Count Per Theme']))
    const example = String(get(row, ['Example_Complaint','Example Complaint']) ?? '')

    const items: CUFinding['items'] = []

    if (rules.requireComplianceOnMiscomm && mis && !reviewed) {
      items.push({ severity: 'HIGH', code: 'compliance_review', title: 'compliance review', detail: 'Miscommunication occurred but communication was not reviewed by compliance' })
    }

    if (readability && readability < rules.readabilityMin) {
      items.push({ severity: 'MEDIUM', code: 'readability', title: 'readability', detail: `Low readability score indicates overly complex language for customers` })
    }

    if (items.length) out.push({ communicationId: id || '(unknown)', productId, channel, readability, items, theme: theme || undefined, complaints: complaints || undefined, exampleComplaint: example || undefined })
  }
  return out
}
