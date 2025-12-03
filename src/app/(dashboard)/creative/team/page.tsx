"use client"

import { Button } from "@/components/ui/button";
import { Plus, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useEffect } from "react";
import { useWorkspace } from "@/contexts/workspace-context";
import { ComingSoon } from "@/components/cr";

export default function TeamPage() {
  const { setWorkspace } = useWorkspace();

  useEffect(() => {
    setWorkspace("creative");
  }, [setWorkspace]);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Team</h1>
          <p className="text-muted-foreground mt-1 text-sm sm:text-base">
            Manage team members and workload distribution
          </p>
        </div>
        <Button className="w-full sm:w-auto">
          <Plus className="mr-2 h-4 w-4" />
          Add Member
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input 
          placeholder="Search team members..." 
          className="pl-9"
        />
      </div>

      {/* Coming Soon Content */}
      <ComingSoon 
        title="Team Management Coming Soon"
        description="The team management view will help team leaders balance workload, track productivity, and manage assignments across designers and creatives."
        features={[
          "Team member profiles and roles",
          "Workload visualization",
          "Assignment management",
          "Availability tracking",
          "Performance metrics",
          "Skill-based assignment matching",
        ]}
      />
    </div>
  );
}

