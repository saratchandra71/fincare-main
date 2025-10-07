
import * as React from 'react'
import { ThresholdQuickEdit } from '@/components/ThresholdQuickEdit'
import { PromptLibraryComponent } from '@/components/PromptLibraryComponent'

export default function PromptLibrary(){
  const [refreshKey, setRefreshKey] = React.useState(0)
  React.useEffect(()=>{
    const onUpd = ()=> setRefreshKey(k=>k+1)
    window.addEventListener('prompt-thresholds-updated', onUpd as any)
    window.addEventListener('storage', onUpd)
    return ()=>{ window.removeEventListener('prompt-thresholds-updated', onUpd as any); window.removeEventListener('storage', onUpd) }
  },[])
  return (
    <div className='space-y-6'>
      <ThresholdQuickEdit />
      <div key={refreshKey}>
        <PromptLibraryComponent />
      </div>
    </div>
  )
}
