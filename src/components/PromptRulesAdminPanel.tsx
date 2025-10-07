
// src/components/PromptRulesAdminPanel.tsx
import * as React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { PromptRuleEditorDialog } from '@/components/PromptRuleEditorDialog'

export function PromptRulesAdminPanel(){
  const [prompts, setPrompts] = React.useState<any[]>([])
  const refresh = () => { try { setPrompts(JSON.parse(localStorage.getItem('prompt-library-data')||'[]')) } catch { setPrompts([]) } }
  React.useEffect(()=>{ refresh(); const onUpd=()=>refresh(); window.addEventListener('prompt-thresholds-updated', onUpd as any); window.addEventListener('storage', onUpd); return ()=>{ window.removeEventListener('prompt-thresholds-updated', onUpd as any); window.removeEventListener('storage', onUpd) } },[])

  const detectPillar = (cat?: string): any => {
    const c = (cat||'').toLowerCase()
    if (c.includes('products & services')) return 'products-services'
    if (c.includes('price & value')) return 'price-value'
    if (c.includes('consumer understanding')) return 'consumer-understanding'
    if (c.includes('consumer support')) return 'consumer-support'
    return null
  }

  return (
    <div className='space-y-2'>
      {prompts.map((p,idx)=>{
        const pillar = detectPillar(p.category)
        return (
          <Card key={idx} className='border'>
            <CardContent className='p-3 flex items-center justify-between'>
              <div>
                <div className='font-medium'>{p.title || '(untitled prompt)'}</div>
                <div className='text-xs text-muted-foreground'>{p.category}</div>
              </div>
              {pillar ? <PromptRuleEditorDialog pillar={pillar} /> : <div className='text-xs text-muted-foreground'>No pillar match</div>}
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
