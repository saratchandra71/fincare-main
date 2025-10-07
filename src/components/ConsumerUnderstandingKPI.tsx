import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, FileCheck, AlertTriangle } from "lucide-react";

type Row = Record<string, string | number | null | undefined>;

interface ConsumerUnderstandingKPIProps {
  data: Row[];
}

function toNum(v: any): number {
  if (typeof v === "number") return v;
  if (typeof v === "string") {
    const s = v.trim().replace(/%/g, "");
    const n = parseFloat(s);
    return isNaN(n) ? 0 : n;
  }
  return 0;
}

function get(row: Row, keys: string[]) {
  for (const k of keys) {
    if (row[k] !== undefined) return row[k];
  }
  return undefined;
}

export function ConsumerUnderstandingKPI({ data }: ConsumerUnderstandingKPIProps) {
  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Consumer Understanding KPIs</CardTitle>
        </CardHeader>
        <CardContent>No data available for selected filters.</CardContent>
      </Card>
    );
  }

  const readabilityScores = data
    .map((row) => toNum(get(row, ["Readability_Score", "Readability Score"])))
    .filter((n) => n > 0);

  const avgReadability =
    readabilityScores.length > 0
      ? readabilityScores.reduce((s, n) => s + n, 0) / readabilityScores.length
      : 0;

  const totalComms = data.length;
  const reviewedByCompliance = data.filter(
    (row) => String(get(row, ["Reviewed_By_Compliance", "Reviewed By Compliance"])).toLowerCase() === "yes"
  ).length;
  const complianceReviewRate = totalComms ? (reviewedByCompliance / totalComms) * 100 : 0;

  const complaintCounts = data.map((row) =>
    toNum(get(row, ["Complaint_Count_Per_Theme", "Complaint Count Per Theme", "Complaints"]))
  );
  const avgComplaints =
    complaintCounts.length > 0 ? complaintCounts.reduce((s, n) => s + n, 0) / complaintCounts.length : 0;

  const kpis = [
    {
      title: "Average Readability Score",
      value: avgReadability.toFixed(1),
      description: "Higher scores indicate better readability",
      icon: MessageSquare,
      status: avgReadability >= 70 ? "good" : avgReadability >= 50 ? "warning" : "poor",
    },
    {
      title: "Compliance Review Rate",
      value: `${complianceReviewRate.toFixed(1)}%`,
      description: "Proportion reviewed by compliance",
      icon: FileCheck,
      status: complianceReviewRate >= 90 ? "good" : complianceReviewRate >= 70 ? "warning" : "poor",
    },
    {
      title: "Avg Complaint Count per Theme",
      value: avgComplaints.toFixed(1),
      description: "Average complaints per communication theme",
      icon: AlertTriangle,
      status: avgComplaints <= 2 ? "good" : avgComplaints <= 5 ? "warning" : "poor",
    },
  ] as const;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Consumer Understanding KPIs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {kpis.map((kpi) => {
              const Icon = kpi.icon;
              const variant =
                kpi.status === "good" ? "default" : kpi.status === "warning" ? "secondary" : "destructive";
              return (
                <Card key={kpi.title} className="border">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="text-3xl font-bold">{kpi.value}</div>
                      <Badge variant={variant} className="capitalize">
                        {kpi.status}
                      </Badge>
                    </div>
                    <div className="mt-2 flex items-center gap-2 text-sm">
                      <Icon className="h-4 w-4" />
                      <span className="font-medium">{kpi.title}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{kpi.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <h5 className="mt-6 mb-2 text-sm font-semibold uppercase text-muted-foreground">
            Communication Breakdown
          </h5>
          <div className="space-y-2 text-sm">
            {data.slice(0, 50).map((row, idx) => {
              const id = String(get(row, ["communication_ID", "Communication_ID", "ID"]) ?? idx + 1);
              const channel = String(get(row, ["Channel"]) ?? "Unknown");
              const misFlag = String(get(row, ["Miscommunication_Flag", "Miscommunication Flag"]) ?? "No");
              const readable = get(row, ["Readability_Score", "Readability Score"]);
              const reviewed = String(get(row, ["Reviewed_By_Compliance", "Reviewed By Compliance"]) ?? "No");
              const complaints = get(row, ["Complaint_Count_Per_Theme", "Complaint Count Per Theme"]);
              return (
                <div key={`${id}-${idx}`} className="rounded-md border p-2">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{id}</span>
                    <span className="text-xs text-muted-foreground">({channel})</span>
                    {misFlag.toLowerCase() === "yes" && <Badge variant="destructive">Miscommunication</Badge>}
                  </div>
                  <div className="mt-1 grid grid-cols-2 gap-2 text-xs md:grid-cols-4">
                    <div>Readability: {readable ?? "N/A"}</div>
                    <div>Reviewed: {reviewed}</div>
                    {complaints && String(complaints) !== "0" && <div>Complaints: {complaints}</div>}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
