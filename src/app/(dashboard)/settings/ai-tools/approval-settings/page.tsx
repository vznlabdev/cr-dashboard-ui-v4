"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { SettingsPageHeader } from "@/components/settings/SettingsPageHeader";

export default function ApprovalSettingsPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <SettingsPageHeader
        title="Approval Settings"
        description="Configure requirements for new AI tool usage"
      />

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
    </div>
  );
}
