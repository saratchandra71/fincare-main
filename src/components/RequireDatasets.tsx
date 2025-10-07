
// src/components/RequireDatasets.tsx
import * as React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { readIngestionStatus, REQUIRED_DATASETS } from '@/lib/ingestionGuard'
import { Alert, AlertDescription } from '@/components/ui/alert'

export function RequireDatasets({ children }: { children: React.ReactNode }){
  const [ok, setOk] = React.useState(()=> readIngestionStatus().allLoaded)
  const [status, setStatus] = React.useState(()=> readIngestionStatus())

  React.useEffect(()=>{
    const onUpd = ()=> { const s = readIngestionStatus(); setStatus(s); setOk(s.allLoaded) }
    window.addEventListener('ingestion-status-updated', onUpd as any)
    window.addEventListener('storage', onUpd)
    return ()=> { window.removeEventListener('ingestion-status-updated', onUpd as any); window.removeEventListener('storage', onUpd) }
  }, [])

  if (ok) return <>{children}</>

  const missing = REQUIRED_DATASETS.filter(f => !status.datasets[f])
  return (
    <Card>
      <CardHeader>
        <CardTitle>Datasets not loaded</CardTitle>
      </CardHeader>
      <CardContent className='space-y-2'>
        <Alert>
          <AlertDescription>
            Analysis is disabled until all required datasets are loaded and verified. Please go to <span className='font-medium'>Consumer Duty → Datasets</span> and click <span className='font-medium'>Load datasets</span> (then <span className='font-medium'>Verify & Enable Analysis</span>).
          </AlertDescription>
        </Alert>
        <div className='text-sm'>Missing:</div>
        <ul className='list-disc pl-6 text-sm'>
          {missing.map(m => <li key={m}>{m}</li>)}
        </ul>
        <div>
          <a href='/consumer-duty/datasets'>
            <Button className='mt-2'>Go to Datasets</Button>
          </a>
        </div>
      </CardContent>
    </Card>
  )
}
