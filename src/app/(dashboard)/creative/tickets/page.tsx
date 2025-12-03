"use client"

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Filter, LayoutGrid, List } from "lucide-react";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { useEffect } from "react";
import { useWorkspace } from "@/contexts/workspace-context";
import { ComingSoon } from "@/components/cr";

export default function TicketsPage() {
  const { setWorkspace } = useWorkspace();

  useEffect(() => {
    setWorkspace("creative");
  }, [setWorkspace]);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Tickets</h1>
          <p className="text-muted-foreground mt-1 text-sm sm:text-base">
            Manage creative requests and track progress
          </p>
        </div>
        <Link href="/creative/tickets/new">
          <Button className="w-full sm:w-auto">
            <Plus className="mr-2 h-4 w-4" />
            New Request
          </Button>
        </Link>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search tickets..." 
            className="pl-9"
          />
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="icon">
            <Filter className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon">
            <LayoutGrid className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon">
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Status Tabs */}
      <div className="flex gap-2 flex-wrap">
        {statusTabs.map((tab) => (
          <Badge 
            key={tab.name} 
            variant={tab.active ? "default" : "outline"}
            className="cursor-pointer hover:bg-primary/80 transition-colors"
          >
            {tab.name} ({tab.count})
          </Badge>
        ))}
      </div>

      {/* Coming Soon Content */}
      <ComingSoon 
        title="Tickets Board Coming Soon"
        description="The full ticket management system with kanban board, list view, and detailed ticket pages is under development. You'll be able to create, assign, and track creative requests through the complete workflow."
        features={[
          "Kanban board view with drag & drop",
          "List view with advanced filtering",
          "Ticket detail pages with version history",
          "Time tracking and estimates",
          "File attachments and comments",
          "Workflow automation",
        ]}
      />
    </div>
  );
}

const statusTabs = [
  { name: "All", count: 22, active: true },
  { name: "Submitted", count: 3, active: false },
  { name: "Assessment", count: 2, active: false },
  { name: "Assigned", count: 2, active: false },
  { name: "Production", count: 5, active: false },
  { name: "QA Review", count: 2, active: false },
  { name: "Delivered", count: 8, active: false },
];

