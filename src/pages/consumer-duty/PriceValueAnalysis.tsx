
import { useEffect, useMemo, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { RequireDatasets } from '@/components/RequireDatasets'
import { parseCSVFromUrl } from '@/services/csvService'
import { resolveDataUrl } from '@/services/api'
import { usePromptRules } from '@/hooks/usePromptRules'
import { formatPV } from '@/lib/promptRules'
import { evaluateRows, loadRuleSet } from '@/lib/rulesEngine'
import { analyzePriceValue } from '@/lib/priceValueEngine'
import { readIngestionStatus, getCachedDataset, setCachedDataset } from '@/lib/ingestionGuard'

export default function PriceValueAnalysis(){
  const [rows, setRows] = useState<Record<string,string>[]>([])
  const [error, setError] = useState<string|null>(null)
  const [loading, setLoading] = useState(true)
  const { pv, refresh } = usePromptRules()
  const [allowed, setAllowed] = useState(()=> readIngestionStatus().allLoaded)

  useEffect(()=>{ const onUpd=()=> setAllowed(readIngestionStatus().allLoaded); window.addEventListener('ingestion-status-updated', onUpd as any); window.addEventListener('storage', onUpd); return ()=>{ window.removeEventListener('ingestion-status-updated', onUpd as any); window.removeEventListener('storage', onUpd) } },[])

  useEffect(()=>{ if(!allowed) return; (async()=>{ try{ setLoading(true); setError(null); const cached = getCachedDataset('PriceValue.csv'); if (cached){ setRows(cached); setLoading(false); return } const data = await parseCSVFromUrl(resolveDataUrl('PriceValue.csv')); setRows(data); setCachedDataset('PriceValue.csv', data) } catch(e:any){ setError(e?.message||'Failed to load price/value dataset') } finally{ setLoading(false) } })() },[allowed])

  if (!allowed) return <RequireDatasets><></></RequireDatasets>

  const dynamicFindings = useMemo(()=> evaluateRows('price-value', rows as any[], loadRuleSet('price-value')), [rows, pv])
  const fallbackFindings = useMemo(()=> analyzePriceValue(rows as any[], pv).map(f=> ({ id: f.productId, title: f.productName, severity: f.items.some(i=>i.severity==='HIGH')?'high':'medium', messages: f.items.map(i=> ({ text: `${i.title}: ${i.detail}`, extra: i.extra })) })), [rows, pv])
  const findings = dynamicFindings && dynamicFindings.length ? dynamicFindings : fallbackFindings

  if (loading) return (<Card><CardHeader><CardTitle>Price &amp; Value</CardTitle></CardHeader><CardContent>Loading dataset…</CardContent></Card>)
  if (error) return (<Card><CardHeader><CardTitle>Price &amp; Value</CardTitle></CardHeader><CardContent className='text-red-600'>{error}</CardContent></Card>)

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <div>
          <h2 className='text-xl font-bold'>Price &amp; Value Analysis</h2>
          <p className='text-muted-foreground'>Analysis of pricing strategies and value propositions</p>
        </div>
        <Button onClick={refresh} variant='outline'>Refresh thresholds</Button>
      </div>

      <Card>
        <CardHeader>
          <div className='flex items-center justify-between'>
            <CardTitle>Consumer Duty compliance analysis for pricing fairness and value proposition</CardTitle>
            <Badge variant='secondary'>{findings.length} products flagged</Badge>
          </div>
          <div className='text-xs text-muted-foreground'>Using thresholds from Prompt Library — {formatPV(pv)}</div>
        </CardHeader>
        <CardContent className='space-y-4'>
          <Alert><AlertDescription>Rules engine: dynamic rules from Prompt Library (fallback to built-in if no rules).</AlertDescription></Alert>
          {findings.map((f)=> (
            <Card key={`${f.id}-${f.title}`} className='border'>
              <CardContent className='p-4 space-y-2'>
                <div className='text-base font-semibold'>{f.title}</div>
                <div className='text-xs text-muted-foreground'>Product ID: {f.id}</div>
                <div className='mt-2 space-y-3'>
                  {f.messages.map((m, idx)=> (
                    <div key={idx} className='space-y-1'>
                      <div className='uppercase text-xs font-semibold'>{f.severity.toUpperCase()}</div>
                      <div className='text-sm'>{m.text}</div>
                      {m.extra && <div className='text-sm text-muted-foreground'>{m.extra}</div>}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
          {findings.length===0 && <div className='text-sm text-muted-foreground'>No products breached current thresholds.</div>}
        </CardContent>
      </Card>
    </div>
  )
}
