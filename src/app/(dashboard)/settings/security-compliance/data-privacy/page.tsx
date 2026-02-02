"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Database, Shield, FileDown, Cookie } from "lucide-react";
import { SettingsPageHeader } from "@/components/settings/SettingsPageHeader";

export default function DataPrivacyPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <SettingsPageHeader
        title="Data Privacy"
        description="GDPR compliance, data retention, and privacy controls"
      />

      {/* GDPR Compliance */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            <CardTitle>GDPR Compliance</CardTitle>
          </div>
          <CardDescription>
            Configure GDPR and data privacy settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>GDPR Mode</Label>
              <p className="text-sm text-muted-foreground">
                Enable enhanced privacy controls for GDPR compliance
              </p>
            </div>
            <Switch defaultChecked />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Data Processing Agreement</Label>
              <p className="text-sm text-muted-foreground">
                Require DPA acceptance for all users
              </p>
            </div>
            <Switch defaultChecked />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Right to Be Forgotten</Label>
              <p className="text-sm text-muted-foreground">
                Allow users to request complete data deletion
              </p>
            </div>
            <Switch defaultChecked />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Data Portability</Label>
              <p className="text-sm text-muted-foreground">
                Allow users to export all their data
              </p>
            </div>
            <Switch defaultChecked />
          </div>

          <Button onClick={() => toast.success("GDPR settings saved!")}>
            Save GDPR Settings
          </Button>
        </CardContent>
      </Card>

      {/* Data Retention Policies */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            <CardTitle>Data Retention Policies</CardTitle>
          </div>
          <CardDescription>
            Define how long different types of data are retained
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="user-data-retention">User Data Retention</Label>
            <Select defaultValue="730">
              <SelectTrigger id="user-data-retention">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="365">1 year</SelectItem>
                <SelectItem value="730">2 years</SelectItem>
                <SelectItem value="1825">5 years</SelectItem>
                <SelectItem value="forever">Indefinitely</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              How long to retain user profile data after account deletion
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="asset-retention">Asset Data Retention</Label>
            <Select defaultValue="1825">
              <SelectTrigger id="asset-retention">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="730">2 years</SelectItem>
                <SelectItem value="1825">5 years</SelectItem>
                <SelectItem value="3650">10 years</SelectItem>
                <SelectItem value="forever">Indefinitely</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              How long to retain asset files and metadata
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="audit-retention">Audit Log Retention</Label>
            <Select defaultValue="1825">
              <SelectTrigger id="audit-retention">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="365">1 year</SelectItem>
                <SelectItem value="730">2 years</SelectItem>
                <SelectItem value="1825">5 years</SelectItem>
                <SelectItem value="3650">10 years</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Minimum 1 year recommended for compliance
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="backup-retention">Backup Retention</Label>
            <Select defaultValue="90">
              <SelectTrigger id="backup-retention">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="30">30 days</SelectItem>
                <SelectItem value="90">90 days</SelectItem>
                <SelectItem value="180">180 days</SelectItem>
                <SelectItem value="365">1 year</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              How long to retain backup copies
            </p>
          </div>

          <Button onClick={() => toast.success("Retention policies saved!")}>
            Save Retention Policies
          </Button>
        </CardContent>
      </Card>

      {/* Data Deletion Rules */}
      <Card>
        <CardHeader>
          <CardTitle>Automated Data Deletion</CardTitle>
          <CardDescription>
            Configure automatic deletion of old data
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Auto-delete Inactive User Accounts</Label>
              <p className="text-sm text-muted-foreground">
                Delete accounts inactive for more than 2 years
              </p>
            </div>
            <Switch />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Auto-delete Draft Assets</Label>
              <p className="text-sm text-muted-foreground">
                Delete draft assets older than 90 days
              </p>
            </div>
            <Switch />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Purge Deleted Items</Label>
              <p className="text-sm text-muted-foreground">
                Permanently delete items from trash after 30 days
              </p>
            </div>
            <Switch defaultChecked />
          </div>

          <Button onClick={() => toast.success("Deletion rules saved!")}>
            Save Deletion Rules
          </Button>
        </CardContent>
      </Card>

      {/* Cookie Consent */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Cookie className="h-5 w-5" />
            <CardTitle>Cookie Consent Management</CardTitle>
          </div>
          <CardDescription>
            Manage cookie consent and tracking preferences
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Show Cookie Consent Banner</Label>
              <p className="text-sm text-muted-foreground">
                Display cookie consent banner to visitors
              </p>
            </div>
            <Switch defaultChecked />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Require Explicit Consent</Label>
              <p className="text-sm text-muted-foreground">
                Require users to explicitly opt-in to non-essential cookies
              </p>
            </div>
            <Switch defaultChecked />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Analytics Cookies</Label>
              <p className="text-sm text-muted-foreground">
                Allow analytics and performance tracking cookies
              </p>
            </div>
            <Switch defaultChecked />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Marketing Cookies</Label>
              <p className="text-sm text-muted-foreground">
                Allow marketing and advertising cookies
              </p>
            </div>
            <Switch />
          </div>

          <Button onClick={() => toast.success("Cookie settings saved!")}>
            Save Cookie Settings
          </Button>
        </CardContent>
      </Card>

      {/* Data Subject Requests */}
      <Card>
        <CardHeader>
          <CardTitle>Data Subject Access Requests (DSAR)</CardTitle>
          <CardDescription>
            Manage user data access and deletion requests
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Enable Self-Service Data Export</Label>
              <p className="text-sm text-muted-foreground">
                Allow users to export their data without admin approval
              </p>
            </div>
            <Switch defaultChecked />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Require Admin Approval for Deletion</Label>
              <p className="text-sm text-muted-foreground">
                Deletion requests must be reviewed by admin
              </p>
            </div>
            <Switch defaultChecked />
          </div>

          <Separator />

          <div className="space-y-2">
            <Label htmlFor="response-time">DSAR Response Time</Label>
            <Select defaultValue="30">
              <SelectTrigger id="response-time">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">7 days</SelectItem>
                <SelectItem value="14">14 days</SelectItem>
                <SelectItem value="30">30 days (GDPR standard)</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Maximum time to fulfill data subject requests
            </p>
          </div>

          <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              <strong>GDPR Requirement:</strong> Organizations must respond to data subject access requests within 30 days under GDPR Article 15.
            </p>
          </div>

          <Button onClick={() => toast.success("DSAR settings saved!")}>
            Save DSAR Settings
          </Button>
        </CardContent>
      </Card>

      {/* Privacy Policy */}
      <Card>
        <CardHeader>
          <CardTitle>Privacy Policy Configuration</CardTitle>
          <CardDescription>
            Manage your privacy policy and consent tracking
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="privacy-policy-url">Privacy Policy URL</Label>
            <input
              id="privacy-policy-url"
              type="url"
              className="w-full p-2 border rounded-md"
              defaultValue="https://acme.com/privacy"
              placeholder="https://your-company.com/privacy"
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Require Policy Acceptance</Label>
              <p className="text-sm text-muted-foreground">
                Users must accept privacy policy before using the system
              </p>
            </div>
            <Switch defaultChecked />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Track Consent History</Label>
              <p className="text-sm text-muted-foreground">
                Maintain audit trail of user consent and policy versions
              </p>
            </div>
            <Switch defaultChecked />
          </div>

          <Button onClick={() => toast.success("Privacy policy settings saved!")}>
            Save Privacy Settings
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
