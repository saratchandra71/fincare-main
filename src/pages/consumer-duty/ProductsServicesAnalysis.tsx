
import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { RequireDatasets } from '@/components/RequireDatasets'

import { parseCSVFromUrl } from "@/services/csvService";
import { resolveDataUrl } from "@/services/api";
import { usePromptRules } from "@/hooks/usePromptRules";
import { formatPS } from "@/lib/promptRules";
import { evaluateRows, loadRuleSet } from "@/lib/rulesEngine";
import { analyzeProducts } from "@/lib/productsServicesEngine";
import { readIngestionStatus, getCachedDataset, setCachedDataset } from '@/lib/ingestionGuard'

export default function ProductsServicesAnalysis() {
  const [rows, setRows] = useState<Record<string, string>[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const { ps, refresh } = usePromptRules();
  const [allowed, setAllowed] = useState(()=> readIngestionStatus().allLoaded)

  useEffect(()=>{
    const onUpd = ()=> setAllowed(readIngestionStatus().allLoaded)
    window.addEventListener('ingestion-status-updated', onUpd as any)
    window.addEventListener('storage', onUpd)
    return ()=> { window.removeEventListener('ingestion-status-updated', onUpd as any); window.removeEventListener('storage', onUpd) }
  }, [])

  useEffect(() => {
    if (!allowed) return
    const run = async () => {
      try {
        setLoading(true);
        setError(null);
        const cached = getCachedDataset('ProductPerformance.csv')
        if (cached) { setRows(cached); setLoading(false); return }
        const data = await parseCSVFromUrl(resolveDataUrl("ProductPerformance.csv"));
        setRows(data);
        setCachedDataset('ProductPerformance.csv', data)
      } catch (e: any) {
        setError(e?.message ?? "Failed to load product dataset");
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [allowed]);

  if (!allowed) return <RequireDatasets><></></RequireDatasets>

  const dynamicFindings = useMemo(
    () => evaluateRows("products-services", rows as any[], loadRuleSet("products-services")),
    [rows, ps]
  );

  const fallbackFindings = useMemo(
    () =>
      analyzeProducts(rows as any[], ps).map((f) => ({
        id: f.productId,
        title: f.productName,
        severity: f.severity === "critical" ? "critical" : "medium",
        messages: f.issues.map((t) => ({ text: t })),
      })),
    [rows, ps]
  );

  const findings = dynamicFindings && dynamicFindings.length > 0 ? dynamicFindings : fallbackFindings;

  if (loading)
    return (
      <Card>
        <CardHeader>
          <CardTitle>Products &amp; Services</CardTitle>
        </CardHeader>
        <CardContent>Loading dataset…</CardContent>
      </Card>
    );

  if (error)
    return (
      <Card>
        <CardHeader>
          <CardTitle>Products &amp; Services</CardTitle>
        </CardHeader>
        <CardContent className="text-red-600">{error}</CardContent>
      </Card>
    );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">Products &amp; Services Outcome</h2>
          <p className="text-muted-foreground">Consumer Duty compliance analysis for product suitability</p>
        </div>
        <Button onClick={refresh} variant="outline">
          Refresh thresholds
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Consumer Duty compliance analysis</CardTitle>
            <Badge variant="secondary">{findings.length} Issues Found</Badge>
          </div>
          <div className="text-xs text-muted-foreground">
            Using thresholds from Prompt Library — {formatPS(ps)}
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <Alert>
            <AlertDescription>
              Rules engine: dynamic rules from Prompt Library (fallback to built-in if no rules).
            </AlertDescription>
          </Alert>

          {findings.length === 0 ? (
            <div className="text-sm text-muted-foreground">No issues detected with current thresholds.</div>
          ) : (
            <div className="space-y-4">
              {findings.map((f) => (
                <Card key={`${f.id}-${f.title}`} className="border">
                  <CardContent className="p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-base font-semibold">{f.title}</div>
                        <div className="text-xs text-muted-foreground">{f.id}</div>
                      </div>
                      <Badge variant={f.severity === "critical" ? "destructive" : "outline"}>{f.severity}</Badge>
                    </div>
                    <ul className="list-disc pl-5 text-sm space-y-1">
                      {f.messages.map((m, idx) => (
                        <li key={idx}>
                          <div>{m.text}</div>
                          {m.extra && <div className="text-muted-foreground">{m.extra}</div>}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
