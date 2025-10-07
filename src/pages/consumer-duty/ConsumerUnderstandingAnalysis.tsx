
import { useEffect, useMemo, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { RequireDatasets } from '@/components/RequireDatasets'
import { parseCSVFromUrl } from '@/services/csvService'
import { resolveDataUrl } from '@/services/api'
import { usePromptRules } from '@/hooks/usePromptRules'
import { formatCU } from '@/lib/promptRules'
import { evaluateRows, loadRuleSet } from '@/lib/rulesEngine'
import { analyzeConsumerUnderstanding } from '@/lib/consumerUnderstandingEngine'
import { readIngestionStatus, getCachedDataset, setCachedDataset } from '@/lib/ingestionGuard'

function channelIcon(ch: string){ const c=(ch||'').toLowerCase(); if(c.includes('web')) return '🌐'; if(c.includes('phone')) return '📞'; if(c.includes('email')) return '✉️'; return '📄' }

export default function ConsumerUnderstandingAnalysis(){
  const [rows, setRows] = useState<Record<string,string>[]>([])
  const [error, setError] = useState<string|null>(null)
  const [loading, setLoading] = useState(true)
  const { cu, refresh } = usePromptRules()
  const [allowed, setAllowed] = useState(()=> readIngestionStatus().allLoaded)

  useEffect(()=>{ const onUpd=()=> setAllowed(readIngestionStatus().allLoaded); window.addEventListener('ingestion-status-updated', onUpd as any); window.addEventListener('storage', onUpd); return ()=>{ window.removeEventListener('ingestion-status-updated', onUpd as any); window.removeEventListener('storage', onUpd) } },[])

  useEffect(()=>{ if(!allowed) return; (async()=>{ try{ setLoading(true); setError(null); const cached = getCachedDataset('ConsumerUnderstanding.csv'); if (cached){ setRows(cached); setLoading(false); return } const data = await parseCSVFromUrl(resolveDataUrl('ConsumerUnderstanding.csv')); setRows(data); setCachedDataset('ConsumerUnderstanding.csv', data) } catch(e:any){ setError(e?.message||'Failed to load consumer understanding dataset') } finally{ setLoading(false) } })() },[allowed])

  if (!allowed) return <RequireDatasets><></></RequireDatasets>

  const dynamicFindings = useMemo(()=> evaluateRows('consumer-understanding', rows as any[], loadRuleSet('consumer-understanding')), [rows, cu])
  const fallbackFindings = useMemo(()=> analyzeConsumerUnderstanding(rows as any[], cu).map(f=> ({ id: f.communicationId, title: `Communication ${f.communicationId}`, severity: f.items.some(i=>i.severity==='HIGH')?'high':'medium', messages: f.items.map(i=> ({ text: `${i.title} — ${i.detail}` })) })), [rows, cu])
  const findings = dynamicFindings && dynamicFindings.length ? dynamicFindings : fallbackFindings

  if (loading) return (<Card><CardHeader><CardTitle>Consumer Understanding</CardTitle></CardHeader><CardContent>Loading dataset…</CardContent></Card>)
  if (error) return (<Card><CardHeader><CardTitle>Consumer Understanding</CardTitle></CardHeader><CardContent className='text-red-600'>{error}</CardContent></Card>)

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <div>
          <h2 className='text-xl font-bold'>Consumer Understanding Analysis</h2>
          <p className='text-muted-foreground'>Analysis of communication clarity and customer comprehension issues</p>
        </div>
        <Button onClick={refresh} variant='outline'>Refresh thresholds</Button>
      </div>

      <Card>
        <CardHeader>
          <div className='flex items-center justify-between'>
            <CardTitle>Consumer Understanding Analysis</CardTitle>
            <Badge variant='secondary'>{findings.length} communications flagged</Badge>
          </div>
          <div className='text-xs text-muted-foreground'>Using thresholds from Prompt Library — {formatCU(cu)}</div>
        </CardHeader>
        <CardContent className='space-y-4'>
          <Alert><AlertDescription>Rules engine: dynamic rules from Prompt Library (fallback to built-in if no rules).</AlertDescription></Alert>
          {findings.map((f)=> (
            <Card key={`${f.id}`} className='border'>
              <CardContent className='p-4 space-y-2'>
                <div className='flex items-center gap-2'>
                  <div className='text-base font-semibold'>{f.title}</div>
                </div>
                <div>
                  <span className='mr-2'>{channelIcon('')}</span>
                </div>
                <div className='mt-2 space-y-3'>
                  {f.messages.map((m, idx)=> (
                    <div key={idx} className='space-y-1'>
                      <div className='uppercase text-xs font-semibold'>{f.severity.toUpperCase()}</div>
                      <div className='text-sm'>{m.text}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
          {findings.length===0 && <div className='text-sm text-muted-foreground'>No communications breached current thresholds.</div>}
        </CardContent>
      </Card>
    </div>
  )
}
