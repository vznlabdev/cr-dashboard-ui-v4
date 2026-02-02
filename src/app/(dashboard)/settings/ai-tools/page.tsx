"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { AddAIToolModal } from "@/components/AddAIToolModal";
import { EditAIToolModal } from "@/components/EditAIToolModal";
import { ImportToolTemplatesModal } from "@/components/ImportToolTemplatesModal";
import { ToolUsageAnalyticsModal } from "@/components/ToolUsageAnalyticsModal";
import { useState } from "react";
import { FileDown, Search, CheckSquare, X as XIcon, Plus, AlertTriangle } from "lucide-react";
import { SettingsPageHeader } from "@/components/settings/SettingsPageHeader";

// Mock data
const aiToolsWhitelist: Array<{
  id: string;
  name: string;
  icon: string;
  category: string;
  baseUrl: string;
  status: "Approved" | "Under Review" | "Pending Approval" | "Archived";
  statusVariant: "default" | "secondary" | "outline" | "destructive";
  trackingLevel: "Full Tracking" | "Good Tracking" | "Basic Tracking";
  trackingVariant: "default" | "secondary" | "outline";
  approved: boolean;
  active: boolean;
  projectCount?: number;
  taskCount?: number;
  lastUsed?: string;
  createdAt: string;
  createdBy: string;
  description?: string;
  projectAvailability: "all" | "restricted";
  selectedProjects?: string[];
}> = [
  {
    id: "1",
    name: "Midjourney",
    icon: "🎨",
    category: "Image Generation",
    baseUrl: "https://midjourney.com",
    status: "Approved",
    statusVariant: "default",
    trackingLevel: "Full Tracking",
    trackingVariant: "default",
    approved: true,
    active: true,
    projectCount: 24,
    taskCount: 187,
    lastUsed: "2h ago",
    createdAt: "Jan 15, 2026",
    createdBy: "Sarah Chen",
    description: "AI image generation tool",
    projectAvailability: "all",
  },
  {
    id: "2",
    name: "ChatGPT",
    icon: "💬",
    category: "Text Generation",
    baseUrl: "https://chat.openai.com",
    status: "Approved",
    statusVariant: "default",
    trackingLevel: "Full Tracking",
    trackingVariant: "default",
    approved: true,
    active: true,
    projectCount: 18,
    taskCount: 243,
    lastUsed: "1h ago",
    createdAt: "Jan 10, 2026",
    createdBy: "Michael Chen",
    description: "Large language model for text generation",
    projectAvailability: "all",
  },
  {
    id: "3",
    name: "ElevenLabs",
    icon: "🎙️",
    category: "Audio Generation",
    baseUrl: "https://elevenlabs.io",
    status: "Approved",
    statusVariant: "default",
    trackingLevel: "Good Tracking",
    trackingVariant: "secondary",
    approved: true,
    active: true,
    projectCount: 8,
    taskCount: 45,
    lastUsed: "5h ago",
    createdAt: "Jan 8, 2026",
    createdBy: "Emma Davis",
    description: "AI voice synthesis and cloning",
    projectAvailability: "all",
  },
];

export default function AIToolsPage() {
  const [addToolOpen, setAddToolOpen] = useState(false);
  const [editToolOpen, setEditToolOpen] = useState(false);
  const [importTemplatesOpen, setImportTemplatesOpen] = useState(false);
  const [usageAnalyticsOpen, setUsageAnalyticsOpen] = useState(false);
  const [selectedTool, setSelectedTool] = useState<typeof aiToolsWhitelist[0] | null>(null);
  const [templateData, setTemplateData] = useState<any>(null);
  
  // Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [trackingFilter, setTrackingFilter] = useState("all");
  
  // Bulk selection states
  const [selectedToolIds, setSelectedToolIds] = useState<string[]>([]);
  const [bulkActionModalOpen, setBulkActionModalOpen] = useState(false);
  const [bulkAction, setBulkAction] = useState<"approve" | "activate" | "deactivate" | "delete" | null>(null);

  const handleImportTemplate = (template: any) => {
    setTemplateData({
      name: template.name,
      baseUrl: template.baseUrl,
      category: template.category,
      trackingLevel: template.trackingLevel,
      description: template.description,
    });
    setAddToolOpen(true);
  };

  // Filter tools based on search and filters
  const filteredTools = aiToolsWhitelist.filter((tool) => {
    // Search filter
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = 
      tool.name.toLowerCase().includes(searchLower) ||
      tool.category.toLowerCase().includes(searchLower) ||
      tool.baseUrl.toLowerCase().includes(searchLower);

    if (!matchesSearch) return false;

    // Category filter
    if (categoryFilter !== "all" && tool.category !== categoryFilter) {
      return false;
    }

    // Status filter
    if (statusFilter !== "all") {
      if (statusFilter === "Active" && !tool.active) return false;
      if (statusFilter === "Inactive" && tool.active) return false;
      if (statusFilter !== "Active" && statusFilter !== "Inactive" && tool.status !== statusFilter) {
        return false;
      }
    }

    // Tracking level filter
    if (trackingFilter !== "all" && tool.trackingLevel !== trackingFilter) {
      return false;
    }

    return true;
  });

  // Bulk selection handlers
  const toggleToolSelection = (toolId: string) => {
    setSelectedToolIds(prev => 
      prev.includes(toolId) 
        ? prev.filter(id => id !== toolId)
        : [...prev, toolId]
    );
  };

  const clearSelection = () => {
    setSelectedToolIds([]);
  };

  const handleBulkAction = (action: "approve" | "activate" | "deactivate" | "delete") => {
    setBulkAction(action);
    setBulkActionModalOpen(true);
  };

  const confirmBulkAction = () => {
    const selectedTools = aiToolsWhitelist.filter(tool => selectedToolIds.includes(tool.id));
    
    switch (bulkAction) {
      case "approve":
        toast.success(`${selectedToolIds.length} tools approved successfully`);
        break;
      case "activate":
        toast.success(`${selectedToolIds.length} tools activated successfully`);
        break;
      case "deactivate":
        toast.success(`${selectedToolIds.length} tools deactivated successfully`);
        break;
      case "delete":
        const cannotDelete = selectedTools.filter(tool => (tool.taskCount || 0) > 0);
        if (cannotDelete.length > 0) {
          toast.error(`Cannot delete ${cannotDelete.length} tools that have tasks using them`);
        } else {
          toast.success(`${selectedToolIds.length} tools deleted successfully`);
        }
        break;
    }
    
    setBulkActionModalOpen(false);
    clearSelection();
  };

  const selectedTools = aiToolsWhitelist.filter(tool => selectedToolIds.includes(tool.id));
  const canDeleteAll = selectedTools.every(tool => (tool.taskCount || 0) === 0);

  return (
    <div className="space-y-6 animate-fade-in">
      <SettingsPageHeader
        title="AI Tool Whitelist"
        description="Manage which AI tools are approved for content creation"
        actions={
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setImportTemplatesOpen(true)}
            >
              <FileDown className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Import from Templates</span>
              <span className="sm:hidden">Import</span>
            </Button>
            <Button 
              size="sm"
              onClick={() => {
                setTemplateData(null);
                setAddToolOpen(true);
              }}
            >
              <Plus className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Add New Tool</span>
              <span className="sm:hidden">Add</span>
            </Button>
          </div>
        }
      />

      {/* Main AI Tools Card */}
      <Card>
        <CardHeader>
          <CardTitle>AI Tool Whitelist</CardTitle>
          <CardDescription>
            Manage which AI tools are approved for content creation
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Bulk Action Bar */}
          {selectedToolIds.length > 0 && (
            <div className="mb-4 p-4 rounded-lg border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <CheckSquare className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  <span className="font-medium text-blue-900 dark:text-blue-100">
                    {selectedToolIds.length} tool{selectedToolIds.length !== 1 ? 's' : ''} selected
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleBulkAction("approve")}
                  >
                    Approve All
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleBulkAction("activate")}
                  >
                    Activate All
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleBulkAction("deactivate")}
                  >
                    Deactivate All
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleBulkAction("delete")}
                    disabled={!canDeleteAll}
                    className="text-red-600 hover:text-red-700 dark:text-red-400"
                  >
                    Delete All
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={clearSelection}
                  >
                    <XIcon className="w-4 h-4 mr-1" />
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Filter Bar */}
          <div className="space-y-4 mb-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {/* Search */}
              <div className="relative sm:col-span-2 lg:col-span-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search tools..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>

              {/* Category Filter */}
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="Image Generation">Image Generation</SelectItem>
                  <SelectItem value="Text Generation">Text Generation</SelectItem>
                  <SelectItem value="Video Generation">Video Generation</SelectItem>
                  <SelectItem value="Audio Generation">Audio Generation</SelectItem>
                </SelectContent>
              </Select>

              {/* Status Filter */}
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Inactive">Inactive</SelectItem>
                  <SelectItem value="Approved">Approved</SelectItem>
                </SelectContent>
              </Select>

              {/* Tracking Level Filter */}
              <Select value={trackingFilter} onValueChange={setTrackingFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Tracking Levels" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Tracking Levels</SelectItem>
                  <SelectItem value="Full Tracking">Full Tracking</SelectItem>
                  <SelectItem value="Good Tracking">Good Tracking</SelectItem>
                  <SelectItem value="Basic Tracking">Basic Tracking</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Result Count */}
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Showing {filteredTools.length} of {aiToolsWhitelist.length} tools
            </p>
          </div>

          {/* Tools List */}
          <div className="space-y-4">
            {filteredTools.map((tool) => (
              <div 
                key={tool.id} 
                className={cn(
                  "relative p-4 rounded-lg border transition-all duration-200",
                  "hover:shadow-md hover:border-gray-300 dark:hover:border-gray-700",
                  selectedToolIds.includes(tool.id) && "ring-2 ring-blue-500 dark:ring-blue-400",
                  tool.active 
                    ? "border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900" 
                    : "border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50 opacity-60"
                )}
              >
                {/* Selection Checkbox */}
                <div className="absolute top-4 left-4 z-10">
                  <input
                    type="checkbox"
                    checked={selectedToolIds.includes(tool.id)}
                    onChange={() => toggleToolSelection(tool.id)}
                    className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                </div>

                {/* Active/Inactive Badge */}
                <div className="absolute top-4 right-4">
                  <Badge variant={tool.active ? "default" : "outline"}>
                    {tool.active ? "Active" : "Inactive"}
                  </Badge>
                </div>

                <div className="flex items-start gap-3 pl-6">
                  <div className="text-2xl flex-shrink-0">{tool.icon}</div>
                  <div className="space-y-2 flex-1">
                    <div>
                      <p className="text-sm font-semibold">{tool.name}</p>
                      <a 
                        href={tool.baseUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-muted-foreground hover:text-blue-600 font-mono"
                      >
                        {tool.baseUrl}
                      </a>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs text-muted-foreground">{tool.category}</span>
                      <Badge variant="outline" className="text-xs">
                        {tool.trackingLevel}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {tool.status}
                      </Badge>
                    </div>

                    {(tool.projectCount || tool.taskCount) && (
                      <p className="text-xs text-muted-foreground">
                        {tool.projectCount && `${tool.projectCount} projects`}
                        {tool.projectCount && tool.taskCount && " · "}
                        {tool.taskCount && `${tool.taskCount} tasks`}
                        {tool.lastUsed && ` · Last used: ${tool.lastUsed}`}
                      </p>
                    )}

                    <div className="flex items-center gap-2 pt-1">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => {
                          setSelectedTool(tool);
                          setEditToolOpen(true);
                        }}
                      >
                        Edit
                      </Button>
                      {tool.active ? (
                        <>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => {
                              setSelectedTool(tool);
                              setUsageAnalyticsOpen(true);
                            }}
                          >
                            View Usage
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => toast.success(`${tool.name} deactivated`)}
                            className="text-orange-600 hover:text-orange-700"
                          >
                            Deactivate
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => toast.success(`${tool.name} reactivated`)}
                            className="text-green-600 hover:text-green-700"
                          >
                            Reactivate
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => toast.info(`Archive ${tool.name}`)}
                            className="text-red-600 hover:text-red-700"
                          >
                            Archive
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Modals */}
      <ImportToolTemplatesModal
        open={importTemplatesOpen}
        onOpenChange={setImportTemplatesOpen}
        onImport={handleImportTemplate}
      />

      <AddAIToolModal
        open={addToolOpen}
        onOpenChange={(open) => {
          setAddToolOpen(open);
          if (!open) setTemplateData(null);
        }}
        initialData={templateData}
      />

      {selectedTool && (
        <EditAIToolModal
          open={editToolOpen}
          onOpenChange={setEditToolOpen}
          tool={{
            ...selectedTool,
            status: selectedTool.active ? "Active" : "Inactive",
            trackingLevel: selectedTool.trackingLevel.replace(" Tracking", ""),
          }}
        />
      )}

      {selectedTool && (
        <ToolUsageAnalyticsModal
          open={usageAnalyticsOpen}
          onOpenChange={setUsageAnalyticsOpen}
          tool={{
            name: selectedTool.name,
            icon: selectedTool.icon,
            taskCount: selectedTool.taskCount || 0,
            projectCount: selectedTool.projectCount || 0,
          }}
        />
      )}

      {/* Bulk Action Confirmation Modal */}
      <Dialog open={bulkActionModalOpen} onOpenChange={setBulkActionModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {bulkAction === "delete" && (
                <AlertTriangle className="w-5 h-5 text-red-600" />
              )}
              Confirm Bulk Action
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm mb-3">
              Are you sure you want to{" "}
              <span className="font-semibold">
                {bulkAction === "approve" && "approve"}
                {bulkAction === "activate" && "activate"}
                {bulkAction === "deactivate" && "deactivate"}
                {bulkAction === "delete" && "delete"}
              </span>{" "}
              {selectedToolIds.length} tool{selectedToolIds.length !== 1 ? "s" : ""}?
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBulkActionModalOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={confirmBulkAction}
              className={cn(
                bulkAction === "delete" && "bg-red-600 hover:bg-red-700 text-white"
              )}
              disabled={bulkAction === "delete" && !canDeleteAll}
            >
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
