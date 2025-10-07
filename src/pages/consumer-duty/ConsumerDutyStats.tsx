
// src/pages/consumer-duty/ConsumerDutyStats.tsx
import * as React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { RequireDatasets } from '@/components/RequireDatasets'
import { readIngestionStatus, getCachedDataset } from '@/lib/ingestionGuard'
import { aliases, type AliasMap } from '@/lib/rulesEngine'

function useGate(){
  const [allowed, setAllowed] = React.useState(()=> readIngestionStatus().allLoaded)
  const [verifiedAt, setVerifiedAt] = React.useState(()=> readIngestionStatus().verifiedAt)
  React.useEffect(()=>{
    const onUpd = ()=> { const s = readIngestionStatus(); setAllowed(s.allLoaded); setVerifiedAt(s.verifiedAt) }
    window.addEventListener('ingestion-status-updated', onUpd as any)
    window.addEventListener('storage', onUpd)
    return ()=>{ window.removeEventListener('ingestion-status-updated', onUpd as any); window.removeEventListener('storage', onUpd) }
  },[])
  return { allowed, verifiedAt }
}

function getField(row: Record<string, any>, m: AliasMap, logical: string, fallbackHeaders: string[] = []): any {
  if (m[logical]){
    for (const k of m[logical]) if (row[k] !== undefined) return row[k]
  }
  for (const k of fallbackHeaders) if (row[k] !== undefined) return row[k]
  return row[logical]
}
function toNum(v: any): number { if (typeof v === 'number') return v; if (v==null) return 0; const n = parseFloat(String(v).replace(/[%£$,]/g,'').trim()); return isFinite(n)? n : 0 }
function avg(nums: number[]): number { if (!nums.length) return 0; return nums.reduce((a,b)=>a+b,0)/nums.length }

export default function ConsumerDutyStats(){
  const { allowed, verifiedAt } = useGate()
  if (!allowed) return <RequireDatasets><></></RequireDatasets>

  // cache-first
  const prod = (getCachedDataset('ProductPerformance.csv') || []) as Record<string,any>[]
  const pv   = (getCachedDataset('PriceValue.csv') || []) as Record<string,any>[]
  const cu   = (getCachedDataset('ConsumerUnderstanding.csv') || []) as Record<string,any>[]
  const cs   = (getCachedDataset('ConsumerSupport.csv') || []) as Record<string,any>[]

  // Aliases from rules engine
  const A_PS = aliases['products-services']
  const A_PV = aliases['price-value']
  const A_CU = aliases['consumer-understanding']
  const A_CS = aliases['consumer-support']

  // KPIs (robust to missing columns)
  const productsCount = prod.length
  const avgECR = avg(prod.map(r=> toNum(getField(r, A_PS, 'Early_Closure_Rate', ['Early_Closure_Rate','Early Closure Rate','EarlyClosureRate']))))
  const avgComplaints = avg(prod.map(r=> toNum(getField(r, A_PS, 'Complaint_Count', ['Complaint_Count','Complaints','Complaint Count']))))
  const avgVulnerable = avg(prod.map(r=> toNum(getField(r, A_PS, 'Vulnerable_Customer_proportion', ['Vulnerable_Customer_proportion','Vulnerable Customer proportion','Vulnerable%']))))

  const avgRate = avg(pv.map(r=> toNum(getField(r, A_PV, 'Rate', ['Rate','Interest_Rate','Interest Rate']))))
  const avgMarketRate = avg(pv.map(r=> toNum(getField(r, A_PV, 'Market_Rate', ['Market_Rate','Market Rate','Market']))))
  const avgFee = avg(pv.map(r=> toNum(getField(r, A_PV, 'Fee', ['Fee','Product_Fee','Upfront_Fee']))))
  const avgMarketFee = avg(pv.map(r=> toNum(getField(r, A_PV, 'Market_Fee', ['Market_Fee','Market Fee']))))
  const avgLagDays = avg(pv.map(r=> toNum(getField(r, A_PV, 'Rate_Change_Lag_Days', ['Rate_Change_Lag_Days','Rate Change Lag Days','Lag_Days']))))

  const commsCount = cu.length
  const avgReadability = avg(cu.map(r=> toNum(getField(r, A_CU, 'Readability_Score', ['Readability_Score','Readability Score']))))
  const miscommYes = cu.filter(r=> String(getField(r, A_CU, 'Miscommunication_Flag', ['Miscommunication_Flag','Miscommunication Flag'])).toLowerCase()==='yes').length
  const pctMiscomm = commsCount ? (miscommYes/commsCount*100) : 0

  const interCount = cs.length
  const avgWait = avg(cs.map(r=> toNum(getField(r, A_CS, 'Avg_Wait_Time_Min', ['Avg_Wait_Time_Min','Avg Wait Time Min','Wait_Min','Wait (min)','WaitMinutes']))))
  const avgCsat = avg(cs.map(r=> toNum(getField(r, A_CS, 'CSAT_Score', ['CSAT_Score','CSAT Score','CSAT']))))
  const slaNo = cs.filter(r=> String(getField(r, A_CS, 'SLA_Compliance_Flag', ['SLA_Compliance_Flag','SLA Compliance Flag','SLA'])).toLowerCase()==='no').length
  const pctSLABreach = interCount ? (slaNo/interCount*100) : 0

  const refresh = ()=> window.dispatchEvent(new Event('ingestion-status-updated'))

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <div>
          <h2 className='text-xl font-bold'>Consumer Duty Stats</h2>
          <p className='text-muted-foreground'>Key performance indicators across Products & Services, Price & Value, Consumer Understanding, and Consumer Support</p>
        </div>
        <div className='text-xs text-muted-foreground'>Verified: {verifiedAt? new Date(verifiedAt).toLocaleString() : 'Pending'}</div>
      </div>

      <div className='grid md:grid-cols-2 xl:grid-cols-4 gap-4'>
        <Card>
          <CardHeader>
            <CardTitle className='text-base'>Products & Services</CardTitle>
          </CardHeader>
          <CardContent className='space-y-2'>
            <div className='text-3xl font-semibold'>{productsCount}</div>
            <div className='text-xs text-muted-foreground'>Products</div>
            <div className='text-sm'>Avg Early Closure: <Badge variant='secondary'>{avgECR.toFixed(1)}%</Badge></div>
            <div className='text-sm'>Avg Complaints: <Badge variant='secondary'>{avgComplaints.toFixed(1)}</Badge></div>
            <div className='text-sm'>Avg Vulnerable %: <Badge variant='secondary'>{avgVulnerable.toFixed(1)}%</Badge></div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className='text-base'>Price & Value</CardTitle>
          </CardHeader>
          <CardContent className='space-y-2'>
            <div className='text-sm'>Avg Rate: <Badge variant='secondary'>{avgRate.toFixed(2)}%</Badge></div>
            <div className='text-sm'>Avg Market Rate: <Badge variant='secondary'>{avgMarketRate.toFixed(2)}%</Badge></div>
            <div className='text-sm'>Avg Fee: <Badge variant='secondary'>£{avgFee.toFixed(2)}</Badge></div>
            <div className='text-sm'>Avg Market Fee: <Badge variant='secondary'>£{avgMarketFee.toFixed(2)}</Badge></div>
            <div className='text-sm'>Avg Response Lag: <Badge variant='secondary'>{avgLagDays.toFixed(0)} days</Badge></div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className='text-base'>Consumer Understanding</CardTitle>
          </CardHeader>
          <CardContent className='space-y-2'>
            <div className='text-3xl font-semibold'>{commsCount}</div>
            <div className='text-xs text-muted-foreground'>Communications</div>
            <div className='text-sm'>Avg Readability: <Badge variant='secondary'>{avgReadability.toFixed(1)}</Badge></div>
            <div className='text-sm'>Miscommunication flagged: <Badge variant='secondary'>{pctMiscomm.toFixed(1)}%</Badge></div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className='text-base'>Consumer Support</CardTitle>
          </CardHeader>
          <CardContent className='space-y-2'>
            <div className='text-3xl font-semibold'>{interCount}</div>
            <div className='text-xs text-muted-foreground'>Support Interactions</div>
            <div className='text-sm'>Avg Wait: <Badge variant='secondary'>{avgWait.toFixed(1)} min</Badge></div>
            <div className='text-sm'>Avg CSAT: <Badge variant='secondary'>{avgCsat.toFixed(2)}</Badge></div>
            <div className='text-sm'>SLA Breach (No): <Badge variant='secondary'>{pctSLABreach.toFixed(1)}%</Badge></div>
          </CardContent>
        </Card>
      </div>

      <Alert>
        <AlertDescription>
          KPIs are computed from cached datasets. If you’ve just loaded data and still don’t see updates, click <Button size='sm' variant='outline' className='ml-1' onClick={refresh}>Refresh</Button>.
        </AlertDescription>
      </Alert>
    </div>
  )
}
