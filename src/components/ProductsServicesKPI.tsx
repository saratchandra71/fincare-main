import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface Props { data: any[] }

function pct(val: number) { return `${val.toFixed(1)}%` }
function numPct(s: any) {
  if (s == null) return 0
  const n = parseFloat(String(s).replace('%',''))
  return Number.isFinite(n) ? n : 0
}
function numInt(s: any) {
  const n = parseInt(String(s))
  return Number.isFinite(n) ? n : 0
}

export function ProductsServicesKPI({ data }: Props) {
  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader><CardTitle>Products & Services KPIs</CardTitle></CardHeader>
        <CardContent>No data available for selected filters.</CardContent>
      </Card>
    )
  }

  const uptake = data.map(r => numPct(r.Uptake_Rate ?? r.Uptake ?? r['Uptake Rate']))
  const closure = data.map(r => numPct(r.Early_Closure_Rate ?? r['Early Closure Rate']))
  const complaints = data.map(r => numInt(r.Complaint_Count ?? r['Complaint Count'] ?? 0))
  const vulnerable = data.map(r => numPct(r.Vulnerable_Customer_proportion ?? r['Vulnerable %'] ?? 0))

  const avgUptake = uptake.length ? uptake.reduce((a,b)=>a+b,0)/uptake.length : 0
  const avgClosure = closure.length ? closure.reduce((a,b)=>a+b,0)/closure.length : 0
  const totalComplaints = complaints.reduce((a,b)=>a+b,0)
  const avgVuln = vulnerable.length ? vulnerable.reduce((a,b)=>a+b,0)/vulnerable.length : 0

  const tiles = [
    { title: 'Average Uptake Rate', value: pct(avgUptake), desc: 'Target market adoption', status: avgUptake>=50?'good':avgUptake>=30?'warning':'poor'},
    { title: 'Average Early Closure', value: pct(avgClosure), desc: 'Lower is better', status: avgClosure<=5?'good':avgClosure<=10?'warning':'poor'},
    { title: 'Total Complaints', value: String(totalComplaints), desc: 'Customer satisfaction', status: totalComplaints<=10?'good':totalComplaints<=20?'warning':'poor'},
    { title: 'Vulnerable Customer %', value: pct(avgVuln), desc: 'Lower is better', status: avgVuln<=10?'good':avgVuln<=15?'warning':'poor'},
  ]

  return (
    <Card>
      <CardHeader><CardTitle>Products & Services KPIs</CardTitle></CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {tiles.map((t,i)=>(
            <div key={i} className="rounded-lg border p-4">
              <Badge variant={t.status==='good'?'default':t.status==='warning'?'secondary':'destructive'}>{t.status}</Badge>
              <div className="mt-2 text-2xl font-bold">{t.value}</div>
              <div className="text-sm font-medium">{t.title}</div>
              <div className="text-sm text-muted-foreground">{t.desc}</div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
