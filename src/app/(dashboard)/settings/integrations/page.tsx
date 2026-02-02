"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Plug, Copy } from "lucide-react";
import { SettingsPageHeader } from "@/components/settings/SettingsPageHeader";

export default function IntegrationsPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <SettingsPageHeader
        title="Integrations"
        description="Configure how AI tool data is tracked and stored across all integrations"
      />

      {/* Integration Configuration */}
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

      {/* API Rate Limits */}
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
    </div>
  );
}
