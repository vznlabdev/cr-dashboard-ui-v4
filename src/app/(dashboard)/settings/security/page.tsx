"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Shield, Smartphone, Key, Clock } from "lucide-react";
import { SettingsPageHeader } from "@/components/settings/SettingsPageHeader";

// Mock data for active sessions
const activeSessions = [
  {
    id: "1",
    device: "Chrome on MacBook Pro",
    location: "San Francisco, CA",
    lastActive: "Active now",
    current: true,
  },
  {
    id: "2",
    device: "Safari on iPhone 15",
    location: "San Francisco, CA",
    lastActive: "2 hours ago",
    current: false,
  },
  {
    id: "3",
    device: "Chrome on Windows",
    location: "New York, NY",
    lastActive: "Yesterday",
    current: false,
  },
];

export default function SecurityPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <SettingsPageHeader
        title="Security & Access"
        description="Manage your account security and access controls"
      />

      {/* Two-Factor Authentication */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            <CardTitle>Two-Factor Authentication</CardTitle>
          </div>
          <CardDescription>
            Add an extra layer of security to your account
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <Label>Two-Factor Authentication</Label>
                <Badge variant="outline">Not Enabled</Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Require a code from your authenticator app when signing in
              </p>
            </div>
            <Button onClick={() => toast.info("2FA setup coming soon")}>
              Enable 2FA
            </Button>
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <Smartphone className="h-4 w-4" />
                <Label>SMS Backup</Label>
              </div>
              <p className="text-sm text-muted-foreground">
                Receive backup codes via SMS
              </p>
            </div>
            <Button variant="outline" disabled>
              Configure
            </Button>
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <Key className="h-4 w-4" />
                <Label>Backup Codes</Label>
              </div>
              <p className="text-sm text-muted-foreground">
                Generate backup codes for emergency access
              </p>
            </div>
            <Button variant="outline" disabled>
              Generate Codes
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Security Keys */}
      <Card>
        <CardHeader>
          <CardTitle>Security Keys</CardTitle>
          <CardDescription>
            Use hardware security keys for the strongest protection
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center py-8 text-muted-foreground">
            <Key className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p className="text-sm">No security keys registered</p>
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={() => toast.info("Security key registration coming soon")}
            >
              Register Security Key
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Active Sessions */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            <CardTitle>Active Sessions</CardTitle>
          </div>
          <CardDescription>
            Manage devices that are currently signed in to your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {activeSessions.map((session) => (
              <div 
                key={session.id}
                className="flex items-center justify-between pb-4 border-b last:border-0"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium">{session.device}</p>
                    {session.current && (
                      <Badge variant="outline" className="text-xs">
                        Current Session
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {session.location} · {session.lastActive}
                  </p>
                </div>
                {!session.current && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toast.success(`Session revoked: ${session.device}`)}
                  >
                    Revoke
                  </Button>
                )}
              </div>
            ))}
          </div>
          <div className="mt-4">
            <Button 
              variant="outline"
              onClick={() => toast.success("All other sessions revoked")}
            >
              Revoke All Other Sessions
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Login History */}
      <Card>
        <CardHeader>
          <CardTitle>Login History</CardTitle>
          <CardDescription>
            View your recent login activity
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <p className="text-sm">Login history feature coming soon</p>
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={() => toast.info("Login history coming soon")}
            >
              View Full History
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Session Timeout */}
      <Card>
        <CardHeader>
          <CardTitle>Session Timeout</CardTitle>
          <CardDescription>
            Automatically sign out after period of inactivity
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Automatic Sign Out</Label>
              <p className="text-sm text-muted-foreground">
                Sign out after 30 minutes of inactivity
              </p>
            </div>
            <Switch defaultChecked />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
