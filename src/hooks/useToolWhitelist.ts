"use client";

import { useMemo, useCallback } from "react";
import type { WhitelistedTool, WorkflowStepType } from "@/types/workflow-builder";
import {
  MOCK_WHITELIST_CONFIG,
  MOCK_TOOL_WHITELIST,
} from "@/lib/data/ai-tools-whitelist";

const APPROVAL_ORDER: Record<string, number> = {
  approved: 0,
  pending_review: 1,
  restricted: 2,
  blocked: 3,
};

function sortByApprovalStatus(tools: WhitelistedTool[]): WhitelistedTool[] {
  return [...tools].sort(
    (a, b) =>
      (APPROVAL_ORDER[a.approvalStatus] ?? 4) -
      (APPROVAL_ORDER[b.approvalStatus] ?? 4)
  );
}

export interface UseToolWhitelistReturn {
  config: typeof MOCK_WHITELIST_CONFIG;
  tools: WhitelistedTool[];
  getToolsByCategory: (stepType: WorkflowStepType) => WhitelistedTool[];
  getApprovedTools: (stepType: WorkflowStepType) => WhitelistedTool[];
  getToolById: (id: string) => WhitelistedTool | undefined;
  canUseTool: (toolId: string) => boolean;
  requestToolAccess: (toolId: string) => void;
}

/**
 * Hook for enterprise AI tools whitelist. Returns config, tools, and helpers for
 * filtering by category/approval and checking usage. Uses mock data; will connect to API later.
 */
export function useToolWhitelist(): UseToolWhitelistReturn {
  const config = MOCK_WHITELIST_CONFIG;
  const tools = MOCK_TOOL_WHITELIST;

  const getToolsByCategory = useCallback((stepType: WorkflowStepType) => {
    const filtered = MOCK_TOOL_WHITELIST.filter((t) => t.category === stepType);
    return sortByApprovalStatus(filtered);
  }, []);

  const getApprovedTools = useCallback((stepType: WorkflowStepType) => {
    return MOCK_TOOL_WHITELIST.filter(
      (t) => t.category === stepType && t.approvalStatus === "approved"
    );
  }, []);

  const getToolById = useCallback((id: string) => {
    return MOCK_TOOL_WHITELIST.find((t) => t.id === id);
  }, []);

  const canUseTool = useCallback((toolId: string) => {
    const tool = MOCK_TOOL_WHITELIST.find((t) => t.id === toolId);
    return tool?.approvalStatus === "approved";
  }, []);

  const requestToolAccess = useCallback((toolId: string) => {
    console.log("[useToolWhitelist] requestToolAccess:", toolId);
  }, []);

  return useMemo(
    () => ({
      config,
      tools,
      getToolsByCategory,
      getApprovedTools,
      getToolById,
      canUseTool,
      requestToolAccess,
    }),
    [
      getToolsByCategory,
      getApprovedTools,
      getToolById,
      canUseTool,
      requestToolAccess,
    ]
  );
}
