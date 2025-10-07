
// src/lib/priceValueEngine.ts
import type { PVRules } from './promptRules'

type Row = Record<string, any>

function get(row: Row, keys: string[]): any { for (const k of keys) if (row[k] !== undefined) return row[k]; return undefined }
function toNum(v: any): number { if (typeof v === 'number') return v; if (v == null) return 0; const n = parseFloat(String(v).replace(/%|£|\$/g,'').trim()); return isFinite(n)?n:0 }

export type PVFinding = {
  productId: string
  productName: string
  items: { severity: 'HIGH'|'MEDIUM', code: 'overpriced'|'excess_fee'|'loyalty_penalty'|'slow_response', title: string, detail: string, extra?: string }[]
}

export function analyzePriceValue(rows: Row[], rules: PVRules): PVFinding[] {
  const out: PVFinding[] = []
  for (const row of rows) {
    const productId = String(get(row, ['Product_ID','Product Id','ProductID','ID']) ?? '')
    const productName = String(get(row, ['Product_Name','Product Name','Name']) ?? 'Unknown Product')

    const rate = toNum(get(row, ['Rate','Interest_Rate','Interest Rate']))
    const market = toNum(get(row, ['Market_Rate','Market Rate','Market']))
    const fee = toNum(get(row, ['Fee','Product_Fee','Upfront_Fee']))
    const marketFee = toNum(get(row, ['Market_Fee','Market Fee']))
    const legacy = toNum(get(row, ['Legacy_Rate','Legacy Rate']))
    const newer = toNum(get(row, ['New_Rate','New Rate']))
    const lagDays = toNum(get(row, ['Rate_Change_Lag_Days','Rate Change Lag Days','Lag_Days']))

    const items: PVFinding['items'] = []

    // overpriced
    const delta = +(rate - market).toFixed(2)
    if (market > 0 && delta > rules.overpricedDeltaPct) {
      items.push({
        severity: 'HIGH', code: 'overpriced', title: 'overpriced',
        detail: `Interest rate ${rate}% exceeds market average ${market}% by ${delta.toFixed(2)}%`,
        extra: `Rate: ${rate}% vs Market: ${market}%`
      })
    }

    // excessive fee
    const feeDelta = fee - marketFee
    if (marketFee >= 0 && feeDelta > rules.feeExcessAbs) {
      items.push({
        severity: 'MEDIUM', code: 'excess_fee', title: 'excessive fee',
        detail: `Fee £${fee} exceeds market average £${marketFee}`,
        extra: `Fee: £${fee} vs Market: £${marketFee}`
      })
    }

    // loyalty penalty
    const loyaltyDelta = legacy - newer
    if (legacy > 0 && newer > 0 && loyaltyDelta > rules.loyaltyPenaltyDeltaPct) {
      items.push({
        severity: 'HIGH', code: 'loyalty_penalty', title: 'loyalty penalty',
        detail: `Existing customers pay higher rate (${legacy}%) than new customers (${newer}%)`,
        extra: `Legacy: ${legacy}% vs New: ${newer}%`
      })
    }

    // slow response to base rate change
    if (lagDays > rules.responseLagDays) {
      items.push({
        severity: 'MEDIUM', code: 'slow_response', title: 'slow response',
        detail: `Rate change delayed ${lagDays} days after BoE base rate change`,
        extra: `Lag: ${lagDays} days`
      })
    }

    if (items.length) out.push({ productId: productId || '(unknown)', productName, items })
  }
  return out
}
