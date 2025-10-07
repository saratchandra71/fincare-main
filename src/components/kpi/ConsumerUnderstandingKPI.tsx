import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, FileCheck, AlertTriangle } from "lucide-react";

interface ConsumerUnderstandingKPIProps {
  data: any[];
}

export function ConsumerUnderstandingKPI({ data }: ConsumerUnderstandingKPIProps) {
  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Consumer Understanding KPIs
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No data available for selected filters.</p>
        </CardContent>
      </Card>
    );
  }

  // Calculate KPIs
  const readabilityScores = data.map(row => {
    const score = parseFloat(row.Readability_Score || '0');
    return isNaN(score) ? 0 : score;
  }).filter(score => score > 0);
  
  const avgReadabilityScore = readabilityScores.length > 0 
    ? readabilityScores.reduce((sum, score) => sum + score, 0) / readabilityScores.length 
    : 0;

  const totalCommunications = data.length;
  const reviewedByCompliance = data.filter(row => row.Reviewed_By_Compliance === 'Yes').length;
  const complianceReviewRate = totalCommunications > 0 
    ? (reviewedByCompliance / totalCommunications) * 100 
    : 0;

  const complaintCounts = data.map(row => {
    const count = parseInt(row.Complaint_Count_Per_Theme || '0');
    return isNaN(count) ? 0 : count;
  });
  const avgComplaintCount = complaintCounts.length > 0 
    ? complaintCounts.reduce((sum, count) => sum + count, 0) / complaintCounts.length 
    : 0;

  const kpis = [
    {
      title: "Average Readability Score",
      value: avgReadabilityScore.toFixed(1),
      description: "Higher scores indicate better readability",
      icon: MessageSquare,
      status: avgReadabilityScore >= 70 ? "default" : avgReadabilityScore >= 50 ? "secondary" : "destructive",
    },
    {
      title: "Compliance Review Rate",
      value: `${complianceReviewRate.toFixed(1)}%`,
      description: "Proportion reviewed by compliance",
      icon: FileCheck,
      status: complianceReviewRate >= 90 ? "default" : complianceReviewRate >= 70 ? "secondary" : "destructive",
    },
    {
      title: "Avg Complaint Count per Theme",
      value: avgComplaintCount.toFixed(1),
      description: "Average complaints per communication theme",
      icon: AlertTriangle,
      status: avgComplaintCount <= 2 ? "default" : avgComplaintCount <= 5 ? "secondary" : "destructive",
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Consumer Understanding KPIs
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
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
          <h4 className="font-semibold mb-3">Communication Breakdown</h4>
          <div className="space-y-2">
            {data.map((comm, index) => (
              <div key={index} className="flex justify-between items-center p-2 rounded border">
                <div>
                  <span className="font-medium">{comm.communication_ID}</span>
                  <span className="text-sm text-muted-foreground ml-2">({comm.Channel})</span>
                  {comm.Miscommunication_Flag === 'Yes' && (
                    <Badge variant="destructive" className="ml-2">Miscommunication</Badge>
                  )}
                </div>
                <div className="flex gap-4 text-sm">
                  <span>Readability: {comm.Readability_Score || 'N/A'}</span>
                  <span>Reviewed: {comm.Reviewed_By_Compliance}</span>
                  {comm.Complaint_Count_Per_Theme && comm.Complaint_Count_Per_Theme !== '0' && (
                    <span>Complaints: {comm.Complaint_Count_Per_Theme}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}