"use client";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { Check, AlertTriangle, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { WhitelistedTool } from "@/types/workflow-builder";

function approvalStatusLabel(status: WhitelistedTool["approvalStatus"]) {
  switch (status) {
    case "approved":
      return "Approved";
    case "pending_review":
      return "Pending Review";
    case "restricted":
      return "Restricted";
    case "blocked":
      return "Blocked";
    default:
      return status;
  }
}

function approvalStatusClass(status: WhitelistedTool["approvalStatus"]) {
  switch (status) {
    case "approved":
      return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400";
    case "pending_review":
      return "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400";
    case "restricted":
      return "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400";
    case "blocked":
      return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
    default:
      return "";
  }
}

function licenseTierLabel(tier: string) {
  return tier.charAt(0).toUpperCase() + tier.slice(1);
}

interface ToolInfoTooltipProps {
  tool: WhitelistedTool;
  children: React.ReactNode;
}

export function ToolInfoTooltip({ tool, children }: ToolInfoTooltipProps) {
  const displayName = tool.internalAlias ?? tool.name;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>{children}</TooltipTrigger>
        <TooltipContent
          side="top"
          className="max-w-[240px] p-3 space-y-2 text-left"
          sideOffset={6}
        >
          <p className="font-medium text-sm">{displayName}</p>
          <div className="flex flex-wrap items-center gap-1.5">
            <Badge
              variant="secondary"
              className={cn("text-[10px] font-normal", approvalStatusClass(tool.approvalStatus))}
            >
              {approvalStatusLabel(tool.approvalStatus)}
            </Badge>
            {tool.licenseTier && (
              <span className="text-[10px] text-muted-foreground">
                {licenseTierLabel(tool.licenseTier)}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
            {tool.indemnified ? (
              <>
                <Check className="h-3 w-3 text-emerald-500 shrink-0" />
                Indemnified
              </>
            ) : (
              <>
                <AlertTriangle className="h-3 w-3 text-amber-500 shrink-0" />
                Not Indemnified
              </>
            )}
          </div>
          {tool.complianceNotes && (
            <p className="text-[11px] text-muted-foreground border-t pt-1.5">
              {tool.complianceNotes}
            </p>
          )}
          {tool.dataResidency && (
            <p className="text-[11px] text-muted-foreground">
              Data residency: {tool.dataResidency}
            </p>
          )}
          <p className="text-[11px] text-blue-600 dark:text-blue-400 pt-0.5 flex items-center gap-1">
            View details
            <ArrowRight className="h-3 w-3" />
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
