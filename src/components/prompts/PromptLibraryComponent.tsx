import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Plus, Edit, Trash2, Eye, GripVertical, Archive, Clock, Workflow } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface PromptVersion {
  version: number;
  text: string;
  timestamp: Date;
  user: string;
  reason: string;
}

interface Prompt {
  id: string;
  name: string;
  category: string;
  text: string;
  versions: PromptVersion[];
  lastModified: Date;
  lastModifiedBy: string;
  order: number;
}

const PROMPT_CATEGORIES = [
  'Data Ingestion Prompts',
  'Products & Services Analysis Prompts', 
  'Price & Value Analysis Prompts',
  'Consumer Understanding Analysis Prompts',
  'Consumer Support Analysis Prompts',
  'Vulnerable customers prompts',
  'Audit Report/Logs Prompts',
  'Prompt Library Management Prompts',
  'Prompt Log Management Prompts'
];

const STORAGE_KEY = 'prompt-library-data';

// Sortable prompt item component
function SortablePromptItem({ prompt, onEdit, onDelete, onPreview }: {
  prompt: Prompt;
  onEdit: (prompt: Prompt) => void;
  onDelete: (id: string) => void;
  onPreview: (prompt: Prompt) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: prompt.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-start gap-3 p-4 border rounded-lg bg-card"
    >
      <GripVertical 
        className="h-4 w-4 text-muted-foreground mt-1 cursor-grab" 
        {...attributes} 
        {...listeners}
      />
      <div className="flex-1">
        <div className="flex items-center justify-between mb-2">
          <h4 className="font-medium">{prompt.name}</h4>
          <div className="flex items-center gap-2">
            <Badge variant="outline">
              v{prompt.versions.length}
            </Badge>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onPreview(prompt)}
              >
                <Eye className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost" 
                size="sm"
                onClick={() => onEdit({ ...prompt })}
              >
                <Edit className="h-4 w-4" />
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Prompt</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete "{prompt.name}"? This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={() => onDelete(prompt.id)}>
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </div>
        <p className="text-sm text-muted-foreground line-clamp-2">
          {prompt.text}
        </p>
        <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
          <span>Modified: {prompt.lastModified.toLocaleDateString()}</span>
          <span>By: {prompt.lastModifiedBy}</span>
        </div>
      </div>
    </div>
  );
}

export function PromptLibraryComponent() {
  const { toast } = useToast();
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [editingPrompt, setEditingPrompt] = useState<Prompt | null>(null);
  const [previewPrompt, setPreviewPrompt] = useState<Prompt | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newPrompt, setNewPrompt] = useState({
    name: '',
    category: '',
    text: ''
  });

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    loadPrompts();
  }, []);

  // Save to localStorage whenever prompts change
  useEffect(() => {
    if (prompts.length > 0) {
      const serializedPrompts = prompts.map(prompt => ({
        ...prompt,
        lastModified: prompt.lastModified.toISOString(),
        versions: prompt.versions.map(v => ({
          ...v,
          timestamp: v.timestamp.toISOString()
        }))
      }));
      localStorage.setItem(STORAGE_KEY, JSON.stringify(serializedPrompts));
    }
  }, [prompts]);

  const loadPrompts = () => {
    // Try to load from localStorage first
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsedPrompts = JSON.parse(stored).map((prompt: any) => ({
          ...prompt,
          lastModified: new Date(prompt.lastModified),
          versions: prompt.versions.map((v: any) => ({
            ...v,
            timestamp: new Date(v.timestamp)
          }))
        }));
        setPrompts(parsedPrompts);
        return;
      } catch (error) {
        console.error('Failed to load prompts from storage:', error);
      }
    }

    // Sample prompts with all required categories
    const samplePrompts: Prompt[] = [
      // Data Ingestion Prompts
      {
        id: 'p1',
        name: 'Master Data Ingestion Control',
        category: 'Data Ingestion Prompts',
        text: 'Load the following datasets into memory: ProductPerformance.csv as ProductData, PriceValue.csv as PricingData, ConsumerUnderstanding.csv as CommData, ConsumerSupport.csv as SupportData. When all datasets have been loaded without any problem, display a message that datasets have been loaded successfully. Validate data integrity and report any missing or corrupted files.',
        versions: [
          {
            version: 1,
            text: 'Load the following datasets into memory: ProductPerformance.csv as ProductData, PriceValue.csv as PricingData, ConsumerUnderstanding.csv as CommData, ConsumerSupport.csv as SupportData. When all datasets have been loaded without any problem, display a message that datasets have been loaded successfully. Validate data integrity and report any missing or corrupted files.',
            timestamp: new Date('2024-01-10T10:00:00'),
            user: 'System Admin',
            reason: 'Initial prompt creation'
          }
        ],
        lastModified: new Date('2024-01-10T10:00:00'),
        lastModifiedBy: 'System Admin',
        order: 1
      },
      {
        id: 'p2',
        name: 'Dataset Validation Guardrail',
        category: 'Data Ingestion Prompts',
        text: 'Before processing any analysis requests, verify that all required datasets (ProductPerformance.csv, PriceValue.csv, ConsumerUnderstanding.csv, ConsumerSupport.csv) are loaded and contain valid data. If any dataset is missing or corrupted, halt processing and display: "Analysis cannot proceed - missing or invalid datasets detected. Please reload data files."',
        versions: [
          {
            version: 1,
            text: 'Before processing any analysis requests, verify that all required datasets (ProductPerformance.csv, PriceValue.csv, ConsumerUnderstanding.csv, ConsumerSupport.csv) are loaded and contain valid data. If any dataset is missing or corrupted, halt processing and display: "Analysis cannot proceed - missing or invalid datasets detected. Please reload data files."',
            timestamp: new Date('2024-01-10T10:15:00'),
            user: 'System Admin',
            reason: 'Data validation requirement'
          }
        ],
        lastModified: new Date('2024-01-10T10:15:00'),
        lastModifiedBy: 'System Admin',
        order: 2
      },

      // Products & Services Analysis Prompts
      {
        id: 'p3',
        name: 'Products & Services Core Analysis',
        category: 'Products & Services Analysis Prompts',
        text: 'Analyze the Products & Services outcome using ProductData. For each product: 1. Compare Actual_Customer_Profile vs Target_Market_Profile. Flag any mismatch as potential mis-selling. 2. Flag Early_Closure_Rate > 10% as potential mis-sale or dissatisfaction. 3. Flag Complaint_Count > 5 as customer satisfaction issue. 4. If Vulnerable_Customer_proportion > 10% and any issue is found, highlight as CRITICAL. Display findings in structured format with recommendations.',
        versions: [
          {
            version: 1,
            text: 'Analyze the Products & Services outcome using ProductData. For each product: 1. Compare Actual_Customer_Profile vs Target_Market_Profile. Flag any mismatch as potential mis-selling. 2. Flag Early_Closure_Rate > 10% as potential mis-sale or dissatisfaction. 3. Flag Complaint_Count > 5 as customer satisfaction issue. 4. If Vulnerable_Customer_proportion > 10% and any issue is found, highlight as CRITICAL. Display findings in structured format with recommendations.',
            timestamp: new Date('2024-01-10T11:00:00'),
            user: 'Compliance Team',
            reason: 'Initial analysis framework'
          }
        ],
        lastModified: new Date('2024-01-10T11:00:00'),
        lastModifiedBy: 'Compliance Team',
        order: 1
      },

      // Price & Value Analysis Prompts
      {
        id: 'p4',
        name: 'Price & Value Assessment',
        category: 'Price & Value Analysis Prompts',
        text: 'Analyze pricing fairness using PricingData. For each product: 1. Compare Price_vs_Market against industry benchmarks. Flag deviations >15% as potential overpricing. 2. Assess Value_Score against customer satisfaction metrics. 3. Review complaint patterns related to pricing concerns. 4. Calculate value-for-money ratio and identify products with poor value perception.',
        versions: [
          {
            version: 1,
            text: 'Analyze pricing fairness using PricingData. For each product: 1. Compare Price_vs_Market against industry benchmarks. Flag deviations >15% as potential overpricing. 2. Assess Value_Score against customer satisfaction metrics. 3. Review complaint patterns related to pricing concerns. 4. Calculate value-for-money ratio and identify products with poor value perception.',
            timestamp: new Date('2024-01-10T11:30:00'),
            user: 'Pricing Team',
            reason: 'Value assessment framework'
          }
        ],
        lastModified: new Date('2024-01-10T11:30:00'),
        lastModifiedBy: 'Pricing Team',
        order: 1
      },

      // Consumer Understanding Analysis Prompts
      {
        id: 'p5',
        name: 'Consumer Understanding Evaluation',
        category: 'Consumer Understanding Analysis Prompts',
        text: 'Evaluate consumer comprehension using CommData. Analyze: 1. Communication_Clarity_Score for each product touchpoint. 2. Customer_Comprehension_Rate and flag products with <80% understanding. 3. Complaint_Types related to confusion or misunderstanding. 4. Cross-reference with vulnerable customer data to ensure appropriate communication methods are used.',
        versions: [
          {
            version: 1,
            text: 'Evaluate consumer comprehension using CommData. Analyze: 1. Communication_Clarity_Score for each product touchpoint. 2. Customer_Comprehension_Rate and flag products with <80% understanding. 3. Complaint_Types related to confusion or misunderstanding. 4. Cross-reference with vulnerable customer data to ensure appropriate communication methods are used.',
            timestamp: new Date('2024-01-10T12:00:00'),
            user: 'Customer Experience Team',
            reason: 'Communication assessment framework'
          }
        ],
        lastModified: new Date('2024-01-10T12:00:00'),
        lastModifiedBy: 'Customer Experience Team',
        order: 1
      },

      // Consumer Support Analysis Prompts
      {
        id: 'p6',
        name: 'Consumer Support Quality Analysis',
        category: 'Consumer Support Analysis Prompts',
        text: 'Assess support effectiveness using SupportData. Evaluate: 1. Response_Time_Average and flag if >24 hours for priority issues. 2. Resolution_Rate and highlight channels with <85% success rate. 3. Customer_Satisfaction_Score post-support interaction. 4. Identify support gaps for vulnerable customers and escalation patterns.',
        versions: [
          {
            version: 1,
            text: 'Assess support effectiveness using SupportData. Evaluate: 1. Response_Time_Average and flag if >24 hours for priority issues. 2. Resolution_Rate and highlight channels with <85% success rate. 3. Customer_Satisfaction_Score post-support interaction. 4. Identify support gaps for vulnerable customers and escalation patterns.',
            timestamp: new Date('2024-01-10T12:30:00'),
            user: 'Support Team',
            reason: 'Support quality framework'
          }
        ],
        lastModified: new Date('2024-01-10T12:30:00'),
        lastModifiedBy: 'Support Team',
        order: 1
      },

      // Audit Report/Logs Prompts
      {
        id: 'p7',
        name: 'Audit Dataset Load Guardrail',
        category: 'Audit Report/Logs Prompts',
        text: 'Before generating or displaying any audit logs, audit trails, or audit reports, always check if all required datasets (ProductPerformance.csv, PriceValue.csv, ConsumerUnderstanding.csv, ConsumerSupport.csv) have been successfully loaded into memory. If any dataset is missing or not loaded, do not create or display audit logs, trails, or reports. Instead, display: "Audit features are unavailable until all datasets are loaded. Please load all required datasets to proceed." Only enable audit features after confirming that all datasets are loaded without errors.',
        versions: [
          {
            version: 1,
            text: 'Before generating or displaying any audit logs, audit trails, or audit reports, always check if all required datasets (ProductPerformance.csv, PriceValue.csv, ConsumerUnderstanding.csv, ConsumerSupport.csv) have been successfully loaded into memory. If any dataset is missing or not loaded, do not create or display audit logs, trails, or reports. Instead, display: "Audit features are unavailable until all datasets are loaded. Please load all required datasets to proceed." Only enable audit features after confirming that all datasets are loaded without errors.',
            timestamp: new Date('2024-01-10T13:00:00'),
            user: 'Audit Team',
            reason: 'Audit prerequisite control'
          }
        ],
        lastModified: new Date('2024-01-10T13:00:00'),
        lastModifiedBy: 'Audit Team',
        order: 1
      },

      // Prompt Library Management Prompts
      {
        id: 'p8',
        name: 'Prompt Version Control',
        category: 'Prompt Library Management Prompts',
        text: 'When managing prompt modifications: 1. Always create a new version rather than overwriting existing prompts. 2. Record timestamp, user, and reason for each change. 3. Maintain version history for audit purposes. 4. Allow rollback to previous versions if needed. 5. Validate prompt syntax before saving changes.',
        versions: [
          {
            version: 1,
            text: 'When managing prompt modifications: 1. Always create a new version rather than overwriting existing prompts. 2. Record timestamp, user, and reason for each change. 3. Maintain version history for audit purposes. 4. Allow rollback to previous versions if needed. 5. Validate prompt syntax before saving changes.',
            timestamp: new Date('2024-01-10T13:30:00'),
            user: 'System Admin',
            reason: 'Version control policy'
          }
        ],
        lastModified: new Date('2024-01-10T13:30:00'),
        lastModifiedBy: 'System Admin',
        order: 1
      },

      // Prompt Log Management Prompts
      {
        id: 'p9',
        name: 'Prompt Execution Logging',
        category: 'Prompt Log Management Prompts',
        text: 'Log all prompt executions with: 1. Timestamp of execution. 2. Prompt ID and version used. 3. Input data context. 4. Output generated. 5. Execution duration. 6. Any errors or warnings. 7. User who triggered the execution. Maintain logs for compliance audit trail and performance monitoring.',
        versions: [
          {
            version: 1,
            text: 'Log all prompt executions with: 1. Timestamp of execution. 2. Prompt ID and version used. 3. Input data context. 4. Output generated. 5. Execution duration. 6. Any errors or warnings. 7. User who triggered the execution. Maintain logs for compliance audit trail and performance monitoring.',
            timestamp: new Date('2024-01-10T14:00:00'),
            user: 'System Admin',
            reason: 'Logging requirement specification'
          }
        ],
        lastModified: new Date('2024-01-10T14:00:00'),
        lastModifiedBy: 'System Admin',
        order: 1
      }
    ];
    
    setPrompts(samplePrompts);
  };

  const handleAddPrompt = () => {
    if (!newPrompt.name || !newPrompt.category || !newPrompt.text) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    const categoryPrompts = prompts.filter(p => p.category === newPrompt.category);
    const maxOrder = categoryPrompts.length > 0 
      ? Math.max(...categoryPrompts.map(p => p.order)) 
      : 0;

    const prompt: Prompt = {
      id: `p${Date.now()}`,
      name: newPrompt.name,
      category: newPrompt.category,
      text: newPrompt.text,
      versions: [
        {
          version: 1,
          text: newPrompt.text,
          timestamp: new Date(),
          user: 'Current User',
          reason: 'Initial creation'
        }
      ],
      lastModified: new Date(),
      lastModifiedBy: 'Current User',
      order: maxOrder + 1
    };

    setPrompts(prev => [...prev, prompt]);
    setNewPrompt({ name: '', category: '', text: '' });
    setIsAddDialogOpen(false);
    
    toast({
      title: "Prompt Added",
      description: `"${prompt.name}" has been added to the library.`,
    });
  };

  const handleEditPrompt = (originalPrompt: Prompt) => {
    if (!editingPrompt) return;

    const newVersion: PromptVersion = {
      version: originalPrompt.versions.length + 1,
      text: editingPrompt.text,
      timestamp: new Date(),
      user: 'Current User',
      reason: 'Manual edit'
    };

    const updatedPrompt = {
      ...originalPrompt,
      name: editingPrompt.name,
      category: editingPrompt.category,
      text: editingPrompt.text,
      versions: [...originalPrompt.versions, newVersion],
      lastModified: new Date(),
      lastModifiedBy: 'Current User'
    };

    setPrompts(prev => prev.map(p => p.id === originalPrompt.id ? updatedPrompt : p));
    setEditingPrompt(null);
    
    toast({
      title: "Prompt Updated",
      description: `"${updatedPrompt.name}" has been updated to version ${newVersion.version}.`,
    });
  };

  const handleDeletePrompt = (promptId: string) => {
    const deletedPrompt = prompts.find(p => p.id === promptId);
    setPrompts(prev => prev.filter(p => p.id !== promptId));
    
    toast({
      title: "Prompt Deleted",
      description: `"${deletedPrompt?.name}" has been removed from the library.`,
    });
  };

  const handleDragEnd = (event: any) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      const activePrompt = prompts.find(p => p.id === active.id);
      const overPrompt = prompts.find(p => p.id === over.id);
      
      if (activePrompt && overPrompt && activePrompt.category === overPrompt.category) {
        const categoryPrompts = prompts.filter(p => p.category === activePrompt.category);
        const oldIndex = categoryPrompts.findIndex(p => p.id === active.id);
        const newIndex = categoryPrompts.findIndex(p => p.id === over.id);
        
        const reorderedCategoryPrompts = arrayMove(categoryPrompts, oldIndex, newIndex);
        
        // Update order values
        const updatedPrompts = reorderedCategoryPrompts.map((prompt, index) => ({
          ...prompt,
          order: index + 1
        }));
        
        // Replace prompts in the main array
        setPrompts(prev => [
          ...prev.filter(p => p.category !== activePrompt.category),
          ...updatedPrompts
        ]);
      }
    }
  };

  const groupedPrompts = prompts.reduce((acc, prompt) => {
    if (!acc[prompt.category]) {
      acc[prompt.category] = [];
    }
    acc[prompt.category].push(prompt);
    return acc;
  }, {} as Record<string, Prompt[]>);

  // Sort prompts within each category by order
  Object.keys(groupedPrompts).forEach(category => {
    groupedPrompts[category].sort((a, b) => a.order - b.order);
  });

  const getWorkflowContext = (category: string) => {
    const contexts: Record<string, string> = {
      'Data Ingestion Prompts': 'Executed at system startup and when data refresh is requested. Critical for ensuring data availability before any analysis.',
      'Products & Services Analysis Prompts': 'Triggered when analyzing product performance and customer outcomes. Part of the core Consumer Duty assessment workflow.',
      'Price & Value Analysis Prompts': 'Activated during pricing fairness evaluations and value assessment reviews. Ensures competitive pricing analysis.',
      'Consumer Understanding Analysis Prompts': 'Used when evaluating communication effectiveness and customer comprehension rates. Key for regulatory compliance.',
      'Consumer Support Analysis Prompts': 'Executed during support quality assessments and customer satisfaction reviews. Critical for service improvement.',
      'Audit Report/Logs Prompts': 'Applied before generating any audit documentation. Ensures data integrity and compliance with audit requirements.',
      'Prompt Library Management Prompts': 'Used during prompt modification and version control operations. Maintains system integrity and change tracking.',
      'Prompt Log Management Prompts': 'Activated during system logging and audit trail generation. Essential for compliance monitoring and system debugging.'
    };
    return contexts[category] || 'General system prompt used across various workflows.';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Prompt Library</h2>
          <p className="text-muted-foreground">
            Manage and version control all master prompts used for compliance analysis
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add Prompt
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add New Prompt</DialogTitle>
              <DialogDescription>
                Create a new prompt for the compliance analysis system
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Name</label>
                  <Input
                    value={newPrompt.name}
                    onChange={(e) => setNewPrompt(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Prompt name"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Category</label>
                  <Select value={newPrompt.category} onValueChange={(value) => setNewPrompt(prev => ({ ...prev, category: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {PROMPT_CATEGORIES.map(category => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Prompt Text</label>
                <Textarea
                  value={newPrompt.text}
                  onChange={(e) => setNewPrompt(prev => ({ ...prev, text: e.target.value }))}
                  placeholder="Enter the prompt text..."
                  rows={8}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddPrompt}>
                Add Prompt
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Grouped Prompts */}
      <div className="space-y-6">
        {PROMPT_CATEGORIES.map(category => {
          const categoryPrompts = groupedPrompts[category] || [];
          
          return (
            <Card key={category}>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  {category}
                  <Badge variant="secondary">{categoryPrompts.length}</Badge>
                </CardTitle>
                <CardDescription>
                  {getWorkflowContext(category)}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {categoryPrompts.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Archive className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>No prompts in this category yet</p>
                    <p className="text-sm">Add a new prompt to get started</p>
                  </div>
                ) : (
                  <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                  >
                    <SortableContext
                      items={categoryPrompts.map(p => p.id)}
                      strategy={verticalListSortingStrategy}
                    >
                      <div className="space-y-4">
                        {categoryPrompts.map((prompt) => (
                          <SortablePromptItem
                            key={prompt.id}
                            prompt={prompt}
                            onEdit={setEditingPrompt}
                            onDelete={handleDeletePrompt}
                            onPreview={setPreviewPrompt}
                          />
                        ))}
                      </div>
                    </SortableContext>
                  </DndContext>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Preview Dialog */}
      <Dialog open={!!previewPrompt} onOpenChange={() => setPreviewPrompt(null)}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Workflow className="h-5 w-5" />
              {previewPrompt?.name}
            </DialogTitle>
            <DialogDescription>
              Preview how this prompt will be used in the agent workflow
            </DialogDescription>
          </DialogHeader>
          <Tabs defaultValue="current" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="current">Current Version</TabsTrigger>
              <TabsTrigger value="workflow">Workflow Context</TabsTrigger>
              <TabsTrigger value="history">Version History</TabsTrigger>
            </TabsList>
            <TabsContent value="current" className="space-y-4">
              <div className="p-4 bg-muted/50 rounded-lg">
                <h4 className="font-medium mb-2">Prompt Text</h4>
                <p className="text-sm whitespace-pre-wrap">{previewPrompt?.text}</p>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Category:</span> {previewPrompt?.category}
                </div>
                <div>
                  <span className="font-medium">Version:</span> {previewPrompt?.versions.length}
                </div>
                <div>
                  <span className="font-medium">Last Modified:</span> {previewPrompt?.lastModified.toLocaleDateString()}
                </div>
                <div>
                  <span className="font-medium">Modified By:</span> {previewPrompt?.lastModifiedBy}
                </div>
              </div>
            </TabsContent>
            <TabsContent value="workflow" className="space-y-4">
              <div className="p-4 bg-accent/20 rounded-lg">
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <Workflow className="h-4 w-4" />
                  Workflow Context
                </h4>
                <p className="text-sm text-muted-foreground mb-4">
                  {previewPrompt ? getWorkflowContext(previewPrompt.category) : ''}
                </p>
                <div className="space-y-2">
                  <h5 className="font-medium text-sm">Execution Trigger:</h5>
                  <p className="text-sm text-muted-foreground">
                    This prompt is executed when the system processes {previewPrompt?.category.toLowerCase()} tasks.
                  </p>
                  <h5 className="font-medium text-sm mt-3">Expected Impact:</h5>
                  <p className="text-sm text-muted-foreground">
                    The agent will use this prompt to guide its analysis and ensure consistent compliance monitoring 
                    according to Consumer Duty requirements.
                  </p>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="history" className="space-y-4">
              <div className="space-y-3">
                {previewPrompt?.versions.reverse().map((version) => (
                  <div key={version.version} className="p-3 bg-muted/30 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant="outline">Version {version.version}</Badge>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {version.timestamp.toLocaleString()}
                      </div>
                    </div>
                    <p className="text-sm mb-2">{version.reason}</p>
                    <p className="text-xs text-muted-foreground">By: {version.user}</p>
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPreviewPrompt(null)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={!!editingPrompt} onOpenChange={() => setEditingPrompt(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Prompt</DialogTitle>
            <DialogDescription>
              Modify the prompt. Changes will be saved as a new version.
            </DialogDescription>
          </DialogHeader>
          {editingPrompt && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Name</label>
                  <Input
                    value={editingPrompt.name}
                    onChange={(e) => setEditingPrompt(prev => prev ? { ...prev, name: e.target.value } : null)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Category</label>
                  <Select 
                    value={editingPrompt.category} 
                    onValueChange={(value) => setEditingPrompt(prev => prev ? { ...prev, category: value } : null)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PROMPT_CATEGORIES.map(category => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Prompt Text</label>
                <Textarea
                  value={editingPrompt.text}
                  onChange={(e) => setEditingPrompt(prev => prev ? { ...prev, text: e.target.value } : null)}
                  rows={8}
                />
              </div>
              <div className="p-3 bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  <strong>Note:</strong> This will create version {editingPrompt.versions.length + 1} of this prompt.
                  Previous versions will be preserved for audit purposes.
                </p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingPrompt(null)}>
              Cancel
            </Button>
            <Button onClick={() => editingPrompt && handleEditPrompt(prompts.find(p => p.id === editingPrompt.id)!)}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}