"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Shield, Smartphone, Key, Clock, Copy, CheckCircle2, Download, Globe, MapPin } from "lucide-react";
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

// Mock login history data
const loginHistory = [
  {
    id: "1",
    device: "Chrome on MacBook Pro",
    location: "San Francisco, CA, United States",
    ip: "192.168.1.1",
    timestamp: "2 minutes ago",
    status: "success"
  },
  {
    id: "2",
    device: "Safari on iPhone 15",
    location: "San Francisco, CA, United States",
    ip: "192.168.1.2",
    timestamp: "2 hours ago",
    status: "success"
  },
  {
    id: "3",
    device: "Chrome on Windows",
    location: "New York, NY, United States",
    ip: "10.0.0.45",
    timestamp: "Yesterday",
    status: "success"
  },
  {
    id: "4",
    device: "Firefox on Linux",
    location: "London, United Kingdom",
    ip: "45.67.89.12",
    timestamp: "2 days ago",
    status: "failed"
  },
  {
    id: "5",
    device: "Chrome on Android",
    location: "Tokyo, Japan",
    ip: "123.45.67.89",
    timestamp: "3 days ago",
    status: "failed"
  }
];

export default function SecurityPage() {
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [setup2FADialogOpen, setSetup2FADialogOpen] = useState(false);
  const [backupCodesDialogOpen, setBackupCodesDialogOpen] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [setupStep, setSetupStep] = useState(1); // 1: QR code, 2: verification, 3: backup codes
  
  const secretKey = "JBSWY3DPEHPK3PXP"; // Mock secret for demo
  const backupCodes = [
    "ABCD-1234-EFGH",
    "IJKL-5678-MNOP",
    "QRST-9012-UVWX",
    "YZAB-3456-CDEF",
    "GHIJ-7890-KLMN",
    "OPQR-1234-STUV",
    "WXYZ-5678-ABCD",
    "EFGH-9012-IJKL"
  ];

  const handleEnable2FA = () => {
    setSetup2FADialogOpen(true);
    setSetupStep(1);
  };

  const handleVerify2FA = () => {
    if (verificationCode.length === 6) {
      setSetupStep(3);
      setTwoFactorEnabled(true);
      toast.success("Two-factor authentication enabled successfully");
    } else {
      toast.error("Please enter a valid 6-digit code");
    }
  };

  const handleDisable2FA = () => {
    setTwoFactorEnabled(false);
    toast.info("Two-factor authentication disabled");
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success("Code copied to clipboard");
  };

  const handleDownloadBackupCodes = () => {
    const content = backupCodes.join("\n");
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "backup-codes.txt";
    a.click();
    toast.success("Backup codes downloaded");
  };

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
                <Badge variant={twoFactorEnabled ? "default" : "outline"}>
                  {twoFactorEnabled ? "Enabled" : "Not Enabled"}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Require a code from your authenticator app when signing in
              </p>
            </div>
            {twoFactorEnabled ? (
              <Button 
                variant="outline" 
                onClick={handleDisable2FA}
                className="transition-all duration-150"
              >
                Disable 2FA
              </Button>
            ) : (
              <Button 
                onClick={handleEnable2FA}
                className="transition-all duration-150"
              >
                Enable 2FA
              </Button>
            )}
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
            <Button 
              variant="outline" 
              disabled={!twoFactorEnabled}
              onClick={() => setBackupCodesDialogOpen(true)}
              className="transition-all duration-150"
            >
              {twoFactorEnabled ? "View Codes" : "Generate Codes"}
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
            View your recent login activity and detect suspicious behavior
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {loginHistory.map((login) => (
              <div 
                key={login.id}
                className="flex items-start justify-between p-3 border rounded-md transition-all duration-150 hover:bg-accent/50"
              >
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div className={`rounded-full p-2 mt-1 ${
                    login.status === "success" 
                      ? "bg-green-500/10" 
                      : "bg-destructive/10"
                  }`}>
                    {login.status === "success" ? (
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                    ) : (
                      <Shield className="h-4 w-4 text-destructive" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{login.device}</p>
                    <div className="flex flex-wrap gap-2 mt-1 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {login.location}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Globe className="h-3 w-3" />
                        {login.ip}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{login.timestamp}</p>
                  </div>
                </div>
                <Badge variant={login.status === "success" ? "default" : "destructive"}>
                  {login.status === "success" ? "Success" : "Failed"}
                </Badge>
              </div>
            ))}
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

      {/* 2FA Setup Dialog */}
      <Dialog open={setup2FADialogOpen} onOpenChange={setSetup2FADialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Enable Two-Factor Authentication</DialogTitle>
            <DialogDescription>
              {setupStep === 1 && "Scan the QR code with your authenticator app"}
              {setupStep === 2 && "Enter the verification code from your app"}
              {setupStep === 3 && "Save your backup codes in a safe place"}
            </DialogDescription>
          </DialogHeader>

          {setupStep === 1 && (
            <div className="space-y-4">
              <div className="bg-white p-6 rounded-lg border">
                <div className="w-full aspect-square bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900 rounded-lg flex items-center justify-center">
                  <p className="text-sm text-muted-foreground text-center px-4">
                    QR Code would appear here<br/>
                    (Mock for demo purposes)
                  </p>
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">Or enter this key manually:</Label>
                <div className="flex items-center gap-2">
                  <code className="flex-1 px-3 py-2 bg-muted rounded-md text-sm font-mono">
                    {secretKey}
                  </code>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleCopyCode(secretKey)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-md p-3">
                <p className="text-xs text-muted-foreground">
                  Use an authenticator app like Google Authenticator, Authy, or 1Password to scan this code.
                </p>
              </div>
            </div>
          )}

          {setupStep === 2 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="verification-code">Verification Code</Label>
                <Input
                  id="verification-code"
                  placeholder="000000"
                  maxLength={6}
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ""))}
                  className="text-center text-2xl font-mono tracking-wider"
                />
                <p className="text-xs text-muted-foreground">
                  Enter the 6-digit code from your authenticator app
                </p>
              </div>
            </div>
          )}

          {setupStep === 3 && (
            <div className="space-y-4">
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-md p-4">
                <p className="text-sm font-medium mb-2">Important:</p>
                <p className="text-xs text-muted-foreground">
                  Save these backup codes in a secure location. Each code can only be used once to access your account if you lose your authenticator device.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-2 p-4 bg-muted rounded-md">
                {backupCodes.map((code, index) => (
                  <div key={index} className="font-mono text-sm">
                    {code}
                  </div>
                ))}
              </div>
              <Button
                variant="outline"
                className="w-full"
                onClick={handleDownloadBackupCodes}
              >
                <Download className="h-4 w-4 mr-2" />
                Download Backup Codes
              </Button>
            </div>
          )}

          <DialogFooter>
            {setupStep === 1 && (
              <>
                <Button variant="outline" onClick={() => setSetup2FADialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={() => setSetupStep(2)}>
                  Next
                </Button>
              </>
            )}
            {setupStep === 2 && (
              <>
                <Button variant="outline" onClick={() => setSetupStep(1)}>
                  Back
                </Button>
                <Button 
                  onClick={handleVerify2FA}
                  disabled={verificationCode.length !== 6}
                >
                  Verify & Enable
                </Button>
              </>
            )}
            {setupStep === 3 && (
              <Button 
                className="w-full"
                onClick={() => {
                  setSetup2FADialogOpen(false);
                  setSetupStep(1);
                  setVerificationCode("");
                }}
              >
                Done
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Backup Codes Dialog */}
      <Dialog open={backupCodesDialogOpen} onOpenChange={setBackupCodesDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Backup Codes</DialogTitle>
            <DialogDescription>
              Use these codes to access your account if you lose your authenticator device
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-2 p-4 bg-muted rounded-md">
              {backupCodes.map((code, index) => (
                <div 
                  key={index} 
                  className="flex items-center justify-between font-mono text-sm p-2 hover:bg-background rounded transition-colors"
                >
                  <span>{code}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleCopyCode(code)}
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
            <Button
              variant="outline"
              className="w-full"
              onClick={handleDownloadBackupCodes}
            >
              <Download className="h-4 w-4 mr-2" />
              Download All Codes
            </Button>
          </div>
          <DialogFooter>
            <Button onClick={() => setBackupCodesDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
