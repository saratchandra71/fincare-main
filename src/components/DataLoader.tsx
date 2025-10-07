
import { useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useData } from "@/contexts/DataContext";
import { parseCSVFromUrl } from "@/services/csvService";
import { resolveDataUrl } from "@/services/api";
import { Database } from "lucide-react";

export function DataLoader() {
  const { datasets, setDatasets } = useData();
  const { toast } = useToast();

  const loadDataset = useCallback(
    async (index: number) => {
      const target = datasets[index];
      if (!target) return;

      // Set loading flag
      setDatasets((prev) => {
        const next = [...prev];
        next[index] = { ...next[index], loading: true, error: undefined };
        return next;
      });

      try {
        const url = resolveDataUrl(target.filename);
        const rows = await parseCSVFromUrl(url);
        setDatasets((prev) => {
          const next = [...prev];
          next[index] = {
            ...next[index],
            loading: false,
            loaded: true,
            dataCount: rows.length,
            error: undefined,
          };
          return next;
        });
        toast({ title: `Loaded ${target.name}`, description: `${rows.length} rows`, })
      } catch (err: any) {
        const message = err?.message ?? "Failed to load dataset";
        setDatasets((prev) => {
          const next = [...prev];
          next[index] = { ...next[index], loading: false, loaded: false, error: message };
          return next;
        });
        toast({ title: `Error loading ${target.name}`, description: message, variant: "destructive" });
      }
    },
    [datasets, setDatasets, toast]
  );

  const loadAll = useCallback(async () => {
    // Sequential load to reduce network spikes and keep UX predictable
    for (let i = 0; i < datasets.length; i++) {
      await loadDataset(i);
    }
    toast({ title: "All datasets attempted", description: "Check badges for success/error." });
  }, [datasets.length, loadDataset, toast]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" /> Datasets
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Load required CSV datasets before running analyses.
          </div>
          <Button onClick={loadAll} variant="default">Load All Datasets</Button>
        </div>

        <div className="divide-y rounded-md border">
          {datasets.map((d, idx) => (
            <div key={d.filename} className="flex items-center justify-between p-3">
              <div className="space-y-0.5">
                <div className="font-medium">{d.name}</div>
                <div className="text-xs text-muted-foreground">{d.filename}</div>
              </div>
              <div className="flex items-center gap-2">
                {d.loading && <Badge variant="secondary">Loading…</Badge>}
                {!d.loading && d.loaded && <Badge variant="default">Loaded{typeof d.dataCount === 'number' ? ` (${d.dataCount})` : ''}</Badge>}
                {!d.loading && !d.loaded && !d.error && <Badge variant="outline">Not loaded</Badge>}
                {d.error && <Badge variant="destructive" title={d.error}>Error</Badge>}
                <Button size="sm" variant="outline" disabled={!!d.loading} onClick={() => loadDataset(idx)}>
                  {d.loading ? 'Loading…' : 'Load'}
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
