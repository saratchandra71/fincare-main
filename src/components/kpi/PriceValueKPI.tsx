import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DollarSign, Clock, TrendingUp } from "lucide-react";

interface PriceValueKPIProps {
  data: any[];
}

export function PriceValueKPI({ data }: PriceValueKPIProps) {
  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Price & Value KPIs
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No data available for selected filters.</p>
        </CardContent>
      </Card>
    );
  }

  // Calculate KPIs
  const rateLagDays = data.map(row => {
    const lag = parseInt(row.Rate_Change_Lag_Days || '0');
    return isNaN(lag) ? 0 : lag;
  }).filter(lag => lag > 0);
  
  const avgRateLagDays = rateLagDays.length > 0 
    ? rateLagDays.reduce((sum, days) => sum + days, 0) / rateLagDays.length 
    : 0;

  // Calculate BoE Base Rate Change Lag (simulated from rate change lag)
  const boeLagDays = rateLagDays.map(lag => Math.max(lag - 14, 0));
  const avgBoeLagDays = boeLagDays.length > 0 
    ? boeLagDays.reduce((sum, days) => sum + days, 0) / boeLagDays.length 
    : 0;

  const kpis = [
    {
      title: "Average Rate Change Lag",
      value: `${avgRateLagDays.toFixed(0)} days`,
      description: "Time between rate announcements and implementation",
      icon: Clock,
      status: avgRateLagDays <= 30 ? "default" : avgRateLagDays <= 60 ? "secondary" : "destructive",
    },
    {
      title: "BoE Base Rate Change Lag",
      value: `${avgBoeLagDays.toFixed(0)} days`,
      description: "Lag after Bank of England rate changes",
      icon: TrendingUp,
      status: avgBoeLagDays <= 14 ? "default" : avgBoeLagDays <= 30 ? "secondary" : "destructive",
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-5 w-5" />
          Price & Value KPIs
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {kpis.map((kpi, index) => {
            const Icon = kpi.icon;
            return (
              <div key={index} className="p-4 rounded-lg border bg-card">
                <div className="flex items-center justify-between mb-2">
                  <Icon className="h-4 w-4 text-muted-foreground" />
                  <Badge 
                    variant={kpi.status as any}
                    className={kpi.status === "default" ? "bg-green-600 text-white" : ""}
                  >
                    {kpi.status === "default" ? "good" : kpi.status === "secondary" ? "warning" : "poor"}
                  </Badge>
                </div>
                <div className="text-2xl font-bold mb-1">{kpi.value}</div>
                <p className="text-sm text-muted-foreground">{kpi.title}</p>
                <p className="text-xs text-muted-foreground mt-1">{kpi.description}</p>
              </div>
            );
          })}
        </div>
        
        <div className="mt-6">
          <h4 className="font-semibold mb-3">Product Rate Analysis</h4>
          <div className="space-y-2">
            {data.map((product, index) => (
              <div key={index} className="flex justify-between items-center p-2 rounded border">
                <div>
                  <span className="font-medium">{product.Product_Name}</span>
                  <Badge 
                    variant={product.Fair_Value_Flag === 'Yes' ? 'default' : 'destructive'} 
                    className={product.Fair_Value_Flag === 'Yes' ? 'ml-2 bg-green-600 text-white' : 'ml-2'}
                  >
                    {product.Fair_Value_Flag === 'Yes' ? 'Fair Value' : 'Review Required'}
                  </Badge>
                </div>
                <div className="flex gap-4 text-sm">
                  <span>Rate: {product.Interest_Rate}</span>
                  <span>Lag: {product.Rate_Change_Lag_Days} days</span>
                  <span>Market Δ: {product.Rate_Delta}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}