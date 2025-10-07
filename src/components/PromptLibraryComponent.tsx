
import * as React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { PromptRuleEditorDialog } from '@/components/PromptRuleEditorDialog'

function readPrompts(){ try { return JSON.parse(localStorage.getItem('prompt-library-data')||'[]') } catch { return [] } }
function writePrompts(arr:any[]){ localStorage.setItem('prompt-library-data', JSON.stringify(arr)); window.dispatchEvent(new Event('prompt-thresholds-updated')) }

const CATEGORIES = [
  'Data Ingestion Prompts',
  'Products & Services Analysis Prompts',
  'Price & Value Analysis Prompts',
  'Consumer Understanding Analysis Prompts',
  'Consumer Support Analysis Prompts',
  'Audit Report/Logs Prompts',
  'Prompt Library Management Prompts',
  'Prompt Log Management Prompts',
]

export function PromptLibraryComponent(){
  const [prompts, setPrompts] = React.useState<any[]>(readPrompts())
  const [title, setTitle] = React.useState('')
  const [category, setCategory] = React.useState('')
  const [text, setText] = React.useState('')

  const grouped = React.useMemo(()=>{
    const g: Record<string, any[]> = {}
    for (const p of prompts) {
      const c = p.category || 'Uncategorized'
      g[c] = g[c] || []
      g[c].push(p)
    }
    return g
  }, [prompts])

  const add = () => {
    if (!title || !category || !text) return
    const ts = new Date().toISOString()
    const arr = [...prompts, { id: crypto.randomUUID?.() || Math.random().toString(36).slice(2), title, category, text, lastModified: ts, lastModifiedBy: 'Current User', versions: [{ version: 1, text, timestamp: ts, user: 'Current User', reason: 'Initial' }] }]
    writePrompts(arr)
    setPrompts(arr)
    setTitle(''); setCategory(''); setText('')
  }

  return (
    <div className='space-y-4'>
      <div>
        <h2 className='text-xl font-bold'>Prompt Library</h2>
        <p className='text-muted-foreground'>Manage prompts used in the analysis workflow</p>
      </div>

      <div className='text-sm'>{prompts.length} prompts</div>

      <Card>
        <CardHeader><CardTitle>Add Prompt</CardTitle></CardHeader>
        <CardContent className='space-y-3'>
          <div className='grid md:grid-cols-3 gap-3'>
            <div>
              <label className='text-xs block mb-1'>Name</label>
              <Input value={title} onChange={e=>setTitle(e.target.value)} placeholder='Prompt name' />
            </div>
            <div>
              <label className='text-xs block mb-1'>Category</label>
              <select className='border rounded h-10 px-2 w-full' value={category} onChange={e=>setCategory(e.target.value)}>
                <option value='' disabled>Select category</option>
                {CATEGORIES.map(c=> <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className='text-xs block mb-1'>Prompt Text</label>
            <Textarea value={text} onChange={e=>setText(e.target.value)} rows={6} placeholder='Write the prompt text here…' />
          </div>
          <Button onClick={add}>Add Prompt</Button>
        </CardContent>
      </Card>

      {Object.entries(grouped).map(([cat, items])=> (
        <div key={cat} className='space-y-2'>
          <h3 className='text-sm font-semibold'>{cat} ({items.length})</h3>
          {items.map((p: any, idx: number) => {
            const absoluteIndex = prompts.findIndex(x=> x===p)
            return (
              <Card key={p.id || idx} className='border'>
                <CardContent className='p-4 space-y-2'>
                  <div className='flex items-center justify-between'>
                    <div>
                      <div className='font-medium'>{p.title}</div>
                      <div className='text-xs text-muted-foreground'>Last modified by {p.lastModifiedBy || 'Unknown'} on {new Date(p.lastModified || Date.now()).toLocaleString()}</div>
                    </div>
                    {/* INLINE EDIT FOR THIS PROMPT */}
                    <PromptRuleEditorDialog promptIndex={absoluteIndex} />
                  </div>
                  <pre className='whitespace-pre-wrap text-sm'>{p.text}</pre>
                </CardContent>
              </Card>
            )
          })}
        </div>
      ))}
    </div>
  )
}
