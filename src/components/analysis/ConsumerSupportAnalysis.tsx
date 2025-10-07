import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Phone, Clock, ThumbsDown, LogOut } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useData } from "@/contexts/DataContext";

interface ConsumerSupportData {
  Support_Interaction_ID: string;
  Product_ID: string;
  Channel: string;
  Avg_Wait_Time_Min: string;
  Resolution_Time_Hours: string;
  First_Contact_Resolution: string;
  CSAT_Score: string;
  Complaint_ID: string;
  Complaint_Resolution_Time: string;
  SLA_Compliance_Flag: string;
  'Exit_Ease (hours)': string;
}

interface FlaggedSupport {
  interactionId: string;
  productId: string;
  channel: string;
  issues: Array<{
    type: 'wait_resolution' | 'poor_satisfaction' | 'sla_breach' | 'exit_difficulty';
    description: string;
    metric: string;
    severity: 'high' | 'medium' | 'low';
  }>;
  complaintId?: string;
  waitTime: number;
  csatScore: number;
  exitEase?: number;
}

export function ConsumerSupportAnalysis() {
  const { allDatasetsLoaded } = useData();
  const [flaggedSupport, setFlaggedSupport] = useState<FlaggedSupport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (allDatasetsLoaded) {
      const analyzeConsumerSupport = async () => {
      try {
        const response = await fetch('/data/ConsumerSupport.csv');
        if (!response.ok) throw new Error('Failed to load ConsumerSupport data');
        
        const text = await response.text();
        const lines = text.trim().split('\n');
        const headers = lines[0].split(',');
        
        const supportData: ConsumerSupportData[] = lines.slice(1).map(line => {
          const values = line.split(',');
          return headers.reduce((obj, header, index) => {
            obj[header as keyof ConsumerSupportData] = values[index] || '';
            return obj;
          }, {} as ConsumerSupportData);
        });

        const flagged: FlaggedSupport[] = [];

        supportData.forEach(support => {
          const issues: FlaggedSupport['issues'] = [];
          
          const waitTime = parseFloat(support.Avg_Wait_Time_Min);
          const csatScore = parseFloat(support.CSAT_Score);
          const firstContactResolution = support.First_Contact_Resolution === 'Yes';
          const slaCompliance = support.SLA_Compliance_Flag === 'Yes';
          const complaintResolutionTime = parseFloat(support.Complaint_Resolution_Time);
          const exitEase = support['Exit_Ease (hours)'] !== 'N/A' ? parseFloat(support['Exit_Ease (hours)']) : undefined;

          // 1. Flag Avg_Wait_Time_Min > 5 and First_Contact_Resolution = No
          if (waitTime > 5 && !firstContactResolution) {
            issues.push({
              type: 'wait_resolution',
              description: `Long wait time (${waitTime} min) combined with failed first contact resolution`,
              metric: `Wait: ${waitTime}min, First Contact Resolution: ${support.First_Contact_Resolution}`,
              severity: 'high'
            });
          }

          // 2. Flag CSAT_Score < 3 as poor satisfaction
          if (csatScore < 3) {
            issues.push({
              type: 'poor_satisfaction',
              description: `Customer satisfaction score indicates poor service experience`,
              metric: `CSAT Score: ${csatScore}/5`,
              severity: 'high'
            });
          }

          // 3. Flag SLA_Compliance_Flag = No and Complaint_Resolution_Time > 72 hours
          if (!slaCompliance && complaintResolutionTime > 72) {
            issues.push({
              type: 'sla_breach',
              description: `SLA breach with complaint resolution taking ${complaintResolutionTime} hours`,
              metric: `Resolution Time: ${complaintResolutionTime}hrs, SLA Compliant: ${support.SLA_Compliance_Flag}`,
              severity: 'high'
            });
          }

          // 4. Flag Exit_Ease > 48 as poor ease of exit
          if (exitEase && exitEase > 48) {
            issues.push({
              type: 'exit_difficulty',
              description: `Customers experience difficulty exiting products (${exitEase} hours)`,
              metric: `Exit Time: ${exitEase} hours`,
              severity: 'medium'
            });
          }

          // Only add support interactions with issues
          if (issues.length > 0) {
            flagged.push({
              interactionId: support.Support_Interaction_ID,
              productId: support.Product_ID,
              channel: support.Channel,
              issues,
              complaintId: support.Complaint_ID !== 'N/A' ? support.Complaint_ID : undefined,
              waitTime,
              csatScore,
              exitEase
            });
          }
        });

        setFlaggedSupport(flagged);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Analysis failed');
      } finally {
        setLoading(false);
      }
      };

      analyzeConsumerSupport();
    }
  }, [allDatasetsLoaded]);

  const getIssueIcon = (type: string) => {
    switch (type) {
      case 'wait_resolution': return <Clock className="h-4 w-4" />;
      case 'poor_satisfaction': return <ThumbsDown className="h-4 w-4" />;
      case 'sla_breach': return <AlertTriangle className="h-4 w-4" />;
      case 'exit_difficulty': return <LogOut className="h-4 w-4" />;
      default: return <Phone className="h-4 w-4" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'outline';
    }
  };

  const getChannelIcon = (channel: string) => {
    switch (channel.toLowerCase()) {
      case 'phone': return '📞';
      case 'chat': return '💬';
      case 'email': return '📧';
      case 'web': return '🌐';
      default: return '📞';
    }
  };

  const getCSATColor = (score: number) => {
    if (score >= 4) return 'default';
    if (score >= 3) return 'secondary';
    return 'destructive';
  };

  if (!allDatasetsLoaded) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Consumer Support Analysis</h2>
            <p className="text-muted-foreground">
              Analysis of customer service quality and support experience issues
            </p>
          </div>
        </div>
        <Alert>
          <AlertDescription>
            Datasets are not yet loaded. Please load all required datasets to proceed with analysis.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (loading) return <div className="p-6">Loading Consumer Support analysis...</div>;
  if (error) return <div className="p-6 text-destructive">Error: {error}</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Consumer Support Analysis</h2>
          <p className="text-muted-foreground">
            Analysis of customer service quality and support experience issues
          </p>
        </div>
        <Badge variant={flaggedSupport.some(s => s.issues.some(i => i.severity === 'high')) ? 'destructive' : 'secondary'}>
          {flaggedSupport.length} interactions flagged
        </Badge>
      </div>

      {flaggedSupport.length === 0 ? (
        <Alert>
          <AlertDescription>
            No customer support issues detected. All support interactions meet expected service standards.
          </AlertDescription>
        </Alert>
      ) : (
        <div className="grid gap-6">
          {flaggedSupport.map((support) => (
            <Card key={support.interactionId} className="border-l-4 border-l-warning">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Phone className="h-5 w-5 text-warning" />
                      Support Interaction {support.interactionId}
                    </CardTitle>
                    <CardDescription className="flex items-center gap-4">
                      <span>Product: {support.productId}</span>
                      <span className="flex items-center gap-1">
                        {getChannelIcon(support.channel)} {support.channel}
                      </span>
                      {support.complaintId && (
                        <span>Complaint: {support.complaintId}</span>
                      )}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={getCSATColor(support.csatScore)}>
                      CSAT: {support.csatScore}/5
                    </Badge>
                    <Badge variant="outline">
                      Wait: {support.waitTime}min
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {support.issues.map((issue, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                    <div className="flex-shrink-0 text-warning">
                      {getIssueIcon(issue.type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant={getSeverityColor(issue.severity)}>
                          {issue.severity.toUpperCase()}
                        </Badge>
                        <span className="font-medium capitalize">
                          {issue.type.replace('_', ' ')}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {issue.description}
                      </p>
                      <p className="text-xs font-mono bg-background px-2 py-1 rounded">
                        {issue.metric}
                      </p>
                    </div>
                  </div>
                ))}

                {support.exitEase && (
                  <div className="p-3 bg-accent/20 rounded-lg">
                    <h4 className="font-medium text-sm mb-1">Exit Process</h4>
                    <p className="text-sm text-muted-foreground">
                      Customer exit process takes {support.exitEase} hours
                      {support.exitEase > 48 && " (exceeds 48-hour threshold)"}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}