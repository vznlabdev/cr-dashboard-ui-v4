
"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { InviteMemberDialog } from "@/components/cr";
import { AddAIToolModal } from "@/components/AddAIToolModal";
import { EditAIToolModal } from "@/components/EditAIToolModal";
import { ImportToolTemplatesModal } from "@/components/ImportToolTemplatesModal";
import { ToolUsageAnalyticsModal } from "@/components/ToolUsageAnalyticsModal";
import { ProjectToolRestrictionsModal } from "@/components/ProjectToolRestrictionsModal";
import { useState } from "react";
import { PageContainer } from "@/components/layout/PageContainer";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Shield,
  Users,
  FileText,
  AlertTriangle,
  Plus,
  UserPlus,
  Plug,
  Copy,
  FileDown,
  Search,
  CheckSquare,
  X as XIcon,
} from "lucide-react";

// Mock data
const teamMembers: Array<{
  name: string;
  email: string;
  initials: string;
  role: string;
  roleVariant: "default" | "secondary" | "outline" | "destructive";
}> = [
  {
    name: "Sarah Johnson",
    email: "sarah@company.com",
    initials: "SJ",
    role: "Company Admin",
    roleVariant: "default",
  },
  {
    name: "Michael Chen",
    email: "michael@company.com",
    initials: "MC",
    role: "Legal Reviewer",
    roleVariant: "secondary",
  },
  {
    name: "Emma Davis",
    email: "emma@company.com",
    initials: "ED",
    role: "Insurance Analyst",
    roleVariant: "secondary",
  },
  {
    name: "James Wilson",
    email: "james@company.com",
    initials: "JW",
    role: "Content Creator",
    roleVariant: "outline",
  },
];

const talentAgreements: Array<{
  name: string;
  type: string;
  status: string;
  statusVariant: "default" | "secondary" | "outline" | "destructive";
  expires: string;
}> = [
  {
    name: "John Doe (Voice Actor)",
    type: "Voice Licensing Agreement",
    status: "Active",
    statusVariant: "default",
    expires: "Expires Dec 2025",
  },
  {
    name: "Jane Smith (Model)",
    type: "Likeness Rights Agreement",
    status: "Active",
    statusVariant: "default",
    expires: "Expires Mar 2026",
  },
  {
    name: "Alex Brown (Composer)",
    type: "Music Rights Agreement",
    status: "Expiring Soon",
    statusVariant: "destructive",
    expires: "Expires Jan 2025",
  },
  {
    name: "Maria Garcia (Narrator)",
    type: "Voice Licensing Agreement",
    status: "Pending Renewal",
    statusVariant: "secondary",
    expires: "Expired Nov 2024",
  },
];

const aiToolsWhitelist: Array<{
  id: string;
  name: string;
  icon: string;
  category: string;
  baseUrl: string;
  status: "Approved" | "Under Review" | "Pending Approval" | "Archived";
  statusVariant: "default" | "secondary" | "outline" | "destructive";
  trackingLevel: "Full Tracking" | "Good Tracking" | "Basic Tracking";
  trackingVariant: "default" | "secondary" | "outline";
  approved: boolean;
  active: boolean;
  projectCount?: number;
  taskCount?: number;
  lastUsed?: string;
  createdAt: string;
  createdBy: string;
  description?: string;
  projectAvailability: "all" | "restricted";
  selectedProjects?: string[];
}> = [
  {
    id: "1",
    name: "Midjourney",
    icon: "🎨",
    category: "Image Generation",
    baseUrl: "https://midjourney.com",
    status: "Approved",
    statusVariant: "default",
    trackingLevel: "Full Tracking",
    trackingVariant: "default",
    approved: true,
    active: true,
    projectCount: 24,
    taskCount: 187,
    lastUsed: "2h ago",
    createdAt: "Jan 15, 2026",
    createdBy: "Sarah Chen",
    description: "AI image generation tool",
    projectAvailability: "all",
  },
  {
    id: "2",
    name: "ChatGPT",
    icon: "💬",
    category: "Text Generation",
    baseUrl: "https://chat.openai.com",
    status: "Approved",
    statusVariant: "default",
    trackingLevel: "Full Tracking",
    trackingVariant: "default",
    approved: true,
    active: true,
    projectCount: 18,
    taskCount: 243,
    lastUsed: "1h ago",
    createdAt: "Jan 10, 2026",
    createdBy: "Michael Chen",
    description: "Large language model for text generation",
    projectAvailability: "all",
  },
  {
    id: "3",
    name: "ElevenLabs",
    icon: "🎙️",
    category: "Audio Generation",
    baseUrl: "https://elevenlabs.io",
    status: "Approved",
    statusVariant: "default",
    trackingLevel: "Good Tracking",
    trackingVariant: "secondary",
    approved: true,
    active: true,
    projectCount: 8,
    taskCount: 45,
    lastUsed: "5h ago",
    createdAt: "Jan 8, 2026",
    createdBy: "Emma Davis",
    description: "AI voice synthesis and cloning",
    projectAvailability: "all",
  },
  {
    id: "4",
    name: "Runway",
    icon: "🎬",
    category: "Video Generation",
    baseUrl: "https://runwayml.com",
    status: "Approved",
    statusVariant: "default",
    trackingLevel: "Good Tracking",
    trackingVariant: "secondary",
    approved: true,
    active: true,
    projectCount: 12,
    taskCount: 156,
    lastUsed: "3h ago",
    createdAt: "Dec 28, 2025",
    createdBy: "Sarah Chen",
    description: "AI video generation and editing",
    projectAvailability: "all",
  },
  {
    id: "5",
    name: "DALL-E",
    icon: "🖼️",
    category: "Image Generation",
    baseUrl: "https://openai.com/dall-e",
    status: "Under Review",
    statusVariant: "secondary",
    trackingLevel: "Basic Tracking",
    trackingVariant: "outline",
    approved: false,
    active: true,
    projectCount: 3,
    taskCount: 12,
    lastUsed: "1d ago",
    createdAt: "Jan 20, 2026",
    createdBy: "James Wilson",
    description: "OpenAI image generation model",
    projectAvailability: "restricted",
    selectedProjects: ["1", "3"],
  },
  {
    id: "6",
    name: "Stable Diffusion",
    icon: "🎭",
    category: "Image Generation",
    baseUrl: "https://stability.ai",
    status: "Pending Approval",
    statusVariant: "outline",
    trackingLevel: "Basic Tracking",
    trackingVariant: "outline",
    approved: false,
    active: false,
    createdAt: "Jan 23, 2026",
    createdBy: "Emma Davis",
    description: "Open-source image generation model",
    projectAvailability: "all",
  },
];

// Mock project tool restrictions data
const projectToolRestrictions = [
  {
    id: "1",
    name: "Brand Refresh Campaign",
    toolRestriction: "all" as const,
    allowedTools: [],
    description: "All tools (default)",
  },
  {
    id: "2",
    name: "Q1 Social Campaign",
    toolRestriction: "restricted" as const,
    allowedTools: ["1", "5"], // Midjourney, DALL-E
    description: "Midjourney, DALL-E only",
  },
  {
    id: "3",
    name: "Legal Documents",
    toolRestriction: "restricted" as const,
    allowedTools: ["2"], // ChatGPT
    description: "ChatGPT only",
  },
  {
    id: "4",
    name: "Product Launch Q1",
    toolRestriction: "all" as const,
    allowedTools: [],
    description: "All tools (default)",
  },
  {
    id: "5",
    name: "Website Redesign",
    toolRestriction: "restricted" as const,
    allowedTools: ["1", "4", "5"], // Midjourney, Runway, DALL-E
    description: "Midjourney, Runway, DALL-E",
  },
];

export default function SettingsPage() {
  const [inviteMemberOpen, setInviteMemberOpen] = useState(false);
  const [addToolOpen, setAddToolOpen] = useState(false);
  const [editToolOpen, setEditToolOpen] = useState(false);
  const [importTemplatesOpen, setImportTemplatesOpen] = useState(false);
  const [usageAnalyticsOpen, setUsageAnalyticsOpen] = useState(false);
  const [selectedTool, setSelectedTool] = useState<typeof aiToolsWhitelist[0] | null>(null);
  const [templateData, setTemplateData] = useState<any>(null);
  const [approvalStages, setApprovalStages] = useState("3");
  
  // Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [trackingFilter, setTrackingFilter] = useState("all");
  
  // Bulk selection states
  const [selectedToolIds, setSelectedToolIds] = useState<string[]>([]);
  const [bulkActionModalOpen, setBulkActionModalOpen] = useState(false);
  const [bulkAction, setBulkAction] = useState<"approve" | "activate" | "deactivate" | "delete" | null>(null);
  
  // Project tool restrictions states
  const [projectRestrictionsOpen, setProjectRestrictionsOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<typeof projectToolRestrictions[0] | null>(null);
  
  // Loading states
  const [isLoading, setIsLoading] = useState(false);

  const handleImportTemplate = (template: any) => {
    setTemplateData({
      name: template.name,
      baseUrl: template.baseUrl,
      category: template.category,
      trackingLevel: template.trackingLevel,
      description: template.description,
    });
    setAddToolOpen(true);
  };

  // Filter tools based on search and filters
  const filteredTools = aiToolsWhitelist.filter((tool) => {
    // Search filter
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = 
      tool.name.toLowerCase().includes(searchLower) ||
      tool.category.toLowerCase().includes(searchLower) ||
      tool.baseUrl.toLowerCase().includes(searchLower);

    if (!matchesSearch) return false;

    // Category filter
    if (categoryFilter !== "all" && tool.category !== categoryFilter) {
      return false;
    }

    // Status filter
    if (statusFilter !== "all") {
      if (statusFilter === "Active" && !tool.active) return false;
      if (statusFilter === "Inactive" && tool.active) return false;
      if (statusFilter !== "Active" && statusFilter !== "Inactive" && tool.status !== statusFilter) {
        return false;
      }
    }

    // Tracking level filter
    if (trackingFilter !== "all" && tool.trackingLevel !== trackingFilter) {
      return false;
    }

    return true;
  });

  // Bulk selection handlers
  const toggleToolSelection = (toolId: string) => {
    setSelectedToolIds(prev => 
      prev.includes(toolId) 
        ? prev.filter(id => id !== toolId)
        : [...prev, toolId]
    );
  };

  const clearSelection = () => {
    setSelectedToolIds([]);
  };

  const handleBulkAction = (action: "approve" | "activate" | "deactivate" | "delete") => {
    setBulkAction(action);
    setBulkActionModalOpen(true);
  };

  const confirmBulkAction = () => {
    const selectedTools = aiToolsWhitelist.filter(tool => selectedToolIds.includes(tool.id));
    
    switch (bulkAction) {
      case "approve":
        toast.success(`${selectedToolIds.length} tools approved successfully`);
        break;
      case "activate":
        toast.success(`${selectedToolIds.length} tools activated successfully`);
        break;
      case "deactivate":
        toast.success(`${selectedToolIds.length} tools deactivated successfully`);
        break;
      case "delete":
        const cannotDelete = selectedTools.filter(tool => (tool.taskCount || 0) > 0);
        if (cannotDelete.length > 0) {
          toast.error(`Cannot delete ${cannotDelete.length} tools that have tasks using them`);
        } else {
          toast.success(`${selectedToolIds.length} tools deleted successfully`);
        }
        break;
    }
    
    setBulkActionModalOpen(false);
    clearSelection();
  };

  const selectedTools = aiToolsWhitelist.filter(tool => selectedToolIds.includes(tool.id));
  const canDeleteAll = selectedTools.every(tool => (tool.taskCount || 0) === 0);
  
  return (
    <PageContainer className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-1">
          Configure company policies, risk thresholds, and team management
        </p>
      </div>

      <Tabs defaultValue="policies" className="space-y-4">
        <div className="overflow-x-auto">
          <TabsList className="inline-flex w-auto">
            <TabsTrigger value="policies" className="whitespace-nowrap">Policies</TabsTrigger>
            <TabsTrigger value="risk" className="whitespace-nowrap">Risk Thresholds</TabsTrigger>
            <TabsTrigger value="team" className="whitespace-nowrap">Team</TabsTrigger>
            <TabsTrigger value="talent" className="whitespace-nowrap">Talent Rights</TabsTrigger>
            <TabsTrigger value="ai-tools" className="whitespace-nowrap">AI Tools</TabsTrigger>
            <TabsTrigger value="integrations" className="whitespace-nowrap">Integrations</TabsTrigger>
          </TabsList>
        </div>

        {/* Company Policies */}
        <TabsContent value="policies" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Company Governance Policies</CardTitle>
              <CardDescription>
                Define your organization&apos;s AI content creation policies and compliance requirements
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Require Legal Approval</Label>
                    <p className="text-sm text-muted-foreground">
                      All AI-generated assets must pass legal review before production use
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Mandatory C2PA Metadata</Label>
                    <p className="text-sm text-muted-foreground">
                      Require Content Provenance metadata on all assets
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Prompt Audit Logging</Label>
                    <p className="text-sm text-muted-foreground">
                      Log all AI prompts for compliance and audit purposes
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Third-Party IP Scanning</Label>
                    <p className="text-sm text-muted-foreground">
                      Automatically scan for potential copyright conflicts
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="policy-notes">Additional Policy Notes</Label>
                <Textarea
                  id="policy-notes"
                  placeholder="Add any custom policy requirements or notes..."
                  rows={4}
                />
              </div>
              
              <Button onClick={() => toast.success("Policy settings saved successfully!")}>
                Save Policy Changes
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Approval Workflow</CardTitle>
              <CardDescription>
                Configure the approval process for AI-generated content
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="approval-stages">Required Approval Stages</Label>
                <Select value={approvalStages} onValueChange={setApprovalStages}>
                  <SelectTrigger id="approval-stages">
                    <SelectValue placeholder="Select stages" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">
                      <span className="hidden sm:inline">Draft → Approved (1 stage)</span>
                      <span className="sm:hidden">1 Stage</span>
                    </SelectItem>
                    <SelectItem value="2">
                      <span className="hidden sm:inline">Draft → Review → Approved (2 stages)</span>
                      <span className="sm:hidden">2 Stages</span>
                    </SelectItem>
                    <SelectItem value="3">
                      <span className="hidden sm:inline">Draft → Review → Legal → Approved (3 stages)</span>
                      <span className="sm:hidden">3 Stages</span>
                    </SelectItem>
                  </SelectContent>
                </Select>
                {/* Mobile helper text */}
                <p className="text-xs text-muted-foreground sm:hidden">
                  {approvalStages === "1" && "Draft → Approved"}
                  {approvalStages === "2" && "Draft → Review → Approved"}
                  {approvalStages === "3" && "Draft → Review → Legal → Approved"}
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="min-approvers">Minimum Approvers Required</Label>
                <Select defaultValue="2">
                  <SelectTrigger id="min-approvers">
                    <SelectValue placeholder="Select number" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 Approver</SelectItem>
                    <SelectItem value="2">2 Approvers</SelectItem>
                    <SelectItem value="3">3 Approvers</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <Button onClick={() => toast.success("Workflow settings saved successfully!")}>
                Save Workflow Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Risk Thresholds */}
        <TabsContent value="risk" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                <CardTitle>Risk Threshold Settings</CardTitle>
              </div>
              <CardDescription>
                Configure what triggers risk alerts and compliance warnings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="compliance-min">Minimum Compliance Percentage</Label>
                  <div className="flex items-center gap-4">
                    <Input
                      id="compliance-min"
                      type="number"
                      defaultValue="70"
                      min="0"
                      max="100"
                      className="w-24"
                    />
                    <span className="text-sm text-muted-foreground">
                      Assets below this percentage require legal review
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="provenance-min">Minimum Provenance Score</Label>
                  <div className="flex items-center gap-4">
                    <Input
                      id="provenance-min"
                      type="number"
                      defaultValue="90"
                      min="0"
                      max="100"
                      className="w-24"
                    />
                    <span className="text-sm text-muted-foreground">Score threshold (0-100)</span>
                  </div>
                </div>

                <Separator />

                <div>
                  <h4 className="text-sm font-medium mb-3">Risk Level Triggers</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">High Risk</p>
                        <p className="text-xs text-muted-foreground">Compliance &lt; 60% or missing provenance</p>
                      </div>
                      <Badge variant="destructive">Critical</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">Medium Risk</p>
                        <p className="text-xs text-muted-foreground">Compliance 60-80% or partial documentation</p>
                      </div>
                      <Badge variant="secondary">Warning</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">Low Risk</p>
                        <p className="text-xs text-muted-foreground">Compliance &gt; 80% with full provenance</p>
                      </div>
                      <Badge>Normal</Badge>
                    </div>
                  </div>
                </div>
              </div>

              <Button onClick={() => toast.success("Risk settings saved successfully!")}>
                Save Risk Settings
              </Button>
            </CardContent>
          </Card>

          <Card className="border-amber-500/30">
            <CardHeader>
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-amber-500" />
                <CardTitle>Alert Configuration</CardTitle>
              </div>
              <CardDescription>
                Configure when to send notifications to your team
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Email Alerts for High Risk Assets</Label>
                  <p className="text-sm text-muted-foreground">
                    Notify legal team when high-risk assets are detected
                  </p>
                </div>
                <Switch defaultChecked />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Daily Compliance Report</Label>
                  <p className="text-sm text-muted-foreground">
                    Send daily summary of compliance percentages
                  </p>
                </div>
                <Switch defaultChecked />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>IP Conflict Alerts</Label>
                  <p className="text-sm text-muted-foreground">
                    Immediate notification for copyright conflicts
                  </p>
                </div>
                <Switch defaultChecked />
              </div>

              <Button onClick={() => toast.success("Alert settings saved successfully!")}>
                Save Alert Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Team Management */}
        <TabsContent value="team" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row items-start gap-4 sm:items-center sm:justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    <CardTitle>Team Members</CardTitle>
                  </div>
                  <CardDescription>
                    Manage team access and role-based permissions
                  </CardDescription>
                </div>
                <Button onClick={() => setInviteMemberOpen(true)} className="w-full sm:w-auto">
                  <UserPlus className="mr-2 h-4 w-4" />
                  Invite Member
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {teamMembers.map((member, index) => (
                  <div key={index} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b last:border-0">
                    <div className="flex items-center gap-3 flex-1 w-full">
                      <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center shrink-0">
                        <span className="text-sm font-medium">{member.initials}</span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium truncate">{member.name}</p>
                        <p className="text-xs text-muted-foreground truncate">{member.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <Badge variant={member.roleVariant} className="shrink-0">{member.role}</Badge>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => toast.info(`Edit ${member.name} - feature coming soon`)}
                        className="shrink-0"
                      >
                        Edit
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Role Permissions</CardTitle>
              <CardDescription>
                Define what each role can access and modify
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-3">
                  <div>
                    <h4 className="text-sm font-medium mb-2">Company Admin</h4>
                    <p className="text-xs text-muted-foreground">
                      Full access to all settings, projects, and team management
                    </p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium mb-2">Legal Reviewer</h4>
                    <p className="text-xs text-muted-foreground">
                      Approve/reject assets, view compliance data, access audit logs
                    </p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium mb-2">Insurance Analyst</h4>
                    <p className="text-xs text-muted-foreground">
                      View risk assessments, export reports, no approval permissions
                    </p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium mb-2">Content Creator</h4>
                    <p className="text-xs text-muted-foreground">
                      Upload assets, view own projects, no approval permissions
                    </p>
                  </div>
                </div>
                <Button 
                  variant="outline"
                  onClick={() => toast.info("Role customization feature coming soon")}
                >
                  Customize Roles
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Talent Rights */}
        <TabsContent value="talent" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row items-start gap-4 sm:items-center sm:justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    <CardTitle>External Talent Rights Management</CardTitle>
                  </div>
                  <CardDescription>
                    Track rights and agreements for external creators and talent
                  </CardDescription>
                </div>
                <Button onClick={() => toast.info("Add Talent Agreement feature coming soon")} className="w-full sm:w-auto sm:shrink-0">
                  <Plus className="mr-2 h-4 w-4" />
                  <span className="hidden sm:inline">Add Talent Agreement</span>
                  <span className="sm:hidden">Add Agreement</span>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {talentAgreements.map((talent, index) => (
                  <div key={index} className="flex items-center justify-between pb-4 border-b last:border-0">
                    <div>
                      <p className="text-sm font-medium">{talent.name}</p>
                      <p className="text-xs text-muted-foreground">{talent.type}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant={talent.statusVariant}>{talent.status}</Badge>
                      <span className="text-xs text-muted-foreground">{talent.expires}</span>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => toast.info("Agreement viewer coming soon")}
                      >
                        View Agreement
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Usage Rights Configuration</CardTitle>
              <CardDescription>
                Default settings for talent agreements and licensing
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Require Signed Agreements</Label>
                  <p className="text-sm text-muted-foreground">
                    Block asset uploads without valid talent agreements
                  </p>
                </div>
                <Switch defaultChecked />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Auto-flag Expiring Agreements</Label>
                  <p className="text-sm text-muted-foreground">
                    Alert when agreements expire within 30 days
                  </p>
                </div>
                <Switch defaultChecked />
              </div>

              <Button onClick={() => toast.success("Talent settings saved successfully!")}>
                Save Talent Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* AI Tools Whitelist */}
        <TabsContent value="ai-tools" className="space-y-6">
          {/* Main AI Tools Card */}
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <CardTitle>AI Tool Whitelist</CardTitle>
                  <CardDescription>
                    Manage which AI tools are approved for content creation
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setImportTemplatesOpen(true)}
                    className="flex items-center gap-2 flex-1 sm:flex-none"
                  >
                    <FileDown className="w-4 h-4" />
                    <span className="hidden sm:inline">Import from Templates</span>
                    <span className="sm:hidden">Import</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      setTemplateData(null);
                      setAddToolOpen(true);
                    }}
                    className="flex items-center gap-2 flex-1 sm:flex-none"
                  >
                    <Plus className="w-4 h-4" />
                    <span className="hidden sm:inline">Add New Tool</span>
                    <span className="sm:hidden">Add</span>
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* Bulk Action Bar */}
              {selectedToolIds.length > 0 && (
                <div className="mb-4 p-4 rounded-lg border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <CheckSquare className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      <span className="font-medium text-blue-900 dark:text-blue-100">
                        {selectedToolIds.length} tool{selectedToolIds.length !== 1 ? 's' : ''} selected
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleBulkAction("approve")}
                        className="flex-1 sm:flex-none"
                      >
                        Approve All
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleBulkAction("activate")}
                        className="flex-1 sm:flex-none"
                      >
                        Activate All
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleBulkAction("deactivate")}
                        className="flex-1 sm:flex-none"
                      >
                        Deactivate All
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleBulkAction("delete")}
                        disabled={!canDeleteAll}
                        className="flex-1 sm:flex-none text-red-600 hover:text-red-700 dark:text-red-400 disabled:opacity-50"
                      >
                        Delete All
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={clearSelection}
                        className="flex-1 sm:flex-none"
                      >
                        <XIcon className="w-4 h-4 mr-1" />
                        Cancel
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Filter Bar */}
              <div className="space-y-4 mb-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {/* Search */}
                  <div className="relative sm:col-span-2 lg:col-span-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      type="text"
                      placeholder="Search tools..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9"
                    />
                  </div>

                  {/* Category Filter */}
                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      <SelectItem value="Image Generation">Image Generation</SelectItem>
                      <SelectItem value="Text Generation">Text Generation</SelectItem>
                      <SelectItem value="Video Generation">Video Generation</SelectItem>
                      <SelectItem value="Audio Generation">Audio Generation</SelectItem>
                      <SelectItem value="Image Editing">Image Editing</SelectItem>
                      <SelectItem value="Code Generation">Code Generation</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>

                  {/* Status Filter */}
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Statuses" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="Active">Active</SelectItem>
                      <SelectItem value="Inactive">Inactive</SelectItem>
                      <SelectItem value="Approved">Approved</SelectItem>
                      <SelectItem value="Pending Approval">Pending Approval</SelectItem>
                      <SelectItem value="Under Review">Under Review</SelectItem>
                      <SelectItem value="Archived">Archived</SelectItem>
                    </SelectContent>
                  </Select>

                  {/* Tracking Level Filter */}
                  <Select value={trackingFilter} onValueChange={setTrackingFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Tracking Levels" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Tracking Levels</SelectItem>
                      <SelectItem value="Full Tracking">Full Tracking</SelectItem>
                      <SelectItem value="Good Tracking">Good Tracking</SelectItem>
                      <SelectItem value="Basic Tracking">Basic Tracking</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Result Count */}
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Showing {filteredTools.length} of {aiToolsWhitelist.length} tools
                </p>
              </div>

              {/* Tools List or Empty State */}
              {aiToolsWhitelist.length === 0 ? (
                // Empty state - no tools at all
                <div className="text-center py-16">
                  <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Plug className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Add your first AI tool</h3>
                  <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto">
                    Start tracking AI tool usage by adding tools to your whitelist. You can import from templates or add custom tools.
                  </p>
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                    <Button 
                      onClick={() => setImportTemplatesOpen(true)}
                      className="w-full sm:w-auto"
                    >
                      <FileDown className="w-4 h-4 mr-2" />
                      Import from Templates
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => {
                        setTemplateData(null);
                        setAddToolOpen(true);
                      }}
                      className="w-full sm:w-auto"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Custom Tool
                    </Button>
                  </div>
                </div>
              ) : filteredTools.length === 0 ? (
                // Empty state - no results from filters
                <div className="text-center py-12">
                  <p className="text-gray-500 dark:text-gray-400 mb-2">
                    No tools found. Try adjusting your filters.
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSearchQuery("");
                      setCategoryFilter("all");
                      setStatusFilter("all");
                      setTrackingFilter("all");
                    }}
                  >
                    Clear Filters
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredTools.map((tool, index) => (
                  <div 
                    key={index} 
                    className={cn(
                      "relative p-4 rounded-lg border transition-all duration-200",
                      "hover:shadow-md hover:border-gray-300 dark:hover:border-gray-700",
                      selectedToolIds.includes(tool.id) && "ring-2 ring-blue-500 dark:ring-blue-400",
                      tool.active 
                        ? "border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900" 
                        : "border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50 opacity-60"
                    )}
                  >
                    {/* Selection Checkbox */}
                    <div className="absolute top-4 left-4 z-10">
                      <input
                        type="checkbox"
                        checked={selectedToolIds.includes(tool.id)}
                        onChange={() => toggleToolSelection(tool.id)}
                        className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>
                    {/* Active/Inactive Badge - Top Right */}
                    <div className="absolute top-4 right-4 flex items-center gap-1.5">
                      <div className={cn(
                        "w-2 h-2 rounded-full",
                        tool.active ? "bg-green-500" : "bg-gray-400"
                      )} />
                      <Badge variant={tool.active ? "default" : "outline"} className="text-xs">
                        {tool.active ? "Active" : "Inactive"}
                      </Badge>
                    </div>

                    <div className="flex items-start justify-between">
                      {/* Left Side - Tool Info */}
                      <div className="flex items-start gap-3 flex-1 pr-24 pl-6">
                        <div className="text-2xl flex-shrink-0">{tool.icon}</div>
                        <div className="space-y-2 flex-1 min-w-0">
                          {/* Tool Name */}
                          <div>
                            <p className="text-sm font-semibold text-gray-900 dark:text-white">{tool.name}</p>
                            {/* Base URL */}
                            <a 
                              href={tool.baseUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 font-mono transition-colors"
                            >
                              {tool.baseUrl}
                            </a>
                          </div>

                          {/* Category and Tracking Level */}
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs text-gray-600 dark:text-gray-400">{tool.category}</span>
                            <span className="text-gray-300 dark:text-gray-700">•</span>
                            <Badge 
                              variant={tool.trackingVariant}
                              className={cn(
                                "text-xs",
                                tool.trackingLevel === "Full Tracking" && "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800",
                                tool.trackingLevel === "Good Tracking" && "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800",
                                tool.trackingLevel === "Basic Tracking" && "bg-gray-50 dark:bg-gray-900/20 text-gray-700 dark:text-gray-400 border-gray-200 dark:border-gray-700"
                              )}
                            >
                              {tool.trackingLevel}
                            </Badge>
                            <Badge 
                              variant={
                                tool.status === "Approved" ? "default" : 
                                tool.status === "Under Review" ? "secondary" : 
                                tool.status === "Pending Approval" ? "outline" : 
                                "destructive"
                              }
                              className={cn(
                                "text-xs",
                                tool.status === "Approved" && "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800",
                                tool.status === "Under Review" && "bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400 border-orange-200 dark:border-orange-800",
                                tool.status === "Pending Approval" && "bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800",
                                tool.status === "Archived" && "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800"
                              )}
                            >
                              {tool.status}
                            </Badge>
                          </div>

                          {/* Usage Stats */}
                          {(tool.projectCount || tool.taskCount) && (
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {tool.projectCount && `${tool.projectCount} projects`}
                              {tool.projectCount && tool.taskCount && " · "}
                              {tool.taskCount && `${tool.taskCount} tasks`}
                              {tool.lastUsed && ` · Last used: ${tool.lastUsed}`}
                            </p>
                          )}

                          {/* Action Buttons */}
                          <div className="flex items-center gap-2 pt-1">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => {
                                setSelectedTool(tool);
                                setEditToolOpen(true);
                              }}
                              className="text-xs h-7 px-2"
                              aria-label={`Edit ${tool.name}`}
                            >
                              Edit
                            </Button>
                            {tool.active ? (
                              <>
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => {
                                    setSelectedTool(tool);
                                    setUsageAnalyticsOpen(true);
                                  }}
                                  className="text-xs h-7 px-2"
                                  aria-label={`View usage analytics for ${tool.name}`}
                                >
                                  View Usage
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => toast.success(`${tool.name} deactivated`)}
                                  className="text-xs h-7 px-2 text-orange-600 hover:text-orange-700 dark:text-orange-400"
                                  aria-label={`Deactivate ${tool.name}`}
                                >
                                  Deactivate
                                </Button>
                              </>
                            ) : (
                              <>
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => toast.success(`${tool.name} reactivated`)}
                                  className="text-xs h-7 px-2 text-green-600 hover:text-green-700 dark:text-green-400"
                                  aria-label={`Reactivate ${tool.name}`}
                                >
                                  Reactivate
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => toast.info(`Archive ${tool.name}`)}
                                  className="text-xs h-7 px-2 text-red-600 hover:text-red-700 dark:text-red-400"
                                  aria-label={`Archive ${tool.name}`}
                                >
                                  Archive
                                </Button>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Tool Approval Settings - Enhanced Section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Tool Approval Settings</CardTitle>
              <CardDescription>
                Configure requirements for new AI tool usage
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Require Admin Approval</Label>
                  <p className="text-sm text-muted-foreground">
                    New AI tools need approval before use
                  </p>
                </div>
                <Switch defaultChecked />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Block Unapproved Tools</Label>
                  <p className="text-sm text-muted-foreground">
                    Prevent uploads from non-whitelisted AI tools
                  </p>
                </div>
                <Switch defaultChecked />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Track Tool Usage</Label>
                  <p className="text-sm text-muted-foreground">
                    Log all AI tool interactions for compliance
                  </p>
                </div>
                <Switch defaultChecked />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Auto-detect New Tools</Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically create &apos;Pending Approval&apos; entries when extension detects new tools
                  </p>
                </div>
                <Switch defaultChecked />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Require Tool URLs</Label>
                  <p className="text-sm text-muted-foreground">
                    Enforce base URL entry for all approved tools
                  </p>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="pt-2">
                <Button 
                  variant="outline"
                  onClick={() => toast.info("Advanced Tool Policies feature coming soon")}
                  className="w-full sm:w-auto"
                >
                  Advanced Tool Policies
                </Button>
              </div>

              <Button onClick={() => toast.success("Tool settings saved successfully!")}>
                Save Tool Settings
              </Button>
            </CardContent>
          </Card>

          {/* Project Tool Restrictions - Enhanced Section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Project Tool Restrictions</CardTitle>
              <CardDescription>
                Configure which AI tools are available for specific projects
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-800">
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">
                        Project Name
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">
                        Allowed Tools
                      </th>
                      <th className="text-right py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {projectToolRestrictions.map((project) => (
                      <tr 
                        key={project.id}
                        className="border-b border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors"
                      >
                        <td className="py-3 px-4">
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {project.name}
                          </p>
                        </td>
                        <td className="py-3 px-4">
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {project.description}
                          </p>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedProject(project);
                              setProjectRestrictionsOpen(true);
                            }}
                            aria-label={`Edit tool restrictions for ${project.name}`}
                          >
                            Edit
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="mt-4 p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                <p className="text-xs text-blue-800 dark:text-blue-200">
                  <strong>Default behavior:</strong> New projects inherit &quot;all approved tools&quot; unless restricted here. Tool restrictions help enforce compliance and control costs per project.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Integration Settings */}
        <TabsContent value="integrations" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Plug className="h-5 w-5" />
                <CardTitle>Integration Configuration</CardTitle>
              </div>
              <CardDescription>
                Configure how AI tool data is tracked and stored across all integrations
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Webhook URL</Label>
                <div className="flex gap-2">
                  <Input
                    type="text"
                    value="https://api.creationrights.com/webhooks/ai-tools"
                    readOnly
                    className="font-mono text-sm"
                  />
                  <Button 
                    size="icon" 
                    variant="outline"
                    onClick={() => {
                      navigator.clipboard.writeText("https://api.creationrights.com/webhooks/ai-tools");
                      toast.success("Webhook URL copied to clipboard!");
                    }}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Use this webhook URL in your AI tool configurations for real-time updates
                </p>
              </div>

              <Separator />

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Automatic Metadata Collection</Label>
                    <p className="text-sm text-muted-foreground">
                      Automatically capture prompts and AI model metadata from connected tools
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Audit Logging</Label>
                    <p className="text-sm text-muted-foreground">
                      Log all API interactions for compliance and regulatory requirements
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Real-time Sync</Label>
                    <p className="text-sm text-muted-foreground">
                      Enable real-time synchronization of asset metadata from AI tools
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </div>

              <Button onClick={() => toast.success("Integration settings saved successfully!")}>
                Save Integration Settings
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>API Rate Limits</CardTitle>
              <CardDescription>
                Configure rate limiting for AI tool integrations
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="rate-limit">Requests Per Minute</Label>
                <div className="flex items-center gap-4">
                  <Input
                    id="rate-limit"
                    type="number"
                    defaultValue="100"
                    min="10"
                    max="1000"
                    className="w-32"
                  />
                  <span className="text-sm text-muted-foreground">
                    Maximum API calls per minute across all tools
                  </span>
                </div>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Retry Failed Requests</Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically retry failed API calls up to 3 times
                  </p>
                </div>
                <Switch defaultChecked />
              </div>

              <Button onClick={() => toast.success("Rate limit settings saved successfully!")}>
                Save Rate Limit Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Invite Member Dialog */}
      <InviteMemberDialog
        open={inviteMemberOpen}
        onOpenChange={setInviteMemberOpen}
      />

      {/* Import Tool Templates Modal */}
      <ImportToolTemplatesModal
        open={importTemplatesOpen}
        onOpenChange={setImportTemplatesOpen}
        onImport={handleImportTemplate}
      />

      {/* Add AI Tool Modal */}
      <AddAIToolModal
        open={addToolOpen}
        onOpenChange={(open) => {
          setAddToolOpen(open);
          if (!open) setTemplateData(null);
        }}
        initialData={templateData}
      />

      {/* Edit AI Tool Modal */}
      {selectedTool && (
        <EditAIToolModal
          open={editToolOpen}
          onOpenChange={setEditToolOpen}
          tool={{
            ...selectedTool,
            status: selectedTool.active ? "Active" : "Inactive",
            trackingLevel: selectedTool.trackingLevel.replace(" Tracking", ""),
          }}
        />
      )}

      {/* Tool Usage Analytics Modal */}
      {selectedTool && (
        <ToolUsageAnalyticsModal
          open={usageAnalyticsOpen}
          onOpenChange={setUsageAnalyticsOpen}
          tool={{
            name: selectedTool.name,
            icon: selectedTool.icon,
            taskCount: selectedTool.taskCount || 0,
            projectCount: selectedTool.projectCount || 0,
          }}
        />
      )}

      {/* Bulk Action Confirmation Modal */}
      <Dialog open={bulkActionModalOpen} onOpenChange={setBulkActionModalOpen}>
        <DialogContent className="!bg-white dark:!bg-gray-950 !backdrop-blur-none [backdrop-filter:none!important] [-webkit-backdrop-filter:none!important]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {bulkAction === "delete" && (
                <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
              )}
              Confirm Bulk Action
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
              Are you sure you want to{" "}
              <span className="font-semibold">
                {bulkAction === "approve" && "approve"}
                {bulkAction === "activate" && "activate"}
                {bulkAction === "deactivate" && "deactivate"}
                {bulkAction === "delete" && "delete"}
              </span>{" "}
              {selectedToolIds.length} tool{selectedToolIds.length !== 1 ? "s" : ""}?
            </p>
            
            {/* List of affected tools */}
            <div className="max-h-48 overflow-y-auto border border-gray-200 dark:border-gray-800 rounded-lg p-3 space-y-2">
              {selectedTools.map((tool) => (
                <div key={tool.id} className="flex items-center gap-2 text-sm">
                  <span className="text-lg">{tool.icon}</span>
                  <span className="font-medium">{tool.name}</span>
                  {bulkAction === "delete" && tool.taskCount && tool.taskCount > 0 && (
                    <Badge variant="destructive" className="text-xs">
                      {tool.taskCount} tasks
                    </Badge>
                  )}
                </div>
              ))}
            </div>

            {bulkAction === "delete" && !canDeleteAll && (
              <div className="mt-3 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                <p className="text-sm text-red-800 dark:text-red-200">
                  Some selected tools cannot be deleted because they are used in existing tasks.
                </p>
              </div>
            )}

            {bulkAction === "deactivate" && (
              <div className="mt-3 p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
                <p className="text-sm text-amber-800 dark:text-amber-200">
                  Deactivating these tools will hide them from new task creation but preserve existing task history.
                </p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBulkActionModalOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={confirmBulkAction}
              className={cn(
                bulkAction === "delete" && "bg-red-600 hover:bg-red-700 text-white"
              )}
              disabled={bulkAction === "delete" && !canDeleteAll}
            >
              Confirm {bulkAction === "delete" ? "Delete" : "Action"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Project Tool Restrictions Modal */}
      {selectedProject && (
        <ProjectToolRestrictionsModal
          open={projectRestrictionsOpen}
          onOpenChange={setProjectRestrictionsOpen}
          project={selectedProject}
          availableTools={aiToolsWhitelist.filter(tool => tool.active).map(tool => ({
            id: tool.id,
            name: tool.name,
            icon: tool.icon,
          }))}
        />
      )}
    </PageContainer>
  );
}

