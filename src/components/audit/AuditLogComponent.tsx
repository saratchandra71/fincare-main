import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Clock, AlertTriangle, CheckCircle, User, FileText } from "lucide-react";
import { format } from "date-fns";
import { useData } from "@/contexts/DataContext";

interface AuditLogEntry {
  id: string;
  timestamp: Date;
  action: string;
  product: string;
  outcome: 'Products & Services' | 'Price & Value' | 'Consumer Understanding' | 'Consumer Support';
  ruleCheck: 'PASSED' | 'FAILED' | 'WARNING';
  dataExcerpt: string;
  narrative: string;
  humanReview?: {
    reviewer: string;
    timestamp: Date;
    action: string;
    notes: string;
  };
}

export function AuditLogComponent() {
  const { allDatasetsLoaded } = useData();
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [products, setProducts] = useState<string[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<AuditLogEntry[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<string>('all');
  const [fromDate, setFromDate] = useState<string>('');
  const [toDate, setToDate] = useState<string>('');

  useEffect(() => {
    loadProducts();
    generateSampleAuditLogs();
  }, []);

  useEffect(() => {
    filterLogs();
  }, [auditLogs, selectedProduct, fromDate, toDate]);

  const loadProducts = async () => {
    try {
      const response = await fetch('/data/ProductPerformance.csv');
      const text = await response.text();
      const lines = text.trim().split('\n');
      const headers = lines[0].split(',');
      const productNameIndex = headers.indexOf('Product_Name');
      
      const productNames = lines.slice(1).map(line => {
        const values = line.split(',');
        return values[productNameIndex];
      });
      
      setProducts(productNames);
    } catch (error) {
      console.error('Failed to load products:', error);
    }
  };

  const generateSampleAuditLogs = () => {
    const sampleLogs: AuditLogEntry[] = [
      {
        id: 'AL001',
        timestamp: new Date('2024-01-15T10:30:00'),
        action: 'Compliance scan executed',
        product: 'Flexi Fix Mortgage 2019',
        outcome: 'Price & Value',
        ruleCheck: 'FAILED',
        dataExcerpt: 'Interest Rate: 5.00%, Market Avg: 3.50%',
        narrative: 'Product flagged for overpricing - rate exceeds market average by 1.50%',
        humanReview: {
          reviewer: 'Sarah Johnson',
          timestamp: new Date('2024-01-15T14:20:00'),
          action: 'Rate adjustment approved',
          notes: 'Rate to be reduced to 4.25% effective next month'
        }
      },
      {
        id: 'AL002',
        timestamp: new Date('2024-01-16T09:15:00'),
        action: 'Consumer support analysis',
        product: 'Car Loan Special',
        outcome: 'Consumer Support',
        ruleCheck: 'FAILED',
        dataExcerpt: 'CSAT Score: 1/5, Wait Time: 8min',
        narrative: 'Poor customer satisfaction detected with extended wait times',
        humanReview: {
          reviewer: 'Mike Chen',
          timestamp: new Date('2024-01-16T16:45:00'),
          action: 'Training program initiated',
          notes: 'Additional staff training scheduled for next week'
        }
      },
      {
        id: 'AL003',
        timestamp: new Date('2024-01-17T11:20:00'),
        action: 'Communication review',
        product: 'Easy Access Saver',
        outcome: 'Consumer Understanding',
        ruleCheck: 'WARNING',
        dataExcerpt: 'Readability Score: 45, Miscommunication Flag: Yes',
        narrative: 'Communication materials may be too complex for average customer comprehension',
        humanReview: {
          reviewer: 'Emma Davis',
          timestamp: new Date('2024-01-17T15:30:00'),
          action: 'Content review scheduled',
          notes: 'Plain English review to be completed by communications team'
        }
      },
      {
        id: 'AL004',
        timestamp: new Date('2024-01-18T14:10:00'),
        action: 'Product analysis',
        product: 'Green Home Mortgage 2023',
        outcome: 'Products & Services',
        ruleCheck: 'PASSED',
        dataExcerpt: 'Target match: 95%, Complaint count: 2',
        narrative: 'Product performance within acceptable thresholds',
      }
    ];
    
    setAuditLogs(sampleLogs);
  };

  const filterLogs = () => {
    let filtered = auditLogs;

    if (selectedProduct !== 'all') {
      filtered = filtered.filter(log => log.product === selectedProduct);
    }

    if (fromDate) {
      filtered = filtered.filter(log => log.timestamp >= new Date(fromDate));
    }

    if (toDate) {
      filtered = filtered.filter(log => log.timestamp <= new Date(toDate + 'T23:59:59'));
    }

    setFilteredLogs(filtered.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()));
  };

  const getRuleCheckColor = (status: string) => {
    switch (status) {
      case 'PASSED': return 'default';
      case 'FAILED': return 'destructive';
      case 'WARNING': return 'secondary';
      default: return 'outline';
    }
  };

  const getRuleCheckIcon = (status: string) => {
    switch (status) {
      case 'PASSED': return <CheckCircle className="h-4 w-4" />;
      case 'FAILED': return <AlertTriangle className="h-4 w-4" />;
      case 'WARNING': return <AlertTriangle className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  // Check if datasets are loaded
  if (!allDatasetsLoaded) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center">Datasets Required</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-center text-muted-foreground">
              Audit features are unavailable until all datasets are loaded. Please load all required datasets to proceed.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Audit Log</h2>
          <p className="text-muted-foreground">
            Chronological record of all compliance analysis activities and outcomes
          </p>
        </div>
        <Badge variant="outline">
          {filteredLogs.length} entries
        </Badge>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filters</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Product</label>
              <Select value={selectedProduct} onValueChange={setSelectedProduct}>
                <SelectTrigger className="bg-background">
                  <SelectValue placeholder="Select product" />
                </SelectTrigger>
                <SelectContent className="bg-background border shadow-lg z-50">
                  <SelectItem value="all">All Products</SelectItem>
                  {products.map(product => (
                    <SelectItem key={product} value={product}>
                      {product}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">From Date</label>
              <Input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="bg-background"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">To Date</label>
              <Input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="bg-background"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Audit Log Entries */}
      <div className="space-y-4">
        {filteredLogs.map((entry) => (
          <Card key={entry.id} className="border-l-4 border-l-primary">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <CardTitle className="text-base">
                      {format(entry.timestamp, 'yyyy-MM-dd HH:mm')} – {entry.action}
                    </CardTitle>
                    <CardDescription>
                      {entry.product} • {entry.outcome}
                    </CardDescription>
                  </div>
                </div>
                <Badge variant={getRuleCheckColor(entry.ruleCheck)} className="flex items-center gap-1">
                  {getRuleCheckIcon(entry.ruleCheck)}
                  {entry.ruleCheck}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Data Excerpt */}
              <div className="p-3 bg-muted/50 rounded-lg">
                <h4 className="font-medium text-sm mb-2">Supporting Data</h4>
                <p className="text-sm font-mono">{entry.dataExcerpt}</p>
              </div>

              {/* Narrative */}
              <div className="p-3 bg-accent/20 rounded-lg">
                <h4 className="font-medium text-sm mb-2">AI Analysis</h4>
                <p className="text-sm">{entry.narrative}</p>
              </div>

              {/* Human Review */}
              {entry.humanReview && (
                <div className="p-3 bg-primary/10 rounded-lg border-l-2 border-l-primary">
                  <div className="flex items-center gap-2 mb-2">
                    <User className="h-4 w-4" />
                    <h4 className="font-medium text-sm">Human Review</h4>
                  </div>
                  <div className="space-y-2 text-sm">
                    <p><span className="font-medium">Reviewer:</span> {entry.humanReview.reviewer}</p>
                    <p><span className="font-medium">Time:</span> {format(entry.humanReview.timestamp, 'yyyy-MM-dd HH:mm')}</p>
                    <p><span className="font-medium">Action:</span> {entry.humanReview.action}</p>
                    <p><span className="font-medium">Notes:</span> {entry.humanReview.notes}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredLogs.length === 0 && (
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground">No audit log entries found matching the selected filters.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}