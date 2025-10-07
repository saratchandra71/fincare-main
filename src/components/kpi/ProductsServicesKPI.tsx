import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Users, AlertTriangle } from "lucide-react";

interface ProductsServicesKPIProps {
  data: any[];
}

export function ProductsServicesKPI({ data }: ProductsServicesKPIProps) {
  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Products & Services KPIs
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No data available for selected filters.</p>
        </CardContent>
      </Card>
    );
  }

  // Calculate KPIs
  const uptakeRates = data.map(row => parseFloat(row.Uptake_Rate?.replace('%', '') || '0'));
  const avgUptakeRate = uptakeRates.reduce((sum, rate) => sum + rate, 0) / uptakeRates.length;

  const closureRates = data.map(row => parseFloat(row.Early_Closure_Rate?.replace('%', '') || '0'));
  const avgClosureRate = closureRates.reduce((sum, rate) => sum + rate, 0) / closureRates.length;

  const complaintCounts = data.map(row => parseInt(row.Complaint_Count || '0'));
  const totalComplaints = complaintCounts.reduce((sum, count) => sum + count, 0);

  const vulnerableProportions = data.map(row => parseFloat(row.Vulnerable_Customer_proportion?.replace('%', '') || '0'));
  const avgVulnerableProportion = vulnerableProportions.reduce((sum, prop) => sum + prop, 0) / vulnerableProportions.length;

  const kpis = [
    {
      title: "Average Uptake Rate",
      value: `${avgUptakeRate.toFixed(1)}%`,
      description: "Percentage of target market adopting products",
      icon: TrendingUp,
      status: avgUptakeRate >= 50 ? "default" : avgUptakeRate >= 30 ? "secondary" : "destructive",
    },
    {
      title: "Average Early Closure Rate",
      value: `${avgClosureRate.toFixed(1)}%`,
      description: "Indicator of dissatisfaction or mis-sale",
      icon: TrendingDown,
      status: avgClosureRate <= 5 ? "default" : avgClosureRate <= 10 ? "secondary" : "destructive",
    },
    {
      title: "Total Complaint Count",
      value: totalComplaints.toString(),
      description: "Customer satisfaction metric",
      icon: AlertTriangle,
      status: totalComplaints <= 10 ? "default" : totalComplaints <= 20 ? "secondary" : "destructive",
    },
    {
      title: "Vulnerable Customer Proportion",
      value: `${avgVulnerableProportion.toFixed(1)}%`,
      description: "Average proportion of vulnerable customers",
      icon: Users,
      status: avgVulnerableProportion <= 10 ? "default" : avgVulnerableProportion <= 15 ? "secondary" : "destructive",
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Products & Services KPIs
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
          <h4 className="font-semibold mb-3">Product Breakdown</h4>
          <div className="space-y-2">
            {data.map((product, index) => (
              <div key={index} className="flex justify-between items-center p-2 rounded border">
                <div>
                  <span className="font-medium">{product.Product_Name}</span>
                  <span className="text-sm text-muted-foreground ml-2">({product.Product_Type})</span>
                </div>
                <div className="flex gap-4 text-sm">
                  <span>Uptake: {product.Uptake_Rate}</span>
                  <span>Closure: {product.Early_Closure_Rate}</span>
                  <span>Complaints: {product.Complaint_Count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}