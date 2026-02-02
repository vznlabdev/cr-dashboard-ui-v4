"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Link2 } from "lucide-react";
import { SettingsPageHeader } from "@/components/settings/SettingsPageHeader";

export default function ConnectedServicesPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <SettingsPageHeader
        title="Connected Services"
        description="Manage third-party service integrations and OAuth connections"
      />

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Link2 className="h-5 w-5" />
            <CardTitle>Third-Party Services</CardTitle>
          </div>
          <CardDescription>
            Connect and manage external services
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <Link2 className="h-12 w-12 mx-auto mb-3 text-muted-foreground opacity-50" />
            <p className="text-muted-foreground mb-4">Connected services coming soon</p>
            <Button variant="outline" onClick={() => toast.info("Feature in development")}>
              Browse Available Integrations
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
