import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { Phone, User, CreditCard, AlertTriangle, MessageSquare, Calendar } from 'lucide-react';
import { CustomerData, useVulnerability } from '@/contexts/VulnerabilityContext';

interface CustomerDetailsModalProps {
  customer: CustomerData;
  open: boolean;
  onClose: () => void;
}

export function CustomerDetailsModal({ customer, open, onClose }: CustomerDetailsModalProps) {
  const { timeSeriesData } = useVulnerability();
  const [chartData, setChartData] = useState<any[]>([]);

  // Trend-type markers that should show charts
  const trendMarkers = [
    'Income Drop', 'Credit Score Drop', 'Overdraft Use', 
    'High Card Spend', 'Missed Payments', 'Access Issues'
  ];

  // Event-type markers
  const eventMarkers = ['Life Event Disclosure', 'Product Refusal', 'Advocacy Request'];

  const isTrendType = trendMarkers.includes(customer['Vulnerability Marker']);
  const isEventType = eventMarkers.includes(customer['Vulnerability Marker']);

  useEffect(() => {
    if (isTrendType) {
      // Get time series data for this customer
      const customerTimeData = timeSeriesData
        .filter(d => d['Customer ID'] === customer['Customer ID'])
        .sort((a, b) => new Date(a.Month).getTime() - new Date(b.Month).getTime())
        .map(d => ({
          month: d.Month,
          value: d.Metric_Value,
          metric: d.Metric
        }));

      setChartData(customerTimeData);
    }
  }, [customer, timeSeriesData, isTrendType]);

  const getScoreBadgeVariant = (score: number) => {
    if (!score) return 'outline';
    if (score >= 90) return 'destructive';
    if (score >= 80) return 'destructive';
    if (score >= 70) return 'secondary';
    if (score >= 60) return 'secondary';
    return 'outline';
  };

  const recommendedApproach = [
    'Use a sympathetic tone',
    'Seek to understand the situation',
    'Offer support',
    'Recommend tools (payment plans, budgeting help, breathing space)'
  ];

  return (
    <Dialog open={open} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Customer Details - {customer['Customer ID']}
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Customer Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Customer Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Customer ID</label>
                  <p className="font-mono">{customer['Customer ID']}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Customer Name</label>
                  <p className="font-medium">{customer['Customer Name']}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Vulnerability Score</label>
                  <div className="mt-1">
                    {customer['Vulnerability Score'] ? (
                      <Badge variant={getScoreBadgeVariant(customer['Vulnerability Score'])}>
                        {customer['Vulnerability Score']}
                      </Badge>
                    ) : (
                      <span>—</span>
                    )}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Recommended Action</label>
                  <div className="flex items-center gap-2 mt-1">
                    <Phone className="h-4 w-4" />
                    <span>Telephone</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">Products Held</label>
                <p>{customer['Products Held'] || customer.Product}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">Vulnerability Marker</label>
                <div className="mt-1">
                  <Badge variant="outline" className="flex items-center gap-1 w-fit">
                    <AlertTriangle className="h-3 w-3" />
                    {customer['Vulnerability Marker']}
                  </Badge>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">Contact Details</label>
                <p className="text-muted-foreground italic">—</p>
              </div>

              {customer.Commentary && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Commentary</label>
                  <div className="bg-muted/50 rounded-md p-3 mt-1">
                    <div className="flex items-start gap-2">
                      <MessageSquare className="h-4 w-4 mt-0.5 text-muted-foreground" />
                      <p className="text-sm">{customer.Commentary}</p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recommended Approach */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Recommended Approach</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {recommendedApproach.map((item, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                    <span className="text-sm">{item}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Time Series Chart for Trend Markers */}
        {isTrendType && chartData.length > 0 && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                12-Month Trend Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="value" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={2}
                    dot={{ fill: 'hsl(var(--primary))' }}
                  />
                  <ReferenceLine 
                    x={customer['Trigger Month']} 
                    stroke="hsl(var(--destructive))" 
                    strokeDasharray="5 5"
                    label={{ value: "Trigger", position: "top" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* Event Timeline for Event Markers */}
        {isEventType && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Event Timeline
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center p-8">
                <div className="flex items-center gap-4">
                  <div className="w-4 h-4 rounded-full bg-muted" />
                  <div className="h-px bg-border flex-1 w-32" />
                  <div className="flex flex-col items-center">
                    <div className="w-4 h-4 rounded-full bg-destructive" />
                    <span className="text-sm font-medium mt-2">Event Triggered</span>
                    <span className="text-xs text-muted-foreground">{customer['Trigger Month']}</span>
                  </div>
                  <div className="h-px bg-border flex-1 w-32" />
                  <div className="w-4 h-4 rounded-full bg-muted" />
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </DialogContent>
    </Dialog>
  );
}