"use client"

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { UserPlus, Loader2, Upload, Users } from "lucide-react";

interface InviteMemberDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultRole?: string;
  onInviteSent?: (count: number) => void;
}

export function InviteMemberDialog({ 
  open, 
  onOpenChange, 
  defaultRole,
  onInviteSent 
}: InviteMemberDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState("single");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: defaultRole || "Content Creator",
  });
  const [bulkData, setBulkData] = useState({
    csvText: "",
    role: defaultRole || "Content Creator",
  });

  // Update role when defaultRole changes
  useEffect(() => {
    if (defaultRole && open) {
      setFormData(prev => ({ ...prev, role: defaultRole }));
      setBulkData(prev => ({ ...prev, role: defaultRole }));
    }
  }, [defaultRole, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.name.trim()) {
      toast.error("Name is required");
      return;
    }
    if (!formData.email.trim() || !formData.email.includes("@")) {
      toast.error("Valid email is required");
      return;
    }

    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 800));
    
    toast.success(`Invitation sent to ${formData.email}!`);
    
    // Callback with count
    onInviteSent?.(1);
    
    // Reset form
    setFormData({
      name: "",
      email: "",
      role: defaultRole || "Content Creator",
    });
    
    setIsSubmitting(false);
    onOpenChange(false);
  };

  const handleBulkSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Parse CSV (simple parsing: email,name per line)
    const lines = bulkData.csvText
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0);
    
    if (lines.length === 0) {
      toast.error("Please enter at least one email");
      return;
    }

    // Validate emails
    const invites = lines.map(line => {
      const parts = line.split(',').map(p => p.trim());
      return {
        email: parts[0],
        name: parts[1] || parts[0].split('@')[0],
      };
    });

    const invalidEmails = invites.filter(inv => !inv.email.includes('@'));
    if (invalidEmails.length > 0) {
      toast.error(`Invalid email format: ${invalidEmails[0].email}`);
      return;
    }

    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1200));
    
    toast.success(`${invites.length} invitation${invites.length > 1 ? 's' : ''} sent!`);
    
    // Callback with count
    onInviteSent?.(invites.length);
    
    // Reset form
    setBulkData({
      csvText: "",
      role: defaultRole || "Content Creator",
    });
    
    setIsSubmitting(false);
    onOpenChange(false);
  };

  const getRoleLabel = (role: string) => {
    const labels: Record<string, string> = {
      "Company Admin": "Company Admin",
      "Legal Reviewer": "Legal Reviewer",
      "Insurance Analyst": "Insurance Analyst",
      "Content Creator": "Content Creator",
      "Creative Director": "Creative Director",
      "Marketing Manager": "Marketing Manager",
    };
    return labels[role] || role;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Invite Team Member{defaultRole && ` as ${getRoleLabel(defaultRole)}`}
          </DialogTitle>
          <DialogDescription>
            Send invitations to join your team
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="single" className="gap-2">
              <UserPlus className="h-4 w-4" />
              Single Invite
            </TabsTrigger>
            <TabsTrigger value="bulk" className="gap-2">
              <Users className="h-4 w-4" />
              Bulk Invite
            </TabsTrigger>
          </TabsList>

          {/* Single Invite Tab */}
          <TabsContent value="single">
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="member-name">
                    Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="member-name"
                    placeholder="e.g., John Doe"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    disabled={isSubmitting}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="member-email">
                    Email <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="member-email"
                    type="email"
                    placeholder="e.g., john@company.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    disabled={isSubmitting}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="member-role">Role</Label>
                  <Select
                    value={formData.role}
                    onValueChange={(value) => setFormData({ ...formData, role: value })}
                    disabled={isSubmitting}
                  >
                    <SelectTrigger id="member-role">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Company Admin">Company Admin</SelectItem>
                      <SelectItem value="Legal Reviewer">Legal Reviewer</SelectItem>
                      <SelectItem value="Insurance Analyst">Insurance Analyst</SelectItem>
                      <SelectItem value="Content Creator">Content Creator</SelectItem>
                      <SelectItem value="Creative Director">Creative Director</SelectItem>
                      <SelectItem value="Marketing Manager">Marketing Manager</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Send Invitation
                </Button>
              </DialogFooter>
            </form>
          </TabsContent>

          {/* Bulk Invite Tab */}
          <TabsContent value="bulk">
            <form onSubmit={handleBulkSubmit}>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="bulk-emails">
                    Email Addresses <span className="text-destructive">*</span>
                  </Label>
                  <Textarea
                    id="bulk-emails"
                    placeholder="Enter one email per line, or use CSV format:&#10;email@example.com, John Doe&#10;another@example.com, Jane Smith"
                    value={bulkData.csvText}
                    onChange={(e) => setBulkData({ ...bulkData, csvText: e.target.value })}
                    disabled={isSubmitting}
                    rows={6}
                    className="font-mono text-sm"
                  />
                  <p className="text-xs text-muted-foreground">
                    Format: email@domain.com or email@domain.com, Full Name
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bulk-role">Role for all invitees</Label>
                  <Select
                    value={bulkData.role}
                    onValueChange={(value) => setBulkData({ ...bulkData, role: value })}
                    disabled={isSubmitting}
                  >
                    <SelectTrigger id="bulk-role">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Company Admin">Company Admin</SelectItem>
                      <SelectItem value="Legal Reviewer">Legal Reviewer</SelectItem>
                      <SelectItem value="Insurance Analyst">Insurance Analyst</SelectItem>
                      <SelectItem value="Content Creator">Content Creator</SelectItem>
                      <SelectItem value="Creative Director">Creative Director</SelectItem>
                      <SelectItem value="Marketing Manager">Marketing Manager</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Send Invitations
                </Button>
              </DialogFooter>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

