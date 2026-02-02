"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Webhook, Plus } from "lucide-react";
import { SettingsPageHeader } from "@/components/settings/SettingsPageHeader";

export default function WebhooksPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <SettingsPageHeader
        title="Webhooks"
        description="Configure webhook endpoints for real-time event notifications"
        actions={
          <Button onClick={() => toast.info("Create webhook coming soon")}>
            <Plus className="mr-2 h-4 w-4" />
            Create Webhook
          </Button>
        }
      />

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Webhook className="h-5 w-5" />
            <CardTitle>Webhook Endpoints</CardTitle>
          </div>
          <CardDescription>
            Receive real-time notifications for events in your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <Webhook className="h-12 w-12 mx-auto mb-3 text-muted-foreground opacity-50" />
            <p className="text-muted-foreground mb-4">Webhook configuration coming soon</p>
            <Button variant="outline" onClick={() => toast.info("Feature in development")}>
              Learn More About Webhooks
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
