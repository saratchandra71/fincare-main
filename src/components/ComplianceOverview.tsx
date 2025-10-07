import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, AlertTriangle, CheckCircle, TrendingUp, Users, FileText } from "lucide-react";

const complianceMetrics = [
  {
    title: "Products & Services",
    icon: Shield,
    value: "9",
    description: "Active products monitored",
    status: "primary" as const,
  },
  {
    title: "Price & Value",
    icon: AlertTriangle,
    value: "3",
    description: "Pricing alerts pending",
    status: "warning" as const,
  },
  {
    title: "Communication",
    icon: CheckCircle,
    value: "6",
    description: "Compliant communications",
    status: "success" as const,
  },
  {
    title: "Support Quality",
    icon: TrendingUp,
    value: "4.2",
    description: "Average CSAT score",
    status: "primary" as const,
  },
];

export function ComplianceOverview() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {complianceMetrics.map((metric) => {
        const Icon = metric.icon;
        return (
          <Card key={metric.title} className={`border-${metric.status}/20`}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{metric.title}</CardTitle>
              <Icon className={`h-4 w-4 text-${metric.status}`} />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold text-${metric.status}`}>{metric.value}</div>
              <p className="text-xs text-muted-foreground">{metric.description}</p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}