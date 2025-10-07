import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Calendar, Filter, AlertTriangle, CheckCircle, Clock } from "lucide-react";
import { format } from "date-fns";
import { useData } from "@/contexts/DataContext";

interface AuditTrailEntry {
  id: string;
  timestamp: Date;
  product: string;
  outcome: string;
  alertStatus: 'Active' | 'Resolved' | 'In Progress' | 'Closed';
  issue: string;
  agentFindings: string;
  humanAction: string;
  resolutionStatus: 'Open' | 'Resolved' | 'In Progress' | 'Escalated' | 'Closed';
  supportingData: string;
}

const SUGGESTED_QUERIES = [
  "Show flagged issues for Flexi Fix Mortgage 2019 last quarter",
  "List Consumer Support alerts past 6 months", 
  "Actions taken on complaints about Easy Access Saver",
  "Show all high priority issues from December 2023",
  "Display resolved Price & Value concerns this year"
];

export function AuditTrailComponent() {
  const { allDatasetsLoaded } = useData();
  const [auditTrail, setAuditTrail] = useState<AuditTrailEntry[]>([]);
  const [products, setProducts] = useState<string[]>([]);
  const [filteredTrail, setFilteredTrail] = useState<AuditTrailEntry[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedProduct, setSelectedProduct] = useState<string>('all');
  const [selectedOutcome, setSelectedOutcome] = useState<string>('all');
  const [selectedAlertStatus, setSelectedAlertStatus] = useState<string>('all');
  const [fromDate, setFromDate] = useState<string>('');
  const [toDate, setToDate] = useState<string>('');

  useEffect(() => {
    loadProducts();
    generateSampleAuditTrail();
  }, []);

  useEffect(() => {
    filterTrail();
  }, [auditTrail, searchQuery, selectedProduct, selectedOutcome, selectedAlertStatus, fromDate, toDate]);

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

  const generateSampleAuditTrail = () => {
    const sampleTrail: AuditTrailEntry[] = [
      {
        id: 'AT001',
        timestamp: new Date('2024-01-15T10:30:00'),
        product: 'Flexi Fix Mortgage 2019',
        outcome: 'Price & Value',
        alertStatus: 'Resolved',
        issue: 'Interest rate exceeds market average by 1.50%',
        agentFindings: 'Product flagged for overpricing based on market comparison analysis',
        humanAction: 'Rate reduced to 4.25% effective February 2024',
        resolutionStatus: 'Resolved',
        supportingData: 'Rate: 5.00% vs Market: 3.50%, Delta: 1.50%'
      },
      {
        id: 'AT002',
        timestamp: new Date('2024-01-16T09:15:00'),
        product: 'Car Loan Special',
        outcome: 'Consumer Support',
        alertStatus: 'In Progress',
        issue: 'Poor customer satisfaction with extended wait times',
        agentFindings: 'CSAT score of 1/5 with 8-minute average wait time exceeds threshold',
        humanAction: 'Staff training program initiated, additional resources allocated',
        resolutionStatus: 'In Progress',
        supportingData: 'CSAT: 1/5, Wait Time: 8min, SLA Breach: Yes'
      },
      {
        id: 'AT003',
        timestamp: new Date('2024-01-17T11:20:00'),
        product: 'Easy Access Saver',
        outcome: 'Consumer Understanding',
        alertStatus: 'Active',
        issue: 'Communication materials too complex for customers',
        agentFindings: 'Readability score of 45 indicates overly complex language',
        humanAction: 'Plain English review scheduled with communications team',
        resolutionStatus: 'Open',
        supportingData: 'Readability: 45, Complaints: 4 recurring themes'
      },
      {
        id: 'AT004',
        timestamp: new Date('2024-01-18T14:10:00'),
        product: 'Personal Loan Standard',
        outcome: 'Price & Value',
        alertStatus: 'Active',
        issue: 'Rate significantly above market average',
        agentFindings: 'Interest rate of 9.00% vs market average of 6.00% represents 3.00% premium',
        humanAction: 'Business case review requested for rate justification',
        resolutionStatus: 'Escalated',
        supportingData: 'Rate: 9.00%, Market: 6.00%, Fair Value Flag: No'
      }
    ];
    
    setAuditTrail(sampleTrail);
  };

  const filterTrail = () => {
    let filtered = auditTrail;

    // Text search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(entry => 
        entry.product.toLowerCase().includes(query) ||
        entry.issue.toLowerCase().includes(query) ||
        entry.agentFindings.toLowerCase().includes(query) ||
        entry.humanAction.toLowerCase().includes(query)
      );
    }

    // Product filter
    if (selectedProduct !== 'all') {
      filtered = filtered.filter(entry => entry.product === selectedProduct);
    }

    // Outcome filter
    if (selectedOutcome !== 'all') {
      filtered = filtered.filter(entry => entry.outcome === selectedOutcome);
    }

    // Alert status filter
    if (selectedAlertStatus !== 'all') {
      filtered = filtered.filter(entry => entry.alertStatus === selectedAlertStatus);
    }

    // Date filters
    if (fromDate) {
      filtered = filtered.filter(entry => entry.timestamp >= new Date(fromDate));
    }

    if (toDate) {
      filtered = filtered.filter(entry => entry.timestamp <= new Date(toDate + 'T23:59:59'));
    }

    setFilteredTrail(filtered.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()));
  };

  const handleSuggestedQuery = (query: string) => {
    setSearchQuery(query);
  };

  const getAlertStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'destructive';
      case 'Resolved': return 'default';
      case 'In Progress': return 'secondary';
      case 'Closed': return 'outline';
      default: return 'outline';
    }
  };

  const getResolutionStatusColor = (status: string) => {
    switch (status) {
      case 'Open': return 'destructive';
      case 'Resolved': return 'default';
      case 'In Progress': return 'secondary';
      case 'Escalated': return 'secondary';
      case 'Closed': return 'outline';
      default: return 'outline';
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
          <h2 className="text-2xl font-bold">Audit Trail</h2>
          <p className="text-muted-foreground">
            Historical record of compliance issues, findings, and resolutions
          </p>
        </div>
        <Badge variant="outline">
          {filteredTrail.length} records
        </Badge>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Search & Filter
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Natural Language Search */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Natural Language Query</label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="e.g., Show all issues flagged on Product X last year and what was done"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-background"
                />
              </div>
              <Button 
                variant="outline" 
                onClick={() => setSearchQuery('')}
                disabled={!searchQuery}
              >
                Clear
              </Button>
            </div>
          </div>

          {/* Suggested Queries */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Suggested Queries</label>
            <div className="flex flex-wrap gap-2">
              {SUGGESTED_QUERIES.map((query, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => handleSuggestedQuery(query)}
                  className="text-xs"
                >
                  {query}
                </Button>
              ))}
            </div>
          </div>

          {/* Filter Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Product</label>
              <Select value={selectedProduct} onValueChange={setSelectedProduct}>
                <SelectTrigger className="bg-background">
                  <SelectValue placeholder="All Products" />
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
              <label className="text-sm font-medium">Outcome</label>
              <Select value={selectedOutcome} onValueChange={setSelectedOutcome}>
                <SelectTrigger className="bg-background">
                  <SelectValue placeholder="All Outcomes" />
                </SelectTrigger>
                <SelectContent className="bg-background border shadow-lg z-50">
                  <SelectItem value="all">All Outcomes</SelectItem>
                  <SelectItem value="Products & Services">Products & Services</SelectItem>
                  <SelectItem value="Price & Value">Price & Value</SelectItem>
                  <SelectItem value="Consumer Understanding">Consumer Understanding</SelectItem>
                  <SelectItem value="Consumer Support">Consumer Support</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Alert Status</label>
              <Select value={selectedAlertStatus} onValueChange={setSelectedAlertStatus}>
                <SelectTrigger className="bg-background">
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent className="bg-background border shadow-lg z-50">
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Resolved">Resolved</SelectItem>
                  <SelectItem value="In Progress">In Progress</SelectItem>
                  <SelectItem value="Closed">Closed</SelectItem>
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

      {/* Audit Trail Results */}
      <div className="space-y-4">
        {filteredTrail.map((entry) => (
          <Card key={entry.id} className="border-l-4 border-l-warning">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    {format(entry.timestamp, 'yyyy-MM-dd HH:mm')} - {entry.product}
                  </CardTitle>
                  <CardDescription>
                    {entry.outcome} • {entry.issue}
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={getAlertStatusColor(entry.alertStatus)}>
                    {entry.alertStatus}
                  </Badge>
                  <Badge variant={getResolutionStatusColor(entry.resolutionStatus)}>
                    {entry.resolutionStatus}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Supporting Data */}
              <div className="p-3 bg-muted/50 rounded-lg">
                <h4 className="font-medium text-sm mb-2">Supporting Data</h4>
                <p className="text-sm font-mono">{entry.supportingData}</p>
              </div>

              {/* Agent Findings */}
              <div className="p-3 bg-accent/20 rounded-lg">
                <h4 className="font-medium text-sm mb-2">Agent Findings</h4>
                <p className="text-sm">{entry.agentFindings}</p>
              </div>

              {/* Human Action */}
              <div className="p-3 bg-primary/10 rounded-lg border-l-2 border-l-primary">
                <h4 className="font-medium text-sm mb-2">Human Action Taken</h4>
                <p className="text-sm">{entry.humanAction}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredTrail.length === 0 && (
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground">
              No audit trail records found matching the search criteria.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}