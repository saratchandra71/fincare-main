
// src/lib/rulesEngine.ts
import type { Pillar, Rule, RuleSet, Evaluation } from './rulesSchema'

function readJSON<T=any>(key: string, fallback: T): T { try { const raw = localStorage.getItem(key); return raw ? JSON.parse(raw) : fallback } catch { return fallback } }
const KEY_RULES = 'prompt-rules-v1'

function toNum(v: any): number { if (typeof v === 'number') return v; if (v == null) return 0; const n = parseFloat(String(v).replace(/[%£$,]/g,'').trim()); return isFinite(n)?n:0 }
function toStr(v: any): string { return v == null ? '' : String(v) }
function renderTemplate(tpl: string, row: Record<string, any>): string { return tpl.replace(/\$\{([^}]+)\}/g, (_, k)=> String(row[k] ?? '')) }
function getField(row: Record<string, any>, aliases: string[]): any { for (const k of aliases) if (row[k] !== undefined) return row[k]; return undefined }

export type AliasMap = Record<string, string[]>
export const aliases: Record<Pillar, AliasMap> = {
  'products-services': {
    Product_ID: ['Product_ID','Product Id','ProductID','ID'],
    Product_Name: ['Product_Name','Product Name','Name'],
    Target_Market_Profile: ['Target_Market_Profile','Target Market Profile','Target_Profile'],
    Actual_Customer_Profile: ['Actual_Customer_Profile','Actual Customer Profile','Actual_Profile'],
    Early_Closure_Rate: ['Early_Closure_Rate','Early Closure Rate','EarlyClosureRate'],
    Complaint_Count: ['Complaint_Count','Complaints','Complaint Count'],
    Vulnerable_Customer_proportion: ['Vulnerable_Customer_proportion','Vulnerable Customer proportion','Vulnerable%'],
  },
  'price-value': {
    Product_ID: ['Product_ID','Product Id','ProductID','ID'],
    Product_Name: ['Product_Name','Product Name','Name'],
    Rate: ['Rate','Interest_Rate','Interest Rate'],
    Market_Rate: ['Market_Rate','Market Rate','Market'],
    Fee: ['Fee','Product_Fee','Upfront_Fee'],
    Market_Fee: ['Market_Fee','Market Fee'],
    Legacy_Rate: ['Legacy_Rate','Legacy Rate'],
    New_Rate: ['New_Rate','New Rate'],
    Rate_Change_Lag_Days: ['Rate_Change_Lag_Days','Rate Change Lag Days','Lag_Days']
  },
  'consumer-understanding': {
    communication_ID: ['communication_ID','Communication_ID','ID'],
    Product_ID: ['Product_ID','Product Id','ProductID','PID'],
    Channel: ['Channel'],
    Readability_Score: ['Readability_Score','Readability Score'],
    Miscommunication_Flag: ['Miscommunication_Flag','Miscommunication Flag'],
    Reviewed_By_Compliance: ['Reviewed_By_Compliance','Reviewed By Compliance'],
    Theme: ['Theme','Complaint_Theme'],
    Complaint_Count_Per_Theme: ['Complaint_Count_Per_Theme','Complaint Count Per Theme'],
    Example_Complaint: ['Example_Complaint','Example Complaint']
  },
  'consumer-support': {
    Support_ID: ['Support_ID','Interaction_ID','Support Interaction ID','Support_Interaction_ID','Interaction Id','SupportID','Support Ref','SID','ID'],
    Product_ID: ['Product_ID','Product Id','ProductID','PID','Product'],
    Channel: ['Channel'],
    Complaint_ID: ['Complaint_ID','Complaint Id','CID','Complaint'],
    CSAT_Score: ['CSAT_Score','CSAT Score','CSAT'],
    Avg_Wait_Time_Min: ['Avg_Wait_Time_Min','Avg Wait Time Min','Wait_Min','Wait (min)','WaitMinutes'],
    First_Contact_Resolution: ['First_Contact_Resolution','First Contact Resolution','FCR'],
    SLA_Compliance_Flag: ['SLA_Compliance_Flag','SLA Compliance Flag','SLA'],
    Complaint_Resolution_Time: ['Complaint_Resolution_Time','Resolution_Time_Hours','Resolution Hours','Resolution (hrs)']
  }
}

function resolveValue(row: Record<string, any>, key: string): any {
  const allAliases: Record<string,string[]> = {}
  ;(['products-services','price-value','consumer-understanding','consumer-support'] as Pillar[]).forEach(p=>{
    Object.entries(aliases[p]).forEach(([logical, list])=> allAliases[logical]=list)
  })
  if (allAliases[key]) return getField(row, allAliases[key])
  return row[key]
}

function matchCondition(row: Record<string, any>, c: Rule['conditions'][number]): boolean {
  const left = resolveValue(row, c.left)
  switch (c.op) {
    case '>': return toNum(left) > toNum(c.right)
    case '>=': return toNum(left) >= toNum(c.right)
    case '<': return toNum(left) < toNum(c.right)
    case '<=': return toNum(left) <= toNum(c.right)
    case '==': return toStr(left) === String(c.right)
    case '!=': return toStr(left) !== String(c.right)
    case 'contains': return toStr(left).toLowerCase().includes(String(c.right).toLowerCase())
    case 'not_contains': return !toStr(left).toLowerCase().includes(String(c.right).toLowerCase())
    case 'regex': try { return new RegExp(String(c.right), 'i').test(toStr(left)) } catch { return false }
    case 'delta_gt': return (toNum(left) - toNum(resolveValue(row, c.rightField || ''))) > toNum(c.right)
    case 'delta_lt': return (toNum(left) - toNum(resolveValue(row, c.rightField || ''))) < toNum(c.right)
    case 'lag_days_gt': return toNum(left) > toNum(c.right)
    case 'is_yes': return String(left).toLowerCase() === 'yes'
    case 'is_no': return String(left).toLowerCase() !== 'yes'
    default: return false
  }
}

export function evaluateRows(pillar: Pillar, rows: Record<string, any>[], ruleSet: RuleSet | null): Evaluation[] {
  if (!ruleSet || !ruleSet.rules || ruleSet.rules.length === 0) return []
  const findings: Evaluation[] = []
  for (let idx=0; idx<rows.length; idx++) {
    const row = rows[idx]
    const messages: { text: string, extra?: string }[] = []
    let hasCritical = false
    let hasHigh = false
    let hasMedium = false
    for (const r of ruleSet.rules) {
      const results = r.conditions.map((c)=> matchCondition(row, c))
      const ok = r.all ? results.every(Boolean) : results.some(Boolean)
      if (ok) {
        messages.push({ text: renderTemplate(r.message, row), extra: r.extra ? renderTemplate(r.extra, row) : undefined })
        if (r.severity === 'CRITICAL') hasCritical = true
        else if (r.severity === 'HIGH') hasHigh = true
        else if (r.severity === 'MEDIUM') hasMedium = true
      }
    }
    if (messages.length) {
      findings.push({ id: deriveId(pillar, row, idx), title: deriveTitle(pillar, row), severity: hasCritical ? 'critical' : hasHigh ? 'high' : hasMedium ? 'medium' : 'low', messages })
    }
  }
  return findings
}

function deriveId(pillar: Pillar, row: Record<string, any>, idx: number): string {
  switch (pillar) {
    case 'products-services': return String(resolveValue(row, 'Product_ID') ?? `P${idx+1}`)
    case 'price-value': return String(resolveValue(row, 'Product_ID') ?? `P${idx+1}`)
    case 'consumer-understanding': return String(resolveValue(row, 'communication_ID') ?? `COM${idx+1}`)
    case 'consumer-support': return String(resolveValue(row, 'Support_ID') ?? `S${idx+1}`)
  }
}
function deriveTitle(pillar: Pillar, row: Record<string, any>): string {
  switch (pillar) {
    case 'products-services': return String(resolveValue(row, 'Product_Name') ?? 'Unknown Product')
    case 'price-value': return String(resolveValue(row, 'Product_Name') ?? 'Unknown Product')
    case 'consumer-understanding': return `Communication ${resolveValue(row, 'communication_ID') ?? ''}`.trim()
    case 'consumer-support': return `Support Interaction ${resolveValue(row, 'Support_ID') ?? ''}`.trim()
  }
}
export function loadRuleSet(pillar: Pillar): RuleSet | null {
  const structured = readJSON<Record<string, RuleSet>>(KEY_RULES, {})
  if (structured && structured[pillar]) return structured[pillar]
  const lib = readJSON<any[]>('prompt-library-data', [])
  const cat = pillar === 'products-services' ? 'products & services' : pillar === 'price-value' ? 'price & value' : pillar === 'consumer-understanding' ? 'consumer understanding' : 'consumer support'
  const p = lib.find(x=> typeof x?.category==='string' && x.category.toLowerCase().includes(cat))
  if (p && Array.isArray(p.rules)) return { pillar, rules: p.rules as Rule[] }
  return null
}

