"use client"

import { Button } from "@/components/ui/button";
import { Plus, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { useEffect } from "react";
import { useWorkspace } from "@/contexts/workspace-context";
import { ComingSoon } from "@/components/cr";

export default function BrandsPage() {
  const { setWorkspace } = useWorkspace();

  useEffect(() => {
    setWorkspace("creative");
  }, [setWorkspace]);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Brand Profiles</h1>
          <p className="text-muted-foreground mt-1 text-sm sm:text-base">
            Manage brand guidelines, assets, and identity
          </p>
        </div>
        <Link href="/creative/brands/new">
          <Button className="w-full sm:w-auto">
            <Plus className="mr-2 h-4 w-4" />
            New Brand
          </Button>
        </Link>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input 
          placeholder="Search brands..." 
          className="pl-9"
        />
      </div>

      {/* Coming Soon Content */}
      <ComingSoon 
        title="Brand Profiles Coming Soon"
        description="The brand profile management system will allow you to create comprehensive brand guidelines that designers can reference when working on creative requests."
        features={[
          "Brand name, mission, vision & values",
          "Target audience definitions",
          "Color palettes with hex codes",
          "Typography guidelines",
          "Logo assets and usage rules",
          "Inspiration boards and references",
          "Brand personality traits",
        ]}
      />
    </div>
  );
}

