import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Clock, User, Edit, Plus, Trash2, Download, Search } from "lucide-react";
import { format } from "date-fns";

interface PromptChange {
  id: string;
  promptName: string;
  category: string;
  changeType: 'added' | 'edited' | 'deleted';
  oldText?: string;
  newText?: string;
  user: string;
  timestamp: Date;
  reason: string;
}

export function PromptLogComponent() {
  const [promptChanges, setPromptChanges] = useState<PromptChange[]>([]);
  const [filteredChanges, setFilteredChanges] = useState<PromptChange[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedChangeType, setSelectedChangeType] = useState<string>('all');
  const [selectedUser, setSelectedUser] = useState<string>('all');
  const [fromDate, setFromDate] = useState<string>('');
  const [toDate, setToDate] = useState<string>('');

  const categories = [
    'Data Ingestion Prompts',
    'Outcome-based Analysis Prompts',
    'Audit Report/Logs Prompts',
    'System-Level Guardrail Prompts',
    'Custom Prompts'
  ];

  const changeTypes = ['added', 'edited', 'deleted'];
  const users = ['System Admin', 'Compliance Team', 'Current User', 'Sarah Johnson', 'Mike Chen'];

  useEffect(() => {
    loadPromptChanges();
  }, []);

  useEffect(() => {
    filterChanges();
  }, [promptChanges, searchQuery, selectedCategory, selectedChangeType, selectedUser, fromDate, toDate]);

  const loadPromptChanges = () => {
    // Sample prompt change history
    const sampleChanges: PromptChange[] = [
      {
        id: 'pc1',
        promptName: 'Data Ingestion Control',
        category: 'Data Ingestion Prompts',
        changeType: 'added',
        newText: 'Load the following datasets into memory: ProductPerformance.csv as ProductData, PriceValue.csv as PricingData, ConsumerUnderstanding.csv as CommData, ConsumerSupport.csv as SupportData. When all datasets have been loaded without any problem, display a message that datasets have been loaded successfully.',
        user: 'System Admin',
        timestamp: new Date('2024-01-10T10:00:00'),
        reason: 'Initial prompt creation for data loading workflow'
      },
      {
        id: 'pc2',
        promptName: 'Products & Services Analysis',
        category: 'Outcome-based Analysis Prompts',
        changeType: 'added',
        newText: 'Analyze the Products & Services outcome using ProductData. For each product: 1. Compare Actual_Customer_Profile vs Target_Market_Profile. Flag any mismatch. 2. Flag Early_Closure_Rate > 10% as a potential mis-sale or dissatisfaction. 3. Flag Complaint_Count > 5 as a customer satisfaction issue. 4. If Vulnerable_Customer_proportion > 10% and any issue is found, highlight it as critical.',
        user: 'Compliance Team',
        timestamp: new Date('2024-01-10T11:00:00'),
        reason: 'Initial analysis framework for products and services compliance'
      },
      {
        id: 'pc3',
        promptName: 'Products & Services Analysis',
        category: 'Outcome-based Analysis Prompts',
        changeType: 'edited',
        oldText: 'Analyze the Products & Services outcome using ProductData. For each product: 1. Compare Actual_Customer_Profile vs Target_Market_Profile. Flag any mismatch. 2. Flag Early_Closure_Rate > 10% as a potential mis-sale or dissatisfaction. 3. Flag Complaint_Count > 5 as a customer satisfaction issue. 4. If Vulnerable_Customer_proportion > 10% and any issue is found, highlight it as critical.',
        newText: 'Analyze the Products & Services outcome using ProductData. For each product: 1. Compare Actual_Customer_Profile vs Target_Market_Profile. Flag any mismatch as HIGH priority. 2. Flag Early_Closure_Rate > 8% as a potential mis-sale or dissatisfaction. 3. Flag Complaint_Count > 3 as a customer satisfaction issue. 4. If Vulnerable_Customer_proportion > 10% and any issue is found, highlight it as CRITICAL.',
        user: 'Sarah Johnson',
        timestamp: new Date('2024-01-15T14:30:00'),
        reason: 'Adjusted thresholds based on initial analysis results and regulatory feedback'
      },
      {
        id: 'pc4',
        promptName: 'Price Analysis Rules',
        category: 'Custom Prompts',
        changeType: 'added',
        newText: 'For price analysis, ensure all comparisons use the most recent market data available. Flag products where our rates exceed market rates by more than 0.3% for immediate review.',
        user: 'Mike Chen',
        timestamp: new Date('2024-01-16T09:15:00'),
        reason: 'Added specialized prompt for enhanced price monitoring'
      },
      {
        id: 'pc5',
        promptName: 'Legacy Rate Check',
        category: 'Custom Prompts',
        changeType: 'deleted',
        oldText: 'Check legacy rates against new customer rates monthly.',
        user: 'Current User',
        timestamp: new Date('2024-01-17T16:20:00'),
        reason: 'Functionality moved to main price analysis workflow'
      }
    ];
    
    setPromptChanges(sampleChanges);
  };

  const filterChanges = () => {
    let filtered = promptChanges;

    // Text search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(change =>
        change.promptName.toLowerCase().includes(query) ||
        change.category.toLowerCase().includes(query) ||
        change.user.toLowerCase().includes(query) ||
        change.reason.toLowerCase().includes(query) ||
        change.newText?.toLowerCase().includes(query) ||
        change.oldText?.toLowerCase().includes(query)
      );
    }

    // Category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(change => change.category === selectedCategory);
    }

    // Change type filter
    if (selectedChangeType !== 'all') {
      filtered = filtered.filter(change => change.changeType === selectedChangeType);
    }

    // User filter
    if (selectedUser !== 'all') {
      filtered = filtered.filter(change => change.user === selectedUser);
    }

    // Date filters
    if (fromDate) {
      filtered = filtered.filter(change => change.timestamp >= new Date(fromDate));
    }

    if (toDate) {
      filtered = filtered.filter(change => change.timestamp <= new Date(toDate + 'T23:59:59'));
    }

    setFilteredChanges(filtered.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()));
  };

  const exportChanges = () => {
    const csvContent = [
      ['Timestamp', 'Prompt Name', 'Category', 'Change Type', 'User', 'Reason'],
      ...filteredChanges.map(change => [
        format(change.timestamp, 'yyyy-MM-dd HH:mm:ss'),
        change.promptName,
        change.category,
        change.changeType,
        change.user,
        change.reason
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `prompt-changes-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getChangeTypeIcon = (type: string) => {
    switch (type) {
      case 'added': return <Plus className="h-4 w-4 text-green-600" />;
      case 'edited': return <Edit className="h-4 w-4 text-blue-600" />;
      case 'deleted': return <Trash2 className="h-4 w-4 text-red-600" />;
      default: return <Edit className="h-4 w-4" />;
    }
  };

  const getChangeTypeColor = (type: string) => {
    switch (type) {
      case 'added': return 'default';
      case 'edited': return 'secondary';
      case 'deleted': return 'destructive';
      default: return 'outline';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Prompt Change Log</h2>
          <p className="text-muted-foreground">
            Complete history of all prompt modifications, additions, and deletions
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline">
            {filteredChanges.length} changes
          </Badge>
          <Button variant="outline" onClick={exportChanges} className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filters</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search prompt names, users, reasons, or content..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-background"
              />
            </div>
          </div>

          {/* Filter Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Category</label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="bg-background">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent className="bg-background border shadow-lg z-50">
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Change Type</label>
              <Select value={selectedChangeType} onValueChange={setSelectedChangeType}>
                <SelectTrigger className="bg-background">
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent className="bg-background border shadow-lg z-50">
                  <SelectItem value="all">All Types</SelectItem>
                  {changeTypes.map(type => (
                    <SelectItem key={type} value={type}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">User</label>
              <Select value={selectedUser} onValueChange={setSelectedUser}>
                <SelectTrigger className="bg-background">
                  <SelectValue placeholder="All Users" />
                </SelectTrigger>
                <SelectContent className="bg-background border shadow-lg z-50">
                  <SelectItem value="all">All Users</SelectItem>
                  {users.map(user => (
                    <SelectItem key={user} value={user}>
                      {user}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Date Range</label>
              <div className="flex gap-2">
                <Input
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  className="bg-background"
                  placeholder="From"
                />
                <Input
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  className="bg-background"
                  placeholder="To"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Change Log Entries */}
      <div className="space-y-4">
        {filteredChanges.map((change) => (
          <Card key={change.id} className="border-l-4 border-l-primary">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <CardTitle className="text-base">
                      {format(change.timestamp, 'yyyy-MM-dd HH:mm')} - {change.promptName}
                    </CardTitle>
                    <CardDescription>
                      {change.category}
                    </CardDescription>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={getChangeTypeColor(change.changeType)} className="flex items-center gap-1">
                    {getChangeTypeIcon(change.changeType)}
                    {change.changeType.toUpperCase()}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* User and Reason */}
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <span className="font-medium">{change.user}</span>
                </div>
                <div className="flex-1">
                  <span className="text-muted-foreground">Reason: </span>
                  {change.reason}
                </div>
              </div>

              {/* Old Text (for edits and deletes) */}
              {change.oldText && (
                <div className="p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <h4 className="font-medium text-sm mb-2 text-red-800 dark:text-red-200">
                    {change.changeType === 'edited' ? 'Previous Version' : 'Deleted Content'}
                  </h4>
                  <p className="text-sm font-mono text-red-700 dark:text-red-300 whitespace-pre-wrap">
                    {change.oldText}
                  </p>
                </div>
              )}

              {/* New Text (for additions and edits) */}
              {change.newText && (
                <div className="p-3 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg">
                  <h4 className="font-medium text-sm mb-2 text-green-800 dark:text-green-200">
                    {change.changeType === 'edited' ? 'New Version' : 'Added Content'}
                  </h4>
                  <p className="text-sm font-mono text-green-700 dark:text-green-300 whitespace-pre-wrap">
                    {change.newText}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredChanges.length === 0 && (
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground">
              No prompt changes found matching the selected filters.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}