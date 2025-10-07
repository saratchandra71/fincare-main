import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface Props { data: any[] }

function num(val: any) {
  if (val == null) return 0
  const s = String(val).replace('%','').trim()
  const n = parseFloat(s)
  return Number.isFinite(n) ? n : 0
}

export function PriceValueKPI({ data }: Props) {
  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader><CardTitle>Price & Value KPIs</CardTitle></CardHeader>
        <CardContent>No data available for selected filters.</CardContent>
      </Card>
    )
  }

  // Heuristic columns (works with varied headings)
  const priceVsMarket = data.map(r => num(r.Price_vs_Market ?? r['Price_vs_Market(%)'] ?? r['Price_vs_Market %']))
  const valueScores   = data.map(r => num(r.Value_Score ?? r['ValueScore'] ?? r['Value Score']))
  const complaintCnt  = data.map(r => parseInt(String(r.Pricing_Complaints ?? r.Complaint_Count ?? 0))).filter(x => Number.isFinite(x))

  const avgDelta = priceVsMarket.length ? priceVsMarket.reduce((a,b)=>a+b,0)/priceVsMarket.length : 0
  const avgValue = valueScores.length ? valueScores.reduce((a,b)=>a+b,0)/valueScores.length : 0
  const totalComplaints = complaintCnt.reduce((a,b)=>a+b,0)

  const tiles = [
    {
      title: 'Avg Price vs Market',
      value: `${avgDelta.toFixed(1)}%`,
      desc: 'Positive = above market, negative = below',
      status: Math.abs(avgDelta) <= 10 ? 'good' : Math.abs(avgDelta) <= 15 ? 'warning' : 'poor',
    },
    {
      title: 'Avg Value Score',
      value: avgValue.toFixed(1),
      desc: 'Higher is better (0–5 or 0–10 scale)',
      status: avgValue >= 4 ? 'good' : avgValue >= 3 ? 'warning' : 'poor',
    },
    {
      title: 'Pricing Complaints',
      value: String(totalComplaints),
      desc: 'Total pricing-related complaints',
      status: totalComplaints <= 10 ? 'good' : totalComplaints <= 20 ? 'warning' : 'poor',
    },
  ]

  return (
    <Card>
      <CardHeader><CardTitle>Price & Value KPIs</CardTitle></CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {tiles.map((t,i)=>(
            <div key={i} className="rounded-lg border p-4">
              <Badge variant={t.status === 'good' ? 'default' : t.status === 'warning' ? 'secondary' : 'destructive'}>
                {t.status}
              </Badge>
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
