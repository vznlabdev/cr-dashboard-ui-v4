
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
import { toast } from "sonner";
import { InviteMemberDialog } from "@/components/cr";
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
  name: string;
  icon: string;
  category: string;
  status: string;
  statusVariant: "default" | "secondary" | "outline" | "destructive";
  riskLevel: string;
  approved: boolean;
}> = [
  {
    name: "Midjourney",
    icon: "🎨",
    category: "Image Generation",
    status: "Approved",
    statusVariant: "default",
    riskLevel: "Low",
    approved: true,
  },
  {
    name: "ChatGPT",
    icon: "💬",
    category: "Text Generation",
    status: "Approved",
    statusVariant: "default",
    riskLevel: "Low",
    approved: true,
  },
  {
    name: "ElevenLabs",
    icon: "🎙️",
    category: "Voice Synthesis",
    status: "Approved",
    statusVariant: "default",
    riskLevel: "Medium",
    approved: true,
  },
  {
    name: "Runway",
    icon: "🎬",
    category: "Video Generation",
    status: "Approved",
    statusVariant: "default",
    riskLevel: "Medium",
    approved: true,
  },
  {
    name: "DALL-E",
    icon: "🖼️",
    category: "Image Generation",
    status: "Under Review",
    statusVariant: "secondary",
    riskLevel: "Low",
    approved: false,
  },
  {
    name: "Stable Diffusion",
    icon: "🎭",
    category: "Image Generation",
    status: "Pending Approval",
    statusVariant: "outline",
    riskLevel: "Medium",
    approved: false,
  },
];

export default function SettingsPage() {
  const [inviteMemberOpen, setInviteMemberOpen] = useState(false);
  const [approvalStages, setApprovalStages] = useState("3");
  
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
        <TabsContent value="ai-tools" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>AI Tool Whitelist</CardTitle>
              <CardDescription>
                Manage which AI tools are approved for content creation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {aiToolsWhitelist.map((tool, index) => (
                  <div key={index} className="flex items-center justify-between pb-4 border-b last:border-0">
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">{tool.icon}</div>
                      <div>
                        <p className="text-sm font-medium">{tool.name}</p>
                        <p className="text-xs text-muted-foreground">{tool.category}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant={tool.statusVariant}>{tool.status}</Badge>
                      <Badge variant="outline">{tool.riskLevel}</Badge>
                      <Switch defaultChecked={tool.approved} />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Tool Approval Settings</CardTitle>
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

              <Button onClick={() => toast.success("Tool settings saved successfully!")}>
                Save Tool Settings
              </Button>
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
    </PageContainer>
  );
}

