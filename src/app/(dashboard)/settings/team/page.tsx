"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Users, UserPlus } from "lucide-react";
import { InviteMemberDialog } from "@/components/cr";
import { useState } from "react";
import { SettingsPageHeader } from "@/components/settings/SettingsPageHeader";

// Mock data
const teamMembers: Array<{
  name: string;
  email: string;
  initials: string;
  role: string;
  roleVariant: "default" | "secondary" | "outline" | "destructive";
}> = [
  {
    name: "Sarah Johnson",
    email: "sarah@company.com",
    initials: "SJ",
    role: "Company Admin",
    roleVariant: "default",
  },
  {
    name: "Michael Chen",
    email: "michael@company.com",
    initials: "MC",
    role: "Legal Reviewer",
    roleVariant: "secondary",
  },
  {
    name: "Emma Davis",
    email: "emma@company.com",
    initials: "ED",
    role: "Insurance Analyst",
    roleVariant: "secondary",
  },
  {
    name: "James Wilson",
    email: "james@company.com",
    initials: "JW",
    role: "Content Creator",
    roleVariant: "outline",
  },
];

export default function TeamPage() {
  const [inviteMemberOpen, setInviteMemberOpen] = useState(false);

  return (
    <div className="space-y-6 animate-fade-in">
      <SettingsPageHeader
        title="Team"
        description="Manage team access and role-based permissions"
        actions={
          <Button onClick={() => setInviteMemberOpen(true)}>
            <UserPlus className="mr-2 h-4 w-4" />
            Invite Member
          </Button>
        }
      />

      {/* Team Members */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            <CardTitle>Team Members</CardTitle>
          </div>
          <CardDescription>
            Manage team access and role-based permissions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {teamMembers.map((member, index) => (
              <div key={index} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b last:border-0">
                <div className="flex items-center gap-3 flex-1 w-full">
                  <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center shrink-0">
                    <span className="text-sm font-medium">{member.initials}</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">{member.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{member.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <Badge variant={member.roleVariant} className="shrink-0">{member.role}</Badge>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => toast.info(`Edit ${member.name} - feature coming soon`)}
                    className="shrink-0"
                  >
                    Edit
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Invite Member Dialog */}
      <InviteMemberDialog
        open={inviteMemberOpen}
        onOpenChange={setInviteMemberOpen}
      />
    </div>
  );
}
