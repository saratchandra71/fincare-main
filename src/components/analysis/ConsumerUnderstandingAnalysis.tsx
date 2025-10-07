import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, FileText, MessageSquare, BookOpen } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useData } from "@/contexts/DataContext";

interface ConsumerUnderstandingData {
  communication_ID: string;
  Product_ID: string;
  Channel: string;
  Readability_Score: string;
  Reviewed_By_Compliance: string;
  Customer_Quiz_Score: string;
  Complaint_Text: string;
  Miscommunication_Flag: string;
  Theme: string;
  Complaint_Count_Per_Theme: string;
}

interface FlaggedCommunication {
  communicationId: string;
  productId: string;
  channel: string;
  issues: Array<{
    type: 'compliance_review' | 'readability' | 'recurring_theme';
    description: string;
    metric: string;
    severity: 'high' | 'medium' | 'low';
  }>;
  theme?: string;
  complaintText?: string;
  readabilityScore: number;
  complaintCount: number;
}

export function ConsumerUnderstandingAnalysis() {
  const { allDatasetsLoaded } = useData();
  const [flaggedCommunications, setFlaggedCommunications] = useState<FlaggedCommunication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (allDatasetsLoaded) {
      const analyzeConsumerUnderstanding = async () => {
      try {
        const response = await fetch('/data/ConsumerUnderstanding.csv');
        if (!response.ok) throw new Error('Failed to load ConsumerUnderstanding data');
        
        const text = await response.text();
        const lines = text.trim().split('\n');
        const headers = lines[0].split(',');
        
        const communications: ConsumerUnderstandingData[] = lines.slice(1).map(line => {
          const values = line.split(',');
          return headers.reduce((obj, header, index) => {
            obj[header as keyof ConsumerUnderstandingData] = values[index] || '';
            return obj;
          }, {} as ConsumerUnderstandingData);
        });

        const flagged: FlaggedCommunication[] = [];

        communications.forEach(comm => {
          const issues: FlaggedCommunication['issues'] = [];
          
          const readabilityScore = parseFloat(comm.Readability_Score);
          const complaintCount = parseFloat(comm.Complaint_Count_Per_Theme);
          const reviewedByCompliance = comm.Reviewed_By_Compliance === 'Yes';
          const miscommunicationFlag = comm.Miscommunication_Flag === 'Yes';

          // 1. Flag if Reviewed_By_Compliance is No and Miscommunication_Flag is Yes
          if (!reviewedByCompliance && miscommunicationFlag) {
            issues.push({
              type: 'compliance_review',
              description: 'Miscommunication occurred but communication was not reviewed by compliance',
              metric: `Compliance Review: ${comm.Reviewed_By_Compliance}, Miscommunication: ${comm.Miscommunication_Flag}`,
              severity: 'high'
            });
          }

          // 2. Flag Readability_Score < 50 as complex language
          if (readabilityScore < 50) {
            issues.push({
              type: 'readability',
              description: `Low readability score indicates overly complex language for customers`,
              metric: `Readability Score: ${readabilityScore}`,
              severity: 'medium'
            });
          }

          // 3. Flag Complaint_Count_Per_Theme > 3 as recurring misunderstanding
          if (complaintCount > 3) {
            issues.push({
              type: 'recurring_theme',
              description: `High number of complaints suggests systematic communication issues`,
              metric: `Complaints for theme "${comm.Theme}": ${complaintCount}`,
              severity: 'high'
            });
          }

          // Only add communications with issues
          if (issues.length > 0) {
            flagged.push({
              communicationId: comm.communication_ID,
              productId: comm.Product_ID,
              channel: comm.Channel,
              issues,
              theme: comm.Theme || undefined,
              complaintText: comm.Complaint_Text || undefined,
              readabilityScore,
              complaintCount
            });
          }
        });

        setFlaggedCommunications(flagged);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Analysis failed');
      } finally {
        setLoading(false);
      }
      };

      analyzeConsumerUnderstanding();
    }
  }, [allDatasetsLoaded]);

  const getIssueIcon = (type: string) => {
    switch (type) {
      case 'compliance_review': return <AlertTriangle className="h-4 w-4" />;
      case 'readability': return <BookOpen className="h-4 w-4" />;
      case 'recurring_theme': return <MessageSquare className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
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
      case 'email': return '📧';
      case 'letter': return '📄';
      case 'website': return '🌐';
      case 'phone': return '📞';
      default: return '📝';
    }
  };

  if (!allDatasetsLoaded) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Consumer Understanding Analysis</h2>
            <p className="text-muted-foreground">
              Analysis of communication clarity and customer comprehension issues
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

  if (loading) return <div className="p-6">Loading Consumer Understanding analysis...</div>;
  if (error) return <div className="p-6 text-destructive">Error: {error}</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Consumer Understanding Analysis</h2>
          <p className="text-muted-foreground">
            Analysis of communication clarity and customer comprehension issues
          </p>
        </div>
        <Badge variant={flaggedCommunications.some(c => c.issues.some(i => i.severity === 'high')) ? 'destructive' : 'secondary'}>
          {flaggedCommunications.length} communications flagged
        </Badge>
      </div>

      {flaggedCommunications.length === 0 ? (
        <Alert>
          <AlertDescription>
            No communication or understanding issues detected. All communications appear to be clear and well-understood.
          </AlertDescription>
        </Alert>
      ) : (
        <div className="grid gap-6">
          {flaggedCommunications.map((comm) => (
            <Card key={comm.communicationId} className="border-l-4 border-l-warning">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5 text-warning" />
                      Communication {comm.communicationId}
                    </CardTitle>
                    <CardDescription className="flex items-center gap-4">
                      <span>Product: {comm.productId}</span>
                      <span className="flex items-center gap-1">
                        {getChannelIcon(comm.channel)} {comm.channel}
                      </span>
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">
                      Readability: {comm.readabilityScore}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {comm.issues.map((issue, index) => (
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
                
                {comm.theme && (
                  <div className="p-3 bg-accent/20 rounded-lg">
                    <h4 className="font-medium text-sm mb-2">Theme: {comm.theme}</h4>
                    <p className="text-sm text-muted-foreground">
                      {comm.complaintCount} complaints recorded for this theme
                    </p>
                  </div>
                )}

                {comm.complaintText && (
                  <div className="p-3 bg-muted/30 rounded-lg border-l-2 border-l-muted-foreground">
                    <h4 className="font-medium text-sm mb-2">Example Customer Complaint:</h4>
                    <blockquote className="text-sm italic text-muted-foreground">
                      "{comm.complaintText}"
                    </blockquote>
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