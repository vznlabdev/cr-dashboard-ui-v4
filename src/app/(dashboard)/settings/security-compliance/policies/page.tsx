"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { useState } from "react";
import { SettingsPageHeader } from "@/components/settings/SettingsPageHeader";

export default function PoliciesPage() {
  const [approvalStages, setApprovalStages] = useState("3");

  return (
    <div className="space-y-6 animate-fade-in">
      <SettingsPageHeader
        title="Policies"
        description="Define your organization's AI content creation policies and compliance requirements"
      />

      {/* Company Policies */}
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

      {/* Approval Workflow */}
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
    </div>
  );
}
