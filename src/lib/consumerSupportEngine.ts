
// src/lib/consumerSupportEngine.ts
import type { CSRRules } from './promptRules'

type Row = Record<string, any>
function get(row: Row, keys: string[]): any { for (const k of keys) if (row[k] !== undefined) return row[k]; return undefined }
function toNum(v: any): number { if (typeof v === 'number') return v; if (v == null) return 0; const n = parseFloat(String(v).replace(/h|hrs|min|m/g,'').trim()); return isFinite(n)?n:0 }

export type CSFinding = { interactionId: string; productId: string; channel: string; complaintId?: string; csat: number; waitMin: number; items: { severity: 'HIGH'|'MEDIUM', code: 'wait_resolution'|'poor_satisfaction'|'sla_breach', title: string, detail: string, extra?: string }[] }

export function analyzeConsumerSupport(rows: Row[], rules: CSRRules): CSFinding[] {
  const out: CSFinding[] = []
  for (let idx=0; idx<rows.length; idx++) {
    const row = rows[idx]
    const idRaw = get(row, [
      'Support_ID','Interaction_ID','Support Interaction ID','Support_Interaction_ID','Interaction Id','SupportID','Support Ref','SID','ID'
    ])
    const interactionId = String(idRaw ?? `S${idx+1}`)
    const productId = String(get(row, ['Product_ID','Product Id','ProductID','PID','Product']) ?? '') || '(unknown)'
    const channel = String(get(row, ['Channel']) ?? 'Unknown')
    const complaintId = String(get(row, ['Complaint_ID','Complaint Id','CID','Complaint']) ?? '') || undefined
    const csat = toNum(get(row, ['CSAT_Score','CSAT Score','CSAT']))
    const wait = toNum(get(row, ['Avg_Wait_Time_Min','Avg Wait Time Min','Wait_Min','Wait (min)','WaitMinutes']))
    const fcr = String(get(row, ['First_Contact_Resolution','First Contact Resolution','FCR']) ?? 'No').toLowerCase() === 'yes'
    const slaFlag = String(get(row, ['SLA_Compliance_Flag','SLA Compliance Flag','SLA']) ?? 'Yes').toLowerCase() === 'yes'
    const resolutionH = toNum(get(row, ['Complaint_Resolution_Time','Resolution_Time_Hours','Resolution Hours','Resolution (hrs)']))

    const items: CSFinding['items'] = []
    if (wait > rules.waitMinutesHigh && !fcr) {
      items.push({ severity: 'HIGH', code: 'wait_resolution', title: 'wait resolution', detail: `Long wait time (${wait} min) combined with failed first contact resolution`, extra: `Wait: ${wait}min, First Contact Resolution: No` })
    }
    if (csat && csat <= rules.csatPoorMax) {
      items.push({ severity: 'HIGH', code: 'poor_satisfaction', title: 'poor satisfaction', detail: 'Customer satisfaction score indicates poor service experience', extra: `CSAT Score: ${csat}/5` })
    }
    if (resolutionH > rules.slaBreachHours && !slaFlag) {
      items.push({ severity: 'HIGH', code: 'sla_breach', title: 'sla breach', detail: `SLA breach with complaint resolution taking ${resolutionH} hours`, extra: `Resolution Time: ${resolutionH}hrs, SLA Compliant: No` })
    }

    if (items.length) out.push({ interactionId, productId, channel, complaintId, csat, waitMin: wait, items })
  }
  return out
}
