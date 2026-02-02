"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { FileText, Plus } from "lucide-react";
import { SettingsPageHeader } from "@/components/settings/SettingsPageHeader";

// Mock data
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

export default function TalentRightsPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <SettingsPageHeader
        title="Talent Rights"
        description="Track rights and agreements for external creators and talent"
        actions={
          <Button onClick={() => toast.info("Add Talent Agreement feature coming soon")}>
            <Plus className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Add Talent Agreement</span>
            <span className="sm:hidden">Add Agreement</span>
          </Button>
        }
      />

      {/* External Talent Rights Management */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            <CardTitle>External Talent Rights Management</CardTitle>
          </div>
          <CardDescription>
            Track rights and agreements for external creators and talent
          </CardDescription>
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

      {/* Usage Rights Configuration */}
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
    </div>
  );
}
