"use client"

import { Button } from "@/components/ui/button";
import { Upload, Search, Filter, LayoutGrid, List } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useEffect } from "react";
import { useWorkspace } from "@/contexts/workspace-context";
import { ComingSoon } from "@/components/cr";

export default function AssetsPage() {
  const { setWorkspace } = useWorkspace();

  useEffect(() => {
    setWorkspace("creative");
  }, [setWorkspace]);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Asset Library</h1>
          <p className="text-muted-foreground mt-1 text-sm sm:text-base">
            Browse and manage deliverables and creative assets
          </p>
        </div>
        <Button className="w-full sm:w-auto">
          <Upload className="mr-2 h-4 w-4" />
          Upload Assets
        </Button>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search assets..." 
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

      {/* Coming Soon Content */}
      <ComingSoon 
        title="Asset Library Coming Soon"
        description="The asset library will provide a centralized location for all delivered creative work, organized by project, brand, and type."
        features={[
          "Grid and list view options",
          "Filter by brand, project, or type",
          "Version history for each asset",
          "Download in multiple formats",
          "Asset tagging and categorization",
          "Quick preview and sharing",
        ]}
      />
    </div>
  );
}

