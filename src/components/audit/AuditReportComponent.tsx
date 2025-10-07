import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { FileText, Download, Mail, Calendar, Settings } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useData } from "@/contexts/DataContext";

interface ReportFilters {
  product: string;
  outcome: string;
  alertStatus: string;
  fromDate: string;
  toDate: string;
}

interface ReportOptions {
  format: 'pdf' | 'docx';
  includeSupportingData: boolean;
  includeHumanNotes: boolean;
  includeCoverPage: boolean;
  includeTableOfContents: boolean;
  includePageNumbers: boolean;
  customNotes: string;
}

export function AuditReportComponent() {
  const { toast } = useToast();
  const { allDatasetsLoaded } = useData();
  const [products, setProducts] = useState<string[]>([]);
  const [filters, setFilters] = useState<ReportFilters>({
    product: 'all',
    outcome: 'all',
    alertStatus: 'all',
    fromDate: '',
    toDate: ''
  });
  const [reportOptions, setReportOptions] = useState<ReportOptions>({
    format: 'pdf',
    includeSupportingData: true,
    includeHumanNotes: true,
    includeCoverPage: true,
    includeTableOfContents: true,
    includePageNumbers: true,
    customNotes: ''
  });
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    loadProducts();
  }, []);

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

  const handleFilterChange = (key: keyof ReportFilters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleOptionChange = (key: keyof ReportOptions, value: any) => {
    setReportOptions(prev => ({ ...prev, [key]: value }));
  };

  const generateReport = async () => {
    setIsGenerating(true);
    
    try {
      // Simulate report generation
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const reportName = `consumer-duty-audit-report-${new Date().toISOString().split('T')[0]}.${reportOptions.format}`;
      
      // In a real implementation, this would generate and download the actual file
      toast({
        title: "Report Generated Successfully",
        description: `${reportName} has been generated and is ready for download.`,
      });
      
      // Simulate download
      const element = document.createElement('a');
      element.href = '#';
      element.download = reportName;
      element.click();
      
    } catch (error) {
      toast({
        title: "Report Generation Failed",
        description: "There was an error generating the audit report. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const emailReport = async () => {
    const reportName = `consumer-duty-audit-report-${new Date().toISOString().split('T')[0]}.${reportOptions.format}`;
    
    toast({
      title: "Email Sent",
      description: `${reportName} has been sent to your registered email address.`,
    });
  };

  const scheduleRecurringReport = () => {
    toast({
      title: "Recurring Report Scheduled",
      description: "Your recurring audit report has been scheduled successfully.",
    });
  };

  const getFilterSummary = () => {
    const activeFilters: string[] = [];
    
    if (filters.product !== 'all') activeFilters.push(`Product: ${filters.product}`);
    if (filters.outcome !== 'all') activeFilters.push(`Outcome: ${filters.outcome}`);
    if (filters.alertStatus !== 'all') activeFilters.push(`Status: ${filters.alertStatus}`);
    if (filters.fromDate) activeFilters.push(`From: ${filters.fromDate}`);
    if (filters.toDate) activeFilters.push(`To: ${filters.toDate}`);
    
    return activeFilters.length > 0 ? activeFilters.join(', ') : 'No filters applied';
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
          <h2 className="text-2xl font-bold">Audit Report Generator</h2>
          <p className="text-muted-foreground">
            Generate comprehensive compliance audit reports with customizable options
          </p>
        </div>
        <Badge variant="outline" className="flex items-center gap-1">
          <FileText className="h-3 w-3" />
          Report Builder
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Filter Options */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Filter Options
            </CardTitle>
            <CardDescription>
              Select criteria to include in your audit report
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Product</label>
                <Select value={filters.product} onValueChange={(value) => handleFilterChange('product', value)}>
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
                <Select value={filters.outcome} onValueChange={(value) => handleFilterChange('outcome', value)}>
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
                <Select value={filters.alertStatus} onValueChange={(value) => handleFilterChange('alertStatus', value)}>
                  <SelectTrigger className="bg-background">
                    <SelectValue placeholder="All Statuses" />
                  </SelectTrigger>
                  <SelectContent className="bg-background border shadow-lg z-50">
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="Active">Active Issues</SelectItem>
                    <SelectItem value="Resolved">Resolved Issues</SelectItem>
                    <SelectItem value="In Progress">In Progress</SelectItem>
                    <SelectItem value="Closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">From Date</label>
                  <Input
                    type="date"
                    value={filters.fromDate}
                    onChange={(e) => handleFilterChange('fromDate', e.target.value)}
                    className="bg-background"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">To Date</label>
                  <Input
                    type="date"
                    value={filters.toDate}
                    onChange={(e) => handleFilterChange('toDate', e.target.value)}
                    className="bg-background"
                  />
                </div>
              </div>
            </div>

            <div className="p-3 bg-muted/50 rounded-lg">
              <h4 className="font-medium text-sm mb-1">Active Filters</h4>
              <p className="text-xs text-muted-foreground">{getFilterSummary()}</p>
            </div>
          </CardContent>
        </Card>

        {/* Report Options */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Report Options
            </CardTitle>
            <CardDescription>
              Customize the format and content of your report
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Format</label>
              <Select value={reportOptions.format} onValueChange={(value: 'pdf' | 'docx') => handleOptionChange('format', value)}>
                <SelectTrigger className="bg-background">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-background border shadow-lg z-50">
                  <SelectItem value="pdf">PDF Document</SelectItem>
                  <SelectItem value="docx">Word Document (.docx)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <label className="text-sm font-medium">Include in Report</label>
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="supportingData"
                    checked={reportOptions.includeSupportingData}
                    onCheckedChange={(checked) => handleOptionChange('includeSupportingData', checked)}
                  />
                  <label htmlFor="supportingData" className="text-sm">Supporting data excerpts</label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="humanNotes"
                    checked={reportOptions.includeHumanNotes}
                    onCheckedChange={(checked) => handleOptionChange('includeHumanNotes', checked)}
                  />
                  <label htmlFor="humanNotes" className="text-sm">Human review notes</label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="coverPage"
                    checked={reportOptions.includeCoverPage}
                    onCheckedChange={(checked) => handleOptionChange('includeCoverPage', checked)}
                  />
                  <label htmlFor="coverPage" className="text-sm">Cover page</label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="tableOfContents"
                    checked={reportOptions.includeTableOfContents}
                    onCheckedChange={(checked) => handleOptionChange('includeTableOfContents', checked)}
                  />
                  <label htmlFor="tableOfContents" className="text-sm">Table of contents</label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="pageNumbers"
                    checked={reportOptions.includePageNumbers}
                    onCheckedChange={(checked) => handleOptionChange('includePageNumbers', checked)}
                  />
                  <label htmlFor="pageNumbers" className="text-sm">Page numbers</label>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Custom Notes</label>
              <Textarea
                placeholder="Add any custom notes or commentary for this report..."
                value={reportOptions.customNotes}
                onChange={(e) => handleOptionChange('customNotes', e.target.value)}
                className="bg-background"
                rows={3}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Report Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Generate Report</CardTitle>
          <CardDescription>
            Create and distribute your customized audit report
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <Button
              onClick={generateReport}
              disabled={isGenerating}
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              {isGenerating ? 'Generating...' : 'Download Report'}
            </Button>
            
            <Button
              variant="outline"
              onClick={emailReport}
              disabled={isGenerating}
              className="flex items-center gap-2"
            >
              <Mail className="h-4 w-4" />
              Email Report
            </Button>
            
            <Button
              variant="outline"
              onClick={scheduleRecurringReport}
              className="flex items-center gap-2"
            >
              <Calendar className="h-4 w-4" />
              Schedule Recurring
            </Button>
          </div>
          
          <div className="mt-4 p-3 bg-accent/20 rounded-lg">
            <h4 className="font-medium text-sm mb-2">Report Preview</h4>
            <div className="space-y-1 text-sm text-muted-foreground">
              <p>Format: {reportOptions.format.toUpperCase()}</p>
              <p>Filters: {getFilterSummary()}</p>
              <p>Options: {[
                reportOptions.includeSupportingData && 'Supporting Data',
                reportOptions.includeHumanNotes && 'Human Notes',
                reportOptions.includeCoverPage && 'Cover Page',
                reportOptions.includeTableOfContents && 'Table of Contents',
                reportOptions.includePageNumbers && 'Page Numbers'
              ].filter(Boolean).join(', ') || 'Basic report'}</p>
              {reportOptions.customNotes && <p>Custom Notes: Added</p>}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}