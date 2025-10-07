
// src/lib/productsServicesEngine.ts
import type { PSRules } from './promptRules'

type Row = Record<string, any>

function get(row: Row, keys: string[]): any {
  for (const k of keys) {
    if (row[k] !== undefined) return row[k]
  }
  return undefined
}

function toNum(v: any): number {
  if (typeof v === 'number') return v
  if (v == null) return 0
  const s = String(v).replace(/%/g, '').trim()
  const n = parseFloat(s)
  return Number.isFinite(n) ? n : 0
}

export interface ProductIssue {
  productId: string
  productName: string
  severity: 'critical' | 'review'
  issues: string[]
}

export function analyzeProducts(rows: Row[], rules: PSRules): ProductIssue[] {
  const results: ProductIssue[] = []

  for (const row of rows) {
    const productId = String(
      get(row, ['Product_ID', 'Product Id', 'ProductID', 'ID']) ?? ''
    )
    const productName = String(
      get(row, ['Product_Name', 'Product Name', 'Name']) ?? 'Unknown Product'
    )

    const targetProfile = String(
      get(row, ['Target_Market_Profile', 'Target Market Profile', 'Target_Profile']) ?? ''
    )
    const actualProfile = String(
      get(row, ['Actual_Customer_Profile', 'Actual Customer Profile', 'Actual_Profile']) ?? ''
    )

    const earlyClosure = toNum(
      get(row, ['Early_Closure_Rate', 'Early Closure Rate', 'EarlyClosureRate'])
    )
    const complaints = toNum(
      get(row, ['Complaint_Count', 'Complaints', 'Complaint Count'])
    )
    const vulnerable = toNum(
      get(row, ['Vulnerable_Customer_proportion', 'Vulnerable Customer proportion', 'Vulnerable%'])
    )

    const issues: string[] = []

    // Market profile mismatch: naive string inequality (case-insensitive)
    if (
      targetProfile && actualProfile &&
      targetProfile.toLowerCase() !== actualProfile.toLowerCase()
    ) {
      issues.push(
        `Market profile mismatch: Target "${targetProfile}" vs Actual "${actualProfile}"`
      )
    }

    if (earlyClosure > rules.earlyClosureRateThreshold) {
      issues.push(
        `High early closure rate: ${earlyClosure}% (potential mis-sale or dissatisfaction)`
      )
    }

    if (complaints > rules.complaintCountThreshold) {
      issues.push(
        `High complaint count: ${complaints} complaints (customer satisfaction issue)`
      )
    }

    // Critical if vulnerable proportion above threshold and any other issue exists
    const isCritical = vulnerable > rules.vulnerableProportionThreshold && issues.length > 0
    if (isCritical) {
      issues.push(
        `Critical: High vulnerable customer proportion (${vulnerable}%) with identified issues`
      )
    }

    if (issues.length > 0) {
      results.push({
        productId: productId || '(unknown)',
        productName,
        severity: isCritical ? 'critical' : 'review',
        issues,
      })
    }
  }

  return results
}
