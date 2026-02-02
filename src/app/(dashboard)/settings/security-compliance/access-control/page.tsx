"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Lock, Shield, Clock, Key, Plus, X } from "lucide-react";
import { SettingsPageHeader } from "@/components/settings/SettingsPageHeader";
import { useState } from "react";

// Mock data for IP allowlist
const initialAllowedIPs = [
  { id: "1", address: "192.168.1.0/24", description: "Office Network", addedBy: "Admin", addedDate: "2026-01-15" },
  { id: "2", address: "203.0.113.0/24", description: "Remote Office", addedBy: "Admin", addedDate: "2026-01-20" },
];

export default function AccessControlPage() {
  const [allowedIPs, setAllowedIPs] = useState(initialAllowedIPs);
  const [newIP, setNewIP] = useState("");
  const [newIPDescription, setNewIPDescription] = useState("");

  const handleAddIP = () => {
    if (newIP) {
      const newEntry = {
        id: Date.now().toString(),
        address: newIP,
        description: newIPDescription || "No description",
        addedBy: "Current User",
        addedDate: new Date().toISOString().split('T')[0],
      };
      setAllowedIPs([...allowedIPs, newEntry]);
      setNewIP("");
      setNewIPDescription("");
      toast.success("IP address added to allowlist");
    }
  };

  const handleRemoveIP = (id: string) => {
    setAllowedIPs(allowedIPs.filter(ip => ip.id !== id));
    toast.success("IP address removed from allowlist");
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <SettingsPageHeader
        title="Access Control"
        description="Manage IP allowlisting, SSO, and session policies"
      />

      {/* IP Allowlisting */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            <CardTitle>IP Allowlisting</CardTitle>
          </div>
          <CardDescription>
            Restrict access to specific IP addresses or ranges
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Enable IP Allowlisting</Label>
              <p className="text-sm text-muted-foreground">
                Only allow access from whitelisted IP addresses
              </p>
            </div>
            <Switch />
          </div>

          <Separator />

          <div className="space-y-3">
            <Label>Allowed IP Addresses</Label>
            
            {/* Add IP Form */}
            <div className="flex gap-2">
              <div className="flex-1">
                <Input
                  placeholder="IP address or CIDR (e.g., 192.168.1.0/24)"
                  value={newIP}
                  onChange={(e) => setNewIP(e.target.value)}
                />
              </div>
              <div className="flex-1">
                <Input
                  placeholder="Description (optional)"
                  value={newIPDescription}
                  onChange={(e) => setNewIPDescription(e.target.value)}
                />
              </div>
              <Button onClick={handleAddIP}>
                <Plus className="h-4 w-4 mr-2" />
                Add
              </Button>
            </div>

            {/* IP List */}
            <div className="space-y-2 mt-4">
              {allowedIPs.map((ip) => (
                <div 
                  key={ip.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex-1">
                    <p className="text-sm font-medium font-mono">{ip.address}</p>
                    <p className="text-xs text-muted-foreground">
                      {ip.description} · Added by {ip.addedBy} on {ip.addedDate}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveIP(ip.id)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
            <p className="text-sm text-amber-800 dark:text-amber-200">
              <strong>Warning:</strong> Enabling IP allowlisting will block all access from non-whitelisted IPs. Make sure to add your current IP before enabling.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* SSO Configuration */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            <CardTitle>Single Sign-On (SSO)</CardTitle>
          </div>
          <CardDescription>
            Configure SAML or OAuth-based single sign-on
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <Label>SSO Enabled</Label>
                <Badge variant="outline">Not Configured</Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Allow users to sign in with their corporate identity provider
              </p>
            </div>
            <Button onClick={() => toast.info("SSO configuration coming soon")}>
              Configure SSO
            </Button>
          </div>

          <Separator />

          <div className="space-y-2">
            <Label htmlFor="sso-provider">SSO Provider</Label>
            <Select defaultValue="saml">
              <SelectTrigger id="sso-provider">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="saml">SAML 2.0</SelectItem>
                <SelectItem value="oauth">OAuth 2.0</SelectItem>
                <SelectItem value="oidc">OpenID Connect</SelectItem>
                <SelectItem value="azure">Azure AD</SelectItem>
                <SelectItem value="okta">Okta</SelectItem>
                <SelectItem value="google">Google Workspace</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Enforce SSO</Label>
              <p className="text-sm text-muted-foreground">
                Require all users to sign in via SSO (disable password login)
              </p>
            </div>
            <Switch />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Just-in-Time Provisioning</Label>
              <p className="text-sm text-muted-foreground">
                Automatically create user accounts on first SSO login
              </p>
            </div>
            <Switch />
          </div>
        </CardContent>
      </Card>

      {/* Session Management */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            <CardTitle>Session Management</CardTitle>
          </div>
          <CardDescription>
            Configure session timeout and security policies
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="session-timeout">Session Timeout</Label>
            <Select defaultValue="30">
              <SelectTrigger id="session-timeout">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="15">15 minutes</SelectItem>
                <SelectItem value="30">30 minutes</SelectItem>
                <SelectItem value="60">1 hour</SelectItem>
                <SelectItem value="120">2 hours</SelectItem>
                <SelectItem value="480">8 hours</SelectItem>
                <SelectItem value="never">Never</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Automatically sign out users after this period of inactivity
            </p>
          </div>

          <Separator />

          <div className="space-y-2">
            <Label htmlFor="max-session-duration">Maximum Session Duration</Label>
            <Select defaultValue="12">
              <SelectTrigger id="max-session-duration">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="8">8 hours</SelectItem>
                <SelectItem value="12">12 hours</SelectItem>
                <SelectItem value="24">24 hours</SelectItem>
                <SelectItem value="168">7 days</SelectItem>
                <SelectItem value="never">Never</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Force re-authentication after this duration, regardless of activity
            </p>
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Single Session Per User</Label>
              <p className="text-sm text-muted-foreground">
                Only allow one active session per user
              </p>
            </div>
            <Switch />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Remember Me</Label>
              <p className="text-sm text-muted-foreground">
                Allow users to stay signed in for extended periods
              </p>
            </div>
            <Switch defaultChecked />
          </div>

          <Button onClick={() => toast.success("Session settings saved!")}>
            Save Session Settings
          </Button>
        </CardContent>
      </Card>

      {/* Password Policies */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            <CardTitle>Password Policies</CardTitle>
          </div>
          <CardDescription>
            Enforce strong password requirements
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="min-length">Minimum Password Length</Label>
            <Select defaultValue="12">
              <SelectTrigger id="min-length">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="8">8 characters</SelectItem>
                <SelectItem value="10">10 characters</SelectItem>
                <SelectItem value="12">12 characters</SelectItem>
                <SelectItem value="14">14 characters</SelectItem>
                <SelectItem value="16">16 characters</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Require Uppercase Letters</Label>
              <p className="text-sm text-muted-foreground">
                Password must contain at least one uppercase letter
              </p>
            </div>
            <Switch defaultChecked />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Require Lowercase Letters</Label>
              <p className="text-sm text-muted-foreground">
                Password must contain at least one lowercase letter
              </p>
            </div>
            <Switch defaultChecked />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Require Numbers</Label>
              <p className="text-sm text-muted-foreground">
                Password must contain at least one number
              </p>
            </div>
            <Switch defaultChecked />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Require Special Characters</Label>
              <p className="text-sm text-muted-foreground">
                Password must contain at least one special character
              </p>
            </div>
            <Switch defaultChecked />
          </div>

          <Separator />

          <div className="space-y-2">
            <Label htmlFor="password-expiry">Password Expiry</Label>
            <Select defaultValue="90">
              <SelectTrigger id="password-expiry">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="never">Never expires</SelectItem>
                <SelectItem value="30">30 days</SelectItem>
                <SelectItem value="60">60 days</SelectItem>
                <SelectItem value="90">90 days</SelectItem>
                <SelectItem value="180">180 days</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Force users to change their password after this period
            </p>
          </div>

          <Separator />

          <div className="space-y-2">
            <Label htmlFor="password-history">Password History</Label>
            <Select defaultValue="5">
              <SelectTrigger id="password-history">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">No history</SelectItem>
                <SelectItem value="3">Last 3 passwords</SelectItem>
                <SelectItem value="5">Last 5 passwords</SelectItem>
                <SelectItem value="10">Last 10 passwords</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Prevent reuse of recent passwords
            </p>
          </div>

          <Button onClick={() => toast.success("Password policies saved!")}>
            Save Password Policies
          </Button>
        </CardContent>
      </Card>

      {/* Login Restrictions */}
      <Card>
        <CardHeader>
          <CardTitle>Login Restrictions</CardTitle>
          <CardDescription>
            Configure login attempt limits and lockout policies
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="max-attempts">Maximum Failed Login Attempts</Label>
            <Select defaultValue="5">
              <SelectTrigger id="max-attempts">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="3">3 attempts</SelectItem>
                <SelectItem value="5">5 attempts</SelectItem>
                <SelectItem value="10">10 attempts</SelectItem>
                <SelectItem value="unlimited">Unlimited</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Lock account after this many consecutive failed login attempts
            </p>
          </div>

          <Separator />

          <div className="space-y-2">
            <Label htmlFor="lockout-duration">Account Lockout Duration</Label>
            <Select defaultValue="30">
              <SelectTrigger id="lockout-duration">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="15">15 minutes</SelectItem>
                <SelectItem value="30">30 minutes</SelectItem>
                <SelectItem value="60">1 hour</SelectItem>
                <SelectItem value="manual">Manual unlock required</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              How long to lock the account after failed attempts
            </p>
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Send Lockout Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Email user and admins when account is locked
              </p>
            </div>
            <Switch defaultChecked />
          </div>

          <Button onClick={() => toast.success("Login restrictions saved!")}>
            Save Login Restrictions
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
