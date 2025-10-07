import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, CheckCircle, Shield } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useData } from "@/contexts/DataContext";

interface ProductData {
  Product_ID: string;
  Product_Name: string;
  Target_Market_Profile: string;
  Actual_Customer_Profile: string;
  Early_Closure_Rate: string;
  Complaint_Count: string;
  Vulnerable_Customer_proportion: string;
}

interface AnalysisResult {
  productId: string;
  productName: string;
  issues: string[];
  isCritical: boolean;
}

export function ProductsServicesAnalysis() {
  const { toast } = useToast();
  const { allDatasetsLoaded } = useData();
  const [loading, setLoading] = useState(true);
  const [analysisResults, setAnalysisResults] = useState<AnalysisResult[]>([]);

  useEffect(() => {
    if (allDatasetsLoaded) {
      loadAndAnalyzeData();
    }
  }, [allDatasetsLoaded]);

  const loadAndAnalyzeData = async () => {
    try {
      const response = await fetch('/data/ProductPerformance.csv');
      const text = await response.text();
      const lines = text.split('\n');
      const headers = lines[0].split(',');
      
      const products: ProductData[] = lines.slice(1)
        .filter(line => line.trim())
        .map(line => {
          const values = line.split(',');
          return headers.reduce((obj, header, index) => {
            obj[header as keyof ProductData] = values[index] || '';
            return obj;
          }, {} as ProductData);
        });

      const results = analyzeProducts(products);
      setAnalysisResults(results);
      setLoading(false);

      toast({
        title: "Analysis Complete",
        description: `Products & Services analysis completed. ${results.length} issues identified.`,
      });
    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: "Analysis Failed",
        description: "Failed to load product data for analysis.",
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  const analyzeProducts = (products: ProductData[]): AnalysisResult[] => {
    const flaggedProducts: AnalysisResult[] = [];

    products.forEach(product => {
      const issues: string[] = [];
      
      // 1. Compare Actual vs Target Market Profile
      if (product.Actual_Customer_Profile !== product.Target_Market_Profile && 
          !product.Actual_Customer_Profile.toLowerCase().includes('aligned')) {
        issues.push(`Market profile mismatch: Target "${product.Target_Market_Profile}" vs Actual "${product.Actual_Customer_Profile}"`);
      }

      // 2. Flag Early Closure Rate > 10%
      const earlyClosureRate = parseFloat(product.Early_Closure_Rate.replace('%', ''));
      if (earlyClosureRate > 10) {
        issues.push(`High early closure rate: ${product.Early_Closure_Rate} (potential mis-sale or dissatisfaction)`);
      }

      // 3. Flag Complaint Count > 5
      const complaintCount = parseInt(product.Complaint_Count);
      if (complaintCount > 5) {
        issues.push(`High complaint count: ${complaintCount} complaints (customer satisfaction issue)`);
      }

      // 4. Check vulnerable customers with issues
      const vulnerablePercent = parseFloat(product.Vulnerable_Customer_proportion.replace('%', ''));
      const isCritical = vulnerablePercent > 10 && issues.length > 0;
      
      if (isCritical) {
        issues.push(`Critical: High vulnerable customer proportion (${product.Vulnerable_Customer_proportion}) with identified issues`);
      }

      if (issues.length > 0) {
        flaggedProducts.push({
          productId: product.Product_ID,
          productName: product.Product_Name,
          issues,
          isCritical
        });
      }
    });

    return flaggedProducts;
  };

  if (!allDatasetsLoaded) {
    return (
      <div className="p-6 space-y-4">
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          <h2 className="text-xl font-semibold">Products & Services Analysis</h2>
        </div>
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground">
              Datasets are not yet loaded. Please load all required datasets to proceed with analysis.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-6 space-y-4">
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 animate-pulse" />
          <h2 className="text-xl font-semibold">Analyzing Products & Services...</h2>
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Products & Services Outcome</h2>
          <p className="text-muted-foreground">Consumer Duty compliance analysis for product suitability</p>
        </div>
        <Badge variant={analysisResults.length > 0 ? "destructive" : "secondary"} className="text-sm">
          {analysisResults.length} Issues Found
        </Badge>
      </div>

      {analysisResults.length === 0 ? (
        <Card className="border-success/20 bg-success/5">
          <CardContent className="p-6 text-center">
            <CheckCircle className="h-12 w-12 text-success mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-success mb-2">All Products Compliant</h3>
            <p className="text-muted-foreground">No issues identified in the Products & Services outcome analysis.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {analysisResults.map((result) => (
            <Card key={result.productId} className={`border-l-4 ${result.isCritical ? 'border-l-destructive bg-destructive/5' : 'border-l-warning bg-warning/5'}`}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className={`h-5 w-5 ${result.isCritical ? 'text-destructive' : 'text-warning'}`} />
                    {result.productName}
                  </CardTitle>
                  <div className="flex gap-2">
                    <Badge variant="outline">{result.productId}</Badge>
                    {result.isCritical && <Badge variant="destructive">Critical</Badge>}
                  </div>
                </div>
                <CardDescription>Issues requiring human review</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {result.issues.map((issue, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <span className="text-muted-foreground">•</span>
                      <span>{issue}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Card className="border-primary/20 bg-primary/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-primary">
            <Shield className="h-5 w-5" />
            Analysis Methodology
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2">
          <p>• <strong>Market Profile Mismatch:</strong> Comparing actual vs target customer profiles</p>
          <p>• <strong>Early Closure Analysis:</strong> Flagging rates {">"} 10% as potential mis-sales</p>
          <p>• <strong>Complaint Monitoring:</strong> Identifying products with {">"} 5 complaints</p>
          <p>• <strong>Vulnerable Customer Focus:</strong> Critical flagging when {">"} 10% vulnerable customers have issues</p>
        </CardContent>
      </Card>
    </div>
  );
}