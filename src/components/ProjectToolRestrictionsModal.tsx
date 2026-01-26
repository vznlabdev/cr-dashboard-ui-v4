"use client"

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "sonner";

interface ProjectToolRestrictionsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  project: {
    id: string;
    name: string;
    toolRestriction: "all" | "restricted";
    allowedTools: string[];
  };
  availableTools: Array<{
    id: string;
    name: string;
    icon: string;
  }>;
}

export function ProjectToolRestrictionsModal({ 
  open, 
  onOpenChange,
  project,
  availableTools,
}: ProjectToolRestrictionsModalProps) {
  const [restriction, setRestriction] = useState<"all" | "restricted">(project.toolRestriction);
  const [selectedTools, setSelectedTools] = useState<string[]>(project.allowedTools);

  useEffect(() => {
    setRestriction(project.toolRestriction);
    setSelectedTools(project.allowedTools);
  }, [project]);

  const toggleTool = (toolId: string) => {
    setSelectedTools(prev =>
      prev.includes(toolId)
        ? prev.filter(id => id !== toolId)
        : [...prev, toolId]
    );
  };

  const handleSave = () => {
    if (restriction === "restricted" && selectedTools.length === 0) {
      toast.error("Please select at least one tool");
      return;
    }

    const toolNames = restriction === "all" 
      ? "all tools"
      : selectedTools
          .map(id => availableTools.find(t => t.id === id)?.name)
          .filter((name): name is string => name !== undefined)
          .join(", ");

    toast.success(`Tool restrictions updated for ${project.name}`);
    console.log({
      projectId: project.id,
      restriction,
      selectedTools: restriction === "restricted" ? selectedTools : [],
    });
    
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto !bg-white dark:!bg-gray-950 !backdrop-blur-none [backdrop-filter:none!important] [-webkit-backdrop-filter:none!important]">
        <DialogHeader>
          <DialogTitle>Configure Tools for {project.name}</DialogTitle>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Control which AI tools can be used in this project
          </p>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <RadioGroup
            value={restriction}
            onValueChange={(value: "all" | "restricted") => setRestriction(value)}
            className="space-y-3"
          >
            <div className="flex items-start space-x-3 p-3 rounded-lg border border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700 transition-colors cursor-pointer">
              <RadioGroupItem value="all" id="all-tools" className="mt-0.5" />
              <div className="flex-1">
                <Label htmlFor="all-tools" className="font-medium cursor-pointer">
                  Use all approved tools (default)
                </Label>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  All approved AI tools can be used in this project
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3 p-3 rounded-lg border border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700 transition-colors cursor-pointer">
              <RadioGroupItem value="restricted" id="restricted-tools" className="mt-0.5" />
              <div className="flex-1">
                <Label htmlFor="restricted-tools" className="font-medium cursor-pointer">
                  Restrict to specific tools
                </Label>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  Only selected tools can be used in this project
                </p>
              </div>
            </div>
          </RadioGroup>

          {/* Tool Selection */}
          {restriction === "restricted" && (
            <div className="p-4 border border-gray-200 dark:border-gray-800 rounded-lg space-y-3">
              <Label className="text-sm font-medium">
                Select Allowed Tools <span className="text-red-500">*</span>
              </Label>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {availableTools.map((tool) => (
                  <label
                    key={tool.id}
                    className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selectedTools.includes(tool.id)}
                      onChange={() => toggleTool(tool.id)}
                      className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-xl">{tool.icon}</span>
                    <span className="text-sm font-medium">{tool.name}</span>
                  </label>
                ))}
              </div>
              {selectedTools.length > 0 && (
                <p className="text-xs text-gray-500 mt-2">
                  {selectedTools.length} tool{selectedTools.length !== 1 ? 's' : ''} selected
                </p>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            Save Restrictions
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
