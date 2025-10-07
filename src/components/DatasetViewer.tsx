import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Eye, FileText, RotateCcw } from "lucide-react";
import { useData } from "@/contexts/DataContext";

interface DatasetRecord {
  [key: string]: string;
}

export function DatasetViewer() {
  const { datasets, allDatasetsLoaded } = useData();
  const [selectedDataset, setSelectedDataset] = useState<string>("");
  const [datasetRecords, setDatasetRecords] = useState<DatasetRecord[]>([]);
  const [columns, setColumns] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const loadedDatasets = datasets.filter(d => d.loaded);

  useEffect(() => {
    if (loadedDatasets.length > 0 && !selectedDataset) {
      setSelectedDataset(loadedDatasets[0].name);
    }
  }, [loadedDatasets, selectedDataset]);

  useEffect(() => {
    if (selectedDataset) {
      loadDatasetData();
    }
  }, [selectedDataset]);

  const loadDatasetData = async () => {
    if (!selectedDataset) return;

    const dataset = datasets.find(d => d.name === selectedDataset);
    if (!dataset) return;

    setLoading(true);
    try {
      const response = await fetch(`/data/${dataset.filename}`);
      const text = await response.text();
      const lines = text.trim().split('\n');
      
      if (lines.length === 0) return;

      const headers = lines[0].split(',').map(h => h.trim());
      setColumns(headers);

      const records: DatasetRecord[] = lines.slice(1)
        .filter(line => line.trim())
        .map((line, index) => {
          const values = line.split(',').map(v => v.trim());
          const record: DatasetRecord = { _rowNumber: (index + 1).toString() };
          headers.forEach((header, i) => {
            record[header] = values[i] || '';
          });
          return record;
        });

      setDatasetRecords(records);
    } catch (error) {
      console.error('Error loading dataset:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!allDatasetsLoaded) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Dataset Viewer
          </CardTitle>
          <CardDescription>
            No datasets loaded. Please load datasets first using the Dataset Management section.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Dataset Viewer
          </CardTitle>
          <CardDescription>
            View and explore loaded datasets in table format
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <Select value={selectedDataset} onValueChange={setSelectedDataset}>
              <SelectTrigger className="w-64">
                <SelectValue placeholder="Select dataset to view" />
              </SelectTrigger>
              <SelectContent>
                {loadedDatasets.map((dataset) => (
                  <SelectItem key={dataset.name} value={dataset.name}>
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      {dataset.filename} ({dataset.name})
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            {selectedDataset && (
              <div className="flex items-center gap-2">
                <Badge variant="secondary">
                  {datasetRecords.length} rows
                </Badge>
                <Badge variant="outline">
                  {columns.length} columns
                </Badge>
              </div>
            )}
          </div>

          {loading && (
            <div className="flex items-center justify-center py-8">
              <RotateCcw className="h-6 w-6 animate-spin mr-2" />
              Loading dataset...
            </div>
          )}

          {!loading && selectedDataset && datasetRecords.length > 0 && (
            <Card className="border">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">
                  {datasets.find(d => d.name === selectedDataset)?.filename}
                </CardTitle>
                <CardDescription>
                  Showing {datasetRecords.length} records with {columns.length} columns
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="h-[600px] w-full">
                  <div className="min-w-max">
                    <Table>
                      <TableHeader className="sticky top-0 bg-background z-10 border-b">
                        <TableRow>
                          <TableHead className="w-16 text-center font-semibold bg-muted">
                            #
                          </TableHead>
                          {columns.map((column) => (
                            <TableHead key={column} className="font-semibold min-w-32 bg-muted">
                              {column}
                            </TableHead>
                          ))}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {datasetRecords.map((record, index) => (
                          <TableRow key={index} className="hover:bg-muted/50">
                            <TableCell className="text-center font-mono text-sm text-muted-foreground bg-muted/30">
                              {record._rowNumber}
                            </TableCell>
                            {columns.map((column) => (
                              <TableCell key={column} className="font-mono text-sm max-w-48">
                                <div className="truncate" title={record[column]}>
                                  {record[column]}
                                </div>
                              </TableCell>
                            ))}
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          )}

          {!loading && selectedDataset && datasetRecords.length === 0 && (
            <Card className="border-dashed">
              <CardContent className="flex items-center justify-center py-8">
                <div className="text-center text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No data found in selected dataset</p>
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  );
}