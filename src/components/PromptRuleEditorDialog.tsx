
import * as React from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import type { Rule, RuleSet } from '@/lib/rulesSchema'
import { pillarForCategory, type Pillar } from '@/lib/pillars'

function uid() { return Math.random().toString(36).slice(2,9) }
const OPERATORS = ['>','>=','<','<=','==','!=','contains','not_contains','regex','delta_gt','delta_lt','lag_days_gt','is_yes','is_no'] as const

function readPrompts(): any[] { try { return JSON.parse(localStorage.getItem('prompt-library-data') || '[]') } catch { return [] } }
function writePrompts(arr: any[]) { localStorage.setItem('prompt-library-data', JSON.stringify(arr)); window.dispatchEvent(new Event('prompt-thresholds-updated')) }
function readRuleSet(p: Pillar): RuleSet | null { try { const m = JSON.parse(localStorage.getItem('prompt-rules-v1') || '{}'); return p? (m?.[p] ?? null) : null } catch { return null } }
function writeRuleSet(p: Pillar, rs: RuleSet) { const m = JSON.parse(localStorage.getItem('prompt-rules-v1') || '{}'); if(p){ m[p] = rs; localStorage.setItem('prompt-rules-v1', JSON.stringify(m)) } }

export function PromptRuleEditorDialog({ promptIndex }: { promptIndex: number }) {
  const [open, setOpen] = React.useState(false)
  const prompts = React.useMemo(()=> readPrompts(), [])
  const prompt = prompts[promptIndex]
  const pillar = pillarForCategory(prompt?.category)

  const initialRules: Rule[] = React.useMemo(()=> {
    if (Array.isArray(prompt?.rules)) return prompt.rules as Rule[]
    const rs = readRuleSet(pillar)
    return rs?.rules ?? []
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [promptIndex, open])

  const [rules, setRules] = React.useState<Rule[]>(initialRules)
  React.useEffect(()=> { setRules(initialRules) }, [initialRules])

  if (pillar == null) return null

  const addRule = () => setRules(r => [...r, { id: uid(), code: 'rule_'+(r.length+1), name: '', severity: 'MEDIUM', all: false, conditions: [{ left: '', op: '>' as any, right: 0 }], message: '' }])
  const removeRule = (id: string) => setRules(r => r.filter(x => x.id !== id))

  const save = () => {
    const rs: RuleSet = { pillar, rules }
    writeRuleSet(pillar, rs)
    const arr = readPrompts()
    const p = arr[promptIndex]
    if (p) {
      const ts = new Date().toISOString()
      arr[promptIndex] = { ...p, rules, lastModified: ts, versions: [...(p.versions||[]), { version: (p.versions?.length||0)+1, text: p.text, timestamp: ts, user: 'Current User', reason: 'Rules updated' }] }
      writePrompts(arr)
    }
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant='outline' size='sm'>Edit</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Rules – {prompt?.title || '(untitled)'} ({prompt?.category})</DialogTitle>
        </DialogHeader>
        <div className='space-y-3'>
          {rules.map((r) => (
            <Card key={r.id}>
              <CardContent className='p-3 space-y-2'>
                <div className='flex items-center gap-2'>
                  <Input placeholder='Rule name' value={r.name} onChange={e=> setRules(x=> x.map(y=> y.id===r.id? { ...y, name: e.target.value }: y))} />
                  <Input placeholder='Code' className='w-40' value={r.code} onChange={e=> setRules(x=> x.map(y=> y.id===r.id? { ...y, code: e.target.value }: y))} />
                  <select className='border rounded h-10 px-2' value={r.severity} onChange={e=> setRules(x=> x.map(y=> y.id===r.id? { ...y, severity: e.target.value as any }: y))}>
                    <option>LOW</option><option>MEDIUM</option><option>HIGH</option><option>CRITICAL</option>
                  </select>
                  <label className='text-xs ml-2'>ALL conditions
                    <input type='checkbox' className='ml-1' checked={!!r.all} onChange={e=> setRules(x=> x.map(y=> y.id===r.id? { ...y, all: e.target.checked }: y))} />
                  </label>
                  <Button variant='destructive' size='sm' className='ml-auto' onClick={()=>removeRule(r.id)}>Delete</Button>
                </div>
                <div className='space-y-2'>
                  {r.conditions.map((c, ci) => (
                    <div key={ci} className='grid grid-cols-4 gap-2'>
                      <Input placeholder='Left field (e.g., Complaint_Count)' value={c.left} onChange={e=> setRules(x=> x.map(y=> y.id===r.id? { ...y, conditions: y.conditions.map((z,zi)=> zi===ci? { ...z, left: e.target.value }: z) }: y))} />
                      <select className='border rounded h-10 px-2' value={c.op} onChange={e=> setRules(x=> x.map(y=> y.id===r.id? { ...y, conditions: y.conditions.map((z,zi)=> zi===ci? { ...z, op: e.target.value as any }: z) }: y))}>
                        {'>'} <option>{'>'}</option><option>{'>='}</option><option>{'<'}</option><option>{'<='}</option><option>==</option><option>!=</option><option>contains</option><option>not_contains</option><option>regex</option><option>delta_gt</option><option>delta_lt</option><option>lag_days_gt</option><option>is_yes</option><option>is_no</option>
                      </select>
                      <Input placeholder='Right value (number/text/regex)' value={String(c.right ?? '')} onChange={e=> setRules(x=> x.map(y=> y.id===r.id? { ...y, conditions: y.conditions.map((z,zi)=> zi===ci? { ...z, right: e.target.value }: z) }: y))} />
                      <Input placeholder='Right field (for delta ops)' value={String(c.rightField ?? '')} onChange={e=> setRules(x=> x.map(y=> y.id===r.id? { ...y, conditions: y.conditions.map((z,zi)=> zi===ci? { ...z, rightField: e.target.value }: z) }: y))} />
                    </div>
                  ))}
                  <Button size='sm' variant='outline' onClick={()=> setRules(x=> x.map(y=> y.id===r.id? { ...y, conditions: [...y.conditions, { left: '', op: '>' as any, right: 0 }] }: y))}>+ Condition</Button>
                </div>
                <div className='grid grid-cols-2 gap-2'>
                  <Input placeholder='Message template (e.g., High complaints: ${Complaint_Count})' value={r.message} onChange={e=> setRules(x=> x.map(y=> y.id===r.id? { ...y, message: e.target.value }: y))} />
                  <Input placeholder='Extra details template (optional)' value={r.extra ?? ''} onChange={e=> setRules(x=> x.map(y=> y.id===r.id? { ...y, extra: e.target.value }: y))} />
                </div>
              </CardContent>
            </Card>
          ))}
          <div className='flex gap-2'>
            <Button onClick={addRule} variant='outline'>+ Rule</Button>
            <Button onClick={save}>Save</Button>
            <Button variant='ghost' onClick={()=> setOpen(false)}>Close</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
