import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface Props { data: any[] }
const n = (x:any)=>{ const v = parseFloat(String(x)); return Number.isFinite(v)?v:0 }

export function ConsumerSupportKPI({ data }: Props) {
  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader><CardTitle>Consumer Support KPIs</CardTitle></CardHeader>
        <CardContent>No data available for selected filters.</CardContent>
      </Card>
    )
  }

  const waitTimes = data.map(r => n(r.Avg_Wait_Time_Min ?? r.Wait_Min ?? r['Avg Wait (min)'] ?? 0)).filter(x=>x>0)
  const avgWait = waitTimes.length ? waitTimes.reduce((a,b)=>a+b,0)/waitTimes.length : 0

  const resolutionTimes = data.map(r => n(r.Resolution_Time_Hours ?? r['Resolution (h)'] ?? 0)).filter(x=>x>0)
  const avgRes = resolutionTimes.length ? resolutionTimes.reduce((a,b)=>a+b,0)/resolutionTimes.length : 0

  const fcrYes = data.filter(r => String(r.First_Contact_Resolution ?? r.FCR ?? '').toLowerCase() === 'yes').length
  const fcrRate = data.length ? (fcrYes / data.length) * 100 : 0

  const csat = data.map(r => n(r.CSAT_Score ?? r.CSAT ?? 0)).filter(x=>x>0)
  const avgCsat = csat.length ? csat.reduce((a,b)=>a+b,0)/csat.length : 0

  const slaYes = data.filter(r => String(r.SLA_Compliance_Flag ?? r.SLA ?? '').toLowerCase() === 'yes').length
  const slaRate = data.length ? (slaYes / data.length) * 100 : 0

  const tiles = [
    { title: 'Avg Wait Time', value: `${avgWait.toFixed(1)} min`, desc: 'Lower is better', status: avgWait<=5?'good':avgWait<=10?'warning':'poor' },
    { title: 'Avg Resolution Time', value: `${avgRes.toFixed(1)} h`, desc: 'Lower is better', status: avgRes<=1?'good':avgRes<=2?'warning':'poor' },
    { title: 'First Contact Resolution', value: `${fcrRate.toFixed(1)}%`, desc: 'Higher is better', status: fcrRate>=80?'good':fcrRate>=60?'warning':'poor' },
    { title: 'CSAT Score', value: avgCsat.toFixed(1), desc: 'Higher is better', status: avgCsat>=4?'good':avgCsat>=3?'warning':'poor' },
    { title: 'SLA Compliance', value: `${slaRate.toFixed(1)}%`, desc: 'Higher is better', status: slaRate>=90?'good':slaRate>=70?'warning':'poor' },
  ]

  return (
    <Card>
      <CardHeader><CardTitle>Consumer Support KPIs</CardTitle></CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
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
