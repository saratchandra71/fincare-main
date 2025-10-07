import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, TrendingUp, Clock, DollarSign } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useData } from "@/contexts/DataContext";

interface PriceValueData {
  Product_ID: string;
  Product_Name: string;
  Interest_Rate: string;
  Fee_Amount: string;
  Market_Avg_Rate: string;
  Market_Avg_Fee: string;
  Rate_Delta: string;
  Fee_Delta: string;
  Legacy_Rate: string;
  New_Customer_Rate: string;
  Rate_Change_Date: string;
  BoE_Base_Rate_Change_Date: string;
  Rate_Change_Lag_Days: string;
  Fair_Value_Flag: string;
}

interface FlaggedIssue {
  productId: string;
  productName: string;
  issues: Array<{
    type: 'overpriced' | 'excessive_fee' | 'loyalty_penalty' | 'slow_response';
    description: string;
    metric: string;
    severity: 'high' | 'medium' | 'low';
  }>;
  fairValueFlag: string;
}

export function PriceValueAnalysis() {
  const { allDatasetsLoaded } = useData();
  const [flaggedProducts, setFlaggedProducts] = useState<FlaggedIssue[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (allDatasetsLoaded) {
      const analyzePriceValue = async () => {
      try {
        const response = await fetch('/data/PriceValue.csv');
        if (!response.ok) throw new Error('Failed to load PriceValue data');
        
        const text = await response.text();
        const lines = text.trim().split('\n');
        const headers = lines[0].split(',');
        
        const products: PriceValueData[] = lines.slice(1).map(line => {
          const values = line.split(',');
          return headers.reduce((obj, header, index) => {
            obj[header as keyof PriceValueData] = values[index] || '';
            return obj;
          }, {} as PriceValueData);
        });

        const flagged: FlaggedIssue[] = [];

        products.forEach(product => {
          const issues: FlaggedIssue['issues'] = [];
          
          // Parse numeric values
          const interestRate = parseFloat(product.Interest_Rate.replace('%', ''));
          const marketAvgRate = parseFloat(product.Market_Avg_Rate.replace('%', ''));
          const feeAmount = parseFloat(product.Fee_Amount);
          const marketAvgFee = parseFloat(product.Market_Avg_Fee);
          const legacyRate = parseFloat(product.Legacy_Rate.replace('%', ''));
          const newCustomerRate = parseFloat(product.New_Customer_Rate.replace('%', ''));
          const lagDays = product.Rate_Change_Lag_Days === '>900' ? 900 : parseFloat(product.Rate_Change_Lag_Days);

          // 1. Flag Interest_Rate > Market_Avg_Rate by more than 0.5%
          if (interestRate > marketAvgRate + 0.5) {
            issues.push({
              type: 'overpriced',
              description: `Interest rate ${interestRate}% exceeds market average ${marketAvgRate}% by ${(interestRate - marketAvgRate).toFixed(2)}%`,
              metric: `Rate: ${interestRate}% vs Market: ${marketAvgRate}%`,
              severity: 'high'
            });
          }

          // 2. Flag Fee_Amount > Market_Avg_Fee or any fee where market fee is zero
          if (feeAmount > marketAvgFee || (feeAmount > 0 && marketAvgFee === 0)) {
            issues.push({
              type: 'excessive_fee',
              description: marketAvgFee === 0 
                ? `Charging £${feeAmount} fee when market standard is £0`
                : `Fee £${feeAmount} exceeds market average £${marketAvgFee}`,
              metric: `Fee: £${feeAmount} vs Market: £${marketAvgFee}`,
              severity: 'medium'
            });
          }

          // 3. Flag Legacy_Rate worse than New_Customer_Rate
          if (legacyRate > newCustomerRate) {
            issues.push({
              type: 'loyalty_penalty',
              description: `Existing customers pay higher rate (${legacyRate}%) than new customers (${newCustomerRate}%)`,
              metric: `Legacy: ${legacyRate}% vs New: ${newCustomerRate}%`,
              severity: 'high'
            });
          }

          // 4. Flag Rate_Change_Lag_Days > 90
          if (lagDays > 90) {
            issues.push({
              type: 'slow_response',
              description: `Rate change delayed ${lagDays} days after BoE base rate change`,
              metric: `Lag: ${lagDays} days`,
              severity: 'medium'
            });
          }

          // Only add products with issues
          if (issues.length > 0) {
            flagged.push({
              productId: product.Product_ID,
              productName: product.Product_Name,
              issues,
              fairValueFlag: product.Fair_Value_Flag
            });
          }
        });

        setFlaggedProducts(flagged);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Analysis failed');
      } finally {
        setLoading(false);
      }
      };

      analyzePriceValue();
    }
  }, [allDatasetsLoaded]);

  const getIssueIcon = (type: string) => {
    switch (type) {
      case 'overpriced': return <TrendingUp className="h-4 w-4" />;
      case 'excessive_fee': return <DollarSign className="h-4 w-4" />;
      case 'loyalty_penalty': return <AlertTriangle className="h-4 w-4" />;
      case 'slow_response': return <Clock className="h-4 w-4" />;
      default: return <AlertTriangle className="h-4 w-4" />;
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

  if (!allDatasetsLoaded) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Price & Value Analysis</h2>
            <p className="text-muted-foreground">
              Consumer Duty compliance analysis for pricing fairness and value proposition
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

  if (loading) return <div className="p-6">Loading Price & Value analysis...</div>;
  if (error) return <div className="p-6 text-destructive">Error: {error}</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Price & Value Analysis</h2>
          <p className="text-muted-foreground">
            Consumer Duty compliance analysis for pricing fairness and value proposition
          </p>
        </div>
        <Badge variant={flaggedProducts.some(p => p.issues.some(i => i.severity === 'high')) ? 'destructive' : 'secondary'}>
          {flaggedProducts.length} products flagged
        </Badge>
      </div>

      {flaggedProducts.length === 0 ? (
        <Alert>
          <AlertDescription>
            No pricing or value issues detected. All products appear to offer fair value to customers.
          </AlertDescription>
        </Alert>
      ) : (
        <div className="grid gap-6">
          {flaggedProducts.map((product) => (
            <Card key={product.productId} className="border-l-4 border-l-warning">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5 text-warning" />
                      {product.productName}
                    </CardTitle>
                    <CardDescription>Product ID: {product.productId}</CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={product.fairValueFlag === 'Yes' ? 'default' : 'destructive'}>
                      Fair Value: {product.fairValueFlag}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {product.issues.map((issue, index) => (
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
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}