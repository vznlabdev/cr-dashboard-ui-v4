"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { AlertTriangle, X } from "lucide-react";
import { SettingsPageHeader } from "@/components/settings/SettingsPageHeader";

export default function AccountPage() {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [confirmEmail, setConfirmEmail] = useState("");
  const userEmail = "john.doe@company.com"; // This would come from user context

  const handleDeleteAccount = () => {
    if (confirmEmail !== userEmail) {
      toast.error("Email doesn't match. Please try again.");
      return;
    }
    
    // In a real app, this would call the API
    toast.success("Account deletion request submitted");
    setDeleteDialogOpen(false);
    setConfirmEmail("");
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <SettingsPageHeader
        title="Account"
        description="Manage your account information and preferences"
      />

      {/* Profile Information */}
      <Card>
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
          <CardDescription>
            Update your personal details and contact information
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="full-name">Full Name</Label>
            <Input id="full-name" defaultValue="John Doe" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input id="email" type="email" defaultValue="john.doe@company.com" />
            <p className="text-xs text-muted-foreground">
              We&apos;ll send a verification email if you change this
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="job-title">Job Title</Label>
            <Input id="job-title" defaultValue="Creative Director" />
          </div>

          <Button onClick={() => toast.success("Profile updated successfully!")}>
            Save Changes
          </Button>
        </CardContent>
      </Card>

      {/* Password */}
      <Card>
        <CardHeader>
          <CardTitle>Password</CardTitle>
          <CardDescription>
            Change your password to keep your account secure
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="current-password">Current Password</Label>
            <Input id="current-password" type="password" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="new-password">New Password</Label>
            <Input id="new-password" type="password" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirm-password">Confirm New Password</Label>
            <Input id="confirm-password" type="password" />
          </div>

          <Button onClick={() => toast.success("Password updated successfully!")}>
            Update Password
          </Button>
        </CardContent>
      </Card>

      {/* Email Preferences */}
      <Card>
        <CardHeader>
          <CardTitle>Email Preferences</CardTitle>
          <CardDescription>
            Choose what emails you want to receive
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email-frequency">Email Frequency</Label>
            <select 
              id="email-frequency"
              className="w-full p-2 border rounded-md"
              defaultValue="daily"
            >
              <option value="realtime">Real-time</option>
              <option value="daily">Daily Digest</option>
              <option value="weekly">Weekly Digest</option>
              <option value="never">Never</option>
            </select>
          </div>

          <Button onClick={() => toast.success("Email preferences updated!")}>
            Save Preferences
          </Button>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-red-500/30">
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            <CardTitle className="text-red-600 dark:text-red-400">Danger Zone</CardTitle>
          </div>
          <CardDescription>
            Irreversible actions for your account
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Separator />
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-red-600 dark:text-red-400">Delete Account</Label>
              <p className="text-sm text-muted-foreground">
                Permanently delete your account and all associated data
              </p>
            </div>
            <Button 
              variant="destructive"
              onClick={() => setDeleteDialogOpen(true)}
              className="transition-all duration-150"
            >
              Delete Account
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Delete Account Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <div className="flex items-center gap-2">
              <div className="rounded-full p-2 bg-destructive/10">
                <AlertTriangle className="h-5 w-5 text-destructive" />
              </div>
              <DialogTitle>Delete Account</DialogTitle>
            </div>
            <DialogDescription className="pt-3">
              This action cannot be undone. This will permanently delete your account and remove all your data from our servers.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="bg-destructive/10 border border-destructive/20 rounded-md p-4">
              <h4 className="text-sm font-semibold text-destructive mb-2">Warning: This will delete:</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• All your projects and assets</li>
                <li>• All compliance and legal records</li>
                <li>• All team memberships and invitations</li>
                <li>• All integration connections</li>
                <li>• All historical data and analytics</li>
              </ul>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm-email">
                Type <span className="font-mono font-semibold">{userEmail}</span> to confirm
              </Label>
              <Input
                id="confirm-email"
                type="email"
                placeholder="Enter your email address"
                value={confirmEmail}
                onChange={(e) => setConfirmEmail(e.target.value)}
                className="font-mono"
              />
            </div>
          </div>

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setDeleteDialogOpen(false);
                setConfirmEmail("");
              }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteAccount}
              disabled={confirmEmail !== userEmail}
              className="transition-all duration-150"
            >
              <AlertTriangle className="h-4 w-4 mr-2" />
              Permanently Delete Account
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
