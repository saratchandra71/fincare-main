import { useEffect, useMemo, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

type Change = {
  id: string
  promptName: string
  category: string
  changeType: 'added' | 'edited' | 'deleted'
  newText?: string
  oldText?: string
  user: string
  timestamp: string
  reason: string
}

const CATEGORIES = [
  'Data Ingestion Prompts',
  'Outcome-based Analysis Prompts',
  'Audit Report/Logs Prompts',
  'System-Level Guardrail Prompts',
  'Custom Prompts',
]

const USERS = ['System Admin', 'Compliance Team', 'Current User', 'Sarah Johnson', 'Mike Chen']
const TYPES: Change['changeType'][] = ['added', 'edited', 'deleted']

export function PromptLogComponent() {
  const [changes, setChanges] = useState<Change[]>([])
  const [q, setQ] = useState('')
  const [cat, setCat] = useState('all')
  const [typ, setTyp] = useState('all')
  const [usr, setUsr] = useState('all')

  useEffect(() => {
    // seed sample
    const sample: Change[] = [
      {
        id: 'pc1',
        promptName: 'Data Ingestion Control',
        category: 'Data Ingestion Prompts',
        changeType: 'added',
        newText: 'Load ProductPerformance.csv, PriceValue.csv, ConsumerUnderstanding.csv, ConsumerSupport.csv',
        user: 'System Admin',
        timestamp: new Date().toISOString(),
        reason: 'Initial creation'
      },
      {
        id: 'pc2',
        promptName: 'Products & Services Analysis',
        category: 'Outcome-based Analysis Prompts',
        changeType: 'edited',
        oldText: 'Flag Early_Closure_Rate > 10%',
        newText: 'Flag Early_Closure_Rate > 8%',
        user: 'Sarah Johnson',
        timestamp: new Date(Date.now()-86400000).toISOString(),
        reason: 'Threshold adjustment'
      },
    ]
    setChanges(sample)
  }, [])

  const filtered = useMemo(() => {
    return changes
      .filter(c => (cat==='all' ? true : c.category===cat))
      .filter(c => (typ==='all' ? true : c.changeType===typ))
      .filter(c => (usr==='all' ? true : c.user===usr))
      .filter(c => {
        if (!q.trim()) return true
        const s = q.toLowerCase()
        return [c.promptName, c.category, c.user, c.reason, c.newText ?? '', c.oldText ?? '']
          .join(' ')
          .toLowerCase()
          .includes(s)
      })
      .sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
  }, [changes, q, cat, typ, usr])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Prompt Change Log</h2>
          <p className="text-muted-foreground">History of prompt additions, edits, and deletions</p>
        </div>
        <Badge variant="outline">{filtered.length} changes</Badge>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-lg">Filters</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div>
            <label className="text-sm font-medium">Search</label>
            <Input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search name, user, reason..." />
          </div>
          <div>
            <label className="text-sm font-medium">Category</label>
            <Select value={cat} onValueChange={setCat}>
              <SelectTrigger><SelectValue placeholder="All" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                {CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm font-medium">Change Type</label>
            <Select value={typ} onValueChange={setTyp}>
              <SelectTrigger><SelectValue placeholder="All" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                {TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm font-medium">User</label>
            <Select value={usr} onValueChange={setUsr}>
              <SelectTrigger><SelectValue placeholder="All" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                {USERS.map(u => <SelectItem key={u} value={u}>{u}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-3">
        {filtered.map(c => (
          <Card key={c.id} className="border-l-4 border-l-primary">
            <CardHeader>
              <CardTitle className="text-base">{new Date(c.timestamp).toLocaleString()} — {c.promptName}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="text-sm text-muted-foreground">
                <span className="mr-2">Category: <b>{c.category}</b></span>
                <span className="mr-2">Type: <Badge variant={c.changeType==='deleted'?'destructive':c.changeType==='edited'?'secondary':'default'}>{c.changeType}</Badge></span>
                <span>User: <b>{c.user}</b></span>
              </div>
              {c.oldText && (
                <div className="text-sm p-2 rounded-md border border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/20">
                  <b>Previous:</b> <span className="font-mono">{c.oldText}</span>
                </div>
              )}
              {c.newText && (
                <div className="text-sm p-2 rounded-md border border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950/20">
                  <b>New:</b> <span className="font-mono">{c.newText}</span>
                </div>
              )}
              <div className="text-sm">Reason: {c.reason}</div>
            </CardContent>
          </Card>
        ))}
        {filtered.length === 0 && (
          <Card><CardContent className="p-6 text-center text-muted-foreground">No changes match your filters.</CardContent></Card>
        )}
      </div>
    </div>
  )
}
