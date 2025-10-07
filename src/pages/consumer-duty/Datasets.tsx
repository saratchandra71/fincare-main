
// src/pages/consumer-duty/Datasets.tsx
import * as React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { parseCSVFromUrl } from '@/services/csvService'
import { resolveDataUrl } from '@/services/api'
import { REQUIRED_DATASETS, markDataset, readIngestionStatus, resetIngestion, setCachedDataset, clearDatasetCache } from '@/lib/ingestionGuard'
import { useToast } from '@/hooks/use-toast'

export default function Datasets(){
  const { toast } = useToast()
  const [status, setStatus] = React.useState(()=> readIngestionStatus())
  const [loadingMap, setLoadingMap] = React.useState<Record<string, 'idle'|'loading'|'ok'|'error'>>({})
  const [busy, setBusy] = React.useState(false)

  React.useEffect(()=>{
    const onUpd = ()=> setStatus(readIngestionStatus())
    window.addEventListener('ingestion-status-updated', onUpd as any)
    window.addEventListener('storage', onUpd)
    return ()=> { window.removeEventListener('ingestion-status-updated', onUpd as any); window.removeEventListener('storage', onUpd) }
  }, [])

  const loadDatasets = async () => {
    setBusy(true)
    const next: Record<string, 'idle'|'loading'|'ok'|'error'> = {}
    try {
      for (const f of REQUIRED_DATASETS) {
        next[f] = 'loading'; setLoadingMap({...next});
        try {
          const rows = await parseCSVFromUrl(resolveDataUrl(f))
          setCachedDataset(f, rows)
          next[f] = 'ok'; setLoadingMap({...next});
        } catch (e) {
          next[f] = 'error'; setLoadingMap({...next});
        }
      }
      toast({ title: 'Load complete', description: 'Datasets fetched to local cache. You can now Verify & Enable Analysis.', variant: 'default' })
    } finally {
      setBusy(false)
    }
  }

  const verify = async () => {
    setBusy(true)
    try {
      for (const f of REQUIRED_DATASETS) {
        // mark ok if present in cache or can be parsed live
        try {
          const cached = JSON.parse(localStorage.getItem('dataset-cache-v1')||'{}')[f]
          if (Array.isArray(cached)) { markDataset(f, true); continue }
          const rows = await parseCSVFromUrl(resolveDataUrl(f))
          markDataset(f, Array.isArray(rows))
        } catch {
          markDataset(f, false)
        }
      }
      const s = readIngestionStatus()
      setStatus(s)
      if (s.allLoaded) {
        toast({ title: 'Datasets verified', description: 'All required datasets are available. Analysis enabled.', variant: 'success' })
      } else {
        toast({ title: 'Some datasets missing', description: 'See the missing list below.', variant: 'warning' })
      }
    } finally {
      setBusy(false)
    }
  }

  const clear = () => {
    resetIngestion(); clearDatasetCache(); setLoadingMap({}); setStatus(readIngestionStatus());
    toast({ title: 'Reset', description: 'Cache cleared and verification reset. Analysis disabled until datasets are loaded again.' })
  }

  const missing = REQUIRED_DATASETS.filter(f => !status.datasets[f])

  return (
    <div className='space-y-6'>
      <Card>
        <CardHeader>
          <CardTitle>Dataset Ingestion Control</CardTitle>
        </CardHeader>
        <CardContent className='space-y-3'>
          <Alert>
            <AlertDescription>
              1) Click <span className='font-medium'>Load datasets</span> to fetch all required CSVs into a local cache. 2) Then click <span className='font-medium'>Verify & Enable Analysis</span> to enable Consumer Duty analysis.
            </AlertDescription>
          </Alert>
          <div className='flex flex-wrap gap-2'>
            <Button onClick={loadDatasets} disabled={busy}>{busy? 'Working…' : 'Load datasets'}</Button>
            <Button onClick={verify} disabled={busy} variant='secondary'>Verify & Enable Analysis</Button>
            <Button variant='outline' onClick={clear}>Reset</Button>
          </div>
          <div className='text-sm'>Status: {status.allLoaded ? 'All datasets verified' : 'Pending'}</div>
          <div className='grid md:grid-cols-2 gap-2'>
            {REQUIRED_DATASETS.map(f=> (
              <div key={f} className='text-sm'>
                <span className='font-medium'>{f}</span>
                <span className='ml-2'>— {loadingMap[f]==='loading' ? 'loading…' : loadingMap[f]==='ok' ? 'loaded' : loadingMap[f]==='error' ? 'error' : (status.datasets[f] ? 'verified' : 'not loaded')}</span>
              </div>
            ))}
          </div>
          {!status.allLoaded && (
            <div>
              <div className='text-sm font-medium mb-1'>Missing datasets:</div>
              <ul className='list-disc pl-6 text-sm'>
                {missing.map(m => <li key={m}>{m}</li>)}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
