"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Shield, AlertTriangle } from "lucide-react";
import { SettingsPageHeader } from "@/components/settings/SettingsPageHeader";

export default function RiskThresholdsPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <SettingsPageHeader
        title="Risk Thresholds"
        description="Configure what triggers risk alerts and compliance warnings"
      />

      {/* Risk Threshold Settings */}
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

      {/* Alert Configuration */}
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
    </div>
  );
}
