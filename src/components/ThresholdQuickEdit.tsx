
import * as React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { getPSRulesFromPromptLibrary, getPVRulesFromPromptLibrary, getCURulesFromPromptLibrary, getCSRRulesFromPromptLibrary } from '@/lib/promptRules'
import { KEY_PROMPT_LIBRARY, KEY_THRESHOLDS, readJSON, writeJSON } from '@/lib/storage'

function readPrompts(){ return readJSON<any[]>(KEY_PROMPT_LIBRARY, []) }
function savePrompts(arr:any[]){ writeJSON(KEY_PROMPT_LIBRARY, arr); window.dispatchEvent(new Event('prompt-thresholds-updated')) }
function readStruct(){ return readJSON(KEY_THRESHOLDS, {}) as any }
function saveStruct(obj:any){ writeJSON(KEY_THRESHOLDS, obj); window.dispatchEvent(new Event('prompt-thresholds-updated')) }

function updatePrompt(categoryIncludes: string, updater: (text: string)=>string) {
  const arr = readPrompts()
  const idx = arr.findIndex((p: any) => typeof p?.category === 'string' && p.category.toLowerCase().includes(categoryIncludes))
  if (idx === -1) return false
  const p = arr[idx]
  const newText = updater(p.text || '')
  const newVersion = (p.versions?.length || 0) + 1
  const timestamp = new Date().toISOString()
  const updated = { ...p, text: newText, lastModified: timestamp, lastModifiedBy: 'Current User', versions: [...(p.versions||[]), { version: newVersion, text: newText, timestamp, user: 'Current User', reason: 'Threshold quick edit' }] }
  arr[idx] = updated
  savePrompts(arr)
  return true
}

const NL = `
`

export function ThresholdQuickEdit(){
  const [ps, setPS] = React.useState(()=>getPSRulesFromPromptLibrary())
  const [pv, setPV] = React.useState(()=>getPVRulesFromPromptLibrary())
  const [cu, setCU] = React.useState(()=>getCURulesFromPromptLibrary())
  const [cs, setCS] = React.useState(()=>getCSRRulesFromPromptLibrary())

  const savePS = () => {
    // persist structured thresholds
    const s = readStruct(); s.ps = { earlyClosureRateThreshold: ps.earlyClosureRateThreshold, complaintCountThreshold: ps.complaintCountThreshold, vulnerableProportionThreshold: ps.vulnerableProportionThreshold }; saveStruct(s)
    // update prompt text block
    updatePrompt('products & services', (t)=>{
      const block = [ 'Thresholds:', `- Early_Closure_Rate > ${ps.earlyClosureRateThreshold}%`, `- Complaint_Count > ${ps.complaintCountThreshold}`, `- Vulnerable_Customer_proportion > ${ps.vulnerableProportionThreshold}%`, ].join(NL)
      const stripped = (t||'').replace(/Thresholds:[\s\S]*$/i, '').trim()
      return (stripped ? `${stripped}${NL}` : '') + block
    })
  }

  const savePV = () => {
    const s = readStruct(); s.pv = { overpricedDeltaPct: pv.overpricedDeltaPct, feeExcessAbs: pv.feeExcessAbs, loyaltyPenaltyDeltaPct: pv.loyaltyPenaltyDeltaPct, responseLagDays: pv.responseLagDays }; saveStruct(s)
    updatePrompt('price & value', (t)=>{
      const block = [ 'Thresholds:', `- Overpriced delta > ${pv.overpricedDeltaPct}%`, `- Excess fee > £${pv.feeExcessAbs}`, `- Loyalty penalty delta > ${pv.loyaltyPenaltyDeltaPct}%`, `- Response lag > ${pv.responseLagDays} days`, ].join(NL)
      const stripped = (t||'').replace(/Thresholds:[\s\S]*$/i, '').trim()
      return (stripped ? `${stripped}${NL}` : '') + block
    })
  }

  const saveCU = () => {
    const s = readStruct(); s.cu = { readabilityMin: cu.readabilityMin, requireComplianceOnMiscomm: cu.requireComplianceOnMiscomm }; saveStruct(s)
    updatePrompt('consumer understanding', (t)=>{
      const block = [ 'Thresholds:', `- Readability < ${cu.readabilityMin}`, `- Require compliance review on miscommunication: ${cu.requireComplianceOnMiscomm ? 'Yes' : 'No'}`, ].join(NL)
      const stripped = (t||'').replace(/Thresholds:[\s\S]*$/i, '').trim()
      return (stripped ? `${stripped}${NL}` : '') + block
    })
  }

  const saveCS = () => {
    const s = readStruct(); s.cs = { waitMinutesHigh: cs.waitMinutesHigh, csatPoorMax: cs.csatPoorMax, slaBreachHours: cs.slaBreachHours }; saveStruct(s)
    updatePrompt('consumer support', (t)=>{
      const block = [ 'Thresholds:', `- Wait > ${cs.waitMinutesHigh} min`, `- CSAT ≤ ${cs.csatPoorMax}`, `- SLA breach if resolution > ${cs.slaBreachHours} hours and SLA flag No`, ].join(NL)
      const stripped = (t||'').replace(/Thresholds:[\s\S]*$/i, '').trim()
      return (stripped ? `${stripped}${NL}` : '') + block
    })
  }

  return (
    <div className='space-y-4'>
      <Card>
        <CardHeader><CardTitle>Quick Edit: Thresholds</CardTitle></CardHeader>
        <CardContent className='grid gap-6 md:grid-cols-2'>
          <div className='space-y-2'>
            <div className='font-medium'>Products & Services</div>
            <div className='grid grid-cols-3 gap-2'>
              <div>
                <label className='text-xs block mb-1'>Early Closure %</label>
                <Input type='number' value={ps.earlyClosureRateThreshold} onChange={e=>setPS(p=>({...p, earlyClosureRateThreshold: Number(e.target.value)}))}/>
              </div>
              <div>
                <label className='text-xs block mb-1'>Complaints &gt;</label>
                <Input type='number' value={ps.complaintCountThreshold} onChange={e=>setPS(p=>({...p, complaintCountThreshold: Number(e.target.value)}))}/>
              </div>
              <div>
                <label className='text-xs block mb-1'>Vulnerable %</label>
                <Input type='number' value={ps.vulnerableProportionThreshold} onChange={e=>setPS(p=>({...p, vulnerableProportionThreshold: Number(e.target.value)}))}/>
              </div>
            </div>
            <Button onClick={savePS} size='sm'>Save P&amp;S thresholds</Button>
          </div>

          <div className='space-y-2'>
            <div className='font-medium'>Price &amp; Value</div>
            <div className='grid grid-cols-4 gap-2'>
              <div>
                <label className='text-xs block mb-1'>Overpriced Δ %</label>
                <Input type='number' value={pv.overpricedDeltaPct} onChange={e=>setPV(p=>({...p, overpricedDeltaPct: Number(e.target.value)}))}/>
              </div>
              <div>
                <label className='text-xs block mb-1'>Excess fee £</label>
                <Input type='number' value={pv.feeExcessAbs} onChange={e=>setPV(p=>({...p, feeExcessAbs: Number(e.target.value)}))}/>
              </div>
              <div>
                <label className='text-xs block mb-1'>Loyalty Δ %</label>
                <Input type='number' value={pv.loyaltyPenaltyDeltaPct} onChange={e=>setPV(p=>({...p, loyaltyPenaltyDeltaPct: Number(e.target.value)}))}/>
              </div>
              <div>
                <label className='text-xs block mb-1'>Lag days</label>
                <Input type='number' value={pv.responseLagDays} onChange={e=>setPV(p=>({...p, responseLagDays: Number(e.target.value)}))}/>
              </div>
            </div>
            <Button onClick={savePV} size='sm'>Save P&amp;V thresholds</Button>
          </div>

          <div className='space-y-2'>
            <div className='font-medium'>Consumer Understanding</div>
            <div className='grid grid-cols-3 gap-2'>
              <div>
                <label className='text-xs block mb-1'>Readability &lt;</label>
                <Input type='number' value={cu.readabilityMin} onChange={e=>setCU(p=>({...p, readabilityMin: Number(e.target.value)}))}/>
              </div>
              <div className='col-span-2'>
                <label className='text-xs block mb-1'>Require compliance review on miscommunication</label>
                <select className='border rounded h-10 px-2 w-full' value={cu.requireComplianceOnMiscomm? 'Yes':'No'} onChange={e=>setCU(p=>({...p, requireComplianceOnMiscomm: e.target.value==='Yes'}))}>
                  <option>Yes</option>
                  <option>No</option>
                </select>
              </div>
            </div>
            <Button onClick={saveCU} size='sm'>Save CU thresholds</Button>
          </div>

          <div className='space-y-2'>
            <div className='font-medium'>Consumer Support</div>
            <div className='grid grid-cols-3 gap-2'>
              <div>
                <label className='text-xs block mb-1'>Wait &gt; (min)</label>
                <Input type='number' value={cs.waitMinutesHigh} onChange={e=>setCS(p=>({...p, waitMinutesHigh: Number(e.target.value)}))}/>
              </div>
              <div>
                <label className='text-xs block mb-1'>CSAT ≤</label>
                <Input type='number' value={cs.csatPoorMax} onChange={e=>setCS(p=>({...p, csatPoorMax: Number(e.target.value)}))}/>
              </div>
              <div>
                <label className='text-xs block mb-1'>SLA breach &gt; (hrs)</label>
                <Input type='number' value={cs.slaBreachHours} onChange={e=>setCS(p=>({...p, slaBreachHours: Number(e.target.value)}))}/>
              </div>
            </div>
            <Button onClick={saveCS} size='sm'>Save CS thresholds</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
