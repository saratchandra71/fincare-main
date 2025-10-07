import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { HeartHandshake, Clock, CheckCircle, Star, AlertTriangle } from "lucide-react";

interface ConsumerSupportKPIProps {
  data: any[];
}

export function ConsumerSupportKPI({ data }: ConsumerSupportKPIProps) {
  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HeartHandshake className="h-5 w-5" />
            Consumer Support KPIs
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No data available for selected filters.</p>
        </CardContent>
      </Card>
    );
  }

  // Calculate KPIs
  const waitTimes = data.map(row => parseFloat(row.Avg_Wait_Time_Min || '0')).filter(time => time > 0);
  const avgWaitTime = waitTimes.length > 0 ? waitTimes.reduce((sum, time) => sum + time, 0) / waitTimes.length : 0;

  const resolutionTimes = data.map(row => parseFloat(row.Resolution_Time_Hours || '0')).filter(time => time > 0);
  const avgResolutionTime = resolutionTimes.length > 0 ? resolutionTimes.reduce((sum, time) => sum + time, 0) / resolutionTimes.length : 0;
  const maxResolutionTime = resolutionTimes.length > 0 ? Math.max(...resolutionTimes) : 0;
  const minResolutionTime = resolutionTimes.length > 0 ? Math.min(...resolutionTimes) : 0;

  const firstContactResolutions = data.filter(row => row.First_Contact_Resolution === 'Yes').length;
  const firstContactRate = data.length > 0 ? (firstContactResolutions / data.length) * 100 : 0;

  const csatScores = data.map(row => parseFloat(row.CSAT_Score || '0')).filter(score => score > 0);
  const avgCSATScore = csatScores.length > 0 ? csatScores.reduce((sum, score) => sum + score, 0) / csatScores.length : 0;

  const slaCompliant = data.filter(row => row.SLA_Compliance_Flag === 'Yes').length;
  const slaComplianceRate = data.length > 0 ? (slaCompliant / data.length) * 100 : 0;

  const complaintResolutionTimes = data.map(row => parseFloat(row.Complaint_Resolution_Time || '0')).filter(time => time > 0);
  const avgComplaintResolutionTime = complaintResolutionTimes.length > 0 
    ? complaintResolutionTimes.reduce((sum, time) => sum + time, 0) / complaintResolutionTimes.length : 0;
  const maxComplaintResolutionTime = complaintResolutionTimes.length > 0 ? Math.max(...complaintResolutionTimes) : 0;
  const minComplaintResolutionTime = complaintResolutionTimes.length > 0 ? Math.min(...complaintResolutionTimes) : 0;

  const exitEaseTimes = data.map(row => parseFloat(row['Exit_Ease (hours)'] || '0')).filter(time => time > 0);
  const avgExitEase = exitEaseTimes.length > 0 ? exitEaseTimes.reduce((sum, time) => sum + time, 0) / exitEaseTimes.length : 0;

  const kpis = [
    {
      title: "Average Wait Time",
      value: `${avgWaitTime.toFixed(1)} min`,
      description: "Average customer wait time across channels",
      icon: Clock,
      status: avgWaitTime <= 5 ? "default" : avgWaitTime <= 10 ? "secondary" : "destructive",
    },
    {
      title: "Resolution Time",
      value: `${avgResolutionTime.toFixed(1)}h`,
      description: `Avg: ${avgResolutionTime.toFixed(1)}h, Max: ${maxResolutionTime}h, Min: ${minResolutionTime}h`,
      icon: CheckCircle,
      status: avgResolutionTime <= 1 ? "default" : avgResolutionTime <= 2 ? "secondary" : "destructive",
    },
    {
      title: "First Contact Resolution",
      value: `${firstContactRate.toFixed(1)}%`,
      description: "Proportion resolved on first contact",
      icon: CheckCircle,
      status: firstContactRate >= 80 ? "default" : firstContactRate >= 60 ? "secondary" : "destructive",
    },
    {
      title: "CSAT Score",
      value: avgCSATScore.toFixed(1),
      description: "Average customer satisfaction score",
      icon: Star,
      status: avgCSATScore >= 4 ? "default" : avgCSATScore >= 3 ? "secondary" : "destructive",
    },
    {
      title: "SLA Compliance",
      value: `${slaComplianceRate.toFixed(1)}%`,
      description: "Proportion meeting SLA requirements",
      icon: CheckCircle,
      status: slaComplianceRate >= 90 ? "default" : slaComplianceRate >= 70 ? "secondary" : "destructive",
    },
    {
      title: "Complaint Resolution Time",
      value: `${avgComplaintResolutionTime.toFixed(0)}h`,
      description: `Avg: ${avgComplaintResolutionTime.toFixed(0)}h, Max: ${maxComplaintResolutionTime}h, Min: ${minComplaintResolutionTime}h`,
      icon: AlertTriangle,
      status: avgComplaintResolutionTime <= 48 ? "default" : avgComplaintResolutionTime <= 96 ? "secondary" : "destructive",
    },
    {
      title: "Exit Ease",
      value: `${avgExitEase.toFixed(1)}h`,
      description: "Average time to process exits",
      icon: Clock,
      status: avgExitEase <= 24 ? "default" : avgExitEase <= 48 ? "secondary" : "destructive",
    }
  ];

  // Group by channel for breakdown
  const channelBreakdown = data.reduce((acc: any, row) => {
    const channel = row.Channel || 'Unknown';
    if (!acc[channel]) {
      acc[channel] = [];
    }
    acc[channel].push(row);
    return acc;
  }, {});

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <HeartHandshake className="h-5 w-5" />
          Consumer Support KPIs
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
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
          <h4 className="font-semibold mb-3">Channel Breakdown</h4>
          <div className="space-y-4">
            {Object.entries(channelBreakdown).map(([channel, interactions]: [string, any]) => {
              const channelWaitTime = interactions.reduce((sum: number, int: any) => sum + parseFloat(int.Avg_Wait_Time_Min || '0'), 0) / interactions.length;
              const channelCSAT = interactions.reduce((sum: number, int: any) => sum + parseFloat(int.CSAT_Score || '0'), 0) / interactions.length;
              const channelFCR = (interactions.filter((int: any) => int.First_Contact_Resolution === 'Yes').length / interactions.length) * 100;
              
              return (
                <div key={channel} className="p-3 rounded border bg-card">
                  <div className="flex justify-between items-center mb-2">
                    <h5 className="font-medium">{channel}</h5>
                    <Badge variant="outline">{interactions.length} interactions</Badge>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>Wait Time: {channelWaitTime.toFixed(1)} min</div>
                    <div>CSAT: {channelCSAT.toFixed(1)}</div>
                    <div>FCR: {channelFCR.toFixed(1)}%</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}